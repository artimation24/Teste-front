// Variáveis básicas
const MAX_PLAYERS = 5;
const PLAYER_JOIN_INTERVAL = 10000; // 10 segundos
const TIP_ROTATION_INTERVAL = 7000; // 7 segundos

// Opções de nomes dos jogadores simulados
const otherPlayerNames = ["Davi", "Mateus", "Maria", "Gabriel", "Abigail"];

// Cor dos avatares
const avatarColors = ["#ff9900"];

// Mensagens rápidas dos jogadores
const playerMessages = ["Boa sorte!", "Vamos la!", "Oi pessoal!"];

// Dicas
const tips = [
  "Fique atento ao tempo! Cada segundo conta na hora de responder.",
  "Leia a pergunta com calma antes de escolher sua resposta.",
  "Quanto mais rapido voce responder corretamente, mais pontos ganha!",
  "Nao desanime com erros, eles fazem parte do aprendizado.",
  "Observe os outros jogadores, voce pode aprender com as estrategias deles.",
];

// Estado do jogo
let players = [];
let messages = [];
let currentTipIndex = 0;
let hasQuit = false;
let gameStarting = false;
let shuffledPlayers = [];
let messageId = 0;

// Elementos DOM
const playersList = document.getElementById("players-list");
const chatMessages = document.getElementById("chat-messages");
const playerCount = document.getElementById("player-count");
const tipText = document.getElementById("tip-text");
const quitBtn = document.getElementById("quit-btn");
const startBtn = document.getElementById("start-btn");
const quitOverlay = document.getElementById("quit-overlay");
const quickMsgBtns = document.querySelectorAll(".quick-msg-btn");

// Função para embaralhar array
function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Inicializar jogadores embaralhados
function initializePlayers() {
  const shuffled = shuffleArray(otherPlayerNames).slice(0, 4);
  shuffledPlayers = ["Voce", ...shuffled];
}

// Renderizar slots de jogadores
function renderPlayerSlots() {
  playersList.innerHTML = "";

  for (let i = 0; i < MAX_PLAYERS; i++) {
    const slot = document.createElement("div");
    slot.className = "player-slot";

    if (i < players.length) {
      const player = players[i];
      const isUser = player.name === "Voce";

      slot.innerHTML = `
        <div class="player-avatar" style="background-color: ${
          player.color
        }">${player.name.charAt(0).toUpperCase()}</div>
        <span class="player-name ${isUser ? "is-user" : ""}">${
        player.name
      }</span>
      `;
    } else {
      slot.classList.add("empty");
      slot.innerHTML = `
        <div class="loading-spinner"></div>
        <span class="loading-text">Aguardando...</span>
      `;
    }

    playersList.appendChild(slot);
  }

  // Atualizar contador
  playerCount.textContent = `${players.length}/${MAX_PLAYERS}`;

  // Habilitar botão de iniciar quando estiver com máximo de jogadores
  if (players.length >= MAX_PLAYERS && !hasQuit) {
    startBtn.disabled = false;
  }
}

// Adicionar mensagem de sistema ao chat
function addSystemMessage(text) {
  messageId++;
  const msg = {
    id: messageId,
    type: "system",
    text: text,
  };
  messages.push(msg);
  renderChatMessage(msg);
  scrollChatToBottom();
}

// Adicionar mensagem de jogador ao chat
function addPlayerMessage(playerName, text) {
  messageId++;
  const msg = {
    id: messageId,
    type: "player",
    playerName: playerName,
    text: text,
    isUser: playerName === "Voce",
  };
  messages.push(msg);
  renderChatMessage(msg);
  scrollChatToBottom();
}

// Renderizar uma mensagem no chat
function renderChatMessage(msg) {
  const msgElement = document.createElement("div");
  msgElement.className = "chat-message";

  if (msg.type === "system") {
    msgElement.classList.add("system");
    msgElement.textContent = msg.text;
  } else {
    msgElement.innerHTML = `<span class="sender ${
      msg.isUser ? "is-user" : ""
    }">${msg.playerName}:</span>${msg.text}`;
  }

  chatMessages.appendChild(msgElement);
}

// Rolar chat para baixo
function scrollChatToBottom() {
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Adicionar jogador
function addPlayer() {
  if (hasQuit || players.length >= MAX_PLAYERS) return;

  const playerIndex = players.length;
  const playerName = shuffledPlayers[playerIndex];
  const isUser = playerName === "Voce";

  const newPlayer = {
    name: playerName,
    color: avatarColors[playerIndex],
  };

  players.push(newPlayer);
  renderPlayerSlots();

  // Mensagem de sistema quando um jogador entra
  addSystemMessage(`${newPlayer.name} entrou na sala`);

  // Mensagens do jogadores simulados
  if (!isUser) {
    const randomMessage =
      playerMessages[Math.floor(Math.random() * playerMessages.length)];
    setTimeout(() => {
      addPlayerMessage(newPlayer.name, randomMessage);
    }, 500);
  }

  // Verificar se atingiu o limite de jogadores
  if (players.length === MAX_PLAYERS) {
    setTimeout(() => {
      addSystemMessage("Máximo de jogadores atingido! A partida pode começar.");
    }, 1000);
  }
}

// Rotacionar dicas
function rotateTip() {
  // Fade out
  tipText.classList.add("fade-out");

  setTimeout(() => {
    currentTipIndex = (currentTipIndex + 1) % tips.length;
    tipText.textContent = tips[currentTipIndex];
    tipText.classList.remove("fade-out");
    tipText.classList.add("fade-in");

    setTimeout(() => {
      tipText.classList.remove("fade-in");
    }, 300);
  }, 300);
}

// Função para desistir da partida
function handleQuit() {
  if (hasQuit || gameStarting) return;
  hasQuit = true;
  quitOverlay.classList.remove("hidden");
  quitBtn.disabled = true;
  quitBtn.textContent = "Voce saiu da partida";

  // Desabilitar botões de mensagem
  quickMsgBtns.forEach((btn) => {
    btn.disabled = true;
  });
}

// Função para iniciar partida
function handleStartGame() {
  if (
    !startBtn.disabled &&
    players.length >= MAX_PLAYERS &&
    !hasQuit &&
    !gameStarting
  ) {
    gameStarting = true;
    startBtn.innerHTML = 'Partida iniciando<span class="ellipsis"></span>';
    startBtn.disabled = true;

    // Bloquear botão de desistir
    quitBtn.disabled = true;
    quitBtn.classList.add("quit-disabled");

    // Adicionar mensagem de sistema
    addSystemMessage("A partida esta iniciando...");
  }
}

// Funcao para enviar mensagem rápida
function handleQuickMessage(message) {
  if (hasQuit) return;
  addPlayerMessage("Voce", message);
}

// Event Listeners
quitBtn.addEventListener("click", handleQuit);
startBtn.addEventListener("click", handleStartGame);

quickMsgBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    const message = btn.getAttribute("data-message");
    handleQuickMessage(message);
  });
});

// Inicialização
function init() {
  // Inicializar jogadores
  initializePlayers();
  // Renderizar slots vazios
  renderPlayerSlots();
  // Mostrar primeira dica
  tipText.textContent = tips[currentTipIndex];
  // Adicionar primeiro jogador imediatamente
  addPlayer();
  // Adicionar jogadores a cada 10 segundos
  const playerInterval = setInterval(() => {
    if (players.length >= MAX_PLAYERS || hasQuit) {
      clearInterval(playerInterval);
      return;
    }
    addPlayer();
  }, PLAYER_JOIN_INTERVAL);

  // Rotacionar dicas a cada 7 segundos
  setInterval(rotateTip, TIP_ROTATION_INTERVAL);
}

// Iniciar quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", init);
