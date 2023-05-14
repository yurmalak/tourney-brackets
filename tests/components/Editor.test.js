import { render, screen, within, fireEvent/**,waitFor, waitForElementToBeRemoved */ } from '@testing-library/svelte';
import { get } from 'svelte/store';
import { afterEach, vi } from "vitest"

import Editor from '../../src/components/Editor/Editor.svelte';
import { setStore } from '../testUtils';
import { createGame, createSeries } from '../../src/lib/utils';
import { tourneyStore } from '../../src/stores';


describe("Editor", () => {

    afterEach(() => { vi.clearAllMocks() })

    function setup() {

        const players = [
            { name: "John", sIndex: 0, pIndex: 0 },
            { name: "Jane", sIndex: 0, pIndex: 1 },
            { name: "Kate", sIndex: null, pIndex: null }
        ]

        const round = 0
        const participants = players.slice(0, 2)
        const names = participants.map(p => p.name)
        const series = createSeries(round, 0)
        const game = createGame({ round, index: 0, players: names })

        series.players = participants
        series.games = [game]
        game.winner = 1

        setStore({ players, games: series.games })
        const { rerender, component } = render(Editor, { series })

        const selectorSearchArgs = { value: new RegExp(names.join("|")), name: /Player [12]/ }
        return { players, participants, names, series, game, round, selectorSearchArgs, rerender, component }
    }

    /**
     * If `buttonsAppearance` is boolean checks if temp data differs from saved
     * (true - Save and Discard buttons visible, false - close one).
     * If object, looks for buttons with same names as keys.
     * Expects them to be in the document if value is true and missing if false. 
     * @param {boolean|{ [key: string]: boolean }} buttonsAppearance 
     */
    async function checkButtons(buttonsAppearance) {

        if (typeof buttonsAppearance === "boolean") {
            return checkButtons({
                save: buttonsAppearance,
                discard: buttonsAppearance,
                close: !buttonsAppearance
            })
        }

        return Promise.all(Object.entries(buttonsAppearance).map(async ([key, value]) => {

            const options = { name: new RegExp(key, "i") }

            if (value === true) return screen.findByRole("button", options)

            const button = screen.queryByRole("button", { name })
            expect(button).toBeNull()
        }))
    }


    async function checkScore(a, b) {
        const labelPattern = new RegExp(`score ${a}.{1,3}${b}`, "i")
        const score = await screen.findByLabelText(labelPattern)

        const visiblePattern = new RegExp(`${a}.{1,3}${b}`)
        expect(score).toHaveTextContent(visiblePattern)
    }



    /** 
     * Expects number of games in series to be equal to `n`. 
     * @param {number} n
     */
    async function expectNGames(n) {

        if (n === 0) {
            const game = screen.queryByRole("listitem", { name: /game/i })
            expect(game).toBe(null)
            return null
        }
        else {
            const games = await screen.findAllByRole("listitem", { name: /game/i })
            expect(games.length).toBe(n)
            return games
        }
    }


    it("renders correctly with minimal props", async () => {

        setStore()
        const { rerender } = render(Editor, { series: createSeries(0, 0) })
        const selects = screen.getAllByRole("combobox", { value: undefined, name: /Player [12]/ })


        expect(selects).toHaveLength(2)
        await checkScore(0, 0)

        // no changes have been made - only Close visible
        // can't add games without players either
        await checkButtons(false)
        await checkButtons({ "add game": false })

        // check next round
        rerender({ series: createSeries(1, 0) })

        // players can only be changed at first round
        const disabledSelects = screen.queryAllByRole("combobox", { value: undefined, name: /Player [12]/ })
        disabledSelects.forEach(s => expect(s).toBeDisabled())
        expect(selects).toHaveLength(2)
    })

    it("renders correctly with normal props", async () => {

        const { players, participants, names, series, round, selectorSearchArgs, rerender } = setup()
        const selects = screen.getAllByRole("combobox", selectorSearchArgs)


        participants.forEach(p => expect(selects[p.pIndex]).toHaveValue(p.name))
        selects.forEach(el => {
            const options = within(el).getAllByRole("option")

            // de-select
            expect(options[0]).toHaveValue("")

            // idlers first
            expect(options[1]).toHaveValue("Kate")
            expect(options[1]).toHaveClass("idle")

            // then sorted by name
            expect(options[2]).toHaveValue("Jane")
            expect(options[3]).toHaveValue("John")
        })

        // 0 - 1 (second player won during setup)
        await checkScore(0, 1)
        await checkButtons({ "delete game": true, "winner": true, "add game": true })

        // switcher should also have winner's name on it (Jane, second player)
        const winnerSwitcher = screen.getByLabelText("Jane", { exact: false })
        expect(winnerSwitcher).toBeInTheDocument()

        // order of players' names in game should not be relevant
        names.reverse()
        setStore({ players, games: [createGame({ round, index: 0, players: names })] })
        rerender({ series })

        const sameSelects = screen.getAllByRole("combobox", selectorSearchArgs)
        participants.forEach(p => expect(sameSelects[p.pIndex]).toHaveValue(p.name))
    })

    it("selects and de-selects players temporarily", async () => {

        const { selectorSearchArgs } = setup()
        const selects = screen.getAllByRole("combobox", selectorSearchArgs)


        // let's place Kate instead of John in this series
        await fireEvent.change(selects[0], { target: { value: "Kate" } })
        expect(selects[0].value).toBe("Kate")

        // game should disappear since there is no game with Kate and Jane
        const missingGame = screen.queryByRole("listitem", { name: /game/i })
        expect(missingGame).not.toBeInTheDocument()

        // but add game button still present
        const addGameButton = screen.getByRole("button", { name: /add game/i })
        expect(addGameButton).toBeInTheDocument()

        // score set to 0-0
        await checkScore(0, 0)

        // select options should update
        selects.forEach(el => {
            const options = within(el).getAllByRole("option")

            // de-select
            expect(options[0]).toHaveValue("")
            expect(options[0]).toHaveClass("idle")

            // John is now idle and moved up
            expect(options[1]).toHaveValue("John")
            expect(options[1]).toHaveClass("idle")

            // Kate is no longe idle
            expect(options[3]).toHaveValue("Kate")
            expect(options[3]).not.toHaveClass("idle")
        })

        // save and discard buttons should replace the Close one
        await checkButtons(true)

        // but store should be unaffected
        const store = get(tourneyStore)
        expect(store.players.find(p => p.name === "Kate").sIndex === null)
        expect(store.players.find(p => p.name === "John").sIndex === 0)

        // select John back and check that nothing has changed
        await fireEvent.change(selects[0], { target: { value: "John" } })
        await screen.findByRole("listitem", { name: /game/i })
        await checkButtons(false)

        // swap John and Jane - game should be still present
        await fireEvent.change(selects[0], { target: { value: "Jane" } })
        expect(selects[0].value).toBe("Jane")
        expect(selects[1].value).toBe("John")
        await screen.findByRole("listitem", { name: /game/i })

        // but buttons should reflect that changes have been made
        await checkButtons(true)

        // de-select both
        await fireEvent.change(selects[0], { target: { value: "" } })
        await fireEvent.change(selects[1], { target: { value: "" } })
        await checkButtons(true)
    })

    it("updates game list temporarily", async () => {

        setup()

        const addGame = screen.queryByRole("button", { name: /add game/i })
        await expectNGames(1)

        await fireEvent.click(addGame)
        await expectNGames(2)
        await checkButtons(true)

        await fireEvent.click(addGame)
        await fireEvent.click(addGame)
        await fireEvent.click(addGame)
        await fireEvent.click(addGame)
        const games = await expectNGames(6)


        const switcherClick = game => {
            const switcher = within(game).getByRole("button", { name: /switcher/i })
            return fireEvent.click(switcher)
        }

        // odd clicks - first player is the winner, even - second
        // second player won first game during setup
        // first player won 2nd, 3rd and 4th games
        await switcherClick(games[1])
        await switcherClick(games[2])
        await switcherClick(games[2])   // woops! accidentially clicked it twice
        await switcherClick(games[2])   // let's fix this
        await switcherClick(games[3])

        // second player won 5th
        await switcherClick(games[4])
        await switcherClick(games[4])

        // 6th is still on, let's check the score for now
        await checkScore(3, 2)

        // according to the store, nothing is going on
        const store = get(tourneyStore)
        const janeAndJohnGames = store.gameMap.get("Jane").get("John").get(0).games
        expect(janeAndJohnGames.length).toBe(1)
        expect(janeAndJohnGames[0].winner).toBe(1)

        // well, if it says so...
        for (let i = 1; i < games.length; i++) {
            const deleteButton = within(games[i]).getByRole("button", { name: /delete game/i })
            await fireEvent.click(deleteButton)
        }

        // as if nothing happened
        await checkButtons(false)

        // let's at least replace first game
        await fireEvent.click(within(games[0]).getByRole("button", { name: /delete game/i }))
        await fireEvent.click(addGame)
        await checkButtons(true)
    })

    it("saves or discards changes when called", async () => {

        const { selectorSearchArgs, component } = setup()
        const selects = screen.getAllByRole("combobox", selectorSearchArgs)
        const addGameButton = screen.getByRole("button", { name: /add game/i })


        // change player, add game
        await fireEvent.change(selects[0], { target: { value: "Kate" } })
        expect(selects[0].value).toBe("Kate")
        await expectNGames(0)
        await fireEvent.click(addGameButton)
        await fireEvent.click(addGameButton)
        await expectNGames(2)
        await checkButtons(true)

        // discard
        const discardButton = screen.getByRole("button", { name: /discard/i })
        await fireEvent.click(discardButton)
        await expectNGames(1)
        expect(selects[0].value).toBe("John")
        await checkButtons(false)

        // change again
        const winnerSwitcher = screen.getByRole("button", { name: /switcher/i })
        await checkScore(0, 1)
        await fireEvent.click(winnerSwitcher)
        await checkScore(1, 0)
        await checkButtons(true)

        // save and close
        const updateSpy = vi.spyOn(tourneyStore, "update")
        const closeEditorSpy = vi.fn()
        component.$on("toggleEditor", closeEditorSpy)
        const saveButton = screen.getByRole("button", { name: /save/i })
        await fireEvent.click(saveButton)
        expect(updateSpy).toHaveBeenCalledTimes(1)
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)
    })

    it("tries to close on click outside", async () => {

        const { component } = setup()
        const closeEditorSpy = vi.fn()

        // success
        component.$on("toggleEditor", closeEditorSpy)
        window.document.body.dispatchEvent(new Event('click'))
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)

        // changes prevent window from closing
        const winnerSwitcher = screen.getByRole("button", { name: /switcher/i })
        await fireEvent.click(winnerSwitcher)
        await checkButtons(true)
        window.document.body.dispatchEvent(new Event('click'))
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)  // still 1
    })
})