# Surprise Greeting Website

Static site (HTML/CSS/JS). No backend, no camera, no permissions, no tracking.

## Deploy on GitHub Pages
1. Create a new GitHub repository.
2. Upload all files from this folder (keep the folder structure).
3. Commit to the `main` branch.
4. Open **Settings → Pages**.
5. Under **Build and deployment**, choose **Deploy from a branch**.
6. Select branch `main` and folder `/ (root)`, then **Save**.
7. Wait 1–2 minutes, then open `https://USERNAME.github.io/REPOSITORY/`.

## Customize (edit `js/config.js` only)
- **Name / messages:** `recipientName`, `greetingTitle`, `greetingMessage`, `finalMessage`, `introText`
- **Photo:** put an image at `assets/images/sumaiya.jpg` (or change `photoPath`). Keep it under ~300 KB. Missing photo shows a placeholder.
- **Music:** put an MP3 at `assets/audio/background.mp3` (or change `audioPath`). It starts only after "Tap to Begin". Missing file = no music, no errors.
- **Theme:** `theme` = `romantic`, `golden` or `ocean`. Colors live in `css/style.css` (`:root` variables).
- **Fireworks:** `fireworksIntensity` = `low`, `medium`, `high`; toggle with `enableFireworks` / `enableParticles`.

## Local preview
ES modules need a server (not `file://`): run `python3 -m http.server` in this folder and open `http://localhost:8000`.
