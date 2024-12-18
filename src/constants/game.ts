import { FruitType } from '../types/game'


export const FRUITS: Record<FruitType, string> = {
    grape: '/assets/fruits/grape1.png', //grape: '🍇',
    eggplant: '/assets/fruits/eggplant1.png', //eggplant: '🍆',
    banana: '/assets/fruits/banana1.png', //banana: '🍌',
    strawberry: '/assets/fruits/strawberry2.png', //strawberry: '🍓',
    greenApple: '/assets/fruits/greenApple1.png', //greenApple: '🍏',
}

export const ROUND_OPTIONS = [5, 10, 15]
export const TARGET_SUM = 5
export const REACTION_TIME_LIMIT = 5000 // 5 seconds
export const CARD_INTERVAL = 1000 // 1 second

