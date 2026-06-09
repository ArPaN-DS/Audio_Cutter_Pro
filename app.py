import os
import uuid
import json
import zipfile
from flask import Flask, render_template, request, send_file, jsonify
import ai_processor
from pydub import AudioSegment
from logger import log_upload_details
from io import BytesIO

# Load environment variables from .env file if present
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass  # python-dotenv not installed; rely on system environment variables

app = Flask(__name__)
app.secret_key = os.environ.get("FLASK_SECRET_KEY", "change-me-in-production")

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
PROCESSED_FOLDER = os.path.join(BASE_DIR, 'processed')

# Config: 500MB Limit
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024 
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['PROCESSED_FOLDER'] = PROCESSED_FOLDER

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(PROCESSED_FOLDER, exist_ok=True)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/cut', methods=['POST'])
def cut_audio():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400

    try:
        # 1. SETUP & SAVE INPUT
        unique_id = str(uuid.uuid4())
        original_ext = os.path.splitext(file.filename)[1] or ".webm"
        input_path = os.path.join(app.config['UPLOAD_FOLDER'], f"{unique_id}{original_ext}")
        file.save(input_path)
        
        # Calculate file size
        file_size = os.path.getsize(input_path)
        output_format = request.form.get('format', 'mp3')
        
        # Call the robust logger
        log_upload_details(
            request=request, 
            filename=file.filename, 
            file_size_bytes=file_size, 
            target_format=output_format
        )
        
        # 2. PARSE REGIONS (Multi-Region Support)
        regions_json = request.form.get('regions', '[]')
        regions = json.loads(regions_json)
        
        if not regions or len(regions) == 0:
            return "No regions provided", 400
        
        # 3. GET EXPORT MODE & EFFECTS
        export_mode = request.form.get('export_mode', 'merged')
        fade_in = request.form.get('fade_in') == 'true'
        fade_out = request.form.get('fade_out') == 'true'
        do_normalize = request.form.get('normalize') == 'true'
        do_reverse = request.form.get('reverse') == 'true'

        # 4. LOAD AUDIO
        audio = AudioSegment.from_file(input_path)
        
        # 5. PROCESS REGIONS
        processed_segments = []
        for region in regions:
            start_ms = float(region['start']) * 1000
            end_ms = float(region['end']) * 1000
            
            # Validation
            if end_ms > len(audio): 
                end_ms = len(audio)
            if start_ms >= end_ms:
                continue
            
            # Cut
            segment = audio[start_ms:end_ms]
            
            # Apply effects
            fade_duration = 2000 
            if len(segment) < 4000:
                fade_duration = min(2000, len(segment) // 2)

            if fade_in:
                segment = segment.fade_in(fade_duration)
            if fade_out:
                segment = segment.fade_out(fade_duration)
            if do_normalize:
                target_dBFS = -14.0
                change_in_dBFS = target_dBFS - segment.dBFS
                segment = segment.apply_gain(change_in_dBFS)
            if do_reverse:
                segment = segment.reverse()
            
            processed_segments.append({
                'name': region.get('name', 'Region'),
                'audio': segment
            })
        
        if not processed_segments:
            return "No valid regions to process", 400
        
        # 6. EXPORT
        export_args = {}
        if output_format == 'mp3':
            export_args = {'format': 'mp3', 'bitrate': '320k'}
        else:
            export_args = {'format': 'wav'}
        
        if export_mode == 'merged' or len(processed_segments) == 1:
            # MERGE ALL SEGMENTS
            merged = processed_segments[0]['audio']
            for seg in processed_segments[1:]:
                merged += seg['audio']  # Concatenate
            
            output_filename = f"merged_{unique_id}.{output_format}"
            output_path = os.path.join(app.config['PROCESSED_FOLDER'], output_filename)
            merged.export(output_path, **export_args)
            
            return send_file(
                output_path, 
                as_attachment=True, 
                download_name=f'merged_audio.{output_format}'
            )
        
        else:
            # EXPORT SEPARATE FILES (ZIP)
            zip_buffer = BytesIO()
            with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
                for i, seg_data in enumerate(processed_segments, 1):
                    temp_buffer = BytesIO()
                    seg_data['audio'].export(temp_buffer, **export_args)
                    temp_buffer.seek(0)
                    
                    safe_name = seg_data['name'].replace(' ', '_').replace('/', '_')
                    filename = f"{i:02d}_{safe_name}.{output_format}"
                    zip_file.writestr(filename, temp_buffer.read())
            
            zip_buffer.seek(0)
            return send_file(
                zip_buffer,
                mimetype='application/zip',
                as_attachment=True,
                download_name='audio_cuts.zip'
            )

    except Exception as e:
        print(f"Error: {e}")
        return f"Server Error: {str(e)}", 500

# Helper to save upload file temporarily
def save_temp_upload(file):
    unique_id = str(uuid.uuid4())
    original_ext = os.path.splitext(file.filename)[1] or ".webm"
    temp_path = os.path.join(app.config['UPLOAD_FOLDER'], f"temp_{unique_id}{original_ext}")
    file.save(temp_path)
    return temp_path

@app.route('/ai/detect-silence', methods=['POST'])
def ai_detect_silence():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    min_silence_len = float(request.form.get('min_silence_len', 0.5))
    silence_thresh = float(request.form.get('silence_thresh', 40))
    
    temp_path = save_temp_upload(file)
    try:
        results = ai_processor.detect_silence(temp_path, min_silence_len, silence_thresh)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/ai/auto-trim', methods=['POST'])
def ai_auto_trim():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    threshold = float(request.form.get('threshold', 40))
    
    temp_path = save_temp_upload(file)
    try:
        results = ai_processor.auto_trim_silence(temp_path, threshold)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/ai/detect-beats', methods=['POST'])
def ai_detect_beats():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    temp_path = save_temp_upload(file)
    try:
        results = ai_processor.detect_beats(temp_path)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/ai/detect-vad', methods=['POST'])
def ai_detect_vad():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    threshold_db = float(request.form.get('threshold_db', -35.0))
    
    temp_path = save_temp_upload(file)
    try:
        results = ai_processor.detect_voice_activity(temp_path, threshold_db)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/ai/transcribe', methods=['POST'])
def ai_transcribe():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    temp_path = save_temp_upload(file)
    try:
        results = ai_processor.transcribe_audio(temp_path)
        return jsonify(results)
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.route('/ai/noise-reduce', methods=['POST'])
def ai_noise_reduce():
    if 'file' not in request.files: return "No file", 400
    file = request.files['file']
    if file.filename == '': return "No file", 400
    
    temp_path = save_temp_upload(file)
    try:
        unique_id = str(uuid.uuid4())
        output_filename = f"denoised_{unique_id}.wav"
        output_path = os.path.join(app.config['PROCESSED_FOLDER'], output_filename)
        
        ai_processor.reduce_noise(temp_path, output_path)
        
        base_name = os.path.splitext(file.filename)[0]
        return send_file(
            output_path,
            as_attachment=True,
            download_name=f"denoised_{base_name}.wav"
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
