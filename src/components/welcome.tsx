'use client'; // Đảm bảo React xử lý component ở phía client

import React, { useState } from 'react';
import Game from './game';

const GameStartPage: React.FC = () => {
  const [startGame, setStartGame] = useState(false);
  const [language, setLanguage] = useState<string>('vi'); // 'vi' cho Tiếng Việt, 'en' cho English

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang); // Cập nhật ngôn ngữ khi người dùng chọn
    setStartGame(true); // Ngay lập tức bắt đầu game khi chọn ngôn ngữ
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-white text-center">
      {!startGame ? (
        <>
          <div className="flex flex-col items-center mb-5">
            <h1 className="text-1xl text-gray-800">Chào Mừng Bạn Đến Với Trò Chơi</h1>
            <p className="text-2xl font-semibold text-red-300">Trái cây nhập ngũ</p>
          </div>

          <div className="flex flex-col items-center mb-5">
            <h1 className="text-1xl text-gray-800">Welcome to</h1>
            <p className="text-2xl font-semibold text-sky-300">Five-a-Fruit</p>
          </div>

          <p className="text-1xl mb-5">Chọn ngôn ngữ</p>
          <div className="flex space-x-4 mb-5">
            <button
              onClick={() => handleLanguageChange('vi')} 
              className="bg-blue-500 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-600"
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => handleLanguageChange('en')} 
              className="bg-blue-500 text-white text-lg py-3 px-6 rounded-lg hover:bg-blue-600"
            >
              English
            </button>
          </div>
        </>
      ) : (
        <Game language={language} /> 
      )}
    </div>
  );
};

export default GameStartPage;
