import React from 'react';
import { Item, Round } from '../types/playerData';

interface PlayerDataTableProps {
    data: Item[];
}

function PlayerDataTable({ data }: PlayerDataTableProps) {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Player Data</h1>
            {data.map((item: Item) => (
                <div key={item.id} className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2">
                        <h2 className="text-lg font-semibold">
                            Player Session: {new Date(item.createdAt).toLocaleString()}
                        </h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2 w-[20%]">Round</th>
                                <th className="px-4 py-2 w-[20%]">Fruit</th>
                                <th className="px-4 py-2 w-[20%]">Reaction Time</th>
                                <th className="px-4 py-2 w-[40%]">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.round.map((round: Round) => (
                                <tr key={round.round} className={`${round.bgColor} border-b`}>
                                    <td className="px-4 py-2 text-center">{round.round}</td>
                                    <td className="px-4 py-2 text-center">{round.fruit}</td>
                                    <td className="px-4 py-2 text-center">{round.reactionTime}s</td>
                                    <td className="px-4 py-2 text-center">{round.msg}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ))}
            <footer className="text-center text-sm text-gray-500">
                <p>© {new Date().getFullYear()} zunohoang. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default PlayerDataTable;
