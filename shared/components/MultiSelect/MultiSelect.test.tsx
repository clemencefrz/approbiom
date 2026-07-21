import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import MultiSelect from './MultiSelect'
import type { MultiSelectItem } from './MultiSelect.types'

const items: readonly MultiSelectItem<string>[] = [
    {
        id: 'alsace',
        label: 'Alsace',
        options: [
            { value: '67', label: 'Bas-Rhin' },
            { value: '68', label: 'Haut-Rhin' },
        ],
    },
    {
        id: 'champagne-ardenne',
        label: 'Champagne-Ardenne',
        options: [{ value: '08', label: 'Ardennes' }],
    },
    { value: '88', label: 'Vosges' },
]

afterEach(() => {
    cleanup()
})

function ControlledMultiSelect({
    initialSelection = [],
}: {
    initialSelection?: string[]
}) {
    const [selected, setSelected] = useState(initialSelection)

    return (
        <MultiSelect
            label="Départements"
            legend="Départements du Grand Est"
            showSelectAll
            options={items}
            selectedValues={selected}
            onSelectionChange={setSelected}
        />
    )
}

const getTrigger = () => screen.getByRole('button', { name: /Départements/ })

const getCheckbox = (name: string) =>
    screen.getByRole<HTMLInputElement>('checkbox', { name })

const open = () => fireEvent.click(getTrigger())

describe('MultiSelect', () => {
    it('opens the options panel when the trigger is clicked', () => {
        render(<ControlledMultiSelect />)

        // The panel is `hidden`, so it is out of the accessibility tree and out
        // of the tab order — role queries ignore it, which is the assertion.
        expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
        expect(getTrigger().getAttribute('aria-expanded')).toBe('false')

        open()

        expect(screen.getAllByRole('checkbox')).toHaveLength(6)
        expect(getTrigger().getAttribute('aria-expanded')).toBe('true')
    })

    it('selects an ungrouped option when its checkbox is clicked', () => {
        render(<ControlledMultiSelect />)
        open()

        fireEvent.click(getCheckbox('Vosges'))

        expect(getCheckbox('Vosges').checked).toBe(true)
        expect(getCheckbox('Bas-Rhin').checked).toBe(false)
    })

    it('deselects a selected option when its checkbox is clicked again', () => {
        render(<ControlledMultiSelect initialSelection={['88']} />)
        open()

        expect(getCheckbox('Vosges').checked).toBe(true)

        fireEvent.click(getCheckbox('Vosges'))

        expect(getCheckbox('Vosges').checked).toBe(false)
    })

    it('renders option groups with their labels', () => {
        render(<ControlledMultiSelect />)
        open()

        expect(getCheckbox('Alsace')).toBeDefined()
        expect(getCheckbox('Champagne-Ardenne')).toBeDefined()

        const nested = getCheckbox('Bas-Rhin').closest(
            '.shared-multi-select__group-options'
        )
        expect(nested).not.toBeNull()
        // The group's own checkbox stays outside the block it controls.
        expect(nested?.contains(getCheckbox('Alsace'))).toBe(false)
    })

    it('selects all options when the select-all button is clicked', () => {
        render(<ControlledMultiSelect />)
        open()

        fireEvent.click(
            screen.getByRole('button', { name: 'Tout sélectionner' })
        )

        for (const checkbox of screen.getAllByRole<HTMLInputElement>(
            'checkbox'
        )) {
            expect(checkbox.checked).toBe(true)
        }
    })

    it('deselects all options when the deselect-all button is clicked', () => {
        render(
            <ControlledMultiSelect
                initialSelection={['67', '68', '08', '88']}
            />
        )
        open()

        fireEvent.click(
            screen.getByRole('button', { name: 'Tout désélectionner' })
        )

        for (const checkbox of screen.getAllByRole<HTMLInputElement>(
            'checkbox'
        )) {
            expect(checkbox.checked).toBe(false)
        }
    })

    it('selects all options in a group when the group checkbox is clicked', () => {
        render(<ControlledMultiSelect />)
        open()

        fireEvent.click(getCheckbox('Alsace'))

        expect(getCheckbox('Bas-Rhin').checked).toBe(true)
        expect(getCheckbox('Haut-Rhin').checked).toBe(true)

        expect(getCheckbox('Ardennes').checked).toBe(false)
        expect(getCheckbox('Vosges').checked).toBe(false)
    })

    it('shows the correct global selection state when only some options are selected', () => {
        render(<ControlledMultiSelect initialSelection={['67']} />)
        open()

        const alsace = getCheckbox('Alsace')
        expect(alsace.checked).toBe(false)
        expect(alsace.indeterminate).toBe(true)

        expect(getCheckbox('Champagne-Ardenne').indeterminate).toBe(false)

        expect(
            screen.getByRole('button', { name: 'Tout sélectionner' })
        ).toBeDefined()
    })
})
