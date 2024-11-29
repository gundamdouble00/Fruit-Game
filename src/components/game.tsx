'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { Card as CardType, GameState, FruitType } from '../types/game'
import { FRUITS, TARGET_SUM, REACTION_TIME_LIMIT, ROUND_OPTIONS, CARD_INTERVAL } from '../constants/game'

export default function Game() {
    const [showRules, setShowRules] = useState(true)
    const [showNotification, setShowNotification] = useState(false)
    const [showRoundNotification, setShowRoundNotification] = useState(false)
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
        if (gameState.gameStatus === 'playing' && !showRoundNotification) {
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
    }, [gameState.gameStatus, showRoundNotification]);

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

            let reactionTime = 5;
            let success = false;
            let msg = "Không đúng";
            let bgColor = "bg-red-100";

            if (fruitCounts.get(selectedFruit) >= TARGET_SUM && fruitTime.get(selectedFruit)) {
                let minTime = now;
                let minFruit = null;
                for (const [fruit, time] of fruitTime.entries()) {
                    if (time < minTime) {
                        minTime = time;
                        minFruit = fruit;
                    }
                }
                msg = "Đúng";
                bgColor = "bg-green-100";
                if (minFruit != selectedFruit) {
                    msg = "Bạn đã bỏ qua một trái cây trước đấy đủ 5đ";
                    bgColor = "bg-yellow-100";
                }
                if (fruitCounts.get(selectedFruit) === TARGET_SUM) {
                    reactionTime = (now - fruitTime.get(selectedFruit)) / 1000;
                    success = true;
                } else {
                    msg = "Quá số lượng trái cây";
                    bgColor = "bg-yellow-100";
                }
            }


            const newState = {
                ...prev,
                cards: [],
                startTime: null,
                correctFruit: null,
                lastCorrectTime: null,
                currentRound: prev.currentRound + 1,
                results: [...prev.results, {
                    round: prev.currentRound,
                    fruit: selectedFruit,
                    reactionTime: reactionTime,
                    success: success,
                    msg: msg,
                    bgColor: bgColor
                }],
                gameStatus: gameSt,
            };

            // Hiển thị thông báo sau mỗi lượt
            if (newState.currentRound <= newState.totalRounds) {
                setShowRoundNotification(true);
            }

            return newState;
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

            <Dialog open={showNotification} onOpenChange={setShowNotification}>
                <DialogContent>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Kết thúc 2 lượt</h2>
                        <p className="mb-4">
                            Bạn đã hoàn thành 2 lượt chơi. Hãy chuẩn bị cho 2 lượt tiếp theo!
                        </p>
                        <Button onClick={() => setShowNotification(false)}>
                            Tiếp tục
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showRoundNotification} onOpenChange={setShowRoundNotification}>
                <DialogContent>
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4">Kết thúc lượt {gameState.currentRound - 1}</h2>
                        <p className="mb-4">
                            Bạn đã hoàn thành lượt chơi. Hãy chuẩn bị cho lượt tiếp theo!
                        </p>
                        <Button onClick={() => {
                            setShowRoundNotification(false);
                            if (gameState.currentRound > gameState.totalRounds) {
                                setGameState(prev => ({ ...prev, gameStatus: 'finished' }));
                            }
                        }}>
                            {gameState.currentRound > gameState.totalRounds ? 'Xem kết quả' : 'Lượt tiếp theo'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {gameState.gameStatus === 'playing' && !showRoundNotification && (
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

            {gameState.gameStatus === 'finished' && <RenderResults gameState={gameState} setShowRules={setShowRules} />}
        </div>
    )
}

const RenderResults = ({ gameState, setShowRules }: { gameState: GameState, setShowRules: any }) => {

    const saveData = async () => {
        const dataRounds = {
            round: gameState.results
        }

        try {
            const res: any = await fetch('/api/rounds', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataRounds),
            });

            console.log(res);
            if (res.status === 201) {
                console.log('save data success');
            } else {
                console.log('fail save data');
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        if (gameState.gameStatus === 'finished') {
            saveData();
        }
    }, [gameState.gameStatus]);

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
                            <td className={`p-2 border text-center ${result.bgColor}`}>
                                {result.msg}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <Button onClick={() => setShowRules(true)} className="mt-4 bg-sky-600 text-white hover:bg-sky-500">
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

