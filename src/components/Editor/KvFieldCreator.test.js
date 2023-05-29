import { render, screen } from '@testing-library/svelte';
import userEvent from "@testing-library/user-event"
import TesterAssistant from "./testAssistants/TaKvFieldCreator.svelte"


it("works", async () => {

    let kvMap = [["uniqueField1", ""]]
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

    const reportMap = map => (kvMap = map)
    const listSeeker = el => el.closest(".game-card").querySelector("dl")
    render(TesterAssistant, { kvMap, options, listSeeker, reportMap })

    const user = userEvent.setup()


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

it("handles new datetime field", async () => {

    const pattern = /\d{4}-(\d{2})-(\d{2})T(\d{2}:\d{2})/

    let kvMap = []
    const options = {
        date1: {
            fields: [{ type: "datetime" }]
        },
        date2: {
            fields: [{
                type: "datetime",
                initialDate: "1234-01-23",
            }]
        },
        date3: {
            fields: [{
                type: "datetime",
                initialTime: "09:10"
            }]
        },
        date4: {
            fields: [{
                type: "datetime",
                initialDate: "1234-01-23",
                initialTime: "09:10"
            }]
        }
    }
    const reportMap = map => (kvMap = map)
    const listSeeker = el => el.closest(".game-card").querySelector("dl")
    render(TesterAssistant, { kvMap, options, listSeeker, reportMap })

    const user = userEvent.setup()

    const creator = screen.getByRole("combobox")
    await user.selectOptions(creator, "date1")
    await user.selectOptions(creator, "date2")
    await user.selectOptions(creator, "date3")
    await user.selectOptions(creator, "date4")

    expect(kvMap).toHaveLength(4)
    expect(kvMap[0][1]).toMatch(pattern)

    expect(kvMap[1][1]).toMatch(pattern)
    expect(kvMap[1][1].startsWith("1234-01-23T")).toBeTruthy()

    expect(kvMap[2][1]).toMatch(pattern)
    expect(kvMap[2][1].endsWith("T09:10")).toBeTruthy()

    expect(kvMap[3][1]).toBe("1234-01-23T09:10")
})