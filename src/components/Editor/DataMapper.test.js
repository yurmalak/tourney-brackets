import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import DataMapper from "./DataMapper.svelte"



function setup(config = {}) {

    render(DataMapper, { players: [], ...config })
    return { user: userEvent.setup() }
}


it("renders with empty map and no options", () => {
    const ariaLabel = "some label"
    setup({ kvMap: [], options: {}, ariaLabel })
    expect(screen.getByLabelText(ariaLabel)).toBeInTheDocument()
})

it("handles 'text' type field", async () => {

    const kvMap = [["location", "north"]]
    const options = { location: { fields: [{ type: "text" }] } }
    const { user } = setup({ kvMap, options })

    // it's contenteditable so can't get it by role
    const textField = screen.getByText("north")
    await user.type(textField, "-east")
    expect(kvMap[0][1]).toBe("north-east")
    expect(textField).toHaveTextContent("north-east")
})

it("handles 'url' type field", async () => {

    const kvMap = [["pages", "", "com.google/blah/blah/blah"]]
    const options = {
        pages: {
            fields: [
                { type: "url" },
                { type: "url", allowed: ["google.com", "somesite.org/some/path/"] }
            ]
        }
    }
    const { user } = setup({ kvMap, options })
    const [f1, f2] = screen.getAllByRole("textbox")

    const text = "anythingreally"
    await user.type(f1, text)
    expect(kvMap[0][1]).toBe(text)
    expect(f1).toHaveValue(text)
    expect(f1).not.toHaveClass("invalid")

    // it has wrong adress initially
    expect(f2).toHaveClass("invalid")
    await user.clear(f2)
    expect(f2).not.toHaveClass("invalid")
    await user.type(f2, "google.com/a/b/c")
    expect(f2).not.toHaveClass("invalid")
    await user.type(f2, " ")
    expect(f2).toHaveClass("invalid")
    await user.clear(f2)
    await user.type(f2, "somesite.org/some/path/post123")
    expect(f2).not.toHaveClass("invalid")

    expect(kvMap[0]).toEqual(["pages", text, "somesite.org/some/path/post123"])
})

it("handles 'playerSelect' type field", async () => {

    const players = ["Annick", "Bennick"]
    const kvMap = [["first goal", "Annick"]]
    const options = { "first goal": { fields: [{ type: "playerSelect" }] } }
    const { user } = setup({ kvMap, options, players })

    const selOpts = screen.getAllByRole("option")
    expect(selOpts[0]).toHaveValue("")
    expect(selOpts[1]).toHaveValue("Annick")
    expect(selOpts[2]).toHaveValue("Bennick")

    const selector = screen.getByRole("combobox")
    expect(selector).toHaveValue("Annick")
    await user.selectOptions(selector, "Bennick")
    expect(selector).toHaveValue("Bennick")
    expect(kvMap).toEqual([["first goal", "Bennick"]])
    await user.selectOptions(selector, "")
    expect(selector).toHaveValue("")
    expect(kvMap).toEqual([["first goal", ""]])
})

// couldn't find way to change its value with testing-library
// leave it to e2e perhaps?
// it("handles 'datetime' type field", async () => {})