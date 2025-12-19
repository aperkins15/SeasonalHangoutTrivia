# Seasonal Hangout Trivia 🎉

A festive, host-led trivia web app built for remote holiday hangouts.  
Designed to be run live by a host who controls pacing, scoring, and vibes.

Built as a lightweight, single-page app with no frameworks and no backend.

---

## ✨ Features

- Multiple rounds with randomized questions (no duplicates per game)
- Category selection or “All categories”
- Difficulty tagging (Easy / Medium / Hard → 1 / 2 / 3 points)
- Live scoreboard with manual score adjustment
- Scrollable player list for larger groups
- Round winners display with a celebratory sparkle moment
- Festive UI with subtle winter theming

---

## 🌦 Seasonal Design

This project is designed to be reused quarterly.

- Questions are stored in seasonal files (e.g. `questions/winter.js`)
- Visual theming is handled via seasonal CSS files (e.g. `themes/winter.css`)
- Switching seasons requires changing only a couple of includes in `index.html`

This allows the same core app to be reused for Winter, Spring, Summer, and Fall events without modifying game logic.

---

## 🧠 How It’s Used

This app is meant to be **host-driven**, not automated trivia.

The host:
- Adds player names
- Reads questions aloud
- Awards points based on correctness and difficulty
- Advances rounds and announces winners

Perfect for:
- Remote holiday hangouts
- Team socials
- Low-pressure trivia nights

---

## 🛠 Tech Stack

- **HTML**
- **CSS**
- **Vanilla JavaScript**

No frameworks, no build tools, no backend.

Runs entirely in the browser

---

## ▶️ Run Locally
Runs entirely in the browser and can be opened directly via `file://` (no server required).

### Option 1: VS Code Live Server (recommended)
- Open `index.html`
- Right-click → **Open with Live Server**

### Option 2: Python HTTP server
```bash
python3 -m http.server
```
---
## 🔮 Future Ideas

- Expanded seasonal question packs
- Additional seasonal visual themes
- Optional season selector in the UI
- Exportable scores for repeat events

---

## 🤖 AI Collaboration

Built with the help of AI (ChatGPT) as a development partner.  
Concept, structure, UX decisions, and final code were directed, edited, and owned by me.


