const board = document.getElementById("game-board");
const scoreDisplay = document.getElementById("coinscore");
const rows = 10;
const cols = 10;
const circle = document.createElement("div");
circle.classList.add("circle");
const ai = document.createElement("div");
ai.classList.add("ai");
let killed = false;
var audio = new Audio('sound/coin.mp3');
let coincount = 0;


let coinscore = 0;

// Initialize a 10x10 array with consecutive numbers
const numRows = 10;
const numCols = 10;
let x = 0;
let y = 0;
let x_npc = 0;
let y_npc = 9;
game_board = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 0, 0, 0],
  [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 1, 1, 0, 1, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
];
let xp = x;
let yp = y;

function shortestPathSearch(game_board, y_npc, x_npc, yp, xp) {
  const numRows = game_board.length;
  const numCols = game_board[0].length;

  // Define movement directions (up, down, left, right)
  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  // Create a 2D array to mark visited cells and store parent cells
  const visited = Array(numRows)
    .fill(false)
    .map(() => Array(numCols).fill(false));
  const parent = Array(numRows)
    .fill(null)
    .map(() => Array(numCols).fill(null));

  // Create a queue for BFS
  const queue = [];

  // Push the NPC's position into the queue
  queue.push([y_npc, x_npc]);
  visited[y_npc][x_npc] = true;

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    if (x === yp && y === xp) {
      // Found the player's position, reconstruct the path
      const path = [];
      let curX = yp;
      let curY = xp;
      while (curX !== y_npc || curY !== x_npc) {
        path.push([curX, curY]);
        const [prevX, prevY] = parent[curX][curY];
        curX = prevX;
        curY = prevY;
      }
      path.push([y_npc, x_npc]);
      path.reverse(); // Reverse the path to start from player's position
      return path;
    }

    // Explore adjacent cells
    for (let i = 0; i < 4; i++) {
      const newX = x + dx[i];
      const newY = y + dy[i];

      if (newX >= 0 && newX < numRows && newY >= 0 && newY < numCols && game_board[newX][newY] === 0 && !visited[newX][newY]) {
        queue.push([newX, newY]);
        visited[newX][newY] = true;
        parent[newX][newY] = [x, y];
      }
    }
  }

  // If no path is found, return an empty array
  return [];
}

// Function to check if there's a coin nearby
function isCoinNearby(i, j) {
  const positions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
  ];

  for (const [dx, dy] of positions) {
    const newRow = i + dx;
    const newCol = j + dy;

    if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
      if (game_board[newRow][newCol] === 2) {
        return true;
      }
    }
  }
  return false;
}

// Create the game board with randomly spawned coins
function createBoard() {
  for (let i = 0; i < rows; i++) {
    const row = document.createElement("tr");
    for (let j = 0; j < cols; j++) {
      const cell = document.createElement("td");
      row.appendChild(cell);

      if (game_board[i][j] === 1) {
        // Create a square element
        const square = document.createElement("div");
        square.classList.add("square");
        cell.appendChild(square);
      }

      if (Math.random() < 0.1 && !isCoinNearby(i, j) && game_board[i][j] !== 1) {
        // Randomly spawn a coin (represented by 2) with a 10% chance
        game_board[i][j] = 2;
        // Create a coin element
        coincount=coincount+1
        const coin = document.createElement("div");
        coin.classList.add("coin");
        cell.appendChild(coin);
      }

    }
    board.appendChild(row);
  }
  // Add the circle to the starting position
  board.rows[y].cells[x].appendChild(circle);
  board.rows[y_npc].cells[x_npc].appendChild(ai);
}





// Function to move the circle and collect coins
function moveCircle(event) {
  let newX = x;
  let newY = y;

  switch (event.key) {
    case "ArrowUp":
      if (y > 0) {
        newY = y - 1;
      }
      break;
    case "ArrowDown":
      if (y < rows - 1) {
        newY = y + 1;
      }
      break;
    case "ArrowLeft":
      if (x > 0) {
        newX = x - 1;
      }
      break;
    case "ArrowRight":
      if (x < cols - 1) {
        newX = x + 1;
      }
      break;
  }
  let xp = x;
  let yp = y;

  const nextCell = board.rows[newY].cells[newX];

  if (!nextCell.querySelector('.square')) {
    x = newX;
    y = newY;
    const coin = nextCell.querySelector('.coin');
    if (coin) {
      // Collect the coin and update the score
      audio.play();
      coinscore++;
      Checkwin();

      scoreDisplay.textContent = coinscore;
      coin.remove(); // Remove the collected coin from the board


    }

    // Move the circle to the new position
    nextCell.appendChild(circle);
  }
  Checkkill()
}

// Listen for keyboard events
document.addEventListener("keydown", moveCircle);

function Checkkill() {
  if(x_npc == x && y_npc == y && !killed){
    circle.classList.remove("circle");
    killed=true;
    window.location.href = "/gameover.html";
  }

}

function moveAI() {
  if(!killed){
    const Path = shortestPathSearch(game_board, y_npc, x_npc, y, x);
    console.log(Path);
    if (Path.length > 1) {
      x_npc = Path[1][1];
      y_npc = Path[1][0];
    }
    board.rows[y_npc].cells[x_npc].appendChild(ai);
  Checkkill();
  }
}

function Checkwin() {
  if(coinscore == coincount){
    circle.classList.remove("circle");
    killed=false;
    window.location.href = "/winover1.html";
    }
  }

setInterval(moveAI, 400);




createBoard();
