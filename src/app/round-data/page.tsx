import React from 'react';
import data from '../../../public/data.json';

interface Round {
    round: number;
    fruit: string;
    reactionTime: number;
    success: boolean;
    msg: string;
    bgColor: string;
}

interface Item {
    id: string;
    createdAt: string;
    round: Round[];
}

interface PlayerDataTableProps {
    data: Item[];
}

const PlayerDataTable: React.FC<PlayerDataTableProps> = () => {
    return (
        <div className="container mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Player Data</h1>
            {data && data.map((item: Item) => (
                <div key={item.id} className="mb-8 bg-white shadow-md rounded-lg overflow-hidden">
                    <div className="bg-gray-100 px-4 py-2">
                        <h2 className="text-lg font-semibold">
                            Player Session: {new Date(item.createdAt).toLocaleString()}
                        </h2>
                    </div>
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="px-4 py-2">Round</th>
                                <th className="px-4 py-2">Fruit</th>
                                <th className="px-4 py-2">Reaction Time</th>
                                <th className="px-4 py-2">Message</th>
                            </tr>
                        </thead>
                        <tbody>
                            {item.round.map((roun: Round) => (
                                <tr key={roun.round} className={`${roun.bgColor} border-b`}>
                                    <td className="px-4 py-2 text-center">{roun.round}</td>
                                    <td className="px-4 py-2 text-center">{roun.fruit}</td>
                                    <td className="px-4 py-2 text-center">{roun.reactionTime}s</td>
                                    <td className="px-4 py-2 text-center">{roun.msg}</td>
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
};

export default PlayerDataTable;

