import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import PlayerSelector from "./PlayerSelector.svelte"
import { vi } from 'vitest';



it("works", async () => {

    const players = {
        busy: ["A1", "D2", "h5"],
        idle: ["qq"]
    }

    const user = userEvent.setup()
    const spy = vi.fn()
    const { component } = render(PlayerSelector, { players, player: "A1", playerIndex: 1 })
    component.$on("change", spy)

    const options = screen.getAllByRole("option")

    // empty should be first, idle players should follow
    expect(options[0]).toHaveValue("")
    expect(options[1]).toHaveValue("qq")
    expect(options[2]).toHaveValue("A1")


    const selector = screen.getByRole("combobox")
    expect(selector).toHaveValue("A1")
    await user.selectOptions(selector, "D2")

    const ev = spy.mock.lastCall[0]
    expect(ev.target.value).toBe("D2")
    expect(ev.target.dataset.playerIndex).toBe("1")
})

it("disabled if players are null", () => {

    render(PlayerSelector, { players: null, player: "A1", playerIndex: 1 })

    const selector = screen.getByRole("combobox")
    expect(selector).toHaveValue("A1")
    expect(selector).toBeDisabled()
})