/* ═══════════════════════════════════════
   Audio Cutter Pro — Main Script
   Next-Level UX Edition
   ═══════════════════════════════════════ */

let wavesurfer, wsRegions;
let allRegions = [];
let selectedRegion = null;
let recordedBlob = null;
let regionCounter = 1;
let currentVolume = 0.8;
let isResetting = false;

// ─── UNDO SYSTEM ───
let undoStack = [];
const MAX_UNDO = 20;

function pushUndo(action, data) {
    undoStack.push({ action, data, timestamp: Date.now() });
    if (undoStack.length > MAX_UNDO) undoStack.shift();
    updateUndoBtn();
}

function updateUndoBtn() {
    const btn = document.getElementById('undoBtn');
    if (!btn) return;
    btn.disabled = undoStack.length === 0;
    btn.title = undoStack.length > 0
        ? `Undo: ${undoStack[undoStack.length - 1].action} (Ctrl+Z)`
        : 'Nothing to undo';
}

document.addEventListener('DOMContentLoaded', () => {

    // ─── 1. WAVESURFER SETUP ───
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#c4c8d0',
        progressColor: '#D32F2F',
        cursorColor: '#1a1a2e',
        cursorWidth: 2,
        height: 140,
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        responsive: true,
        normalize: true,
        plugins: [
            WaveSurfer.Timeline.create({ container: '#wave-timeline' }),
            WaveSurfer.Regions.create()
        ]
    });

    wsRegions = wavesurfer.plugins[1];

    // ─── 2. TABS ───
    const uploadSec = document.getElementById('uploadSection');
    const recordSec = document.getElementById('recordSection');
    const editorSec = document.getElementById('editor-interface');

    document.getElementById('btnTabUpload').onclick = () => switchTab('upload');
    document.getElementById('btnTabRecord').onclick = () => switchTab('record');

    function switchTab(mode) {
        document.getElementById('btnTabUpload').classList.toggle('active', mode === 'upload');
        document.getElementById('btnTabRecord').classList.toggle('active', mode === 'record');
        uploadSec.classList.toggle('hidden', mode !== 'upload');
        recordSec.classList.toggle('hidden', mode !== 'record');
        editorSec.classList.add('hidden');
    }

    // ─── 3. FILE UPLOAD with DRAG & DROP ───
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadSection');

    fileInput.addEventListener('change', function () {
        if (this.files[0]) handleFileLoad(this.files[0]);
    });

    // Drag & Drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-active');
    });
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-active');
    });
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-active');
        const file = e.dataTransfer.files[0];
        if (file && (file.type.startsWith('audio/') || file.type.startsWith('video/'))) {
            handleFileLoad(file);
        } else {
            showToast('Please drop an audio or video file.', 'warning');
        }
    });

    function handleFileLoad(file) {
        loadAudio(file);
        document.getElementById('fileName').textContent = file.name;
        document.getElementById('fileSize').textContent = formatFileSize(file.size);
    }

    // ─── 4. RECORDING ───
    let mediaRecorder;
    let chunks = [];
    const recBtn = document.getElementById('recordBtn');
    const stopBtn = document.getElementById('stopRecordBtn');
    const recStatus = document.getElementById('recordStatus');

    recBtn.onclick = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = e => chunks.push(e.data);
            mediaRecorder.onstop = () => {
                recordedBlob = new Blob(chunks, { type: 'audio/webm' });
                chunks = [];
                loadAudio(recordedBlob);
                document.getElementById('fileName').textContent = 'Recording';
                document.getElementById('fileSize').textContent = formatFileSize(recordedBlob.size);
            };
            mediaRecorder.start();
            recBtn.classList.add('recording');
            recStatus.textContent = 'Recording... Click Stop when done.';
            stopBtn.classList.remove('hidden');
            recBtn.disabled = true;
        } catch (err) {
            recStatus.textContent = 'Microphone access denied.';
        }
    };

    stopBtn.onclick = () => {
        mediaRecorder.stop();
        recBtn.classList.remove('recording');
        recStatus.textContent = 'Recording finished!';
        recBtn.disabled = false;
        stopBtn.classList.add('hidden');
    };

    // ─── 5. LOAD AUDIO ───
    function loadAudio(source) {
        const url = URL.createObjectURL(source);
        wavesurfer.load(url);
    }

    wavesurfer.on('ready', () => {
        // Don't re-show editor if we're in the middle of a reset
        if (isResetting) return;

        editorSec.classList.remove('hidden');
        editorSec.style.display = '';
        uploadSec.classList.add('hidden');
        recordSec.classList.add('hidden');
        document.getElementById('newFileBtn').classList.remove('hidden');

        wsRegions.clearRegions();
        allRegions = [];
        selectedRegion = null;
        regionCounter = 1;
        undoStack = [];
        updateUndoBtn();

        const duration = wavesurfer.getDuration();
        document.getElementById('totalTime').textContent = formatTimePrecise(duration);
        document.getElementById('fileDuration').textContent = formatTimePrecise(duration);
        document.getElementById('currentTime').textContent = '0:00';

        wavesurfer.setVolume(currentVolume);

        // Add default region
        addRegion(duration * 0.1, duration * 0.4, `Region ${regionCounter++}`, false);

        // Show helpful hint for first-time users
        showToast('💡 Double-click the waveform to add cut regions!', 'info');
    });

    // ─── TIME UPDATE ───
    wavesurfer.on('audioprocess', () => {
        document.getElementById('currentTime').textContent = formatTimePrecise(wavesurfer.getCurrentTime());
    });

    wavesurfer.on('seeking', () => {
        document.getElementById('currentTime').textContent = formatTimePrecise(wavesurfer.getCurrentTime());
    });

    // Play icon toggle
    wavesurfer.on('play', () => {
        document.getElementById('playIcon').className = 'fas fa-pause';
        document.getElementById('playBtn').classList.add('playing');
    });
    wavesurfer.on('pause', () => {
        document.getElementById('playIcon').className = 'fas fa-play';
        document.getElementById('playBtn').classList.remove('playing');
    });

    // ─── 6. REGION MANAGEMENT ───
    function addRegion(start, end, name, trackUndo = true) {
        const alpha = 0.12 + Math.random() * 0.13;
        const region = wsRegions.addRegion({
            start: start,
            end: end,
            color: `rgba(211, 47, 47, ${alpha})`,
            drag: true,
            resize: true
        });

        const regionData = { id: region.id, name: name, region: region };
        allRegions.push(regionData);

        region.on('click', () => selectRegion(region.id));

        if (trackUndo) {
            pushUndo('Add Region', { id: region.id, name, start, end });
        }

        updateRegionList();

        // Pulse animation on the region list
        setTimeout(() => {
            const items = document.querySelectorAll('.region-item');
            const lastItem = items[items.length - 1];
            if (lastItem) {
                lastItem.classList.add('just-added');
                setTimeout(() => lastItem.classList.remove('just-added'), 800);
            }
        }, 50);

        return region;
    }

    function selectRegion(regionId) {
        // Clear all highlights
        allRegions.forEach(r => {
            r.region.element.style.border = 'none';
            r.region.element.style.boxShadow = 'none';
        });
        document.querySelectorAll('.region-item').forEach(el => el.classList.remove('selected'));

        const regionData = allRegions.find(r => r.id === regionId);
        if (regionData) {
            selectedRegion = regionData;
            regionData.region.element.style.border = '2px solid #D32F2F';
            regionData.region.element.style.boxShadow = '0 0 12px rgba(211, 47, 47, 0.35)';

            const idx = allRegions.indexOf(regionData);
            const items = document.querySelectorAll('.region-item');
            if (items[idx]) {
                items[idx].classList.add('selected');
                items[idx].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }

    function updateRegionList() {
        const list = document.getElementById('regionList');
        list.innerHTML = '';

        // Update region count badge
        const countBadge = document.getElementById('regionCount');
        if (countBadge) countBadge.textContent = allRegions.length;

        if (allRegions.length === 0) {
            list.innerHTML = '<p class="empty-state"><i class="fas fa-info-circle"></i> No regions yet. Double-click the waveform or press "Add Region" to start cutting.</p>';
            return;
        }

        allRegions.forEach((r, index) => {
            const div = document.createElement('div');
            div.className = 'region-item';
            const dur = r.region.end - r.region.start;

            div.innerHTML = `
                <div class="region-info">
                    <div class="region-name">
                        <i class="fas fa-wave-square" style="color:var(--primary);margin-right:6px;font-size:0.8rem;"></i>
                        <span class="region-name-text" data-id="${r.id}">${r.name}</span>
                    </div>
                    <div class="region-time">${formatTimePrecise(r.region.start)} → ${formatTimePrecise(r.region.end)}  ·  ${formatTimePrecise(dur)}</div>
                </div>
                <div class="region-actions">
                    <button class="region-play-btn" data-id="${r.id}" title="Play just this region">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="region-delete" data-id="${r.id}" title="Delete this region">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;

            // Click to select
            div.onclick = (e) => {
                if (!e.target.closest('.region-delete') && !e.target.closest('.region-play-btn')) {
                    selectRegion(r.id);
                }
            };

            // Double-click region name to rename
            const nameSpan = div.querySelector('.region-name-text');
            nameSpan.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                const currentName = r.name;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = currentName;
                input.className = 'rename-input';
                input.maxLength = 30;
                nameSpan.replaceWith(input);
                input.focus();
                input.select();

                const saveName = () => {
                    const newName = input.value.trim() || currentName;
                    r.name = newName;
                    updateRegionList();
                };
                input.addEventListener('blur', saveName);
                input.addEventListener('keydown', (ke) => {
                    if (ke.key === 'Enter') input.blur();
                    if (ke.key === 'Escape') { r.name = currentName; input.blur(); }
                });
            });

            // Play region button
            div.querySelector('.region-play-btn').onclick = (e) => {
                e.stopPropagation();
                wavesurfer.play(r.region.start, r.region.end);
                selectRegion(r.id);
            };

            // Delete button
            div.querySelector('.region-delete').onclick = (e) => {
                e.stopPropagation();
                deleteRegion(r.id);
            };

            list.appendChild(div);
        });

        document.getElementById('exportModeGroup').style.display = allRegions.length > 1 ? 'grid' : 'none';
    }

    window.deleteRegion = function (regionId) {
        const index = allRegions.findIndex(r => r.id === regionId);
        if (index !== -1) {
            const removed = allRegions[index];
            // Save undo data
            pushUndo('Delete Region', {
                name: removed.name,
                start: removed.region.start,
                end: removed.region.end
            });
            removed.region.remove();
            allRegions.splice(index, 1);
            selectedRegion = null;
            updateRegionList();
            showToast(`"${removed.name}" removed. Press Ctrl+Z to undo.`, 'info');
        }
    };

    // ─── UNDO ───
    document.getElementById('undoBtn').onclick = performUndo;

    function performUndo() {
        if (undoStack.length === 0) return;
        const last = undoStack.pop();
        updateUndoBtn();

        if (last.action === 'Delete Region') {
            // Re-add the deleted region
            addRegion(last.data.start, last.data.end, last.data.name, false);
            showToast(`↩ Restored "${last.data.name}"`, 'success');
        } else if (last.action === 'Add Region') {
            // Remove the last added region
            const idx = allRegions.findIndex(r => r.id === last.data.id);
            if (idx !== -1) {
                allRegions[idx].region.remove();
                allRegions.splice(idx, 1);
                selectedRegion = null;
                updateRegionList();
                showToast('↩ Region removed', 'success');
            }
        } else if (last.action === 'Clear All') {
            // Re-add all cleared regions
            last.data.forEach(d => {
                addRegion(d.start, d.end, d.name, false);
            });
            showToast(`↩ Restored ${last.data.length} region(s)`, 'success');
        }
    }

    // Add Region Button
    document.getElementById('addRegionBtn').onclick = () => {
        const duration = wavesurfer.getDuration();
        const current = wavesurfer.getCurrentTime();
        const start = Math.max(0, current);
        const end = Math.min(duration, current + duration * 0.15);
        addRegion(start, end, `Region ${regionCounter++}`);
    };

    // Clear All — with undo support
    document.getElementById('clearAllBtn').onclick = () => {
        if (allRegions.length === 0) return;

        // Save all regions for undo
        const savedRegions = allRegions.map(r => ({
            name: r.name,
            start: r.region.start,
            end: r.region.end
        }));
        pushUndo('Clear All', savedRegions);

        allRegions.forEach(r => r.region.remove());
        allRegions = [];
        selectedRegion = null;
        updateRegionList();
        showToast(`Cleared all regions. Press Ctrl+Z to undo.`, 'warning');
    };

    // Region update listener
    wsRegions.on('region-updated', () => updateRegionList());

    // ─── DOUBLE-CLICK waveform → add region ───
    // Remove old single-click handler, use dblclick instead
    let lastClickTime = 0;
    wavesurfer.on('click', (relativeX) => {
        const now = Date.now();
        if (now - lastClickTime < 350) {
            // Double click detected!
            const duration = wavesurfer.getDuration();
            const clickTime = relativeX * duration;
            const regionLen = Math.min(5, duration * 0.1);
            const start = Math.max(0, clickTime - regionLen / 2);
            const end = Math.min(duration, clickTime + regionLen / 2);
            addRegion(start, end, `Region ${regionCounter++}`);
        }
        lastClickTime = now;
    });

    // ─── 7. PLAY/PAUSE ───
    document.getElementById('playBtn').onclick = () => wavesurfer.playPause();

    // ─── 8. ZOOM ───
    const zoomSlider = document.getElementById('zoomSlider');
    zoomSlider.oninput = function () {
        wavesurfer.zoom(Number(this.value));
    };

    // ─── 9. VOLUME CONTROL ───
    const volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.value = currentVolume * 100;

    volumeSlider.oninput = function () {
        currentVolume = Number(this.value) / 100;
        wavesurfer.setVolume(currentVolume);
        updateVolumeIcon();
    };

    document.getElementById('muteBtn').onclick = () => {
        if (wavesurfer.getVolume() > 0) {
            wavesurfer.setVolume(0);
            volumeSlider.value = 0;
        } else {
            wavesurfer.setVolume(currentVolume || 0.8);
            volumeSlider.value = (currentVolume || 0.8) * 100;
        }
        updateVolumeIcon();
    };

    function updateVolumeIcon() {
        const vol = wavesurfer.getVolume();
        const icon = document.getElementById('volumeIcon');
        if (vol === 0) icon.className = 'fas fa-volume-mute';
        else if (vol < 0.5) icon.className = 'fas fa-volume-down';
        else icon.className = 'fas fa-volume-up';
    }

    // ─── 10. SPEED CONTROL ───
    document.getElementById('speedControl').onchange = function () {
        wavesurfer.setPlaybackRate(Number(this.value));
    };

    // ─── 11. NEW FILE / REMOVE AUDIO BUTTONS ───

    function resetToUpload() {
        console.log('[AudioCutter] resetToUpload called');
        isResetting = true;

        // FIRST: Force-hide editor with both methods
        const ei = document.getElementById('editor-interface');
        const us = document.getElementById('uploadSection');
        const rs = document.getElementById('recordSection');

        ei.style.display = 'none';
        ei.classList.add('hidden');

        us.style.display = '';
        us.classList.remove('hidden');

        rs.style.display = 'none';
        rs.classList.add('hidden');

        document.getElementById('btnTabUpload').classList.add('active');
        document.getElementById('btnTabRecord').classList.remove('active');
        document.getElementById('newFileBtn').classList.add('hidden');

        // THEN: Try to clean up wavesurfer
        try {
            if (wavesurfer) {
                wavesurfer.pause();
                wsRegions.clearRegions();
                wavesurfer.empty();
            }
        } catch (e) {
            console.warn('WaveSurfer cleanup error:', e);
        }

        // Clear all data
        allRegions = [];
        selectedRegion = null;
        regionCounter = 1;
        undoStack = [];
        updateUndoBtn();
        recordedBlob = null;
        fileInput.value = '';

        showToast('Audio removed. Upload a new file to continue.', 'info');

        // Allow future wavesurfer 'ready' events after a delay
        setTimeout(() => { isResetting = false; }, 500);
    }

    document.getElementById('newFileBtn').addEventListener('click', resetToUpload);
    document.getElementById('removeAudioBtn').addEventListener('click', resetToUpload);

    // ─── 12. KEYBOARD SHORTCUTS ───
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') return;

        // Ctrl+Z = Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
            e.preventDefault();
            performUndo();
            return;
        }

        switch (e.code) {
            case 'Space':
                e.preventDefault();
                wavesurfer.playPause();
                break;
            case 'Delete':
            case 'Backspace':
                e.preventDefault();
                if (selectedRegion) deleteRegion(selectedRegion.id);
                break;
        }

        if (e.key === '?' || e.key === '/') {
            e.preventDefault();
            document.getElementById('shortcutsOverlay').classList.remove('hidden');
        }

        if (e.key === 'm' || e.key === 'M') {
            e.preventDefault();
            document.getElementById('muteBtn').click();
        }

        // Arrow keys: skip 5 seconds
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const t = Math.max(0, wavesurfer.getCurrentTime() - 5);
            wavesurfer.seekTo(t / wavesurfer.getDuration());
        }
        if (e.key === 'ArrowRight') {
            e.preventDefault();
            const t = Math.min(wavesurfer.getDuration(), wavesurfer.getCurrentTime() + 5);
            wavesurfer.seekTo(t / wavesurfer.getDuration());
        }
    });

    // Help overlay
    document.getElementById('helpBtn').onclick = () =>
        document.getElementById('shortcutsOverlay').classList.remove('hidden');

    document.getElementById('closeShortcuts').onclick = () =>
        document.getElementById('shortcutsOverlay').classList.add('hidden');

    document.getElementById('shortcutsOverlay').onclick = (e) => {
        if (e.target.id === 'shortcutsOverlay') e.target.classList.add('hidden');
    };

    // ─── 13. FORM SUBMISSION ───
    document.getElementById('cutForm').onsubmit = async (e) => {
        e.preventDefault();

        if (allRegions.length === 0) {
            showToast('Please add at least one region before exporting.', 'warning');
            return;
        }

        const spinner = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        spinner.classList.remove('hidden');

        const formData = new FormData(e.target);

        // Attach file
        if (recordedBlob && !fileInput.files[0]) {
            formData.append('file', recordedBlob, 'recording.webm');
        } else if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        } else {
            showToast('No audio source found.', 'error');
            spinner.classList.add('hidden');
            return;
        }

        // Attach regions
        const regionsData = allRegions.map(r => ({
            name: r.name,
            start: r.region.start,
            end: r.region.end
        }));
        formData.append('regions', JSON.stringify(regionsData));

        try {
            loadingText.textContent = `Processing ${allRegions.length} region(s)...`;
            const resp = await fetch('/cut', { method: 'POST', body: formData });

            if (resp.ok) {
                const contentType = resp.headers.get('content-type');
                const blob = await resp.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;

                if (contentType && contentType.includes('application/zip')) {
                    a.download = 'audio_cuts.zip';
                } else {
                    const ext = document.querySelector('input[name="format"]:checked').value;
                    a.download = `cut_audio.${ext}`;
                }

                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                loadingText.textContent = '✅ Download started!';
                showToast('✅ Your audio has been exported successfully!', 'success');
                setTimeout(() => { spinner.classList.add('hidden'); }, 1800);
            } else {
                const errText = await resp.text();
                showToast(`Error: ${errText}`, 'error');
                spinner.classList.add('hidden');
            }
        } catch (err) {
            console.error(err);
            showToast('Network error. Check your connection.', 'error');
            spinner.classList.add('hidden');
        }
    };

    // ─── HELPERS ───
    function formatTimePrecise(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 10);
        return `${min}:${sec.toString().padStart(2, '0')}.${ms}`;
    }

    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    function showToast(message, type = 'info') {
        // Remove old toasts
        document.querySelectorAll('.app-toast').forEach(t => t.remove());

        const toast = document.createElement('div');
        toast.className = 'app-toast';
        const colors = {
            error: '#e74c3c',
            warning: '#f39c12',
            success: '#27ae60',
            info: '#2c3e50'
        };
        toast.innerHTML = `<span>${message}</span>`;
        toast.style.cssText = `
            position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%) translateY(20px);
            background: ${colors[type] || colors.info};
            color: white; padding: 14px 28px; border-radius: 12px; font-size: 0.88rem;
            font-weight: 600; z-index: 99999; box-shadow: 0 10px 30px rgba(0,0,0,0.25);
            opacity: 0; transition: all 0.35s cubic-bezier(0.16, 1, 0.3, 1);
            display: flex; align-items: center; gap: 8px; font-family: 'Inter', sans-serif;
            max-width: 480px;
        `;
        document.body.appendChild(toast);

        // Animate in
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        // Animate out
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 3000);
        setTimeout(() => toast.remove(), 3500);
    }

    // Initialize undo button state
    updateUndoBtn();
});