'use client'

import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle,  } from '@/components/ui/dialog'
import type { Card as CardType, GameState, FruitType } from '../types/game'
import { FRUITS, TARGET_SUM, REACTION_TIME_LIMIT, ROUND_OPTIONS, CARD_INTERVAL } from '../constants/game'
import Image from 'next/image'

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
                        if (prev.cards.length === 20) {
                            return {
                                ...prev,
                                cards: [],
                                startTime: null,
                                correctFruit: null,
                                lastCorrectTime: null,
                                currentRound: prev.currentRound,
                                results: [...prev.results, {
                                    round: prev.currentRound,
                                    fruit: null,
                                    reactionTime: REACTION_TIME_LIMIT,
                                    success: false,
                                    msg: "Quá 20 lá bài",
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

            let reactionTime = (now - fruitTime.get(selectedFruit)) / 1000;
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
                    msg = "Bạn đã bỏ qua một trái cây trước đấy đã đủ 5đ";
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
            <Card key={index} className="w-20 h-28 relative">
                {Array.from({ length: card.count }).map((_, i) => {
                    let positionStyles = {};
                    let size = "100%"; // Kích thước mặc định cho 1 trái cây
    
                    // Sử dụng vw và vh cho các vị trí và kích thước linh hoạt
                    switch (card.count) {
                        case 1:
                            positionStyles = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
                            size = "100%";
                            break;
    
                        case 2:
                            positionStyles = [
                                { top: "25%", left: "18%", transform: "translateY(-25%)" },
                                { top: "75%", left: "50%", transform: "translateY(-75%)" },
                            ][i];
                            size = "100%";
                            break;
    
                        case 3:
                            positionStyles = [
                                { top: "9%", left: "10%", transform: "translateX(-50%), translateY(-20%)" },
                                { top: "39%", left: "35%", transform: "translateX(-40%), translateY(-40%)" },
                                { top: "69%", left: "60%", transform: "translateX(-30%), translateY(-60%)" },
                            ][i];
                            size = "90%";
                            break;
    
                        case 4:
                            positionStyles = [
                                { top: "20%", left: "10%" },
                                { top: "20%", left: "58%" },
                                { top: "60%", left: "10%" },
                                { top: "60%", left: "58%" },
                            ][i];
                            size = "90%";
                            break;
    
                        case 5:
                            positionStyles = [
                                { top: "10%", left: "10%" },
                                { top: "10%", left: "60%" },
                                { top: "40%", left: "35%" },
                                { top: "70%", left: "10%" },
                                { top: "70%", left: "60%" },
                            ][i];
                            size = "90%";
                            break;
                    }
    
                    return (
                        <div key={i} className="absolute" style={{ ...positionStyles }}>
                            <Image
                                src={FRUITS[card.fruit]}
                                alt={card.fruit}
                                width={32}
                                height={32}
                                style={{ width: size, height: size }}
                                className="flex-grow flex-shrink"
                            />
                        </div>
                    );
                })}
            </Card>
        ));
    };
    
    

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
                // className="p-4"
                className="w-14 h-14 bg-teal-50 rounded-lg shadow-md flex flex-col items-center justify-center hover:bg-teal-100"
                variant="outline"
            >
                <div className="flex items-center justify-center flex-wrap">
                    <Image 
                        src={FRUITS[icon as FruitType]}  // Đường dẫn ảnh
                        alt={fruit}  // Mô tả ảnh
                        width={32}   // Đặt chiều rộng của ảnh
                        height={32}  // Đặt chiều cao của ảnh
                    />
                </div>
                <span className="sr-only">{fruit}</span>
            </Button>
        ));
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <Dialog open={showRules} onOpenChange={setShowRules}>
                <DialogContent>
                    <DialogTitle></DialogTitle> {/* Thêm thành phần này */}
                    <div className="p-6">
                        <h2 className="text-2xl font-bold mb-4 text-center">Luật chơi</h2>
                        <p className="mb-4">
                            Màn hình sẽ hiển thị lần lượt các thẻ bài trái cây 🍏🍓🍆🍌🍇,
                            mỗi thẻ chứa một loại trái cây và số lượng của loại trái cây đó (1 quả nho, 2 quả táo, 3 quả chuối,...).
                            Bạn sẽ chọn ngay lập tức loại trái cây mà tổng số lượng của chúng trên các thẻ bài là 5, 
                            nếu như có nhiều loại trái cây có số lượng là 5 thì bạn phải chọn loại trái cây xuất 
                            hiện đầu tiên nhaa.
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
                    <DialogTitle></DialogTitle>
                    <div className="flex-1 flex-2">
                        <h2 className="text-2xl font-bold mb-4">Kết thúc 2 lượt</h2>
                        <p className="mb-4">
                            Bạn đã hoàn thành 2 lượt chơi. Hãy chuẩn bị cho 2 lượt tiếp theo!
                        </p>
                        <Button onClick={() => setShowNotification(false)}>
                            Tiếp theo
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={showRoundNotification} onOpenChange={setShowRoundNotification}>
                <DialogContent>
                    <DialogTitle></DialogTitle>
                    <div className="p-6">
                        
                        <p className="text-center text-lg">Bạn đã hoàn thành lượt này</p>
                        <p className="mb-4 text-center text-lg">
                            Bấm tiếp tục để đến lượt tiếp theo
                        </p>
                        <div className="flex justify-center">
                            <Button className="font-bold bg-yellow-50" onClick={() => {
                                setShowRoundNotification(false);
                                if (gameState.currentRound > gameState.totalRounds) {
                                    setGameState(prev => ({ ...prev, gameStatus: 'finished' }));
                                }
                            }}>
                                {gameState.currentRound > gameState.totalRounds ? 'Xem kết quả' : 'Tiếp tục'}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {gameState.gameStatus === 'playing' && !showRoundNotification && (
                <div className="flex flex-col top-0 items-center gap-8 w-full">
                    <div className="w-full flex-1 flex-2 overflow-y-auto border border-gray-300 p-4 rounded-md">
                        <div className="grid grid-cols-4 gap-4 items-center justify-center max-w-3xl">
                            {renderCards()}
                        </div>
                    </div>
                    
                    <div className="fixed bottom-4 left-6 right-6 flex flex-col items-center gap-4 bg-white p-2 shadow-lg rounded-md">
                        <div className="flex gap-4">
                            {renderFruitButtons()}
                        </div>
                        <div className="text-xl font-bold mt-2 items-center justify-center">
                            Lượt {gameState.currentRound}/{gameState.totalRounds}
                        </div>
                    </div>
                </div>
            )}

            {gameState.gameStatus === 'finished' && <RenderResults gameState={gameState} setShowRules={setShowRules} />}
        </div>
    )
}

const RenderResults = ({ gameState, setShowRules }: { gameState: GameState, setShowRules: Dispatch<SetStateAction<boolean>> }) => {
    const saveData = useCallback(async () => {
        const dataRounds = {
            round: gameState.results
        }

        try {
            const res = await fetch('/api/rounds', {
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
            console.error('Error saving data:', error);
        }
    }, [gameState.results]);

    useEffect(() => {
        saveData();
    }, [saveData]);

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">TỔNG HỢP KẾT QUẢ</h2>
            <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="p-2 border">Lượt chơi</th>
                        <th className="p-2 border">Loại trái cây đúng</th>
                        <th className="p-2 border">Thời gian phản ứng</th>
                        <th className="p-2 border">Đạt yêu cầu</th>
                    </tr>
                </thead>
                <tbody>
                    {gameState.results.map((result, index) => (
                        <tr key={index}>
                            <td className="p-2 border text-center">{result.round}</td>
                            <td className="p-2 border text-center">
                                {result.fruit ? (
                                    <Image
                                        src={FRUITS[result.fruit]} 
                                        alt="Fruit"
                                        width={32} 
                                        height={32} 
                                        className="inline-block object-contain"
                                    />
                                ): '-'}
                            </td>
                            <td className="p-2 border text-center">
                                {result.reactionTime ? `${result.reactionTime.toFixed(3)}s` : '-'}
                            </td>
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
                    Tâm lý học Nhân thức
                </p>
            </footer>
        </div>
    )
}

