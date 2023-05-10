import mockedPlayers from './players';
import mockedGames from './games';

import type { Player, Participant } from '../types';

export async function mockedFetchData(): Promise<{ tourneys: object; currentTourneyId: string; }> {
    let s = 0;

    const mockedTourney = {
        id: '1234567890987654321',
        name: 'Fake tourney',
        templateCode: 'powersOf2',
        playersTotal: 32,
        withTop3: true,
        status: 'ongoing',
        players: mockedPlayers.map((p: Player, i): Participant => ({
            name: p.name,
            sIndex: i % 2 ? s++ : s,
            pIndex: i % 2
        })),
        games: mockedGames
    };

    return {
        tourneys: {
            [mockedTourney.id]: mockedTourney,
            "id123": {
                id: "id123",
                name: "Unfetched tourney",
                status: "finished"
            }
        },
        currentTourneyId: mockedTourney.id
    };
}
