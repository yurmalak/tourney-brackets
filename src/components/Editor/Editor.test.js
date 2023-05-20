import { render, screen, within } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import { get } from 'svelte/store';
import { afterEach, vi } from "vitest"

import { setStore } from '../../../tests/testUtils';
import { createGame, createSeries } from '$lib/utils';
import { tourneyStore } from '../../stores';
import Editor from './EditorTestAssistant.svelte';



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
        game.winner = 1
        game.kvMap = [
            ["game-kv-single-key", "game-kv-single-value"],
            ["game-kv-dual-key", "game-kv-dual-value-1", "game-kv-dual-value-2"],
        ]

        series.games = [game]
        series.players = participants
        const kvMap = [
            ["series-kv-single-key", "series-kv-single-value"],
            ["series-kv-dual-key", "series-kv-dual-value-1", "series-kv-dual-value-2"]
        ]
        const kvMaps = [{ round, sIndex: 0, players: names, kvMap }]

        setStore({ players, games: series.games, kvMaps })
        const { rerender, component } = render(Editor, { series })

        const maps = {
            g1: game.kvMap[0],
            g2: game.kvMap[1],
            s1: kvMap[0],
            s2: kvMap[1]
        }

        const selectorSearchArgs = { value: new RegExp(names.join("|")), name: /Player [12]/ }
        return { players, participants, names, series, game, round, selectorSearchArgs, rerender, component, kvMaps: maps }
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

    /**
     * Checks score by both label and visible part. 
     * @param {number} a
     * @param {number} b
     */
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
            const game = screen.queryByRole("listitem", { name: /^game/i })
            expect(game).toBe(null)
            return null
        }
        else {
            const games = await screen.findAllByRole("listitem", { name: /^game/i })
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
        const winnerSwitcher = screen.getByLabelText(/current.+player.+2/i)
        expect(winnerSwitcher).toBeInTheDocument()

        // order of players' names in game should not be relevant
        names.reverse()
        setStore({ players, games: [createGame({ round, index: 0, players: names })] })
        rerender({ series })

        const sameSelects = screen.getAllByRole("combobox", selectorSearchArgs)
        participants.forEach(p => expect(sameSelects[p.pIndex]).toHaveValue(p.name))
    })

    it("selects and de-selects players", async () => {

        const user = userEvent.setup()
        const { selectorSearchArgs } = setup()
        const selects = screen.getAllByRole("combobox", selectorSearchArgs)


        // let's place Kate instead of John in this series
        await user.selectOptions(selects[0], "Kate")
        expect(selects[0].value).toBe("Kate")

        // game should disappear since there is no game with Kate and Jane
        await expectNGames(0)

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
        await user.selectOptions(selects[0], "John")
        await expectNGames(1)
        await checkButtons(false)

        // swap John and Jane - game should be still present
        await user.selectOptions(selects[0], "Jane")
        expect(selects[0].value).toBe("Jane")
        expect(selects[1].value).toBe("John")
        await expectNGames(1)

        // but buttons should reflect that changes have been made
        await checkButtons(true)

        // de-select both
        await user.selectOptions(selects[0], "")
        await user.selectOptions(selects[1], "")
        await checkButtons(true)
    })

    it("updates game list", async () => {

        const user = userEvent.setup()
        setup()

        const addGame = screen.queryByRole("button", { name: /add game/i })
        await expectNGames(1)

        await user.click(addGame)
        await expectNGames(2)
        await checkButtons(true)

        await user.click(addGame)
        await user.click(addGame)
        await user.click(addGame)
        await user.click(addGame)
        const games = await expectNGames(6)


        const switcherClick = game => {
            const switcher = within(game).getByRole("button", { name: /switcher/i })
            return user.click(switcher)
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
        const janeAndJohnGames = store.tree.get("Jane").get("John").get(0).games
        expect(janeAndJohnGames.length).toBe(1)
        expect(janeAndJohnGames[0].winner).toBe(1)

        // well, if it says so...
        for (let i = 1; i < games.length; i++) {

            const deleteButton = within(games[i]).getByRole("button", { name: /delete game/i })
            await user.click(deleteButton)

            // deletion requires confirmation
            expect(deleteButton.textContent).toBe("Confirm")
            await user.click(deleteButton)
        }

        // as if nothing happened
        await checkButtons(false)


        // let's at least replace first game
        const deleteButton = within(games[0]).getByRole("button", { name: /delete game/i })
        await user.click(deleteButton)
        await user.click(deleteButton)  // confirm
        await user.click(addGame)
        await checkButtons(true)
    })

    it("updates key-value maps", async () => {

        const { kvMaps } = setup()
        const user = userEvent.setup()

        // edit existing maps and check if they are recognized
        const texts = [
            kvMaps.s1[0],
            kvMaps.g2[2]
        ]

        // these are contenteditables so check for textContent instaed of value
        for (const str of texts) {
            const field = screen.getByText(str)
            await user.click(field)
            await user.type(field, "q")
            expect(field).toHaveTextContent(str + "q")

            // won't appear unless component "changed"
            await user.click(screen.getByRole("button", { name: /discard/i }))

            // won't appear unless changes have been discarded
            expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
        }

        // add new pairs to existing and new game
        await user.click(screen.getByRole("button", { name: /add game/i }))
        const games = screen.getAllByRole("listitem", { name: /^game/i })

        // deal with new game (just added so it's second) first since it's a change itself
        // so it won't allow to check if new pair triggers it
        await user.click(within(games[1]).getByRole("button", { name: /single/i }))     // new pair with single value
        const f1 = within(games[1]).getByRole("term")                                   // key 'input'
        await user.type(f1, "qwe")
        expect(f1).toHaveTextContent("qwe")
        await user.click(screen.getByRole("button", { name: /discard/i }))
        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()

        // now add new pair to game that already has map
        await user.click(within(games[0]).getByRole("button", { name: /dual/i }))   // new pair with 2 values
        const f0s = within(games[0]).getAllByRole("definition")                     // value 'input'
        expect(f0s).toHaveLength(5)                                                 // 3 from setup and 2 from new pair
        await user.type(f0s[4], "qwe")
        expect(f0s[4]).toHaveTextContent("qwe")
        await user.click(screen.getByRole("button", { name: /discard/i }))          // this time it's triggered by new pair
        expect(screen.getByRole("button", { name: /close/i })).toBeInTheDocument()
    })

    it("saves or discards changes when called", async () => {

        const user = userEvent.setup()
        const { selectorSearchArgs, component } = setup()
        const selects = screen.getAllByRole("combobox", selectorSearchArgs)
        const addGameButton = screen.getByRole("button", { name: /add game/i })


        // change player, add game
        await user.selectOptions(selects[0], "Kate")
        expect(selects[0].value).toBe("Kate")
        await expectNGames(0)
        await user.click(addGameButton)
        await user.click(addGameButton)
        await expectNGames(2)
        await checkButtons(true)

        // discard
        const discardButton = screen.getByRole("button", { name: /discard/i })
        await user.click(discardButton)
        await expectNGames(1)
        expect(selects[0].value).toBe("John")
        await checkButtons(false)

        // change everything that can be changed
        await user.selectOptions(selects[1], "Kate")                        // John + Kate: 0 games, 0 kv fields
        await user.click(screen.getByRole("button", { name: /add game/i })) // new game
        await user.click(screen.getByRole("button", { name: /switcher/i })) // that John wins

        // add kv fields
        const newKvButtons = [
            ...screen.getAllByRole("button", { name: /single/i }),          // + single and dual fields
            ...screen.getAllByRole("button", { name: /dual/i })             // for both game and series
        ]
        for (const button of newKvButtons) await user.click(button)

        // type data
        const keys = screen.getAllByRole("term")
        const values = screen.getAllByRole("definition")
        expect(keys).toHaveLength(4)
        expect(values).toHaveLength(6)
        await user.type(keys[0], "date")                        // game single key
        await user.type(values[0], "January, 1st")              // game single value
        await user.type(keys[1], "starting gold")               // game double key
        await user.type(values[1], "500")                       // game double value 1
        await user.type(values[2], "400")                       // game double value 2
        await user.type(keys[2], "type")                        // same with series
        await user.type(values[3], "bo3")
        await user.type(keys[3], "hat")
        await user.type(values[4], "cylinder")
        await user.type(values[5], "beanie")

        // save and close
        const closeEditorSpy = vi.fn()
        const updateSpy = vi.spyOn(tourneyStore, "update")
        component.$on("toggleEditor", closeEditorSpy)

        const saveButton = screen.getByRole("button", { name: /save/i })
        await user.click(saveButton)
        expect(updateSpy).toHaveBeenCalledTimes(1)
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)

        // check that it saved with correct data
        const args = updateSpy.mock.lastCall[0]
        expect(args.changed.players).toBe(true)
        expect(args.changed.gamesOrMap).toBe(true)
        expect(args.seriesData.games[0].winner).toBe(0)
        expect(args.seriesData.games[0].players).toEqual(["John", "Kate"])
        expect(args.seriesData.games[0].kvMap).toEqual([
            ["date", "January, 1st"],
            ["starting gold", "500", "400"]
        ])
        expect(args.seriesData.kvMap).toEqual([
            ["type", "bo3"],
            ["hat", "cylinder", "beanie"]
        ])
    })

    it("tries to close on click outside", async () => {

        const user = userEvent.setup()
        const { component } = setup()
        const closeEditorSpy = vi.fn()

        // success
        component.$on("toggleEditor", closeEditorSpy)
        window.document.body.dispatchEvent(new Event('click'))
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)

        // changes prevent window from closing
        const winnerSwitcher = screen.getByRole("button", { name: /switcher/i })
        await user.click(winnerSwitcher)
        await checkButtons(true)
        window.document.body.dispatchEvent(new Event('click'))
        expect(closeEditorSpy).toHaveBeenCalledTimes(1)  // still 1
    })
})