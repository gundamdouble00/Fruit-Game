'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Card as CardType, GameState, FruitType, GameResult } from '../types/game'
import { FRUITS, TARGET_SUM, REACTION_TIME_LIMIT, ROUND_OPTIONS, CARD_INTERVAL } from '../constants/game'

const generateCard = (): CardType => {
    const fruits: FruitType[] = ['apple', 'grape', 'orange', 'banana']
    return {
        fruit: fruits[Math.floor(Math.random() * fruits.length)],
        count: Math.floor(Math.random() * 5) + 1,
    }
}

export default function Game() {
    const [showRules, setShowRules] = useState(true)
    const [gameState, setGameState] = useState<GameState>({
        currentRound: 0,
        totalRounds: 5,
        cards: [],
        results: [],
        gameStatus: 'idle',
        startTime: null,
        correctFruit: null,
        lastCorrectTime: null,
    })

    const startGame = (rounds: number) => {
        setGameState({
            currentRound: 1,
            totalRounds: rounds,
            cards: [],
            results: [],
            gameStatus: 'playing',
            startTime: null,
            correctFruit: null,
            lastCorrectTime: null,
        })
        setShowRules(false)
    }

    const dealNextCard = useCallback(() => {
        if (gameState.gameStatus !== 'playing') return

        const newCard = generateCard()
        setGameState(prev => {
            const newCards = [...prev.cards, newCard]
            const fruitCounts: Record<FruitType, number> = { apple: 0, grape: 0, orange: 0, banana: 0 }
            newCards.forEach(card => {
                fruitCounts[card.fruit] += card.count
            })

            const correctFruit = Object.entries(fruitCounts).find(([_, count]) => count === TARGET_SUM)?.[0] as FruitType | undefined

            return {
                ...prev,
                cards: newCards,
                startTime: correctFruit && !prev.correctFruit ? Date.now() : prev.startTime,
                correctFruit: correctFruit || prev.correctFruit,
                lastCorrectTime: correctFruit && !prev.correctFruit ? Date.now() : prev.lastCorrectTime,
            }
        })
    }, [gameState.gameStatus])

    const checkAndCollectCards = useCallback((selectedFruit: FruitType | null) => {
        if (!gameState.correctFruit || !gameState.startTime || !gameState.lastCorrectTime) return

        const now = Date.now()
        const reactionTime = (now - gameState.lastCorrectTime) / 1000
        let success = false

        if (selectedFruit === gameState.correctFruit && reactionTime <= 5) {
            success = true
        }

        const result: GameResult = {
            round: gameState.currentRound,
            fruit: gameState.correctFruit,
            reactionTime: success ? reactionTime : null,
            success,
        }

        const nextRound = gameState.currentRound + 1
        const nextGameStatus = nextRound > gameState.totalRounds ? 'finished' : 'playing'

        setGameState(prev => ({
            ...prev,
            currentRound: nextRound,
            cards: [],
            results: [...prev.results, result],
            gameStatus: nextGameStatus,
            startTime: null,
            correctFruit: null,
            lastCorrectTime: null,
        }))
    }, [gameState])

    useEffect(() => {
        if (gameState.gameStatus === 'playing') {
            const interval = setInterval(dealNextCard, CARD_INTERVAL)
            return () => clearInterval(interval)
        }
    }, [gameState.gameStatus, dealNextCard])

    useEffect(() => {
        if (gameState.correctFruit && gameState.lastCorrectTime) {
            const timeout = setTimeout(() => {
                checkAndCollectCards(null)
            }, REACTION_TIME_LIMIT)
            return () => clearTimeout(timeout)
        }
    }, [gameState.correctFruit, gameState.lastCorrectTime, checkAndCollectCards])

    const renderCards = () => {
        return gameState.cards.map((card, index) => (
            <Card key={index} className="w-24 h-36 flex items-center justify-center">
                <div className="text-center">
                    {/* <div className="text-4xl mb-2">{FRUITS[card.fruit]}</div> */}
                    <div className="flex flex-wrap justify-center">
                        {Array.from({ length: card.count }).map((_, i) => (
                            <div key={i} className="text-2xl mx-1">{FRUITS[card.fruit]}</div>
                        ))}
                    </div>
                </div>
            </Card>
        ))
    }

    const renderFruitButtons = () => {
        const buttons = [
            { fruit: 'apple', icon: 'apple' },
            { fruit: 'grape', icon: 'grape' },
            { fruit: 'orange', icon: 'orange' },
            { fruit: 'banana', icon: 'banana' },
        ]

        return buttons.map(({ fruit, icon }) => (
            <Button
                key={fruit}
                onClick={() => checkAndCollectCards(fruit as FruitType)}
                className="p-4"
                variant="outline"
            >
                <div className="text-4xl mb-2">{FRUITS[icon as FruitType]}</div>
                <span className="sr-only">{fruit}</span>
            </Button>
        ))
    }

    const renderResults = () => {
        return (
            <div className="w-full max-w-2xl mx-auto mt-8">
                <h2 className="text-2xl font-bold mb-4">TỔNG HỢP KẾT QUẢ</h2>
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-2 border">Lượt chơi</th>
                            <th className="p-2 border">Loại trái cây</th>
                            <th className="p-2 border">Thời gian phản ứng</th>
                            <th className="p-2 border">Đạt yêu cầu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gameState.results.map((result, index) => (
                            <tr key={index}>
                                <td className="p-2 border text-center">{result.round}</td>
                                <td className="p-2 border text-center">{result.fruit ? FRUITS[result.fruit] : '-'}</td>
                                <td className="p-2 border text-center">{result.reactionTime ? `${result.reactionTime.toFixed(2)}s` : '-'}</td>
                                <td className={`p-2 border text-center ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {result.success ? 'Đạt' : 'Không đạt'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Button onClick={() => setShowRules(true)} className="mt-4">
                    Chơi lại
                </Button>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <Dialog open={showRules} onOpenChange={setShowRules}>
                <DialogContent>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Luật chơi</h2>
                        <p className="mb-4">
                            Đếm tổng số trái cây trên các thẻ bài và bấm nút khi tổng số trái cây cùng loại bằng 5.
                            Bạn có 5 giây để phản ứng với mỗi lượt. Mỗi giây sẽ có một lá bài mới được phát ra.
                        </p>
                        <div className="flex gap-4 justify-center">
                            {ROUND_OPTIONS.map(rounds => (
                                <Button key={rounds} onClick={() => startGame(rounds)}>
                                    {rounds} lượt
                                </Button>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {gameState.gameStatus === 'playing' && (
                <div className="flex flex-col items-center gap-8">
                    <div className="text-xl font-bold">
                        Lượt {gameState.currentRound}/{gameState.totalRounds}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center max-w-3xl">
                        {renderCards()}
                    </div>
                    <div className="flex gap-4">
                        {renderFruitButtons()}
                    </div>
                </div>
            )}

            {gameState.gameStatus === 'finished' && renderResults()}
        </div>
    )
}

