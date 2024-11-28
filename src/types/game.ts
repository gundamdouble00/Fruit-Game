export type FruitType = 'apple' | 'grape' | 'orange' | 'banana'

export interface Card {
    fruit: FruitType
    count: number
}

export interface GameResult {
    round: number
    fruit: FruitType | null
    reactionTime: number | null
    success: boolean
}

export interface GameState {
    currentRound: number
    totalRounds: number
    cards: Card[]
    results: GameResult[]
    gameStatus: 'idle' | 'playing' | 'finished'
    startTime: number | null
    correctFruit: FruitType | null
    lastCorrectTime: number | null
}

