# Changelog

All notable changes to **Audio Cutter Pro** are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).  
This project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.0] — 2026-06-09 🎉 Initial Public Release

### Added
- **Multi-Region Cutting** — create unlimited independent cut regions on the waveform
- **Audio Effects** — Fade In, Fade Out, Normalize (−14 dBFS), Reverse
- **Flexible Export** — MP3 (320kbps) or WAV; merged single file or separate ZIP archive
- **Microphone Recording** — record audio directly in the browser via Web Audio API
- **Drag & Drop Upload** — drop audio or video files directly onto the page
- **Undo / Redo** — full undo system (`Ctrl+Z`) for all region operations
- **Keyboard Shortcuts** — Space, Delete, Ctrl+Z, ←/→, M, ?
- **WaveSurfer.js v7** waveform visualization with Regions and Timeline plugins
- **Premium glassmorphism UI** — Swiss Design aesthetic, fully responsive
- **PostgreSQL upload logger** (`logger.py`) — optional analytics
- **Comprehensive documentation** — SETUP.md, PRODUCTION.md, USER_MANUAL.md, CONTRIBUTING.md
- **GitHub Actions CI** — flake8 linting on every push and pull request
- **GitHub Issue Templates** — structured bug report and feature request forms
- **MIT License**

### Security
- Secret key now loaded from `FLASK_SECRET_KEY` environment variable (no more hardcoded keys)
- Added `.env.example` configuration template
- `uploads/` and `processed/` directories excluded from version control

---

## [Unreleased] — Coming Soon

### Planned
- Waveform zoom controls + playback speed adjustment (0.5×–2×)
- Batch file processing (multiple files in one session)
- Merge audio from multiple source files
- Dark / Light mode toggle
- Docker one-command deployment
