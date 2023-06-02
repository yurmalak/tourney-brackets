import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import GameEditorAssistant from "./testAssistants/TaGameEditor.svelte"


const slots = {
    dataMapper: "dmapper",
    kvCreator: "kveator",
    deleteButton: "debutton"
}

it("renders provided slots", () => {

    render(GameEditorAssistant, { ...slots, players: [], winner: "" })
    for (const key in slots) {
        expect(screen.getByText(slots[key])).toBeInTheDocument()
    }
})

it("changes winner on switcher click", async () => {

    const user = userEvent.setup()
    render(GameEditorAssistant, { ...slots, players: ["playerA", "playerB"], winner: undefined })

    const switcher = screen.getByRole("button", { name: /winner/i })

    expect(/winner.+none/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()
    await user.click(switcher)
    expect(/winner.+playerA/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()
    await user.click(switcher)
    expect(/winner.+playerB/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()

    // back to playerA, not none
    await user.click(switcher)
    expect(/winner.+playerA/i.test(switcher.getAttribute("aria-description"))).toBeTruthy()
})