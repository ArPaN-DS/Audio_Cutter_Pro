# 📖 Audio Cutter Pro — User Manual

> Complete guide for using all features of Audio Cutter Pro.

---

## Table of Contents

1. [Getting Started](#1--getting-started)
2. [Uploading Audio](#2--uploading-audio)
3. [Recording Audio](#3--recording-audio)
4. [The Waveform Editor](#4--the-waveform-editor)
5. [Creating Cut Regions](#5--creating-cut-regions)
6. [Managing Regions](#6--managing-regions)
7. [Audio Effects](#7--audio-effects)
8. [Exporting Audio](#8--exporting-audio)
9. [Keyboard Shortcuts](#9--keyboard-shortcuts)
10. [Tips & Tricks](#10--tips--tricks)
11. [FAQ](#11--faq)

---

## 1. 🏁 Getting Started

Open your web browser and go to the app URL (default: `http://localhost:5000`).

You'll see the **Upload File** screen with two tabs:
- **Upload File** — Upload an existing audio/video file
- **Record Audio** — Record directly from your microphone

---

## 2. 📤 Uploading Audio

### Method 1: Click to Upload
1. Click the **"Choose File"** button (or the "No file chosen" area)
2. Select an audio or video file from your computer
3. The waveform editor will appear automatically

### Method 2: Drag & Drop
1. Drag any audio/video file from your computer
2. Drop it onto the upload area (it will highlight when ready)
3. The waveform editor will appear automatically

### Supported Formats
| Audio | Video (audio extracted) |
|-------|------------------------|
| MP3, WAV, OGG, FLAC, M4A, AAC, WMA | MP4, MKV, AVI, MOV, WebM |

### File Size Limit
- Maximum: **500 MB**

---

## 3. 🎙️ Recording Audio

1. Click the **"Record Audio"** tab
2. Click the **red record button** 🔴
3. Your browser will ask for microphone permission — click **"Allow"**
4. Speak or play audio
5. Click **"Stop"** when done
6. The recording will load into the waveform editor automatically

---

## 4. 🌊 The Waveform Editor

Once audio is loaded, you'll see the editor interface:

### Components

| Component | Description |
|-----------|-------------|
| **File Info Bar** | Shows filename, duration, file size, and a "Remove" button |
| **Waveform** | Visual representation of your audio — the colored areas are cut regions |
| **Timeline** | Time markers above the waveform |
| **Transport Bar** | Play button, time display, zoom, volume controls |
| **Cut Regions Panel** | List of all your cut regions with controls |
| **Effects Panel** | Audio effects (fade, normalize, reverse) |
| **Export Panel** | Format and export mode selection |

### Playback Controls
- **Play/Pause** — Click the ▶️ button or press `Space`
- **Seek** — Click anywhere on the waveform to jump to that position
- **Zoom In/Out** — Use the zoom slider 🔍 in the transport bar
- **Volume** — Use the volume slider 🔊 or `M` to mute

---

## 5. ✂️ Creating Cut Regions

Cut regions define which parts of the audio you want to keep.

### Method 1: Double-Click the Waveform
- **Double-click** anywhere on the waveform
- A new region appears centered on your click position
- This is the fastest method!

### Method 2: Use the "+ Add Region" Button
- Click the **"+ Add Region"** button in the Cut Regions panel
- A new region appears at 10%–40% of the audio

### Adjusting Regions
- **Move a region** — Click and drag the region left/right
- **Resize a region** — Drag the left or right edge of the region
- **Select a region** — Click on it (it will highlight)

### When a region is selected, you can:
- See its exact start/end times in the region list
- Delete it with the 🗑️ button or `Delete` key
- Play just that region with the ▶️ button next to it

---

## 6. 📋 Managing Regions

### Region List Panel
Below the waveform, you'll find the **Cut Regions** panel showing all your regions:

- Each region shows its **name**, **start time**, **end time**, and **duration**
- **▶️ Play** — Plays just that region's audio
- **🗑️ Delete** — Removes that region

### Undo
- Press **Ctrl+Z** or click "Undo" to reverse your last action
- Works for: adding regions, deleting regions, clearing all regions
- Supports up to **20 undo steps**

### Clear All
- Click **"Clear All"** to remove all regions at once
- You can undo this with Ctrl+Z

---

## 7. 🎛️ Audio Effects

Effects are applied to all regions during export:

| Effect | What It Does |
|--------|-------------|
| **Fade In** | Gradually increases volume at the start (2 seconds) |
| **Fade Out** | Gradually decreases volume at the end (2 seconds) |
| **Normalize** | Adjusts volume to a standard level (-14 dBFS) — great for making quiet audio louder |
| **Reverse** | Plays the audio backwards |

To apply effects:
1. Toggle the effect switches ON (in the effects panel or export panel)
2. They will be applied when you click "Export"

---

## 8. 💾 Exporting Audio

### Step 1: Choose Format

| Format | Best For |
|--------|----------|
| **MP3** (320kbps) | General use, smaller file size, compatible everywhere |
| **WAV** | Professional quality, no compression loss, larger file size |

### Step 2: Choose Export Mode

| Mode | What Happens |
|------|-------------|
| **Merged** | All regions are joined together into one file |
| **Separate** | Each region is exported as an individual file, all packed into a ZIP file |

### Step 3: Click "Export"

1. Click the **"Export Audio"** button
2. A loading spinner will appear while the server processes your audio
3. The file will automatically download to your computer

### Export File Names
- **Merged:** `merged_audio.mp3` or `merged_audio.wav`
- **Separate:** `audio_cuts.zip` containing files like `01_Region_1.mp3`, `02_Region_2.mp3`, etc.

---

## 9. ⌨️ Keyboard Shortcuts

Press `?` to see the shortcuts panel in the app.

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `Double-Click` | Add new region on waveform |
| `Click Region` | Select a region |
| `Delete` | Remove selected region |
| `Ctrl + Z` | Undo last action |
| `← Arrow` | Skip back 5 seconds |
| `→ Arrow` | Skip forward 5 seconds |
| `M` | Mute / Unmute audio |
| `?` | Show keyboard shortcuts panel |

---

## 10. 💡 Tips & Tricks

1. **Precise cutting** — Zoom in (use the zoom slider) for more precise region placement
2. **Preview before export** — Use the ▶️ button next to each region to preview it
3. **Normalize for podcasts** — Turn on "Normalize" to ensure consistent volume
4. **Quick workflow** — Double-click to add regions, then merge-export for a quick cut
5. **Multiple regions** — You can create many regions to extract different parts of a long audio (like a podcast or lecture)
6. **Remove and re-upload** — Use the "✗ Remove" button to clear the current file and upload a new one without refreshing

---

## 11. ❓ FAQ

### Q: What audio formats are supported?
**A:** MP3, WAV, OGG, FLAC, M4A, AAC, WMA, and any format FFmpeg supports. Video files (MP4, MKV, AVI, MOV, WebM) are also supported — the audio track will be extracted.

### Q: Is there a file size limit?
**A:** Yes, the maximum file size is **500 MB**. This is configurable by the server administrator.

### Q: Where are my files processed?
**A:** All processing happens on the server. Your files are temporarily stored during processing and can be cleaned up automatically. The app does not store your files permanently.

### Q: Can I record and then edit?
**A:** Yes! Use the "Record Audio" tab to record, then the full waveform editor is available for cutting and effects.

### Q: How do I cut out the middle of a song?
**A:** Create **two regions** — one for the part before the section you want to remove, and one for the part after. Then export as "Merged" to join them together seamlessly.

### Q: Can I use this on my phone?
**A:** Yes! The app is fully responsive and works on mobile browsers. Tap and hold on the waveform to create regions on touch devices.

---

*Need more help? Open an issue on [GitHub](https://github.com/ArPaN-DS/Audio_Cutter/issues).*
