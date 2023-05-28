import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import TesterAssistant from "./testAssistants/TaKvFieldCreator.svelte"

it("works", async () => {

    let kvMap = [["uniqueField1", ""]]
    const reportMap = map => (kvMap = map)
    const user = userEvent.setup()
    const options = {
        singleField: {
            fields: [{ type: "text" }]
        },
        dualField: {
            fields: [{ type: "text" }, { type: "text" }]
        },
        uniqueField1: {
            fields: [{ type: "text" }],
            unique: true
        },
        uniqueField2: {
            fields: [{ type: "text" }],
            unique: true
        }
    }
    const listSeeker = el => el.closest(".game-card").querySelector("dl")


    render(TesterAssistant, { kvMap, options, listSeeker, reportMap })

    // no uniqueField1 since it's already in kvMap
    const selOpts1 = screen.getAllByRole("option")
    expect(selOpts1.map(el => el.value)).toEqual([
        "singleField",
        "dualField",
        "uniqueField2"
    ])

    const creator = screen.getByRole("combobox")
    await user.selectOptions(creator, "uniqueField2")

    // new field should be focused
    const textFields = document.querySelectorAll(".game-card [contenteditable]")
    const newField = textFields[1]
    expect(newField).toHaveFocus()

    // uniqueField2 should be removed from list of options
    const selOpts2 = screen.getAllByRole("option")
    expect(selOpts2.map(el => el.value)).toEqual([
        "singleField",
        "dualField",
    ])

    // selected value should remain ""
    expect(creator).toHaveValue("")

    await user.selectOptions(creator, "singleField")
    await user.selectOptions(creator, "dualField")
    await user.selectOptions(creator, "dualField")
    expect(kvMap).toEqual([
        ["uniqueField1", ""],
        ["uniqueField2", ""],
        ["singleField", ""],
        ["dualField", "", ""],
        ["dualField", "", ""],
    ])
})