# Seasonal Hangout Trivia 🎉

A festive, host-led trivia web app built for remote hangouts and casual group play.  
Designed to be run live by a host who controls pacing, scoring, and vibes.

Built as a lightweight, single-page app with no frameworks and no backend.

---

## ✨ Features

- Multiple rounds with randomized questions (no duplicates per game)
- Category selection or **All Categories**
- Difficulty tagging (Easy / Medium / Hard → 1 / 2 / 3 points)
- Live scoreboard with manual score adjustment
- Scrollable player list for larger groups
- Round winners display with a celebratory sparkle moment
- Festive UI with subtle seasonal theming
- **In-app Season picker** (questions + visuals swap dynamically)

---

## 🌦 Seasonal Design

This project is designed to be reused year-round.

- Questions are stored in seasonal files  
  (e.g. `questions/winter.js`, `questions/stpaddys.js`, `questions/summer.js`)
- Visual theming is handled via optional seasonal CSS overrides  
  (e.g. `themes/winter.css`, `themes/spring-stpaddy.css`, `themes/summer.css`)
- The active season is selected **from the UI**, and the app dynamically loads:
  - the appropriate question bank
  - an optional seasonal theme layer

This allows the same core game logic to be reused for **Winter, Spring, Summer, and future seasons** without modifying the app’s core code.

---

## 🧠 How It’s Used

This app is intentionally **host-driven**, not automated trivia.

The host:

- Adds player names
- Reads questions aloud
- Awards points based on correctness and difficulty
- Controls question pacing
- Advances rounds and announces winners

Perfect for:

- Remote holiday hangouts
- Team socials
- Casual, low-pressure trivia nights

---

## 🛠 Tech Stack

- HTML
- CSS
- Vanilla JavaScript

No frameworks.  
No build tools.  
No backend.

Runs entirely in the browser.

---

## ▶️ Run Locally

The app runs entirely client-side.

For best results (especially with dynamic season loading), use a simple local server:

**Option 1: VS Code Live Server**
- Open `index.html`
- Right-click → **Open with Live Server**

**Option 2: Python HTTP server**
```bash
python3 -m http.server
```

## Future Ideas

- Expanded seasonal question packs
- Additional seasonal visual themes
- Optional auto-season mode based on date
- Host keyboard shortcuts
- Exportable scores for repeat events

---

## AI Collaboration

Built with the help of AI (ChatGPT) as a development partner.

Concept, structure, UX decisions, and final code were directed, edited, and owned by me.
