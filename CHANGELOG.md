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

## [1.0.1] — 2026-06-10 🐛 Bug Fix Release

### Fixed
- **WaveSurfer.js v7 plugin wiring** — `wsRegions` is now created before `WaveSurfer.create()` and passed directly into the `plugins` array, replacing the broken `wavesurfer.plugins[1]` accessor that returned `undefined` and prevented audio from loading into the editor
- **Region playback** — "Play just this region" button now calls `region.play()` (WaveSurfer v7 API) instead of the deprecated `wavesurfer.play(start, end)` which was silently ignored
- **Normalization crash on silent audio** — added guard to skip `apply_gain()` when a segment's dBFS is `-inf` (completely silent), preventing a `ValueError` crash in the `/cut` endpoint
- **Database logger blocking requests** — logger now reads DB config from environment variables; if `DB_NAME` or `DB_PASSWORD` are unset it writes directly to `logs/activity_log.csv` without ever attempting a TCP connection, eliminating the multi-second stall on every export

### Added
- **Transcribe Audio button** restored to the AI Audio Assistants panel (`Find Pauses & Speech` card) with purple accent hover styling
- **CSV fallback logging** — `logger.py` now has a dedicated `log_to_csv()` function used as a fallback when PostgreSQL is not configured or fails to connect (with a hard 3-second `connect_timeout`)

---


## [Unreleased] — Coming Soon

### Planned
- Waveform zoom controls + playback speed adjustment (0.5×–2×)
- Batch file processing (multiple files in one session)
- Merge audio from multiple source files
- Dark / Light mode toggle
- Docker one-command deployment
