import os
import numpy as np
import librosa
import noisereduce as nr
import soundfile as sf

def detect_silence(path, min_silence_len=0.5, silence_thresh=40):
    """
    Detects silent gaps in the audio.
    min_silence_len: minimum duration of silence in seconds to be registered
    silence_thresh: threshold (in dB) below reference to consider silence (equivalent to top_db in librosa.effects.split)
    """
    y, sr = librosa.load(path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    
    # split returns intervals of non-silent regions
    non_silent_intervals = librosa.effects.split(y, top_db=silence_thresh)
    
    silence_regions = []
    
    # Convert samples to seconds
    non_silent_secs = []
    for start_idx, end_idx in non_silent_intervals:
        non_silent_secs.append((start_idx / sr, end_idx / sr))
        
    if not non_silent_secs:
        # The entire audio is silent
        return [{"start": 0.0, "end": round(duration, 3), "duration": round(duration, 3)}]
        
    # Find the gaps between non-silent regions
    current_time = 0.0
    for start_sec, end_sec in non_silent_secs:
        if start_sec - current_time >= min_silence_len:
            silence_regions.append({
                "start": round(current_time, 3),
                "end": round(start_sec, 3),
                "duration": round(start_sec - current_time, 3)
            })
        current_time = end_sec
        
    if duration - current_time >= min_silence_len:
        silence_regions.append({
            "start": round(current_time, 3),
            "end": round(duration, 3),
            "duration": round(duration - current_time, 3)
        })
        
    return silence_regions

def auto_trim_silence(path, threshold=40):
    """
    Detects silent portions at start and end and returns proposed trim points.
    """
    y, sr = librosa.load(path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    
    # trim returns the trimmed signal and the start/end samples
    y_trimmed, index = librosa.effects.trim(y, top_db=threshold)
    
    trimmed_start = float(index[0]) / sr
    trimmed_end = float(index[1]) / sr
    
    return {
        "trimmed_start": round(trimmed_start, 3),
        "trimmed_end": round(trimmed_end, 3),
        "removed_start_ms": round(trimmed_start * 1000, 1),
        "removed_end_ms": round((duration - trimmed_end) * 1000, 1),
        "total_duration": round(duration, 3)
    }

def detect_beats(path):
    """
    Analyzes the audio for tempo (BPM) and beat positions.
    """
    y, sr = librosa.load(path, sr=None, mono=True)
    
    # Beat tracking
    tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
    
    # Convert numpy float/array tempo to normal float
    if hasattr(tempo, "__len__"):
        bpm = float(tempo[0])
    else:
        bpm = float(tempo)
        
    beat_times = librosa.frames_to_time(beat_frames, sr=sr)
    beat_times_list = [round(float(t), 3) for t in beat_times]
    
    return {
        "bpm": round(bpm, 2),
        "beat_times": beat_times_list,
        "total_beats": len(beat_times_list)
    }

def reduce_noise(path, output_path):
    """
    Applies local noise reduction using noisereduce package.
    Preserves stereo shape.
    """
    # Load with mono=False to keep stereo if present
    y, sr = librosa.load(path, sr=None, mono=False)
    
    # Run noise reduction
    reduced_y = nr.reduce_noise(y=y, sr=sr)
    
    # Save the output file. Note: soundfile writes channels as columns, so we transpose 2D arrays
    if reduced_y.ndim > 1:
        reduced_y_to_write = reduced_y.T
    else:
        reduced_y_to_write = reduced_y
        
    sf.write(output_path, reduced_y_to_write, sr)
    return output_path

def detect_voice_activity(path, threshold_db=-35.0, frame_length=2048, hop_length=512):
    """
    Performs Voice Activity Detection using RMS energy analysis.
    Classifies frames as 'speech' or 'silence'.
    """
    y, sr = librosa.load(path, sr=None, mono=True)
    duration = librosa.get_duration(y=y, sr=sr)
    
    # Compute RMS energy for each frame
    rms = librosa.feature.rms(y=y, frame_length=frame_length, hop_length=hop_length)[0]
    
    # Avoid log of zero
    rms = np.maximum(rms, 1e-10)
    
    # Safeguard: if absolute peak RMS is extremely quiet, classify entire track as silence
    peak_rms = np.max(rms)
    if peak_rms < 0.001:
        return [{"start": 0.0, "end": round(duration, 3), "type": "silence"}]
        
    # Convert to dB relative to peak energy
    rms_db = librosa.amplitude_to_db(rms, ref=np.max)
    
    # Calculate time timestamps for each frame
    times = librosa.frames_to_time(np.arange(len(rms)), sr=sr, hop_length=hop_length)
    
    is_speech = rms_db > threshold_db
    
    segments = []
    if len(is_speech) == 0:
        return segments
        
    current_state = "speech" if is_speech[0] else "silence"
    start_time = 0.0
    
    for i in range(1, len(is_speech)):
        state = "speech" if is_speech[i] else "silence"
        if state != current_state:
            end_time = times[i]
            segments.append({
                "start": round(start_time, 3),
                "end": round(end_time, 3),
                "type": current_state
            })
            current_state = state
            start_time = end_time
            
    segments.append({
        "start": round(start_time, 3),
        "end": round(duration, 3),
        "type": current_state
    })
    
    return segments

# Global cache to prevent reloading Whisper model on every request
_whisper_model_cache = None

def transcribe_audio(path):
    """
    Transcribes audio to text using openai-whisper tiny model.
    Optional and lazy-loaded.
    """
    global _whisper_model_cache
    try:
        import whisper
    except ImportError:
        return {
            "available": False,
            "error": "Whisper is not installed. To enable transcription, run: pip install openai-whisper"
        }
        
    try:
        # Load and cache model
        if _whisper_model_cache is None:
            import torch
            device = "cuda" if torch.cuda.is_available() else "cpu"
            _whisper_model_cache = whisper.load_model("tiny", device=device)
            
        result = _whisper_model_cache.transcribe(path)
        
        segments = []
        for seg in result.get("segments", []):
            segments.append({
                "start": round(seg["start"], 3),
                "end": round(seg["end"], 3),
                "text": seg["text"].strip()
            })
            
        return {
            "available": True,
            "language": result.get("language", "en"),
            "full_text": result.get("text", "").strip(),
            "segments": segments
        }
    except Exception as e:
        return {
            "available": False,
            "error": f"Failed to transcribe: {str(e)}"
        }
