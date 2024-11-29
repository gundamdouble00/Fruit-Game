import { FruitType } from '../types/game'

export const FRUITS: Record<FruitType, string> = {
    // apple: '🍎',
    // grape: '🍇',
    // orange: '🍊',
    // banana: '🍌',
    grape: '🍇',
    eggplant: '🍆',
    banana: '🍌',
    strawberry: '🍓',
    greenApple: '🍏',
}

/*
Nho, cà tím, chuối, dâu, táo xanh
*/

export const ROUND_OPTIONS = [5, 10, 15]
export const TARGET_SUM = 5
export const REACTION_TIME_LIMIT = 5000 // 5 seconds
export const CARD_INTERVAL = 1000 // 1 second

