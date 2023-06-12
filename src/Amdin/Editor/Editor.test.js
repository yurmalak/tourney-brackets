import clone from "rfdc/default"
import userEvent from "@testing-library/user-event"
import EditorAssistant from "./testAssistants/TaEditor.svelte"
import { render, screen, within, cleanup } from '@testing-library/svelte';
import { vi } from 'vitest';
import { get } from "svelte/store"

import Series from "../../lib/Series"
import { createGame } from '../../lib/utils';
import { tourneyStore } from "../stores";



function setupEditor(dbClient) {

    const playersTotal = 8
    const participants = [
        "John",
        "Jane",
        ...Array(playersTotal - 2).fill(""), // make Kate idle
        "Kate",
    ]

    const sList = []
    for (let i = 0; i < playersTotal; i += 2) {
        sList.push({
            id: "" + i + Date.now(),
            players: participants.slice(i, i + 2),
            round: 0,
            games: [],
            kvMap: []
        })
    }

    const game = createGame()
    game.winner = "Jane"
    game.kvMap.push(["starting gold", "100"])
    sList[0].games.push(game)

    tourneyStore.set({
        tourney: {
            withTop3: true,
            participants: [...participants],
            playersTotal,
            templateCode: "powersOf2",
            winsRequired: [Array(playersTotal / 2).fill(1)]
        },
        sList: clone(sList),
        dbClient
    })

    // not really by round but for Editor it's enought
    const tourney = get(tourneyStore)
    const seriesByRound = [
        clone(sList).map((series, sIndex) => new Series({
            ...series,
            sIndex,
            tourney,
            ancestors: [],
            isLoserSeries: false
        }))
    ]

    const kvOptions = {
        series: {
            "group": { fields: [{ type: "text" }] }
        },
        game: {
            "starting gold": { fields: [{ type: "text" }] },
            "map": { fields: [{ type: "text" }] }
        }
    }


    const series = seriesByRound[0][0]
    const { component } = render(EditorAssistant, { series, kvOptions, seriesByRound })
    const searchArgs = { value: new RegExp(series.players.join("|")), name: /Player [12]/ }
    const playerSelectors = screen.getAllByRole("combobox", searchArgs)

    return { component, series, playerSelectors, participants }
}

it("reflects changes", async () => {

    const { playerSelectors } = setupEditor()
    const user = userEvent.setup()

    // speed up checks by looking withing footer
    const footer = screen.getByRole("button", { name: /close/i }).parentNode

    /** @param {boolean} changed */
    function checkChanged(changed) {

        // discard and save should be visible
        if (changed) {
            expect(within(footer).getByRole("button", { name: /discard/i })).toBeInTheDocument()
            expect(within(footer).getByRole("button", { name: /save/i })).toBeInTheDocument()
        }

        // close should be visible
        else {
            expect(within(footer).getByRole("button", { name: /close/i })).toBeInTheDocument()
        }
    }

    async function discard() {
        const discardButton = within(footer).getByRole("button", { name: /discard/i })
        return user.click(discardButton)
    }

    async function checkAndDiscard() {
        checkChanged(true)
        await discard()
        checkChanged(false)
    }

    checkChanged(false)


    // change players
    await user.selectOptions(playerSelectors[0], "Kate")
    expect(playerSelectors[0]).toHaveValue("Kate")
    await checkAndDiscard()

    // swap players
    await user.selectOptions(playerSelectors[0], "Jane")
    expect(playerSelectors[0]).toHaveValue("Jane")
    expect(playerSelectors[1]).toHaveValue("John")
    await checkAndDiscard()

    // add kv field to series data
    const sFieldAdder = within(footer).getByRole("combobox", { name: /add.+field/i })
    await user.selectOptions(sFieldAdder, "group")
    await checkAndDiscard()

    // add game
    expect(screen.getAllByLabelText("game")).toHaveLength(1)
    const addGameButton = within(footer).getByRole("button", { name: /game/i })
    await user.click(addGameButton)
    expect(screen.getAllByLabelText("game")).toHaveLength(2)
    await checkAndDiscard()
    expect(screen.getAllByLabelText("game")).toHaveLength(1)

    // edit game winner
    const score = screen.getByLabelText(/score/i)
    const game = screen.getByLabelText("game")
    const switcher = within(game).getByRole("button", { name: /winner/i })
    expect(/winner.+Jane/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()
    expect(score).toHaveTextContent(/0.+1/)
    await user.click(switcher)
    expect(/winner.+John/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()
    expect(score).toHaveTextContent(/1.+0/)
    await checkAndDiscard()

    // add kv field to game data
    const gFieldAdder = within(game).getByRole("combobox", { name: /add.+field/i })
    expect(within(game).getAllByRole("textbox")).toHaveLength(1)
    await user.selectOptions(gFieldAdder, "map")
    expect(within(game).getAllByRole("textbox")).toHaveLength(2)
    await checkAndDiscard()

    // edit game's kv field
    const valueField = within(game).getByRole("textbox")
    expect(valueField).toHaveTextContent("100")  // contenteditable
    await user.type(valueField, "500")
    expect(valueField).toHaveTextContent("100500")
    await checkAndDiscard()

    // delete game
    expect(game).toBeInTheDocument()
    const deleteButton = within(game).getByRole("button", { name: /delete/i })
    await user.click(deleteButton)
    await user.click(deleteButton)  // second click to confirm
    expect(game).not.toBeInTheDocument()
    await checkAndDiscard()
})

it("saves with correct args", async () => {

    const dbClient = { updateData: () => Promise.resolve({ result: {} }) }
    const dbSpy = vi.spyOn(dbClient, "updateData")
    const closeEditorSpy = vi.fn()
    const updateSpy = vi.spyOn(tourneyStore, "update")

    const user = userEvent.setup()
    let { playerSelectors, component, participants } = setupEditor(dbClient)
    component.$on("toggleEditor", closeEditorSpy)


    // save swapped players - only players should change
    await user.selectOptions(playerSelectors[0], "Jane")
    await user.click(screen.getByRole("button", { name: /save/i }))
    expect(closeEditorSpy).toHaveBeenCalled()
    expect(updateSpy.mock.lastCall[0]).toHaveProperty("participants")
    expect(updateSpy.mock.lastCall[0]).not.toHaveProperty("series")
    expect(dbSpy.mock.lastCall[0]).not.toHaveProperty("series")
    expect(dbSpy.mock.lastCall[0]).toHaveProperty("tourney")
    expect(dbSpy.mock.lastCall[0].tourney.participants).toEqual([
        ...participants.slice(0, 2).reverse(),
        ...participants.slice(2)
    ])


    // change series only
    cleanup();
    ({ playerSelectors, component } = setupEditor(dbClient))
    await user.click(screen.getByRole("button", { name: /add game/i }))
    await user.click(screen.getByRole("button", { name: /save/i }))
    expect(updateSpy.mock.lastCall[0]).not.toHaveProperty("participants")
    expect(updateSpy.mock.lastCall[0]).toHaveProperty("series")
    expect(dbSpy.mock.lastCall[0]).toHaveProperty("series")
    expect(dbSpy.mock.lastCall[0]).not.toHaveProperty("tourney")
    expect(dbSpy.mock.lastCall[0].series.games).toHaveLength(2)
    expect(dbSpy.mock.lastCall[0].series.games[1].winner).toBe("")


    // both
    cleanup();
    ({ playerSelectors, component } = setupEditor(dbClient))
    await user.selectOptions(playerSelectors[0], "Kate")
    await user.click(screen.getByRole("button", { name: /add game/i }))
    await user.click(screen.getByRole("button", { name: /winner/i }))
    await user.click(screen.getByRole("button", { name: /save/i }))
    expect(updateSpy.mock.lastCall[0]).toHaveProperty("participants")
    expect(updateSpy.mock.lastCall[0]).toHaveProperty("series")
    expect(dbSpy.mock.lastCall[0].series.games[0].winner).toBe("Kate")

    const newParticipants = dbSpy.mock.lastCall[0].tourney.participants
    expect(newParticipants[0]).toBe("Kate")
    expect(newParticipants[1]).toBe("Jane")
    expect(newParticipants.pop()).toBe("John")
})

it("handles 'Close' event correctly", async () => {

    const user = userEvent.setup()
    const { component } = setupEditor()
    const closeEditorSpy = vi.fn()

    // click outside
    component.$on("toggleEditor", closeEditorSpy)
    window.document.body.dispatchEvent(new Event('click'))
    expect(closeEditorSpy).toHaveBeenCalledTimes(1)

    // Escape
    await user.keyboard("{Escape}")
    expect(closeEditorSpy).toHaveBeenCalledTimes(2)

    // changes prevent window from closing
    const winnerSwitcher = screen.getByRole("button", { name: /switcher/i })
    await user.click(winnerSwitcher)
    window.document.body.dispatchEvent(new Event('click'))
    expect(closeEditorSpy).toHaveBeenCalledTimes(2)  // still 1
})

it("locks focus within", async () => {

    const user = userEvent.setup()
    const { playerSelectors: [firstSelector] } = setupEditor()
    const closeButton = screen.getByRole("button", { name: /close/i })

    closeButton.focus()
    expect(closeButton).toHaveFocus()

    await user.keyboard("{Tab}")
    expect(firstSelector).toHaveFocus()

    await user.keyboard("{Shift>}{Tab}{/Shift}")
    expect(closeButton).toHaveFocus()
})