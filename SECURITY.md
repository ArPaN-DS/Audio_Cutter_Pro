# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| 1.0.x   | ✅ Yes     |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub Issues.**

If you discover a security vulnerability in Audio Cutter Pro, please report it responsibly:

1. **Open a [GitHub Security Advisory](https://github.com/ArPaN-DS/Audio_Cutter/security/advisories/new)** (preferred — keeps it private until patched)
2. Or contact the maintainer directly via the email listed on the [GitHub profile](https://github.com/ArPaN-DS)

### What to Include

Please provide as much of the following as possible:

- Type of vulnerability (e.g., path traversal, code injection, XSS)
- Location of the affected source file (file path, line number)
- Step-by-step reproduction instructions
- Proof-of-concept or exploit code (if available)
- Impact assessment — what an attacker could achieve

### Response Timeline

- **Acknowledgement**: within 48 hours
- **Status update**: within 7 days
- **Patch release**: as soon as reasonably possible

We appreciate responsible disclosure and will credit you in the release notes (unless you prefer to remain anonymous).

## Security Best Practices for Self-Hosters

- Always set a strong `FLASK_SECRET_KEY` in your `.env` file
- Run behind a reverse proxy (Nginx/Caddy) — do not expose Flask directly to the internet
- Restrict file upload types and sizes at the proxy level
- Regularly update dependencies: `pip install --upgrade -r requirements.txt`
- Keep FFmpeg up to date on your server
