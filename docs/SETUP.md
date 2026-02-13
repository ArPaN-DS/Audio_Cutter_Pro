# 📋 Audio Cutter Pro — Setup Guide

> **This guide is written for beginners.** Follow each step carefully, even if you've never worked with Python before.

---

## 📌 What You'll Need

Before starting, make sure you have these installed on your computer:

| Software | Why You Need It | Download Link |
|----------|----------------|---------------|
| **Python 3.9 or newer** | Runs the backend server | [python.org/downloads](https://www.python.org/downloads/) |
| **FFmpeg** | Processes audio files (cut, convert, etc.) | [ffmpeg.org/download](https://ffmpeg.org/download.html) |
| **Git** | Clone the project from GitHub | [git-scm.com](https://git-scm.com/) |
| **A web browser** | Use the app (Chrome, Firefox, Edge, etc.) | Already installed! |
| **PostgreSQL** *(optional)* | Log upload statistics | [postgresql.org](https://www.postgresql.org/download/) |

---

## Step 1 — Install Python

### Windows
1. Go to [python.org/downloads](https://www.python.org/downloads/)
2. Download the latest Python 3 installer
3. **IMPORTANT:** During installation, check the box that says **"Add Python to PATH"**
4. Click "Install Now"
5. Verify by opening Command Prompt and typing:
   ```
   python --version
   ```
   You should see something like `Python 3.11.5`

### macOS
```bash
brew install python3
```

### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install python3 python3-pip python3-venv
```

---

## Step 2 — Install FFmpeg

FFmpeg is required by the audio processing library (Pydub).

### Windows
1. Go to [gyan.dev/ffmpeg/builds](https://www.gyan.dev/ffmpeg/builds/)
2. Download **"ffmpeg-release-essentials.zip"**
3. Extract the ZIP file to `C:\ffmpeg`
4. Add `C:\ffmpeg\bin` to your system PATH:
   - Search for "Environment Variables" in Windows
   - Click "Edit the system environment variables"
   - Click "Environment Variables"
   - Under "System Variables", find `Path` and click "Edit"
   - Click "New" and add: `C:\ffmpeg\bin`
   - Click OK on all windows
5. Verify by opening a **new** Command Prompt:
   ```
   ffmpeg -version
   ```

### macOS
```bash
brew install ffmpeg
```

### Linux (Ubuntu/Debian)
```bash
sudo apt install ffmpeg
```

---

## Step 3 — Clone the Project

Open a terminal (Command Prompt, PowerShell, or Terminal) and run:

```bash
git clone https://github.com/ArPaN-DS/Audio_Cutter.git
cd Audio_Cutter
```

---

## Step 4 — Set Up Virtual Environment

A virtual environment keeps this project's dependencies separate from other Python projects.

```bash
# Create the virtual environment
python -m venv venv

# Activate it:
# Windows (Command Prompt):
venv\Scripts\activate

# Windows (PowerShell):
venv\Scripts\Activate.ps1

# macOS / Linux:
source venv/bin/activate
```

> After activation, you should see `(venv)` at the beginning of your terminal prompt.

---

## Step 5 — Install Dependencies

```bash
pip install -r requirements.txt
```

This installs:
- **Flask** — The web framework
- **Pydub** — Audio processing library
- **psycopg2-binary** — PostgreSQL connector (for logging)

---

## Step 6 — Configure Environment (Optional)

If you want to change the default settings:

```bash
# Copy the example config
# Windows:
copy .env.example .env

# macOS / Linux:
cp .env.example .env
```

Then edit `.env` with your preferred text editor to set the PostgreSQL password.

> **Note:** The app works perfectly fine without PostgreSQL. The database is only used for logging upload statistics. If PostgreSQL is not configured, the app will print a warning but continue working normally.

---

## Step 7 — Run the Application

```bash
python app.py
```

You should see output like:
```
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

---

## Step 8 — Open the App

Open your web browser and go to:

### 👉 [http://localhost:5000](http://localhost:5000)

You should see the Audio Cutter Pro interface!

---

## 🔧 Troubleshooting

### "Python is not recognized"
- **Solution:** Reinstall Python and make sure to check "Add Python to PATH"

### "FFmpeg not found" or audio processing fails
- **Solution:** Make sure FFmpeg is installed and added to your system PATH. Restart your terminal after adding it.

### "ModuleNotFoundError: No module named 'flask'"
- **Solution:** Make sure your virtual environment is activated (you should see `(venv)` in your prompt), then run `pip install -r requirements.txt`

### "DATABASE ERROR: password authentication failed"
- **Solution:** This is a non-critical warning. Either:
  - Set the correct PostgreSQL password in `logger.py` (line 9)
  - Or ignore it — the app works fine without the database

### Port 5000 is already in use
- **Solution:** Change the port in `app.py` (last line):
  ```python
  app.run(debug=True, port=5001)  # Change to any available port
  ```

---

## ✅ You're Done!

The app is now running. To learn how to use it, check the [User Manual](USER_MANUAL.md).

To stop the server, press `Ctrl + C` in your terminal.
