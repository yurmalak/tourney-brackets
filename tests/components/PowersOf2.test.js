import PowersOf2 from '../../src/components/brackets/PowersOf2/PowersOf2.svelte';
import { render, screen } from '@testing-library/svelte';
import { setStore } from '../testUtils';



describe('Bracket PowersOf2', () => {


    /** Setup for test #4 */
    function setupDwarfTournament() {

        const participants = [
            "Thror",
            "Thrain",
            "Bifur",
            "Bofur",
            "Bombur",
            "Ori",
            "Nori",
            "Dori",
        ]

        const t = (a, b) => [participants[a], participants[b]]
        const games = [
            [{ players: t(0, 1), round: 0, winner: 1 }],
            [{ players: t(2, 3), round: 0, winner: 0 }],
            [{ players: t(4, 5), round: 0, winner: 1 }],
            [{ players: t(6, 7), round: 0, winner: 0 }],
            // first semi-finals 1-2
            [
                { players: t(1, 2), round: 1, winner: 0 },
                { players: t(1, 2), round: 1, winner: 1 },
                { players: t(1, 2), round: 1, winner: 1 },
            ],
            // seconds semi-finals 2-0
            [
                { players: t(5, 6), round: 1, winner: 0 },
                { players: t(5, 6), round: 1, winner: 0 },
            ],
            // 1st place 2-0
            [
                { players: t(2, 5), round: 2, winner: 0 },
                { players: t(2, 5), round: 2, winner: 0 },
            ],
            // 3rd place 2-1
            [
                { players: t(1, 6), round: 2, winner: 1 },
                { players: t(1, 6), round: 2, winner: 0 },
                { players: t(1, 6), round: 2, winner: 0 },
            ]
        ]

        const sList = games.map(gs => {
            const { players, round } = gs[0]
            return {
                tourneyId: "123",
                players,
                round,
                kvMap: [],
                games: gs.map((g, i) => ({
                    id: "321" + i,
                    winner: players[g.winner],
                    data: {},
                    kvMap: []
                }))
            }
        })

        /** 
         * @param {Array<string|number>} values
         */
        function checkNode(...values) {

            const pattern = new RegExp(`^${values.join("\\s*")}$`)
            const node = screen.getByRole("button", { name: pattern })
            expect(node).toBeInTheDocument()

        }

        return { participants, sList, checkNode }
    }


    it("renders correct number of buttons", () => {

        let expectedNumber = 1 + 2
        setStore()
        const { rerender } = render(PowersOf2);

        for (const num of [4, 8, 16, 32, 64]) {
            expectedNumber += num
            setStore({ tourney: { playersTotal: num * 2 } })
            rerender({})
            const buttons = screen.getAllByRole("button")
            expect(buttons.length).toBe(expectedNumber)
        }
    })

    it("renders extra node if 'withTop3 === true'", () => {

        setStore({ tourney: { playersTotal: 32, withTop3: true } })
        render(PowersOf2)
        const buttons = screen.getAllByRole("button")
        const normal = 1 + 2 + 4 + 8 + 16
        expect(buttons.length).toBe(normal + 1)
    })

    it("writes players to nodes", () => {

        const participants = [
            "Dreeg",
            "Solael",
            "",             // put Bysmiel in second slot
            "Bysmiel",
            "Attendant",
            ...Array(11).fill("")
        ]
        setStore({ tourney: { participants, playersTotal: 16 } })
        render(PowersOf2)

        const dreeg = screen.getByText("Dreeg")
        expect(dreeg.closest("button")?.textContent).toMatch(/Dreeg.*0.*Solael.*0/)

        const bysmiel = screen.getByText("Bysmiel")
        expect(bysmiel.closest("button")?.textContent).toMatch(/0.*Bysmiel.*0/)

        const attendant = screen.getByText("Attendant")
        expect(attendant.closest("button")?.textContent).toMatch(/Attendant.*0.*0/)
    })

    it("counts score and promotes winner to next round (including 3rd place)", () => {

        const { participants, sList, checkNode } = setupDwarfTournament()
        setStore({
            tourney: {
                participants,
                playersTotal: 8,
                withTop3: true
            },
            sList
        })
        const { rerender } = render(PowersOf2)

        // 2-0
        checkNode(participants[2], 2, participants[5], 0)

        // 2-1
        checkNode(participants[1], 2, participants[6], 1)


        // finals should not happen if some game missing
        sList[0].games.pop()
        setStore({
            tourney:
            {
                playersTotal: 8,
                withTop3: true,
                participants
            },
            sList
        })
        rerender({})

        // Thror and Thrain refuse to play since their game got sliced
        checkNode(participants[0], 0, participants[1], 0)

        // so Bifur, Ori and Nori will have to wait for them
        checkNode(0, participants[2], 0)     // semi-finals
        checkNode(0, participants[5], 0)     // winner finals
        checkNode(0, participants[6], 0)     // loser finals
    })
});
