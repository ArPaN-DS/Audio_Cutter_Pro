<p align="center">
  <img src="static/logo.png" alt="Audio Cutter Pro Logo" width="80">
</p>

<h1 align="center">🎵 Audio Cutter Pro</h1>

<p align="center">
  <strong>A professional-grade, browser-based audio editor built with Flask &amp; WaveSurfer.js</strong><br>
  Cut • Trim • Fade • Normalize • Reverse • Export — all from your browser. No signup. No cloud.
</p>

<p align="center">
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/stargazers"><img src="https://img.shields.io/github/stars/ArPaN-DS/Audio_Cutter?style=for-the-badge&logo=github&color=FFD700&labelColor=1a1a2e" alt="GitHub Stars"></a>
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/network/members"><img src="https://img.shields.io/github/forks/ArPaN-DS/Audio_Cutter?style=for-the-badge&logo=github&color=4CAF50&labelColor=1a1a2e" alt="GitHub Forks"></a>
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/issues"><img src="https://img.shields.io/github/issues/ArPaN-DS/Audio_Cutter?style=for-the-badge&color=FF6B6B&labelColor=1a1a2e" alt="Open Issues"></a>
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/blob/main/LICENSE"><img src="https://img.shields.io/github/license/ArPaN-DS/Audio_Cutter?style=for-the-badge&color=blue&labelColor=1a1a2e" alt="MIT License"></a>
  <img src="https://img.shields.io/badge/Python-3.9+-3776AB?style=for-the-badge&logo=python&logoColor=white&labelColor=1a1a2e" alt="Python 3.9+">
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/actions"><img src="https://img.shields.io/github/actions/workflow/status/ArPaN-DS/Audio_Cutter/ci.yml?style=for-the-badge&label=CI&labelColor=1a1a2e" alt="CI Status"></a>
  <a href="https://github.com/ArPaN-DS/Audio_Cutter/commits/main"><img src="https://img.shields.io/github/last-commit/ArPaN-DS/Audio_Cutter?style=for-the-badge&labelColor=1a1a2e" alt="Last Commit"></a>
</p>

---

## ✨ Why Audio Cutter Pro?

> **No subscriptions. No uploads to third-party servers. No account required.**
> Your audio files never leave your machine — everything is processed locally on your own server.

| 🔒 Privacy-First | 🤖 Local AI Tools | ⚡ Feature-Rich | 🌐 Browser-Based |
|:---:|:---:|:---:|:---:|
| Files stay on your server — never sent to cloud APIs | Silence detection, Transcript generator, auto-trim, BPM, and noise reduction (Runs 100% on CPU, even on resource-constrained devices) | Multi-region cutting, effects, undo/redo, mic recording | Works on any device with a browser — no app install |

---

## 🚀 Features

| Feature | Description |
|---------|-------------|
| 🎯 **Multi-Region Cutting** | Create unlimited cut regions on the waveform — each independently adjustable |
| 🔊 **Audio Effects** | Fade In, Fade Out, Normalize (loudness leveling), Reverse |
| 📤 **Flexible Export** | Export as **MP3** (320kbps) or **WAV** — merged or as separate ZIP files |
| 🎙️ **Microphone Recording** | Record audio directly from your browser microphone |
| 🖱️ **Drag & Drop Upload** | Drop your audio or video file directly onto the page |
| ↩️ **Undo/Redo** | Full undo system (`Ctrl+Z`) for all region operations |
| ⌨️ **Keyboard Shortcuts** | `Space`, `Delete`, `Ctrl+Z`, `← / →`, `M`, `?` |
| 📱 **Fully Responsive** | Works on mobile, tablet, and desktop |
| 🎨 **Premium Design** | Glassmorphism UI — clean, modern, professional |
| 🤖 **AI-Powered Analysis** | Local silence detection, auto-trim, beat tracking (BPM), voice activity detection (VAD), **speech-to-text transcription** (requires `openai-whisper`), and local noise reduction — runs 100% on CPU |

---

## ⚡ Quick Start (5 minutes)

### Prerequisites

- **Python 3.9+** → [Download](https://www.python.org/downloads/)
- **FFmpeg** → [Download](https://ffmpeg.org/download.html) *(required for audio processing)*

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/ArPaN-DS/Audio_Cutter.git
cd Audio_Cutter

# 2. Create and activate a virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# macOS / Linux
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment
cp .env.example .env
# Edit .env and set your FLASK_SECRET_KEY

# 5. Run the app
python app.py
```

### 🎉 Open → [http://localhost:5000](http://localhost:5000)

> 📖 **Need more help?** See the [full setup guide →](docs/SETUP.md)

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Backend** | Python 3.9+, Flask 3.x |
| **Audio Engine** | Pydub + FFmpeg |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript |
| **Waveform** | WaveSurfer.js v7 (Regions + Timeline plugins) |
| **Fonts** | Google Fonts — Inter |
| **Icons** | Font Awesome 6 |
| **Logging** | PostgreSQL via psycopg2 (optional) |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Space` | Play / Pause |
| `Double-Click` | Add new region on waveform |
| `Click Region` | Select a region |
| `Delete` | Remove selected region |
| `Ctrl + Z` | Undo last action |
| `← / →` | Skip back / forward 5 seconds |
| `M` | Mute / Unmute |
| `?` | Show shortcuts panel |

---

## 📁 Project Structure

```
Audio_Cutter/
├── app.py                  # Flask backend — routes & audio processing
├── ai_processor.py         # Local AI processing engine (silence, beats, denoise, speech detection)
├── logger.py               # PostgreSQL upload logger (optional)
├── requirements.txt        # Python dependencies
├── .env.example            # Environment configuration template
├── CHANGELOG.md            # Version history
│
├── static/
│   ├── style.css           # Design system (1900+ lines)
│   ├── script.js           # Frontend JS — WaveSurfer, regions, UX (700+ lines)
│   └── logo.png            # App logo
│
├── templates/
│   └── index.html          # Main HTML template (Jinja2)
│
├── .github/
│   ├── workflows/ci.yml    # GitHub Actions CI — linting
│   ├── ISSUE_TEMPLATE/     # Bug report & feature request forms
│   └── PULL_REQUEST_TEMPLATE.md
│
├── docs/
│   ├── SETUP.md            # Detailed setup guide
│   ├── PRODUCTION.md       # Production deployment guide
│   ├── USER_MANUAL.md      # End-user documentation
│   └── CONTRIBUTING.md     # Contribution guidelines
│
├── uploads/                # Temporary uploaded files (auto-cleaned)
├── processed/              # Temporary processed output files
└── logs/                   # Application logs
```

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [📋 Setup Guide](docs/SETUP.md) | Step-by-step setup for beginners |
| [🏭 Production Guide](docs/PRODUCTION.md) | Deploy to a real server |
| [📖 User Manual](docs/USER_MANUAL.md) | How to use every feature |
| [🤝 Contributing](docs/CONTRIBUTING.md) | How to contribute to this project |
| [📋 Changelog](CHANGELOG.md) | Version history |
| [🔒 Security](SECURITY.md) | Vulnerability reporting policy |

---

## 🔧 Configuration

Copy `.env.example` to `.env` and update values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `FLASK_SECRET_KEY` | *(required)* | Session secret key — generate with `python -c "import secrets; print(secrets.token_hex(32))"` |
| `FLASK_PORT` | `5000` | Server port |
| `DB_PASSWORD` | — | PostgreSQL password (optional logging) |

---

## 🗺️ Roadmap

Planned features for upcoming releases:

- [x] **v1.1** — Waveform zoom controls + speed adjustment (0.5×–2×)
- [x] **v1.2** — Local AI integrations (Silence detection, auto-trim, BPM, denoise, Whisper transcription)
- [ ] **v1.3** — Batch file processing (multiple files in one session)
- [ ] **v1.4** — Audio merge from multiple source files
- [ ] **v1.5** — Dark / Light mode toggle
- [ ] **v2.0** — Docker one-command deployment

> 💡 Have an idea? [Open a feature request →](https://github.com/ArPaN-DS/Audio_Cutter/issues/new?template=feature_request.yml)

---

## 🤝 Contributing

Contributions are very welcome! Whether it's a bug fix, a new feature, or improved documentation:

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add awesome feature"`
4. Push & open a Pull Request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for full guidelines.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.
Free to use, modify, and distribute.

---

<p align="center">
  Made with ❤️ by <a href="https://github.com/ArPaN-DS"><strong>ArPaN-DS</strong></a>
  <br><br>
  If this project helped you, please consider giving it a ⭐ — it means a lot!
</p>
