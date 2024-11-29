'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Card as CardType, GameState, FruitType } from '../types/game'
import { FRUITS, TARGET_SUM, REACTION_TIME_LIMIT, ROUND_OPTIONS, CARD_INTERVAL } from '../constants/game'

// const generateCard = (cards: CardType[]): CardType => {
//     const fruits: FruitType[] = ['apple', 'grape', 'orange', 'banana']

//     return {
//         fruit: fruits[Math.floor(Math.random() * fruits.length)],
//         count: Math.floor(Math.random() * 5) + 1,
//         time: Date.now(),
//     }
// }

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

    const generateUniqueCard = (cards: CardType[]): CardType => {
        const fruits: FruitType[] = ['grape', 'eggplant', 'banana', 'strawberry', 'greenApple'];

        const fullCards: CardType[] = [];
        for (let i = 0; i < fruits.length; i++) {
            for (let j = 1; j <= 5; j++) {
                fullCards.push({ fruit: fruits[i], count: j, time: Date.now() });
                fullCards.push({ fruit: fruits[i], count: j, time: Date.now() });
            }
        }

        const remainingCards: CardType[] = [];
        for (let i = 0; i < fullCards.length; i++) {
            let isExist = false;
            for (let j = 0; j < cards.length; j++) {
                if (fullCards[i].fruit === cards[j].fruit && fullCards[i].count === cards[j].count) {
                    isExist = true;
                    break;
                }
            }
            if (!isExist) {
                remainingCards.push(fullCards[i]);
            }
        }

        const newCard: CardType = remainingCards[Math.floor(Math.random() * remainingCards.length)];
        newCard.time = Date.now();

        return newCard;
    };

    useEffect(() => {
        if (gameState.gameStatus === 'playing') {
            const interval = setInterval(() => {
                if (gameState.gameStatus === 'playing') {
                    setGameState(prev => {
                        let gameSt = prev.gameStatus;
                        if (prev.currentRound >= prev.totalRounds) {
                            gameSt = 'finished';
                        }
                        if (prev.cards.length === 25) {

                            return {
                                ...prev,
                                cards: [],
                                startTime: null,
                                correctFruit: null,
                                lastCorrectTime: null,
                                currentRound: prev.currentRound + 1,
                                results: [...prev.results, {
                                    round: prev.currentRound,
                                    fruit: null,
                                    reactionTime: 5,
                                    success: false,
                                    msg: "Quá 25 lá bài",
                                    bgColor: "bg-gray-100"
                                }],
                                gameStatus: gameSt
                            };
                        }
                        const newCard = generateUniqueCard(prev.cards);
                        const currentCards = [...prev.cards];
                        const fruitCounts = new Map();
                        const fruitTime = new Map();
                        currentCards.forEach(card => {
                            fruitCounts.set(card.fruit, (fruitCounts.get(card.fruit) || 0) + card.count);
                            if (fruitCounts.get(card.fruit) === TARGET_SUM) {
                                fruitTime.set(card.fruit, card.time);
                            }
                        });

                        const now = Date.now();
                        for (const [fruit, time] of fruitTime.entries()) {
                            if ((now - time) > REACTION_TIME_LIMIT) {
                                return {
                                    ...prev,
                                    cards: [],
                                    startTime: null,
                                    correctFruit: null,
                                    lastCorrectTime: null,
                                    currentRound: prev.currentRound + 1,
                                    results: [...prev.results, {
                                        round: prev.currentRound,
                                        fruit: fruit,
                                        reactionTime: 5,
                                        success: false,
                                        msg: "Quá 5s sau khi xuất hiện tổng lá 5đ",
                                        bgColor: "bg-red-100"
                                    }],
                                    gameStatus: gameSt,
                                };
                            }
                        }

                        return {
                            ...prev,
                            cards: [...prev.cards, newCard],
                        }
                    })
                }
            }, CARD_INTERVAL)

            return () => clearInterval(interval)
        }
    }, [gameState.gameStatus]);



    const clickFruit = async (selectedFruit: FruitType) => {
        setGameState(prev => {
            let gameSt = prev.gameStatus;
            if (prev.totalRounds <= prev.currentRound) {
                gameSt = 'finished';
            }
            const now = Date.now();
            const fruitCounts = new Map();
            const fruitTime = new Map();
            prev.cards.forEach(card => {
                fruitCounts.set(card.fruit, (fruitCounts.get(card.fruit) || 0) + card.count);
                if (fruitCounts.get(card.fruit) === TARGET_SUM) {
                    fruitTime.set(card.fruit, card.time);
                }
            });

            if (fruitCounts.get(selectedFruit) >= TARGET_SUM && fruitTime.get(selectedFruit)) {
                // tìm kiếm trái cây có lá bài cuối 5đ xuất hiện sớm nhất
                let minTime = now;
                let minFruit = null;
                for (const [fruit, time] of fruitTime.entries()) {
                    if (time < minTime) {
                        minTime = time;
                        minFruit = fruit;
                    }
                }
                let msg = "Đúng";
                let bgColor = "bg-green-100";
                if (minFruit != selectedFruit) {
                    msg = "Bạn đã bỏ qua một trái cây trước đấy đủ 5đ";
                    bgColor = "bg-yellow-100";
                }
                if (fruitCounts.get(selectedFruit) === TARGET_SUM) {
                    return {
                        ...prev,
                        cards: [],
                        startTime: null,
                        correctFruit: null,
                        lastCorrectTime: null,
                        currentRound: prev.currentRound + 1,
                        results: [...prev.results, {
                            round: prev.currentRound,
                            fruit: selectedFruit,
                            reactionTime: (now - fruitTime.get(selectedFruit)) / 1000,
                            success: true,
                            msg: msg,
                            bgColor: bgColor
                        }],
                        gameStatus: gameSt,
                    }
                } else {
                    return {
                        ...prev,
                        cards: [],
                        startTime: null,
                        correctFruit: null,
                        lastCorrectTime: null,
                        currentRound: prev.currentRound + 1,
                        results: [...prev.results, {
                            round: prev.currentRound,
                            fruit: selectedFruit,
                            reactionTime: (now - fruitTime.get(selectedFruit)) / 1000,
                            success: false,
                            msg: "Quá số lượng trái cây",
                            bgColor: "bg-yellow-100"
                        }],
                        gameStatus: gameSt,
                    }
                }
            }

            return {
                ...prev,
                cards: [],
                startTime: null,
                correctFruit: null,
                lastCorrectTime: null,
                currentRound: prev.currentRound + 1,
                results: [...prev.results, {
                    round: prev.currentRound,
                    fruit: selectedFruit,
                    reactionTime: 5,
                    success: false,
                    msg: "Không đúng",
                    bgColor: "bg-red-100"
                }],
                gameStatus: gameSt,
            }
        })
    }



    const renderCards = () => {
        return gameState.cards.map((card, index) => (
            <Card key={index} className="w-24 h-36 flex items-center justify-center">
                <div className="text-center">
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
            { fruit: 'grape', icon: 'grape' },
            { fruit: 'eggplant', icon: 'eggplant' },
            { fruit: 'banana', icon: 'banana' },
            { fruit: 'strawberry', icon: 'strawberry' },
            { fruit: 'greenApple', icon: 'greenApple' },
        ]

        return buttons.map(({ fruit, icon }) => (
            <Button
                key={fruit}
                onClick={() => clickFruit(fruit as FruitType)}
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
                                <td className="p-2 border text-center">{result.reactionTime ? `${result.reactionTime.toFixed(3)}s` : '-'}</td>
                                {/* <td className={`p-2 border text-center ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {result.msg}
                                </td> */}
                                <td className={`p-2 border text-center  ${result.bgColor}`}>
                                    {result.msg}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <Button onClick={() => setShowRules(true)} className="mt-1 bg-sky-600 text-white hover:bg-sky-500">
                    Chơi lại
                </Button>
                <footer className="mt-8 text-center">
                    <p className="text-sm text-gray-500">
                        &copy; {new Date().getFullYear()} zuno. All rights reserved.
                    </p>
                </footer>
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
                    <div className="flex gap-4">
                        {renderFruitButtons()}
                    </div>
                    <div className="flex flex-wrap gap-4 justify-center max-w-3xl">
                        {renderCards()}
                    </div>
                </div>
            )}

            {gameState.gameStatus === 'finished' && renderResults()}
        </div>
    )
}



// const dealNextCard = useCallback(() => {
//     if (gameState.gameStatus !== 'playing') return

//     const newCard = generateCard()
//     setGameState(prev => {
//         const newCards = [...prev.cards, newCard]
//         const fruitCounts: Record<FruitType, number> = { apple: 0, grape: 0, orange: 0, banana: 0 }
//         newCards.forEach(card => {
//             fruitCounts[card.fruit] += card.count
//         })

//         const correctFruit = Object.entries(fruitCounts).find(([_, count]) => count === TARGET_SUM)?.[0] as FruitType | undefined

//         return {
//             ...prev,
//             cards: newCards,
//             startTime: correctFruit && !prev.correctFruit ? Date.now() : prev.startTime,
//             correctFruit: correctFruit || prev.correctFruit,
//             lastCorrectTime: correctFruit && !prev.correctFruit ? Date.now() : prev.lastCorrectTime,
//         }
//     })
// }, [gameState.gameStatus])

// const checkAndCollectCards = useCallback((selectedFruit: FruitType | null) => {
//     if (!gameState.correctFruit || !gameState.startTime || !gameState.lastCorrectTime) return

//     const now = Date.now()
//     const reactionTime = (now - gameState.lastCorrectTime) / 1000
//     let success = false

//     if (selectedFruit === gameState.correctFruit && reactionTime <= 5) {
//         success = true
//     }

//     const result: GameResult = {
//         round: gameState.currentRound,
//         fruit: gameState.correctFruit,
//         reactionTime: success ? reactionTime : null,
//         success,
//     }

//     const nextRound = gameState.currentRound + 1
//     const nextGameStatus = nextRound > gameState.totalRounds ? 'finished' : 'playing'

//     setGameState(prev => ({
//         ...prev,
//         currentRound: nextRound,
//         cards: [],
//         results: [...prev.results, result],
//         gameStatus: nextGameStatus,
//         startTime: null,
//         correctFruit: null,
//         lastCorrectTime: null,
//     }))
// }, [gameState])

// useEffect(() => {
//     if (gameState.gameStatus === 'playing') {
//         const interval = setInterval(dealNextCard, CARD_INTERVAL)
//         return () => clearInterval(interval)
//     }
// }, [gameState.gameStatus, dealNextCard])

// useEffect(() => {
//     if (gameState.correctFruit && gameState.lastCorrectTime) {
//         const timeout = setTimeout(() => {
//             checkAndCollectCards(null)
//         }, REACTION_TIME_LIMIT)
//         return () => clearTimeout(timeout)
//     }
// }, [gameState.correctFruit, gameState.lastCorrectTime, checkAndCollectCards])


/*



*/