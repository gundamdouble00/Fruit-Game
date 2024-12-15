import { FruitType } from '../types/game'


export const FRUITS: Record<FruitType, string> = {
    grape: '/assets/fruits/grape.png', //grape: '🍇',
    eggplant: '/assets/fruits/eggplant.png', //eggplant: '🍆',
    banana: '/assets/fruits/banana.png', //banana: '🍌',
    strawberry: '/assets/fruits/strawberry1.png', //strawberry: '🍓',
    greenApple: '/assets/fruits/greenapple.png', //greenApple: '🍏',
}

export const ROUND_OPTIONS = [5, 10, 15]
export const TARGET_SUM = 5
export const REACTION_TIME_LIMIT = 3000 // 3 seconds
export const CARD_INTERVAL = 1000 // 1 second

