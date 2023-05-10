import PowersOf2 from '../../../src/components/Bracket/templates/PowersOf2.svelte';
import { render, screen } from '@testing-library/svelte';
import { tourneyStore } from '../../../src/stores';


describe('Bracket PowersOf2', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function setStore(options: any) {

        tourneyStore.set({
            withTop3: false,
            playersTotal: 8,
            players: [],
            games: [],
            ...options
        })
    }

    it("renders correct number of buttons", () => {

        let expectedNumber = 1 + 2
        const { rerender } = render(PowersOf2);

        for (const num of [4, 8, 16, 32, 64]) {
            expectedNumber += num
            setStore({ playersTotal: num * 2 })
            rerender({})
            const buttons = screen.getAllByRole("button")
            expect(buttons.length).toBe(expectedNumber)
        }
    })

    it("renders extra node if 'withTop3 === true'", () => {

        setStore({ playersTotal: 32, withTop3: true })
        render(PowersOf2)
        const buttons = screen.getAllByRole("button")
        const normal = 1 + 2 + 4 + 8 + 16
        expect(buttons.length).toBe(normal + 1)
    })

    it("writes players to nodes", () => {

        const players = [
            { name: "Dreeg", sIndex: 2, pIndex: 0 },
            { name: "Solael", sIndex: 2, pIndex: 1 },
            { name: "Bysmiel", sIndex: 5, pIndex: 1 },
            { name: "Attendant", sIndex: 6, pIndex: 0 }
        ]
        setStore({ players, playersTotal: 16 })
        render(PowersOf2)

        const dreeg = screen.getByText("Dreeg")
        expect(dreeg.closest("button")?.textContent).toMatch(/Dreeg.*0.*Solael.*0/)

        const bysmiel = screen.getByText("Bysmiel")
        expect(bysmiel.closest("button")?.textContent).toMatch(/0.*Bysmiel.*0/)

        const attendant = screen.getByText("Attendant")
        expect(attendant.closest("button")?.textContent).toMatch(/Attendant.*0.*0/)
    })

    it("counts score and promotes winner to next round (including 3rd place)", () => {

        const names = [
            "Thror",
            "Thrain",
            "Bifur",
            "Bofur",
            "Bombur",
            "Ori",
            "Nori",
            "Dori",
        ]
        let s = 0
        const players = names.map((name, i) => ({
            name,
            sIndex: i % 2 ? s++ : s,
            pIndex: i % 2
        }))


        const t = (a: number, b: number) => [names[a], names[b]]
        const games = [
            { players: t(0, 1), round: 0, winner: 1 },  // will be missing at second render
            { players: t(2, 3), round: 0, winner: 0 },
            { players: t(4, 5), round: 0, winner: 1 },
            { players: t(6, 7), round: 0, winner: 0 },
            // first semi-finals 1-2
            { players: t(1, 2), round: 1, winner: 0 },
            { players: t(1, 2), round: 1, winner: 1 },
            { players: t(1, 2), round: 1, winner: 1 },
            // seconds semi-finals 2-0
            { players: t(5, 6), round: 1, winner: 0 },
            { players: t(5, 6), round: 1, winner: 0 },
            // 1st place 2-0
            { players: t(2, 5), round: 2, winner: 0 },
            { players: t(2, 5), round: 2, winner: 0 },
            // 3rd place 1-2
            { players: t(1, 6), round: 2, winner: 1 },
            { players: t(1, 6), round: 2, winner: 0 },
            { players: t(1, 6), round: 2, winner: 0 },
        ]
        setStore({
            games,
            playersTotal: 8,
            withTop3: true,
            players
        })
        const { rerender } = render(PowersOf2)


        // fail to check that the function can fail
        let fail = false
        try { screen.getByText(findSeries("Billy", "2", "Bob", "0")) }
        catch (err) { fail = true }
        expect(fail).toBeTruthy()

        // 2-0
        const winner = screen.getByText(findSeries(names[2], "2", names[5], "0"))
        expect(winner).toBeInTheDocument()

        // 1-2
        const thirdPlace = screen.getByText(findSeries(names[1], "2", names[6], "1"))
        expect(thirdPlace).toBeInTheDocument()


        // finals should not happen if some game missing
        setStore({
            games: games.slice(1),
            playersTotal: 8,
            withTop3: true,
            players
        })
        rerender({})

        /** Empty strings are omnipresent so values can;t start with it. */
        function findSeries(...values: string[]) {

            const { length } = values
            let i = 0, current = values[i]
            return function (content: string) {

                if (content === current) {
                    if (++i >= length) return true
                    current = values[i]
                    return false
                }
                else {
                    current = values[i = 0]
                    return false
                }
            }
        }


        // Thror and Thrain refuse to play since their game got sliced
        const justChilling = screen.getByText(findSeries(names[0], "0", names[1], "0"))   // first round
        expect(justChilling).toBeInTheDocument()

        // so Bifur, Ori and Nori will have to wait for them
        const bifur = screen.getByText(findSeries("0", names[2], "0"))    // semi-finals
        const ori = screen.getByText(findSeries("0", names[5], "0"))      // winner finals
        const nori = screen.getByText(findSeries("0", names[6], "0"))     // loser finals
        expect(bifur).toBeInTheDocument()
        expect(ori).toBeInTheDocument()
        expect(nori).toBeInTheDocument()
    })
});
