"use client"

import { useState, useEffect, useRef, useCallback } from "react"

// Palavras aleatórias para nome da sala
const roomWords = [
  "Aurora", "Tempest", "Eclipse", "Phoenix", "Nebula",
  "Vortex", "Zenith", "Cosmos", "Nexus", "Prism"
]

// Nomes dos outros jogadores (serão embaralhados, 4 serão sorteados)
const otherPlayerNames = ["Davi", "Mateus", "Maria", "Gabriel", "Abigail"]

// Mensagens que os jogadores podem enviar ao entrar
const playerMessages = [
  "Olá pessoal! Bora jogar!",
  "Boa sorte a todos!",
  "Estou pronto para a partida!"
]

// Dicas rotativas
const tips = [
  "Dica: Comunique-se com seu time!",
  "Dica: Planeje sua estratégia!",
  "Dica: Observe os movimentos dos adversários!",
  "Dica: A paciência é a chave para a vitória!",
  "Dica: Trabalhe em equipe sempre!"
]

// Cores dos avatares
const avatarColors = [
  "bg-primary",
  "bg-success",
  "bg-accent",
  "bg-destructive",
  "bg-chart-2"
]

// Função para embaralhar array
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

interface Player {
  name: string
  color: string
}

interface ChatMessage {
  id: number
  type: "player" | "system"
  playerName?: string
  message: string
  isUser?: boolean
}

export default function GameLobby() {
  const [roomName, setRoomName] = useState("")
  const [shuffledPlayers, setShuffledPlayers] = useState<string[]>([])
  const [players, setPlayers] = useState<Player[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  const [tipAnimating, setTipAnimating] = useState(false)
  const [hasQuit, setHasQuit] = useState(false)
  const [gameStarting, setGameStarting] = useState(false)
  const [ellipsis, setEllipsis] = useState("")
  const [isInitialized, setIsInitialized] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const messageIdRef = useRef(0)
  const maxPlayers = 5
  const difficulty = "Todos"
  const coinsRequired = 150

  // Inicializar valores no cliente para evitar erro de hidratação
  useEffect(() => {
    setRoomName("Teste")
    // Embaralhar e pegar apenas 4 jogadores para juntar com "Você"
    const shuffled = shuffleArray(otherPlayerNames).slice(0, 4)
    setShuffledPlayers(["Você", ...shuffled])
    setIsInitialized(true)
  }, [])

  // Função para adicionar mensagem do sistema
  const addSystemMessage = useCallback((message: string) => {
    const newMessage: ChatMessage = {
      id: messageIdRef.current++,
      type: "system",
      message
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  // Função para adicionar mensagem de jogador
  const addPlayerMessage = useCallback((playerName: string, message: string, isUser = false) => {
    const newMessage: ChatMessage = {
      id: messageIdRef.current++,
      type: "player",
      playerName: isUser ? "Você" : playerName,
      message,
      isUser
    }
    setMessages(prev => [...prev, newMessage])
  }, [])

  // Adicionar jogadores a cada 10 segundos
  useEffect(() => {
    if (!isInitialized || hasQuit || players.length >= maxPlayers) return

    const addPlayer = () => {
      const playerIndex = players.length
      if (playerIndex < maxPlayers) {
        const playerName = shuffledPlayers[playerIndex]
        const isUser = playerName === "Você"
        const newPlayer: Player = {
          name: playerName,
          color: avatarColors[playerIndex]
        }
        setPlayers(prev => [...prev, newPlayer])
        
        // Mensagem de sistema
        addSystemMessage(`${newPlayer.name} ${isUser ? "entrou" : "entrou"} na sala`)
        
        // Mensagem do jogador (aleatória) - se for "Você", não envia automaticamente
        if (!isUser) {
          const randomMessage = playerMessages[Math.floor(Math.random() * playerMessages.length)]
          setTimeout(() => {
            addPlayerMessage(newPlayer.name, randomMessage)
          }, 500)
        }

        // Verificar se atingiu o máximo
        if (playerIndex + 1 === maxPlayers) {
          setTimeout(() => {
            addSystemMessage("Máximo de jogadores atingido! A partida pode começar.")
          }, 1000)
        }
      }
    }

    // Adicionar primeiro jogador imediatamente
    if (players.length === 0) {
      addPlayer()
    }

    const interval = setInterval(addPlayer, 10000)
    return () => clearInterval(interval)
  }, [players.length, shuffledPlayers, hasQuit, isInitialized, addSystemMessage, addPlayerMessage])

  // Rotação de dicas
  useEffect(() => {
    if (hasQuit) return

    const interval = setInterval(() => {
      setTipAnimating(true)
      setTimeout(() => {
        setCurrentTipIndex(prev => (prev + 1) % tips.length)
        setTipAnimating(false)
      }, 300)
    }, 7000)

    return () => clearInterval(interval)
  }, [hasQuit])

  // Auto scroll do chat
  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight
    }
  }, [messages])

  // Animação de reticências
  useEffect(() => {
    if (!gameStarting) return

    const interval = setInterval(() => {
      setEllipsis(prev => {
        if (prev.length >= 3) return ""
        return prev + "."
      })
    }, 400)

    return () => clearInterval(interval)
  }, [gameStarting])

  // Função para enviar mensagem como usuário
  const handleSendMessage = (message: string) => {
    if (hasQuit) return
    addPlayerMessage("Você", message, true)
  }

  // Função para desistir
  const handleQuit = () => {
    if (hasQuit || gameStarting) return
    setHasQuit(true)
  }

  // Função para iniciar partida
  const handleStartGame = () => {
    if (players.length < maxPlayers || gameStarting || hasQuit) return
    setGameStarting(true)
  }

  const isFull = players.length >= maxPlayers

  // Mostrar loading enquanto inicializa para evitar erro de hidratação
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className={`min-h-screen bg-background p-4 md:p-8 ${hasQuit ? "pointer-events-none opacity-70" : ""}`}>
      <div className="mx-auto max-w-5xl">
        {/* Header - Nome da Sala */}
        <header className="mb-4 rounded-lg bg-card p-4 md:p-6 border border-border">
          <h1 className="text-2xl font-bold text-foreground md:text-3xl text-center">
            Sala: <span className="text-primary">{roomName}</span>
          </h1>
        </header>

        {/* Info Bar - Dificuldade, Moedas, Jogadores */}
        <div className="mb-6 rounded-lg bg-card p-3 md:p-4 border border-border">
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-10">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">Dificuldade:</span>
              <span className="rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                {difficulty}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="h-5 w-5 text-accent" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" />
                <text x="12" y="16" textAnchor="middle" fill="var(--accent-foreground)" fontSize="10" fontWeight="bold">$</text>
              </svg>
              <span className="text-accent font-semibold">{coinsRequired}</span>
            </div>
            <div className="flex items-center gap-2 text-foreground">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span className="font-semibold">{players.length}/{maxPlayers}</span>
            </div>
          </div>
        </div>

        {/* Main Content - Players & Chat */}
        <div className="mb-6 grid gap-6 md:grid-cols-2">
          {/* Players Panel */}
          <div className="rounded-lg bg-card p-4 border border-border">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Jogadores</h2>
            <div className="space-y-3">
              {Array.from({ length: maxPlayers }).map((_, index) => {
                const player = players[index]
                return (
                  <div
                    key={index}
                    className={`flex items-center gap-3 rounded-lg p-3 transition-all duration-300 ${
                      player ? "bg-secondary" : "bg-muted/50 border border-dashed border-border"
                    }`}
                  >
                    {player ? (
                      <>
                        <div className={`h-10 w-10 rounded-full ${player.color} flex items-center justify-center text-primary-foreground font-bold`}>
                          {player.name.charAt(0)}
                        </div>
                        <span className="font-medium text-foreground">{player.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                        </div>
                        <span className="text-muted-foreground">Aguardando jogador...</span>
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Chat Panel */}
          <div className="flex flex-col rounded-lg bg-card p-4 border border-border">
            <h2 className="mb-4 text-lg font-semibold text-foreground">Chat</h2>
            <div
              ref={chatRef}
              className="mb-4 flex-1 space-y-2 overflow-y-auto rounded-lg bg-secondary p-3"
              style={{ maxHeight: "280px", minHeight: "280px" }}
            >
              {messages.length === 0 ? (
                <p className="text-center text-muted-foreground text-sm">Aguardando jogadores...</p>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`rounded-lg p-2 text-sm ${
                      msg.type === "system"
                        ? "bg-muted text-muted-foreground text-center italic"
                        : msg.isUser
                        ? "bg-primary/20 text-foreground"
                        : "bg-card text-foreground"
                    }`}
                  >
                    {msg.type === "player" && (
                      <span className={`font-semibold ${msg.isUser ? "text-primary" : "text-accent"}`}>
                        {msg.playerName}:{" "}
                      </span>
                    )}
                    {msg.message}
                  </div>
                ))
              )}
            </div>
            {/* Quick Messages */}
            <div className="flex flex-wrap gap-2">
              {playerMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => handleSendMessage(msg)}
                  disabled={hasQuit}
                  className="rounded-lg bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-all hover:bg-primary hover:text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tips Panel */}
        <div className="mb-6 overflow-hidden rounded-lg bg-card p-4 border border-border">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="relative h-6 flex-1 overflow-hidden">
              <p
                className={`text-muted-foreground transition-all duration-300 ${
                  tipAnimating ? "translate-y-full opacity-0" : "translate-y-0 opacity-100"
                }`}
              >
                {tips[currentTipIndex]}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4">
          <button
            onClick={handleQuit}
            disabled={hasQuit || gameStarting}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              hasQuit
                ? "bg-destructive/50 text-destructive-foreground cursor-not-allowed"
                : gameStarting
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : "bg-destructive text-destructive-foreground hover:bg-destructive/80"
            }`}
          >
            {hasQuit ? "Você saiu da partida" : "Desistir"}
          </button>
          <button
            onClick={handleStartGame}
            disabled={!isFull || gameStarting || hasQuit}
            className={`flex-1 rounded-lg px-6 py-3 font-semibold transition-all ${
              !isFull || hasQuit
                ? "bg-muted text-muted-foreground cursor-not-allowed"
                : gameStarting
                ? "bg-primary text-primary-foreground cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:bg-primary/80"
            }`}
          >
            {gameStarting ? (
              <span>
                Partida iniciando<span className="inline-block w-6 text-left">{ellipsis}</span>
              </span>
            ) : (
              "Iniciar Partida"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
