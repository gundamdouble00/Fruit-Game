export type FruitType = 'apple' | 'grape' | 'orange' | 'banana'

export interface Card {
    fruit: FruitType
    count: number
    time: number
}

export interface GameResult {
    round: number
    fruit: FruitType | null
    reactionTime: number | null
    success: boolean
    msg: string
    bgColor: string
}

export interface GameState {
    currentRound: number
    totalRounds: number
    cards: Card[]
    results: GameResult[]
    gameStatus: 'idle' | 'playing' | 'finished' | 'STOPPED'
    startTime: number | null
    correctFruit: FruitType | null
    lastCorrectTime: number | null
}

