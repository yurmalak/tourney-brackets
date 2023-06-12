import { render, screen } from '@testing-library/svelte';
import { Tourney } from '../../lib/Tourney';
import PowersOf2 from './PowersOf2.svelte';
import bundleSeries from "./bundleSeries"


/** @param {import("../../types").TourneyData} options */
function setup({ tourney = {}, sList = [], ...other } = {}) {

    const { playersTotal = 8, withTop3 = false } = tourney

    return bundleSeries(new Tourney({
        tourney: {
            participants: [],
            templateCode: "powersOf2",
            playersTotal,
            withTop3,
            winsRequired: buildWinsRequired(playersTotal, withTop3),
            ...tourney
        },
        sList: [...sList],
        ...other
    }))
}

/**
 * @param {number} playersTotal 
 * @param {boolean} withTop3 
 */
function buildWinsRequired(playersTotal, withTop3 = false) {
    const winsByRound = []
    for (let i = playersTotal / 2; i >= 1; i /= 2) {
        winsByRound.push(Array(i).fill(1))
    }

    // withTop3 adds another series to finals
    if (withTop3) {
        const finals = winsByRound[winsByRound.length - 1]
        finals.push(1)
    }

    return winsByRound
}


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
    const { rerender } = render(PowersOf2, setup());

    for (const num of [4, 8, 16, 32, 64]) {
        expectedNumber += num

        const playersTotal = num * 2
        rerender(setup({ tourney: { playersTotal } }))
        const buttons = screen.getAllByRole("button")
        expect(buttons.length).toBe(expectedNumber)
    }
})

it("renders extra node if 'withTop3 === true'", () => {

    render(PowersOf2, setup({ tourney: { playersTotal: 32, withTop3: true } }))
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
    render(PowersOf2, setup({ tourney: { participants, playersTotal: 16 } }))

    const dreeg = screen.getByText("Dreeg")
    expect(dreeg.closest("button").textContent).toMatch(/Dreeg.*0.*Solael.*0/)

    const bysmiel = screen.getByText("Bysmiel")
    expect(bysmiel.closest("button").textContent).toMatch(/0.*Bysmiel.*0/)

    const attendant = screen.getByText("Attendant")
    expect(attendant.closest("button").textContent).toMatch(/Attendant.*0.*0/)
})

it("counts score and promotes winner to next round (including 3rd place)", () => {

    const { participants, sList, checkNode } = setupDwarfTournament()

    const { rerender } = render(PowersOf2, setup({
        tourney: {
            participants,
            playersTotal: 8,
            withTop3: true
        },
        sList
    }))

    // 2-0
    checkNode(participants[2], 2, participants[5], 0)

    // 2-1
    checkNode(participants[1], 2, participants[6], 1)


    // finals should not happen if some game missing
    sList[0].games.pop()
    rerender(setup({
        tourney:
        {
            playersTotal: 8,
            withTop3: true,
            participants
        },
        sList
    }))

    // Thror and Thrain refuse to play since their game got sliced
    checkNode(participants[0], 0, participants[1], 0)

    // so Bifur, Ori and Nori will have to wait for them
    checkNode(0, participants[2], 0)     // semi-finals
    checkNode(0, participants[5], 0)     // winner finals
    checkNode(0, participants[6], 0)     // loser finals
})
