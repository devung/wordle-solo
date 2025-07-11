let words = [];
let answer = "";
const maxAttempts = 6;
let currentRow = 0;
let currentGuess = "";
let score = 0;
let round = 0;
let gameEnded = false;

const game = document.getElementById("game");
const message = document.getElementById("message");
const newGameBtn = document.getElementById("new-game");
const scoreboardBody = document.querySelector("#scoreboard-table tbody");
const totalDisplay = document.getElementById("total");
const keyboardButtons = document.querySelectorAll("#keyboard button");

function pickNewWord() {
  answer = words[Math.floor(Math.random() * words.length)].toLowerCase();
}

function setupGame() {
  game.innerHTML = "";
  message.textContent = "";
  newGameBtn.style.display = "none";
  currentRow = 0;
  currentGuess = "";
  gameEnded = false;
  pickNewWord();

  keyboardButtons.forEach(btn => {
    btn.classList.remove("correct", "present", "absent");
  });

  for (let r = 0; r < maxAttempts; r++) {
    for (let c = 0; c < 5; c++) {
      const cell = document.createElement("div");
      cell.classList.add("cell");
      cell.id = `cell-${r}-${c}`;
      game.appendChild(cell);
    }
  }
}

function updateGrid() {
  for (let i = 0; i < 5; i++) {
    const cell = document.getElementById(`cell-${currentRow}-${i}`);
    cell.textContent = currentGuess[i]?.toUpperCase() || "";
  }
}

function updateScoreboard(word, guessesUsed, earnedPoints) {
  round++;
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${round}</td>
    <td>${word.toUpperCase()}</td>
    <td>${guessesUsed}</td>
    <td>${earnedPoints}</td>
  `;
  scoreboardBody.appendChild(row);
  totalDisplay.textContent = `Total: ${score}`;
}

function colorKey(letter, status) {
  const key = Array.from(keyboardButtons).find(btn => btn.dataset.key === letter);
  console.log(key)
  if (!key) return;

  const priority = ["absent", "present", "correct"];
  const current = priority.indexOf(key.classList.contains("correct") ? "correct" : key.classList.contains("present") ? "present" : key.classList.contains("absent") ? "absent" : "");
  const incoming = priority.indexOf(status);
  if (incoming > current) {
    key.classList.remove("correct", "present", "absent");
    key.classList.add(status);
  }
}

function submitGuess() {
  const guess = currentGuess.toLowerCase();
  if (guess.length !== 5) return;

  const guessArray = guess.split("");
  const answerArray = answer.split("");
  const result = Array(5).fill("absent");
  const used = Array(5).fill(false);

  for (let i = 0; i < 5; i++) {
    if (guessArray[i] === answerArray[i]) {
      result[i] = "correct";
      used[i] = true;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] !== "correct") {
      const idx = answerArray.findIndex((char, j) => char === guessArray[i] && !used[j]);
      if (idx !== -1) {
        result[i] = "present";
        used[idx] = true;
      }
    }
  }

  for (let i = 0; i < 5; i++) {
    const cell = document.getElementById(`cell-${currentRow}-${i}`);
    cell.classList.add(result[i]);
    cell.textContent = guessArray[i].toUpperCase();
    colorKey(guessArray[i], result[i]);
  }

  if (guess === answer) {
    const guessesLeft = maxAttempts - 1 - currentRow;
    let earned = 1 + guessesLeft;
    if (currentRow === 0) earned += 6;
    score += earned;

    message.textContent = `🎉 Correct! You scored ${earned} point${earned !== 1 ? "s" : ""}.`;
    updateScoreboard(answer, currentRow + 1, earned);
    gameEnded = true;
    newGameBtn.style.display = "inline-block";
  } else if (currentRow === maxAttempts - 1) {
    message.textContent = `😢 Out of guesses! The word was "${answer.toUpperCase()}".`;
    updateScoreboard(answer, 6, 0);
    gameEnded = true;
    newGameBtn.style.display = "inline-block";
  } else {
    currentRow++;
    currentGuess = "";
  }
}

document.addEventListener("keydown", (e) => {
  if (gameEnded) return;

  if (e.key === "Backspace") {
    currentGuess = currentGuess.slice(0, -1);
    updateGrid();
  } else if (/^[a-zA-Z]$/.test(e.key)) {
    if (currentGuess.length < 5) {
      currentGuess += e.key.toLowerCase();
      updateGrid();
    }
  } else if (e.key === "Enter" && currentGuess.length === 5) {
    submitGuess();
  }
});

document.getElementById("keyboard").addEventListener("click", (e) => {
  if (gameEnded || e.target.tagName !== "BUTTON") return;

  const key = e.target.textContent;
  const action = e.target.dataset.action;

  if (action === "backspace") {
    currentGuess = currentGuess.slice(0, -1);
    updateGrid();
  } else if (action === "enter") {
    if (currentGuess.length === 5) submitGuess();
  } else if (/^[a-zA-Z]$/.test(key)) {
    if (currentGuess.length < 5) {
      currentGuess += key.toLowerCase();
      updateGrid();
    }
  }
});

newGameBtn.addEventListener("click", setupGame);

// Load word list from JSON
fetch("words.json")
  .then(res => res.json())
  .then(data => {
    words = data.filter(word => word.length === 5);
    setupGame();
  })
  .catch(err => {
    message.textContent = "⚠️ Failed to load words.";
    console.error(err);
  });
