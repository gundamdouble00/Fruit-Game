"use client"; // Đảm bảo React xử lý component ở phía client

import React, { useState } from "react";
import Game from "./game";

const GameStartPage: React.FC = () => {
  const [startGame, setStartGame] = useState(false);
  const [language, setLanguage] = useState<string>("vi"); // 'vi' cho Tiếng Việt, 'en' cho English

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang); // Cập nhật ngôn ngữ khi người dùng chọn
    setStartGame(true); // Ngay lập tức bắt đầu game khi chọn ngôn ngữ
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-white text-center">
      {!startGame ? (
        <>
          <div className="mb-5 flex flex-col items-center">
            <h1 className="text-1xl text-gray-800">
              Chào Mừng Bạn Đến Với Trò Chơi
            </h1>
            <p className="text-2xl font-semibold text-red-300">
              Trái cây nhập ngũ
            </p>
          </div>

          <div className="mb-5 flex flex-col items-center">
            <h1 className="text-1xl text-gray-800">Welcome to</h1>
            <p className="text-2xl font-semibold text-sky-300">Five-a-Fruit</p>
          </div>

          <p className="text-1xl mb-5">Chọn ngôn ngữ</p>
          <div className="mb-5 flex space-x-4">
            <button
              onClick={() => handleLanguageChange("vi")}
              className="rounded-lg bg-blue-500 px-6 py-3 text-lg text-white hover:bg-blue-600"
            >
              Tiếng Việt
            </button>
            <button
              onClick={() => handleLanguageChange("en")}
              className="rounded-lg bg-blue-500 px-6 py-3 text-lg text-white hover:bg-blue-600"
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
