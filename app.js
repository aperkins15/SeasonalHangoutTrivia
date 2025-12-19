// --- CONFIG ---
const GAME_CONFIG = {
  rounds: [
    { name: "Round 1", questionsPerRound: 7 },
    { name: "Round 2", questionsPerRound: 7 },
    { name: "Round 3", questionsPerRound: 8 },
  ],
  pointsDefault: 3,
};

// --- STATE ---
let players = []; // {name, score}
let currentRoundIndex = 0;
let currentQuestionIndex = 0;
let roundQuestions = [];
let roundActive = false;
let usedQuestionIds = new Set();

// --- DOM ---
const seasonSelect = document.getElementById("seasonSelect");
const roundPill = document.getElementById("roundPill");
const qPill = document.getElementById("qPill");
const categorySelect = document.getElementById("categorySelect");
const catPill = document.getElementById("catPill");
const questionText = document.getElementById("questionText");
const choicesList = document.getElementById("choicesList");
const answerBox = document.getElementById("answerBox");
const answerText = document.getElementById("answerText");
const diffPill = document.getElementById("diffPill");
const funFact = document.getElementById("funFact");

const startBtn = document.getElementById("startBtn");
const nextBtn = document.getElementById("nextBtn");
const revealBtn = document.getElementById("revealBtn");
const skipBtn = document.getElementById("skipBtn");

const playerName = document.getElementById("playerName");
const addPlayerBtn = document.getElementById("addPlayerBtn");
const scoreBody = document.getElementById("scoreBody");

const playerSelect = document.getElementById("playerSelect");
const pointsSelect = document.getElementById("pointsSelect");
const addPointsBtn = document.getElementById("addPointsBtn");

const topN = document.getElementById("topN");
const showWinnersBtn = document.getElementById("showWinnersBtn");
const winnersArea = document.getElementById("winnersArea");

const resetRoundBtn = document.getElementById("resetRoundBtn");
const resetAllBtn = document.getElementById("resetAllBtn");

// --- SEASONS (winter is base; others may add an override CSS) ---
const SEASONS = {
  winter: {
    // winter is ALWAYS ON via themes/winter.css in index.html
    cssOverride: "", // no override
    questionsSrc: "winter.js",
  },
  "spring-stpaddy": {
    cssOverride: "themes/spring-stpaddy.css",
    questionsSrc: "stpaddys.js",
  },
};

let activeSeason = "winter";

// Loads questions + optional override CSS, then re-inits the game safely
function setSeason(seasonKey) {
  activeSeason = SEASONS[seasonKey] ? seasonKey : "winter";

  // 1) CSS override (optional)
  const seasonLink = document.getElementById("seasonTheme");
  if (seasonLink) {
    seasonLink.href = SEASONS[activeSeason].cssOverride || "";
  }

  // 2) Replace the questions script
  const prior = document.getElementById("seasonQuestions");
  if (prior) prior.remove();

  const s = document.createElement("script");
  s.id = "seasonQuestions";
  s.src = SEASONS[activeSeason].questionsSrc;

  s.onload = () => {
    if (!Array.isArray(window.QUESTION_BANK)) {
      console.error(
        "Season questions loaded, but window.QUESTION_BANK is missing or not an array."
      );
      questionText.textContent =
        "Questions failed to load. Check the season questions file.";
      return;
    }

    usedQuestionIds.clear();
    resetAll();
    populateCategoryDropdown();
    updatePills(null);
    renderScoreboard();
    questionText.innerHTML = `Click <b>Start Round</b> to begin.`;
  };

  s.onerror = () => {
    console.error(`Failed to load questions for season: ${activeSeason}`);
  };

  document.head.appendChild(s);
}

// --- HELPERS ---
function currentRound() {
  return (
    GAME_CONFIG.rounds[currentRoundIndex] ??
    GAME_CONFIG.rounds[GAME_CONFIG.rounds.length - 1]
  );
}

function updatePills(qObj) {
  // Round + question count
  roundPill.textContent = `Round ${currentRoundIndex + 1}: ${
    currentRound().name
  }`;
  qPill.textContent = `Question ${currentQuestionIndex + 1} / ${
    roundQuestions.length || currentRound().questionsPerRound
  }`;

  // Category logic
  if (qObj && qObj.cat) {
    // During a question: show the actual question category
    catPill.textContent = `Category: ${getCategory(qObj)}`;
  } else {
    // Before round start or between rounds: show selected category
    const selected = categorySelect?.value || "ALL";
    catPill.textContent =
      selected === "ALL" ? "Category: All Categories" : `Category: ${selected}`;
  }

  // Difficulty pill
  if (qObj) {
    const d = difficultyValue(qObj);
    diffPill.textContent = `Difficulty: ${difficultyLabel(d)} • ${d} pt${
      d === 1 ? "" : "s"
    }`;
  } else {
    diffPill.textContent = "Difficulty: —";
  }
}

function populateCategoryDropdown() {
  const cats = uniqueCategories();
  categorySelect.innerHTML = cats
    .map((c) => {
      const label = c === "ALL" ? "All categories" : displayCategoryName(c);
      return `<option value="${c}">${label}</option>`;
    })
    .join("");
}

function displayCategoryName(cat) {
  return cat === "Winter" ? "Seasonal" : cat;
}

function uniqueCategories() {
  const bank = Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK : [];
  const cats = new Set(bank.map(getCategory).filter(Boolean));
  return ["ALL", ...Array.from(cats).sort()];
}

function getAvailableQuestions(category) {
  return QUESTION_BANK.filter((q) => {
    const matchesCat = category === "ALL" || getCategory(q) === category;
    const unused = !usedQuestionIds.has(getId(q));
    return matchesCat && unused;
  });
}

function getCategory(q) {
  return q.cat.split("_")[0]; // "Movies_01" -> "Movies"
}
function getId(q) {
  return q.cat; // treat "Movies_01" as unique ID
}
function difficultyValue(q) {
  return q?.diff ?? 1;
}

function difficultyLabel(d) {
  if (d === 1) return "Easy";
  if (d === 2) return "Medium";
  return "Hard";
}

function renderQuestion(qObj) {
  updatePills(qObj);
  answerBox.style.display = "none";
  answerText.textContent = "";
  funFact.textContent = "";
  pointsSelect.value = String(difficultyValue(qObj));

  if (!qObj) {
    questionText.innerHTML = `Round complete. Hit <b>Reset Round</b> or move to the next round.`;
    choicesList.innerHTML = "";
    revealBtn.disabled = true;
    nextBtn.disabled = true;
    skipBtn.disabled = true;
    return;
  }

  questionText.textContent = qObj.q;
  choicesList.innerHTML = "";

  if (qObj.choices && qObj.choices.length) {
    qObj.choices.forEach((c) => {
      const li = document.createElement("li");
      li.textContent = c;
      choicesList.appendChild(li);
    });
  } else {
    const li = document.createElement("li");
    li.innerHTML = "<i>Short answer (people answer in chat)</i>";
    choicesList.appendChild(li);
  }
  revealBtn.disabled = false;
  nextBtn.disabled = true; // only after reveal
  skipBtn.disabled = false;
}

function revealAnswer() {
  const qObj = roundQuestions[currentQuestionIndex];
  if (!qObj) return;
  answerBox.style.display = "block";
  answerText.textContent = qObj.a;
  funFact.textContent = qObj.fact ? `Fun fact: ${qObj.fact}` : "";
  nextBtn.disabled = false;
  revealBtn.disabled = true;
}

function nextQuestion() {
  currentQuestionIndex++;
  const qObj = roundQuestions[currentQuestionIndex];
  renderQuestion(qObj);
}

function startRound() {
  const perRound = currentRound().questionsPerRound;
  const chosen = categorySelect.value || "ALL";
  roundQuestions = pickQuestions({ category: chosen, count: perRound });

  currentQuestionIndex = 0;
  roundActive = true;
  categorySelect.disabled = true;

  renderQuestion(roundQuestions[currentQuestionIndex]);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions({ category, count }) {
  // Prefer selected category
  const preferred = QUESTION_BANK.filter((q) => {
    const matches = category === "ALL" || getCategory(q) === category;
    return matches && !usedQuestionIds.has(getId(q));
  });

  const picked = shuffle(preferred).slice(0, count);

  // Top off from anywhere if needed
  if (picked.length < count) {
    const need = count - picked.length;
    const fallback = QUESTION_BANK.filter(
      (q) =>
        !usedQuestionIds.has(getId(q)) &&
        !picked.some((p) => getId(p) === getId(q))
    );

    picked.push(...shuffle(fallback).slice(0, need));
  }

  picked.forEach((q) => usedQuestionIds.add(getId(q)));
  return picked;
}

function resetRound(advanceRound = true) {
  roundQuestions = [];
  currentQuestionIndex = 0;
  roundActive = false;

  startBtn.disabled = false;
  nextBtn.disabled = true;
  revealBtn.disabled = true;
  skipBtn.disabled = true;
  answerBox.style.display = "none";
  questionText.innerHTML = `Click <b>Start Round</b> to begin.`;
  choicesList.innerHTML = "";
  categorySelect.disabled = false;

  if (advanceRound) {
    currentRoundIndex = (currentRoundIndex + 1) % GAME_CONFIG.rounds.length;
  }
  updatePills(null);
}

function addPlayer(name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  if (players.some((p) => p.name.toLowerCase() === trimmed.toLowerCase()))
    return;

  players.push({ name: trimmed, score: 0 });
  players = players.sort((a, b) => a.name.localeCompare(b.name));
  renderScoreboard();
  playerName.value = "";
}

function renderScoreboard() {
  // table
  scoreBody.innerHTML = "";
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  sorted.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
        <td>${p.name}</td>
        <td><b>${p.score}</b></td>
        <td>
          <button data-act="minus" data-name="${p.name}">-</button>
          <button data-act="plus" data-name="${p.name}">+</button>
        </td>
      `;
    scoreBody.appendChild(tr);
  });

  // dropdown
  playerSelect.innerHTML =
    `<option value="">Select player…</option>` +
    players.map((p) => `<option value="${p.name}">${p.name}</option>`).join("");

  updateWinners(false);
}

function adjustScore(name, delta) {
  const p = players.find((x) => x.name === name);
  if (!p) return;
  p.score = Math.max(0, p.score + delta);
  renderScoreboard();
}

function awardPoints() {
  const name = playerSelect.value;
  const pts = parseInt(pointsSelect.value, 10);
  if (!name || Number.isNaN(pts)) return;
  adjustScore(name, pts);
}

function showWinnerSparkle(names) {
  const overlay = document.getElementById("winnerSparkle");
  const nameEl = document.getElementById("winnerNames");

  nameEl.textContent = names.join(" & ");
  overlay.classList.remove("hidden");

  setTimeout(() => {
    overlay.classList.add("hidden");
  }, 2500);
}

function updateWinners(sparkle = false) {
  if (!players.length) {
    winnersArea.textContent = "—";
    return;
  }
  const N = parseInt(topN.value, 10);
  const sorted = [...players].sort(
    (a, b) => b.score - a.score || a.name.localeCompare(b.name)
  );
  const top = sorted.slice(0, N);

  // include ties at the cutoff
  const cutoffScore = top[top.length - 1]?.score ?? 0;
  const withTies = sorted.filter((p) => p.score >= cutoffScore && p.score > 0);

  if (!withTies.length) {
    winnersArea.textContent = "No points yet—everyone’s still perfect. 😄";
    return;
  }

  winnersArea.innerHTML =
    `<b>Current leaders:</b> ` +
    withTies
      .map((p, i) => `${i === 0 ? "🏆" : "✨"} ${p.name} (${p.score})`)
      .join(" • ");

  if (sparkle) {
    showWinnerSparkle(withTies.map((p) => p.name));
  }
}

function resetAll() {
  players = [];
  currentRoundIndex = 0;
  resetRound(false);
  renderScoreboard();
  usedQuestionIds.clear();
}

// --- EVENTS ---
startBtn.addEventListener("click", startRound);
revealBtn.addEventListener("click", revealAnswer);
nextBtn.addEventListener("click", nextQuestion);
skipBtn.addEventListener("click", () => nextQuestion());
const fullscreenBtn = document.getElementById("fullscreenBtn");

if (seasonSelect) {
  seasonSelect.addEventListener("change", (e) => {
    setSeason(e.target.value);
  });
}

fullscreenBtn.addEventListener("click", () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    fullscreenBtn.textContent = "⛶ Exit Full Screen";
  } else {
    document.exitFullscreen();
    fullscreenBtn.textContent = "⛶ Full Screen";
  }
});

addPlayerBtn.addEventListener("click", () => addPlayer(playerName.value));
playerName.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addPlayer(playerName.value);
});

scoreBody.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  const name = btn.getAttribute("data-name");
  const act = btn.getAttribute("data-act");
  if (act === "plus") adjustScore(name, 1);
  if (act === "minus") adjustScore(name, -1);
});

categorySelect.addEventListener("change", () => {
  updatePills(null);
});

addPointsBtn.addEventListener("click", awardPoints);
showWinnersBtn.addEventListener("click", () => updateWinners(true));

resetRoundBtn.addEventListener("click", () => resetRound(false));
resetAllBtn.addEventListener("click", resetAll);

// init
window.initGame = function initGame() {
  // Boot with winter by default (base theme is already on)
  if (seasonSelect) seasonSelect.value = activeSeason;

  // Load season assets (questions + optional override)
  setSeason(activeSeason);

  // Set default points selector
  pointsSelect.value = String(GAME_CONFIG.pointsDefault);
};
