// app/round-data/page.tsx
import PlayerDataTable from '../../components/PlayerDataTable';
import path from 'path';
import fs from 'fs/promises';
import { Item } from '../../types/playerData';

async function getData(): Promise<Item[]> {
    try {
        const filePath = path.join(process.cwd(), 'public', 'data.json');
        const jsonData = await fs.readFile(filePath, 'utf8');
        return JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading or parsing data:', error);
        return [];
    }
}

export default async function RoundDataPage() {
    const data = await getData();

    return <PlayerDataTable data={data} />;
}
