'use client'

import { useState, useEffect, Dispatch, SetStateAction, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogTitle,  } from '@/components/ui/dialog'
import type { Card as CardType, GameState, FruitType } from '../types/game'
import { FRUITS, TARGET_SUM, REACTION_TIME_LIMIT, ROUND_OPTIONS, CARD_INTERVAL } from '../constants/game'
import Image from 'next/image'

interface GameProps {
    language: string, 
}

const texts = {
    vi: {
      text: 'Luật chơi',
      gameRules: `
        Màn hình sẽ hiển thị lần lượt các thẻ bài trái cây 🍏🍓🍆🍌🍇,
        mỗi thẻ chứa một loại trái cây và số lượng của loại trái cây đó (1 quả nho, 2 quả táo, 3 quả chuối,...).
        Bạn sẽ chọn ngay lập tức loại trái cây mà tổng số lượng của chúng trên các thẻ bài là 5, 
        nếu như có nhiều loại trái cây có số lượng là 5 thì bạn phải chọn loại trái cây xuất 
        hiện đầu tiên nha.
      `,
      numsRounds: 'Chọn số lượt bạn muốn chơi', 
      round: 'Lượt',
      roundNotification1: 'Bạn đã hoàn thành lượt này',
      roundNotification2: 'Bấm "Tiếp tục" để đến lượt tiếp theo',
      continue: 'Tiếp tục',
      viewResults: 'Xem kết quả',   
      resultsSummary: 'Tổng hợp kết quả', 

      gameRound: 'Lượt chơi',
      fruitType: 'Loại trái cây',
      reactionTime: 'Thời gian phản ứng',
      requirements: 'Đạt yêu cầu',    

      correctAnswer: 'Đúng',
      wrongAnswer: 'Không đúng',
      missAnswer: 'Bạn đã bỏ qua một trái cây trước đấy đủ 5', 
      larger: 'Quá số lượng trái cây',
      noAnswer: 'Không có đáp án', 
      outOf5s: 'Quá 5s sau khi xuất hiện tổng lá là 5', 

      explainCorrect: 'Người chơi chọn đúng trái cây và chọn trong 5 giây.',
      explainWrong1: 'Chọn sai loại trái cây.',
      explainWrong2: 'Chưa đạt số lượng trái cây.',

      explainOutOf5s: 'Quá 5s sau khi xuất hiện tổng lá là 5.',

      explainLarger: 'Quá số lượng trái cây.', 
      explainMiss: 'Bạn đã bỏ qua một loại trái cây trước đấy đủ 5.',
      explainNoAnswer: 'Sau 20 thẻ bài mà không có một loại trái cây nào có tổng là 5, lượt chơi đó kết thúc.', 

      playAgain: 'Chơi lại', 
    },
    en: {
        text: 'Game Rules',
        gameRules: `
          The bot displays cards every second, each card contains a type of fruit and the quantity (1 grape, 2 apples, 3 bananas, ...). 
          You have to immediately choose the fruit that total quantity on the cards is 5. 
          If there are more than 1 type of fruit with a quantity of 5, choose the one that appears first.
        `,
        numsRounds: 'Choose the number of rounds you want to play', 
        round: 'Rounds',
        roundNotification1: 'You have completed this round',
        roundNotification2: 'Press "Continue" to go to the next round',
        continue: 'Continue',  
        viewResults: 'View results',   
        resultsSummary: 'Results Summary', 

        gameRound: 'Round',
        fruitType: 'Fruit',
        reactionTime: 'Time',
        requirements: 'Result',    

        correctAnswer: 'Correct',
        wrongAnswer: 'Incorrect',
        missAnswer: 'Miss', 
        larger: 'Over 5',
        noAnswer: 'No answer',
        outOf5s: 'Overtime', 

        explainCorrect: 'You selected the correct fruit within the allotted time (Under 5 seconds).',
        explainWrong1: 'You selected the wrong type of fruit.',
        explainWrong2: 'The fruit you selected are not exactly 5.',

        explainOutOf5s: 'After 5 seconds, if you have not identified a fruit type that sums to 5, you lose.',

        explainLarger: 'The fruit you selected exceeds 5 in total.', 
        explainMiss: 'You missed another fruit that added up to 5.',
        explainNoAnswer: 'After 20 cards, if no fruit combination adds up to 5, the round ends.', 

        playAgain: 'Play Again',
    },
  };

export default function Game({language}: GameProps) {
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
    
    useEffect(() => {
        console.log('Language set to:', language);
    }, [language]);

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

    type Checking = FruitType | boolean
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
                            if (prev.currentRound < prev.totalRounds) {
                                setShowRoundNotification(true);
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
                                    fruit: null,
                                    reactionTime: null,
                                    success: false,
                                    msg: language === 'vi' ? texts.vi.noAnswer : texts.en.noAnswer,
                                    bgColor: "bg-gray-100"
                                }],
                                gameStatus: gameSt
                            };
                        }
                        
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
                                if (prev.currentRound < prev.totalRounds) {
                                    setShowRoundNotification(true);
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
                                        fruit: fruit,
                                        reactionTime: 5,
                                        success: false,
                                        msg: language === 'vi' ? texts.vi.outOf5s : texts.en.outOf5s,
                                        bgColor: "bg-red-100"
                                    }],
                                    gameStatus: gameSt,
                                };
                            }
                        }

                        const generateUniqueCard = (cards: CardType[], FRUIT: Checking): CardType => {
                            const fruits: FruitType[] = ['grape', 'eggplant', 'banana', 'strawberry', 'greenApple'];
                    
                            const fullCards: CardType[] = [];
                            for (let i = 0; i < fruits.length; i++) {
                                for (let j = 1; j <= 5; j++) {
                                    if (j == 5) {
                                        fullCards.push({ fruit: fruits[i], count: j, time: Date.now() });
                                        break;    
                                    }
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
                    
                            let newCard: CardType
                            while (true) {
                                newCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
                                if (newCard.fruit !== FRUIT) {
                                    newCard.time = Date.now();
                                    break;
                                }
                            }
                            return newCard;
                        };

                        const FirstFruit = fruitTime.entries().next();
                        let Answer: Checking = false
                        if (!FirstFruit.done) {
                            Answer = FirstFruit.value[0];
                        }
                        const newCard = generateUniqueCard(prev.cards, Answer);
                        return {
                            ...prev,
                            cards: [...prev.cards, newCard],
                        }
                    })
                }
            }, CARD_INTERVAL)

            return () => clearInterval(interval)
        }
    }, [gameState.gameStatus, showRoundNotification, language]);

    const clickFruit = useCallback(async (selectedFruit: FruitType) => {
        setGameState(prev => {
            let gameSt = prev.gameStatus;
            if (prev.totalRounds <= prev.currentRound) {
                gameSt = 'finished';
            }

            const 
                now = Date.now(), 
                fruitCounts = new Map(), 
                fruitTime = new Map();

            let Answer: FruitType | undefined, 
                TimeAppearance = -1, 
                reactionTime = -1, 
                success = false, 
                msg = (language === 'vi' ? texts.vi.wrongAnswer : texts.en.wrongAnswer), 
                bgColor = "bg-red-100",
                flagFirstCard: boolean = false, 
                flagAnswer: boolean = false; 

            prev.cards.forEach(card => {
                if (flagFirstCard === false) {
                    flagFirstCard = true
                    reactionTime = (now - card.time) / 1000
                }
                fruitCounts.set(card.fruit, (fruitCounts.get(card.fruit) || 0) + card.count);
                if (fruitCounts.get(card.fruit) === TARGET_SUM) {
                    fruitTime.set(card.fruit, card.time);
                    if (flagAnswer === false) {
                        TimeAppearance = card.time;
                        Answer = card.fruit;
                        flagAnswer = true
                    } 
                }
            });

            const Temp: number = (now - TimeAppearance) / 1000
            
            if (selectedFruit === Answer) {
                if (fruitCounts.get(selectedFruit) > 5) {
                    // msg = "Quá số lượng trái cây"
                    msg = (language === 'vi' ? texts.vi.larger : texts.en.larger)
                    bgColor = "bg-yellow-100"
                    reactionTime = Temp
                } 
                if (fruitCounts.get(selectedFruit) === 5) {
                    if (Temp <= 5) {
                        success = true;
                        // msg = "Đúng"
                        msg = (language === 'vi' ? texts.vi.correctAnswer : texts.en.correctAnswer)
                        bgColor = "bg-green-100"
                        reactionTime = Temp
                    }
                }
            } 

            if (selectedFruit !== Answer) {
                if (Answer !== undefined) {
                    const Fruits = fruitCounts.get(selectedFruit);
                    if (Fruits === 5) {
                        // msg = "Bạn đã bỏ qua một trái cây trước đấy đủ 5đ"
                        msg = (language === 'vi' ? texts.vi.missAnswer : texts.en.missAnswer)
                        bgColor = "bg-yellow-100"
                        reactionTime = (Temp > 5 ? Temp - 5 : Temp)
                    } else {
                        // msg = "Không đúng"
                        msg = (language === 'vi' ? texts.vi.wrongAnswer : texts.en.wrongAnswer)
                        reactionTime = Temp
                    }
                    // selectedFruit = Answer
                }
            }         

            const Result: FruitType | null = (Answer ?? null)

            console.log("Round: ", prev.currentRound)
            console.log("Selected Fruit: ", selectedFruit)
            console.log("Result: ", Result)

            const newState = {
                ...prev,
                cards: [],
                startTime: null,
                correctFruit: null,
                lastCorrectTime: null,
                currentRound: prev.currentRound + 1,
                results: [...prev.results, {
                    round: prev.currentRound,
                    fruit: Result,
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
    }, [setGameState, language]);

    const renderCards = () => {
        return gameState.cards.map((card, index) => (
            <Card key={index} className="w-20 h-28 relative">
                {Array.from({ length: card.count }).map((_, i) => {
                    let positionStyles = {};
                    let size = "2rem"; // 32px = 2rem
        
                    // Sử dụng vw và vh cho các vị trí và kích thước linh hoạt
                    switch (card.count) {
                        case 1:
                            positionStyles = { top: "50%", left: "50%", transform: "translate(-50%, -50%)" };
                            size = "2rem"; // 32px = 2rem
                            break;
        
                        case 2:
                            positionStyles = [
                                { top: "25%", left: "18%", transform: "translateY(-25%)" },
                                { top: "75%", left: "50%", transform: "translateY(-75%)" },
                            ][i];
                            size = "2rem"; // 32px = 2rem
                            break;
        
                        case 3:
                            positionStyles = [
                                { top: "9%", left: "10%", transform: "translateX(-50%), translateY(-20%)" },
                                { top: "39%", left: "35%", transform: "translateX(-40%), translateY(-40%)" },
                                { top: "69%", left: "60%", transform: "translateX(-30%), translateY(-60%)" },
                            ][i];
                            size = "1.8rem"; // 32px = 2rem, giảm size xuống 1.8rem (tương đương 28.8px)
                            break;
        
                        case 4:
                            positionStyles = [
                                { top: "20%", left: "10%" },
                                { top: "20%", left: "58%" },
                                { top: "60%", left: "10%" },
                                { top: "60%", left: "58%" },
                            ][i];
                            size = "1.8rem"; // 32px = 2rem, giảm size xuống 1.8rem (tương đương 28.8px)
                            break;
        
                        case 5:
                            positionStyles = [
                                { top: "10%", left: "10%" },
                                { top: "10%", left: "60%" },
                                { top: "40%", left: "35%" },
                                { top: "70%", left: "10%" },
                                { top: "70%", left: "60%" },
                            ][i];
                            size = "1.8rem"; // 32px = 2rem, giảm size xuống 1.8rem (tương đương 28.8px)
                            break;
                    }
        
                    return (
                        <div key={i} className="absolute" style={{ ...positionStyles }}>
                            <Image
                                src={FRUITS[card.fruit]}
                                alt={card.fruit}
                                width={32} // Cần điều chỉnh lại nếu bạn muốn sử dụng rem ở đây
                                height={32} // Cần điều chỉnh lại nếu bạn muốn sử dụng rem ở đây
                                style={{ width: size, height: size }} // Đảm bảo kích thước được thay đổi theo rem
                                className="flex-1 flex-2"
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
                className="w-14 h-14 bg-white rounded-lg shadow-md flex flex-col items-center justify-center"
                variant="outline">

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
                        <h2 className="text-2xl font-bold mb-4 text-center">
                            {language === 'vi' ? texts.vi.text : texts.en.text}
                        </h2>
                        <p className="mb-4">
                            {language === 'vi' ? texts.vi.gameRules : texts.en.gameRules}
                        </p>
                        <div className="flex gap-4 justify-center">
                            {ROUND_OPTIONS.map(rounds => (
                                <Button key={rounds} onClick={() => startGame(rounds)}>
                                    {rounds} {language === 'vi' ? texts.vi.round : texts.en.round}
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
                        
                        <p className="text-center text-lg">
                            {
                                language === 'vi' ?
                                texts.vi.roundNotification1 :
                                texts.en.roundNotification1
                            }
                        </p>
                        <p className="mb-4 text-center text-lg">
                            {
                                language === 'vi' ?
                                texts.vi.roundNotification2 : 
                                texts.en.roundNotification2
                            }
                        </p>
                        <div className="flex justify-center">
                            <Button className="font-bold bg-yellow-50" onClick={() => {
                                setShowRoundNotification(false);
                                if (gameState.currentRound > gameState.totalRounds) {
                                    setGameState(prev => ({ ...prev, gameStatus: 'finished' }));
                                }
                            }}>
                                {/* {gameState.currentRound > gameState.totalRounds ? 'Xem kết quả' : 'Tiếp tục'} */}
                                {
                                    gameState.currentRound > gameState.totalRounds ? 
                                    (language === 'vi' ? texts.vi.viewResults : texts.en.viewResults) : 
                                    (language === 'vi' ? texts.vi.continue : texts.en.continue)
                                }
                               
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {gameState.gameStatus === 'playing' && !showRoundNotification && (
                <div className="flex flex-col top-0 items-center gap-8 w-full pb-24">
                    <div className="w-full sm:w-[350px] h-auto sm:h-[400px] flex-1 overflow-y-auto border border-white bg-white p-4 rounded-md mb-16">
                        <div className="grid grid-cols-4 gap-4 items-center justify-center max-w-3xl">
                            {renderCards()}
                        </div>
                    </div>

                    <div className="fixed bottom-4 left-2 right-2 flex flex-col items-center gap-4 bg-orange-50 border-white p-2 shadow-lg rounded-md">
                        <div className="flex gap-4">
                            {renderFruitButtons()}
                        </div>
                        <div className="text-xl font-bold mt-2 items-center justify-center bottom-8">
                            {language === 'vi' ? texts.vi.round : texts.en.round} {gameState.currentRound}/{gameState.totalRounds}
                        </div>
                    </div>
                </div>
            )}
            {gameState.gameStatus === 'finished' && <RenderResults gameState={gameState} setShowRules={setShowRules} language={language} />}
        </div>
    )
}

const RenderResults = ({ 
    gameState, 
    setShowRules, 
    language, 
    }: { 
    gameState: GameState, 
    setShowRules: Dispatch<SetStateAction<boolean>>,
    language: string
    }) => {
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


    let Explaination = null
    if (language === 'vi') {
        Explaination = (
            <div className="border mt-4">
                <div className="top-12">
                    <p className="text-left ml-4">
                        <span className="text-green-500 font-semibold">
                            {language === 'vi' ? texts.vi.correctAnswer : texts.en.correctAnswer} 
                        </span>
                        <span className="mr-2 text-green-500 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainCorrect : texts.en.explainCorrect} 
                    </p>
                </div>
                <div className="ml-4">
                    <p className="text-red-300 font-semibold text-left">
                        {language === 'vi' ? texts.vi.wrongAnswer : texts.en.wrongAnswer}:
                    </p>
                    <p className="ml-8 text-left">
                        + {language === 'vi' ? texts.vi.explainWrong1 : texts.vi.explainWrong1}
                    </p>
                    <p className="ml-8 text-left">
                        + {language === 'vi' ? texts.vi.explainWrong2 : texts.vi.explainWrong2}
                    </p>
                </div>

                <div className="text-left font-semibold text-red-300 ml-4">
                    {language === 'vi' ? texts.vi.explainOutOf5s : texts.en.explainOutOf5s}
                </div>

                <div className="text-left font-semibold text-yellow-400 ml-4">
                    {language === 'vi' ? texts.vi.explainLarger : texts.en.explainLarger}
                </div>
                <div className="text-left font-semibold ml-4 text-yellow-400">
                    {language === 'vi' ? texts.vi.explainMiss : texts.en.explainMiss}
                </div>
                <div className="top-12">
                    <p className="text-left ml-4">
                        <span className="text-gray-500 font-semibold">
                            {language === 'vi' ? texts.vi.noAnswer : texts.en.noAnswer}
                        </span>
                        <span className="mr-2 text-gray-500 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainNoAnswer : texts.en.explainNoAnswer}
                    </p>
                </div>
            </div>
        );
    } else {
        Explaination = (
            <div className="border mt-4">
                <div className="top-12">
                    <p className="text-left ml-4">
                        <span className="text-green-500 font-semibold">
                            {language === 'vi' ? texts.vi.correctAnswer : texts.en.correctAnswer} 
                        </span>
                        <span className="mr-2 text-green-500 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainCorrect : texts.en.explainCorrect} 
                    </p>
                </div>

                <div className="ml-4">
                    <p className="text-left">
                        <span className="text-red-300 font-semibold">
                            {language === 'vi' ? texts.vi.wrongAnswer : texts.en.wrongAnswer} 
                        </span>
                        <span className="mr-2 text-red-300 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainWrong1 : texts.en.explainWrong1} 
                    </p>
                </div>

                <div className="ml-4">
                    <p className="text-left">
                        <span className="text-red-300 font-semibold">
                            {language === 'vi' ? texts.vi.outOf5s : texts.en.outOf5s} 
                        </span>
                        <span className="mr-2 text-red-300 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainWrong1 : texts.en.explainOutOf5s} 
                    </p>
                </div>

                <div className="ml-4">
                    <p className="text-left">
                        <span className="text-yellow-400 font-semibold">
                            {language === 'vi' ? texts.vi.wrongAnswer : texts.en.larger} 
                        </span>
                        <span className="mr-2 text-yellow-400 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainWrong1 : texts.en.explainLarger} 
                    </p>
                </div>

                <div className="ml-4">
                    <p className="text-left">
                        <span className="text-yellow-400 font-semibold">
                            {language === 'vi' ? texts.vi.wrongAnswer : texts.en.missAnswer} 
                        </span>
                        <span className="mr-2 text-yellow-400 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainWrong1 : texts.en.explainMiss} 
                    </p>
                </div>

                <div className="ml-4">
                    <p className="text-left">
                        <span className="text-gray-500 font-semibold">
                            {language === 'vi' ? texts.vi.wrongAnswer : texts.en.noAnswer} 
                        </span>
                        <span className="mr-2 text-gray-500 font-semibold">:</span>
                        {language === 'vi' ? texts.vi.explainWrong1 : texts.en.explainNoAnswer} 
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl mx-auto mt-8">
            
            <h2 className="text-2xl font-bold mb-4">
                {language === 'vi' ? texts.vi.resultsSummary : texts.en.resultsSummary}
            </h2>
            <table className="w-full border-collapse">
                
                <thead>
                    <tr className="bg-fuchsia-50">
                        <th className="p-2 border">
                            {language === 'vi' ? texts.vi.gameRound : texts.en.gameRound}
                        </th>
                        <th className="p-2 border">
                            {language === 'vi' ? texts.vi.fruitType : texts.en.fruitType}
                        </th>
                        <th className="p-2 border">
                            {/* Thời gian phản ứng */}
                            {language === 'vi' ? texts.vi.reactionTime : texts.en.reactionTime}
                        </th>
                        <th className="p-2 border">
                            {/* Đạt yêu cầu */}
                            {language === 'vi' ? texts.vi.requirements : texts.en.requirements}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {gameState.results.map((result, index) => (
                        <tr key={index}>
                            <td className="p-2 border text-center bg-white">{result.round}</td>
                            <td className="p-2 border text-center bg-white">
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
                            <td className="p-2 border text-center bg-white">
                                {result.reactionTime ? `${result.reactionTime.toFixed(3)}s` : '-'}
                            </td>
                            <td className={`p-2 border text-center ${result.bgColor}`}>
                                {result.msg}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {Explaination}

            <Button onClick={() => setShowRules(true)} className="mt-4 bg-sky-600 text-white hover:bg-sky-500">
                {language === 'vi' ? texts.vi.playAgain : texts.en.playAgain}
            </Button>

            <footer className="mt-8 text-center mb-8">
                <p className="text-sm text-gray-500 font-medium">
                    Tâm lý học Nhận thức - Cognitive Psychology
                </p>
            </footer>
        </div>
    )
}

