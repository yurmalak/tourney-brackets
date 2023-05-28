import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import DeleteButtonAssistant from "./testAssistants/TaDeleteButton.svelte"
import { vi, beforeEach } from "vitest"

let user, button, spy
beforeEach(() => {
    const { component } = render(DeleteButtonAssistant, { normal: "Click me", clicked: "Again, please" })

    button = screen.getByRole("button")
    user = userEvent.setup()
    spy = vi.fn()

    component.$on("deleteGame", spy)
})

it("asks for confirmation first, invokes callback on second click", async () => {

    expect(button).toHaveAccessibleName("Click me")

    await user.click(button)
    expect(spy).toBeCalledTimes(0)
    expect(button).toHaveAccessibleName("Again, please")

    await user.click(button)
    expect(spy).toBeCalledTimes(1)
})

it("resets on click outside", async () => {

    expect(button).toHaveAccessibleName("Click me")
    await user.click(button)
    expect(button).toHaveAccessibleName("Again, please")
    await user.click(button.parentNode)
    expect(button).toHaveAccessibleName("Click me")

    // click again after clicking outside
    await user.click(button)
    expect(spy).toBeCalledTimes(0)
})