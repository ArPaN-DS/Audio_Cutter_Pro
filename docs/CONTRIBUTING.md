# 🤝 Contributing to Audio Cutter Pro

Thank you for your interest in contributing! Here's how to get started.

---

## 📋 How to Contribute

### 1. Fork & Clone
```bash
git fork https://github.com/ArPaN-DS/Audio_Cutter.git
git clone https://github.com/YOUR_USERNAME/Audio_Cutter.git
cd Audio_Cutter
```

### 2. Create a Branch
```bash
git checkout -b feature/your-feature-name
```

### 3. Make Your Changes
- Follow the code style of the existing codebase
- Test your changes locally before submitting
- Update documentation if needed

### 4. Commit & Push
```bash
git add .
git commit -m "feat: description of your change"
git push origin feature/your-feature-name
```

### 5. Open a Pull Request
- Go to the [repository on GitHub](https://github.com/ArPaN-DS/Audio_Cutter)
- Click "New Pull Request"
- Describe your changes clearly

---

## 📐 Code Style

### Python (Backend)
- Follow PEP 8
- Use meaningful variable names
- Add comments for complex logic
- Keep functions small and focused

### JavaScript (Frontend)
- Use `const` / `let` (never `var`)
- Use arrow functions where appropriate
- Add comments for complex logic

### CSS
- Follow the existing design system (CSS custom properties in `:root`)
- Use the existing spacing / radius / color variables
- Don't add new utility frameworks

---

## 🐛 Reporting Bugs

Open an issue on [GitHub Issues](https://github.com/ArPaN-DS/Audio_Cutter/issues) with:

1. **Description** of the bug
2. **Steps to reproduce**
3. **Expected behavior** vs **actual behavior**
4. **Browser & OS** information
5. **Screenshots** (if applicable)

---

## 💡 Feature Requests

Open an issue with the `enhancement` label describing:
1. What the feature should do
2. Why it would be useful
3. Any mockups or examples

---

## 📦 Project Architecture

```
app.py          → Flask routes + audio processing logic
logger.py       → PostgreSQL upload logging
static/
  style.css     → Complete design system (1900+ lines)
  script.js     → WaveSurfer.js integration + UI logic (700+ lines)
  logo.png      → App logo
templates/
  index.html    → Single-page Jinja2 template
```

### Key Technologies
- **Flask** — Python web framework
- **Pydub** — Audio manipulation (wraps FFmpeg)
- **WaveSurfer.js** — Browser-based waveform rendering
- **Font Awesome** — Icons
- **Google Fonts (Inter)** — Typography

---

Thank you for contributing! 🎵
