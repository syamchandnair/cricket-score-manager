let runs = 0;
let wickets = 0;
let balls = 0; // Total legal balls bowled
let overs = 0;
let historyStack = [];
let currentOver = [];
let oversHistory = [];
let overStartRuns = 0;
let overStartWickets = 0;
let maxOvers = 8;
let maxPlayers = 11;
let targetScore = 0;

const scoreEl = document.getElementById("score");
const wicketsEl = document.getElementById("wickets");
const oversEl = document.getElementById("overs");
const crrEl = document.getElementById("crr");
const rrrEl = document.getElementById("rrr");
const targetDisplayEl = document.getElementById("target-display");
const rrrContainer = document.getElementById("rrr-container");
const currentOverEl = document.getElementById("current-over-balls");
const historyBodyEl = document.getElementById("history-body");
const maxOversInput = document.getElementById("max-overs");
const maxPlayersInput = document.getElementById("max-players");
const scorecardModal = document.getElementById("scorecard-modal");
const targetInput = document.getElementById("target-score");

function updateDisplay() {
  scoreEl.textContent = runs;
  wicketsEl.textContent = wickets;

  // Calculate overs (e.g., 0.1, 0.2 ... 0.5, 1.0)
  const completedOvers = Math.floor(balls / 6);
  const ballsInOver = balls % 6;
  oversEl.textContent = `${completedOvers}.${ballsInOver}`;

  // Calculate CRR
  let crr = 0;
  if (balls > 0) {
    crr = (runs / (balls / 6)).toFixed(2);
  }
  crrEl.textContent = crr;

  // Calculate RRR if target is set
  if (targetScore > 0) {
    rrrContainer.style.display = "block";
    targetDisplayEl.textContent = targetScore;

    const runsNeeded = targetScore - runs;
    const ballsRemaining = maxOvers * 6 - balls;
    let rrr = 0;

    if (runsNeeded > 0 && ballsRemaining > 0) {
      rrr = (runsNeeded / (ballsRemaining / 6)).toFixed(2);
    } else if (runsNeeded <= 0) {
      rrr = "0.00"; // Target reached
    } else {
      rrr = "Inf"; // Overs finished, target not reached
    }
    rrrEl.textContent = rrr;
  } else {
    rrrContainer.style.display = "none";
  }

  // Update Current Over Balls
  currentOverEl.innerHTML = "";
  currentOver.forEach((ball) => {
    const span = document.createElement("span");
    span.className = "ball";
    span.textContent = ball;
    currentOverEl.appendChild(span);
  });

  // Update History Table
  historyBodyEl.innerHTML = "";
  oversHistory.forEach((over) => {
    const row = document.createElement("tr");
    row.innerHTML = `<td>${over.over}</td><td>${
      over.isMaiden ? 1 : 0
    }</td><td>${over.runs}</td><td>${over.wickets}</td>`;
    historyBodyEl.appendChild(row);
  });
  saveToLocalStorage();
}

function updateMaxOvers() {
  maxOvers = parseInt(maxOversInput.value) || 10;
  updateDisplay();
}

function updateMaxPlayers() {
  maxPlayers = parseInt(maxPlayersInput.value) || 11;
  updateDisplay();
}

function updateTarget() {
  targetScore = parseInt(targetInput.value) || 0;
  updateDisplay();
}

function toggleScorecard() {
  scorecardModal.classList.toggle("hidden");
}

function addRuns(runValue) {
  if (wickets >= maxPlayers - 1) {
    alert("All out!");
    return;
  }
  if (balls >= maxOvers * 6) {
    alert("Innings Complete! Max overs reached.");
    return;
  }
  if (targetScore > 0 && runs > targetScore) {
    alert("Match Won! Target reached.");
    return;
  }
  saveState();
  runs += runValue;
  balls++;
  currentOver.push(runValue);
  checkOverCompletion();
  updateDisplay();

  if (targetScore > 0 && runs > targetScore) {
    setTimeout(() => alert("Match Won! Target reached."), 100);
  }
}

function addExtra(type) {
  if (wickets >= maxPlayers - 1) {
    alert("All out!");
    return;
  }
  if (balls >= maxOvers * 6) {
    alert("Innings Complete! Max overs reached.");
    return;
  }
  if (targetScore > 0 && runs > targetScore) {
    alert("Match Won! Target reached.");
    return;
  }
  saveState();
  // Wides and No Balls add 1 run but are NOT legal deliveries (ball count doesn't increase)
  runs += 1;
  currentOver.push(type.toUpperCase());

  // Note: In standard scoring, if runs are scored off a No Ball (e.g. NB+4),
  // you would typically click NB then the runs.
  // For this simple app, we just count the extra run.

  updateDisplay();

  if (targetScore > 0 && runs > targetScore) {
    setTimeout(() => alert("Match Won! Target reached."), 100);
  }
}

function addWicket() {
  if (wickets < maxPlayers - 1) {
    if (balls >= maxOvers * 6) {
      alert("Innings Complete! Max overs reached.");
      return;
    }
    if (targetScore > 0 && runs > targetScore) {
      alert("Match Won! Target reached.");
      return;
    }
    saveState();
    wickets++;
    balls++;
    currentOver.push("W");
    checkOverCompletion();
    updateDisplay();

    if (wickets >= maxPlayers - 1) {
      setTimeout(() => alert("All out!"), 100);
    }
  } else {
    alert("All out!");
  }
}

function checkOverCompletion() {
  if (balls % 6 === 0 && balls > 0) {
    const runsInOver = runs - overStartRuns;
    const wicketsInOver = wickets - overStartWickets;

    oversHistory.push({
      over: balls / 6,
      runs: runsInOver,
      wickets: wicketsInOver,
      isMaiden: runsInOver === 0,
    });

    currentOver = [];
    overStartRuns = runs;
    overStartWickets = wickets;
  }
}

function startNextInnings() {
  if (confirm("Start Next Innings?")) {
    targetScore = runs + 1;
    targetInput.value = targetScore;
    resetCommonState();
  }
}

function startNewMatch() {
  if (confirm("Start New Match?")) {
    targetScore = 0;
    targetInput.value = "";
    resetCommonState();
  }
}

function resetCommonState() {
  historyStack = [];
  runs = 0;
  wickets = 0;
  balls = 0;
  overs = 0;
  currentOver = [];
  oversHistory = [];
  overStartRuns = 0;
  overStartWickets = 0;
  updateDisplay();
}

function saveState() {
  historyStack.push({
    runs,
    wickets,
    balls,
    currentOver: [...currentOver],
    oversHistory: [...oversHistory],
    overStartRuns,
    overStartWickets,
  });
}

function undoLastAction() {
  if (historyStack.length > 0) {
    const previousState = historyStack.pop();
    runs = previousState.runs;
    wickets = previousState.wickets;
    balls = previousState.balls;
    currentOver = previousState.currentOver;
    oversHistory = previousState.oversHistory;
    overStartRuns = previousState.overStartRuns;
    overStartWickets = previousState.overStartWickets;
    updateDisplay();
  } else {
    alert("Nothing to undo!");
  }
}

function saveToLocalStorage() {
  const state = {
    runs,
    wickets,
    balls,
    overs,
    historyStack,
    currentOver,
    oversHistory,
    overStartRuns,
    overStartWickets,
    maxOvers,
    maxPlayers,
    targetScore,
  };
  localStorage.setItem("cricketScoreState", JSON.stringify(state));
}

function loadFromLocalStorage() {
  const savedState = localStorage.getItem("cricketScoreState");
  if (savedState) {
    const state = JSON.parse(savedState);
    runs = state.runs;
    wickets = state.wickets;
    balls = state.balls;
    overs = state.overs;
    historyStack = state.historyStack;
    currentOver = state.currentOver;
    oversHistory = state.oversHistory;
    overStartRuns = state.overStartRuns;
    overStartWickets = state.overStartWickets;
    maxOvers = state.maxOvers;
    maxPlayers = state.maxPlayers || 11;
    targetScore = state.targetScore;

    maxOversInput.value = maxOvers;
    maxPlayersInput.value = maxPlayers;
    targetInput.value = targetScore || "";
  }
}

// Initialize
loadFromLocalStorage();
updateDisplay();

