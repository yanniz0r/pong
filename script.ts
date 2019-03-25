const gameCanvas = document.getElementById('game') as HTMLCanvasElement;

const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_HEIGHT = GAME_HEIGHT / 10;
const PLAYER_WIDTH = 10;
const PLAYER_FRAME_DISTANCE = 5;
const PLAYER_VELOCITY = 0.4;

const BALL_SIZE = 10;
const BALL_BASE_VELOCITY = 0.25;

gameCanvas.style.background = 'black';
gameCanvas.width = GAME_WIDTH;
gameCanvas.height = GAME_HEIGHT;

const context = gameCanvas.getContext('2d')!;

const clearFrame = () => context.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

const drawPlayer = (x: number, y: number) => {
  x = x < 0 ? 0 : x;
  y = y > GAME_HEIGHT - PLAYER_HEIGHT ? GAME_HEIGHT - PLAYER_HEIGHT : y;
  y = y < 0 ? 0 : y;
  context.fillStyle = 'white';
  context.fillRect(x, y, PLAYER_WIDTH, PLAYER_HEIGHT);
}

const initialBallPosition = () => {
  return {
    x: (GAME_WIDTH + BALL_SIZE) / 2,
    y: (GAME_HEIGHT + BALL_SIZE) / 2
  }  
}

const initialPlayerPosition = () => {
  return (GAME_HEIGHT - PLAYER_HEIGHT) / 2;
}

const initialBallVelocity = () => {
  return {
    x: Math.random() > 0.5 ? BALL_BASE_VELOCITY : BALL_BASE_VELOCITY * -1,
    y: (Math.random() > 0.5 ? BALL_BASE_VELOCITY : BALL_BASE_VELOCITY * -1) * 0.25
  }
}

const drawStatus = (text: string) => {
  context.fillStyle = 'red';
  context.font = '48px Helvetica';
  context.textAlign = 'center';
  context.fillText(text, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 80);
}

const drawBall = (x: number, y: number) => {
  if (x < 0) {
    x = 0;
  } else if (x > GAME_WIDTH - BALL_SIZE) {
    x = GAME_WIDTH - BALL_SIZE;
  }
  if (y < 0) {
    y = 0;
  } else if (y > GAME_HEIGHT - BALL_SIZE) {
    y = GAME_HEIGHT - BALL_SIZE;
  }
  context.fillStyle = 'white';
  context.fillRect(x, y, BALL_SIZE, BALL_SIZE);
}

const gameState = {
  playerA: initialPlayerPosition(),
  playerB: initialPlayerPosition(),
  playerAScore: 0,
  playerBScore: 0,
  status: 'wait',
  ballPosition: initialBallPosition(),
  ballVelocity: initialBallVelocity(),
  lastRender: 0,
  pressedKeys: new Map<string, boolean>()
};

function onKeyDown(this: GlobalEventHandlers, event: KeyboardEvent) {
  gameState.pressedKeys.set(event.key, true);
}

function onKeyUp(this: GlobalEventHandlers, event: KeyboardEvent) {
  gameState.pressedKeys.set(event.key, false);
}

window.addEventListener('keydown', onKeyDown, true);
window.addEventListener('keyup', onKeyUp, true);

const resetRound = () => {
  gameState.status = 'result';
  gameState.ballPosition = initialBallPosition();
  gameState.playerA = initialPlayerPosition();
  gameState.playerB = initialPlayerPosition();
}

const loop = (timestamp: number) => {
  const update = timestamp - gameState.lastRender;
  clearFrame();

  // Player A
  if (gameState.pressedKeys.get('ArrowDown')) {
    // Move Down
    gameState.playerA += PLAYER_VELOCITY * update;
  } else if (gameState.pressedKeys.get('ArrowUp')) {
    // Move Up
    gameState.playerA -= PLAYER_VELOCITY * update;
  }

  if (gameState.pressedKeys.get('Enter')) {
    gameState.status = 'play';
  }

  // Player B
  if (gameState.pressedKeys.get('s')) {
    gameState.playerB += PLAYER_VELOCITY * update;
  } else if (gameState.pressedKeys.get('w')) {
    gameState.playerB -= PLAYER_VELOCITY * update;
  }

  // Game Window Collision
  if (gameState.ballPosition.x >= GAME_WIDTH - BALL_SIZE) {
    gameState.playerBScore += 1;
    resetRound();
  } else if (gameState.ballPosition.x <= 0) {
    gameState.playerAScore += 1;
    resetRound();
  }

  if (gameState.ballPosition.y >= GAME_HEIGHT - BALL_SIZE || gameState.ballPosition.y <= 0) {
    gameState.ballVelocity.y *= -1;
  }

  // Player A Collision
  if (gameState.ballPosition.x <= PLAYER_WIDTH + PLAYER_FRAME_DISTANCE) {
    if (gameState.ballPosition.y > gameState.playerB && gameState.ballPosition.y < gameState.playerB + PLAYER_HEIGHT) {
      gameState.ballVelocity.x *= -1;
    }
  }

  // Player B Collision
  if (gameState.ballPosition.x + BALL_SIZE >= GAME_WIDTH - (PLAYER_WIDTH + PLAYER_FRAME_DISTANCE)) {
    if (gameState.ballPosition.y > gameState.playerA && gameState.ballPosition.y < gameState.playerA + PLAYER_HEIGHT) {
      gameState.ballVelocity.x *= -1;
    }
  }

  if (gameState.status === 'play') {
    gameState.ballPosition.x += gameState.ballVelocity.x * update;
    gameState.ballPosition.y += gameState.ballVelocity.y * update;
  }

  drawPlayer(GAME_WIDTH - PLAYER_FRAME_DISTANCE - PLAYER_WIDTH, gameState.playerA);
  drawPlayer(0 + PLAYER_FRAME_DISTANCE, gameState.playerB);

  drawBall(gameState.ballPosition.x, gameState.ballPosition.y);

  if (gameState.status === 'wait') {
    drawStatus('Press ENTER to start');
  } else if (gameState.status === 'result') {
    drawStatus(`${gameState.playerAScore}:${gameState.playerBScore}`)
  }

  gameState.lastRender = timestamp;
  window.requestAnimationFrame(loop);
}

window.requestAnimationFrame(loop);