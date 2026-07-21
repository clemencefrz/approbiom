import {
    cleanup,
    fireEvent,
    render,
    screen,
    within,
} from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import DataTable from './DataTable'

type Plan = {
    nom: string
    statut: string
}

const plans: Plan[] = [
    { nom: 'Plan Nord', statut: 'En cours' },
    { nom: 'Plan Sud', statut: 'Terminé' },
]

const columns = [
    { id: 'nom', header: 'Nom', render: (plan: Plan) => plan.nom },
    { id: 'statut', header: 'Statut', render: (plan: Plan) => plan.statut },
]

afterEach(() => {
    cleanup()
})

describe('DataTable', () => {
    it('renders the table caption', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
            />
        )

        // Queried by accessible name rather than by text: the caption is what
        // names the table for a screen reader, and this fails if it stops
        // being a `<caption>`.
        expect(
            screen.getByRole('table', { name: 'Plans d’approvisionnement' })
        ).toBeDefined()
    })

    it('renders all column headers', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
            />
        )

        const headers = screen.getAllByRole('columnheader')

        expect(headers.map((header) => header.textContent)).toEqual([
            'Nom',
            'Statut',
        ])
    })

    // The first row is the header row, so the data rows start at index 1.
    const getDataRow = (index: number) => screen.getAllByRole('row')[index + 1]

    const rowAction = {
        columnId: 'nom',
        label: (plan: Plan) => `Ouvrir le plan ${plan.nom}`,
        onActivate: () => {},
    }

    it('activates the row through a button carrying an accessible name', () => {
        const onActivate = vi.fn()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                rowAction={{ ...rowAction, onActivate }}
            />
        )

        // Queried as a button by its accessible name: this is the whole point
        // of the DSFR pattern — the row is operable through a real control,
        // announced as such, not through a focusable <tr> with no role.
        // Enter and Space then come from the browser, so there is nothing of
        // ours left to test for them.
        fireEvent.click(
            screen.getByRole('button', { name: 'Ouvrir le plan Plan Sud' })
        )

        expect(onActivate).toHaveBeenCalledTimes(1)
        expect(onActivate).toHaveBeenCalledWith(plans[1])
    })

    it('puts the button in the column named by the action', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                rowAction={rowAction}
            />
        )

        const [nom, statut] = within(getDataRow(0)).getAllByRole('cell')

        // The button wraps the cell content rather than replacing it, so the
        // column still reads as its own value.
        expect(within(nom).getByRole('button').textContent).toBe('Plan Nord')
        expect(within(statut).queryByRole('button')).toBeNull()
    })

    it('renders no interactive element when no rowAction is given', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
            />
        )

        const row = getDataRow(0)

        expect(screen.queryAllByRole('button')).toHaveLength(0)
        expect(row.className).toBe('')
        // Nothing focusable: a read-only table adds no tab stops.
        expect(row.getAttribute('tabindex')).toBeNull()
    })

    it('leaves a nested interactive element to handle its own activation', () => {
        const onActivate = vi.fn()
        const onModifier = vi.fn()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={[
                    ...columns,
                    {
                        id: 'actions',
                        header: 'Actions',
                        render: () => (
                            <button onClick={onModifier}>Modifier</button>
                        ),
                    },
                ]}
                rowAction={{ ...rowAction, onActivate }}
            />
        )

        fireEvent.click(screen.getAllByRole('button', { name: 'Modifier' })[0])

        // There is no row-level handler to fire: the action lives on its own
        // button, so a click elsewhere in the row cannot reach it. In a browser
        // the two are also physically separated — DataTable.css lifts nested
        // controls above the enlarged click zone.
        expect(onModifier).toHaveBeenCalledTimes(1)
        expect(onActivate).not.toHaveBeenCalled()
    })

    const selectionLabel = (plan: Plan) => `Sélectionner ${plan.nom}`

    const getCheckbox = (name: string) => screen.getByRole('checkbox', { name })

    it('does not render selection checkboxes when selection is disabled', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
            />
        )

        expect(screen.queryAllByRole('checkbox')).toHaveLength(0)
        // No extra column either: the table keeps the shape it had.
        expect(screen.getAllByRole('columnheader')).toHaveLength(2)
    })

    it('renders one checkbox per row and a select-all checkbox', () => {
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                selectedRows={[]}
                selectionLabel={selectionLabel}
                onSelectionChange={vi.fn()}
            />
        )

        // Queried by accessible name: each checkbox has to say which row it
        // selects, since DSFR hides that text visually in a fixed cell.
        expect(screen.getAllByRole('checkbox')).toHaveLength(plans.length + 1)
        expect(getCheckbox('Tout sélectionner')).toBeDefined()
        expect(getCheckbox('Sélectionner Plan Nord')).toBeDefined()
        expect(getCheckbox('Sélectionner Plan Sud')).toBeDefined()
    })

    it('adds a row to the selection when its checkbox is checked', () => {
        // Typed so that reading back the reported selection stays type-safe.
        const onSelectionChange = vi.fn<(rows: Plan[]) => void>()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                selectedRows={[]}
                selectionLabel={selectionLabel}
                onSelectionChange={onSelectionChange}
            />
        )

        fireEvent.click(getCheckbox('Sélectionner Plan Nord'))

        expect(onSelectionChange).toHaveBeenCalledTimes(1)
        // The very object from `rows`, not a copy of it.
        expect(onSelectionChange.mock.calls[0][0][0]).toBe(plans[0])
    })

    it('removes a row from the selection when its checkbox is unchecked', () => {
        const onSelectionChange = vi.fn()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                selectedRows={plans}
                selectionLabel={selectionLabel}
                onSelectionChange={onSelectionChange}
            />
        )

        fireEvent.click(getCheckbox('Sélectionner Plan Nord'))

        expect(onSelectionChange).toHaveBeenCalledTimes(1)
        expect(onSelectionChange).toHaveBeenCalledWith([plans[1]])
    })

    it('selects all rows from the header checkbox', () => {
        const onSelectionChange = vi.fn()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                selectedRows={[]}
                selectionLabel={selectionLabel}
                onSelectionChange={onSelectionChange}
            />
        )

        fireEvent.click(getCheckbox('Tout sélectionner'))

        expect(onSelectionChange).toHaveBeenCalledWith(plans)
    })

    it('clears all rows from the header checkbox', () => {
        const onSelectionChange = vi.fn()
        render(
            <DataTable
                caption="Plans d’approvisionnement"
                rows={plans}
                columns={columns}
                // Everything selected, so the header checkbox is checked and
                // clicking it clears instead of selecting.
                selectedRows={plans}
                selectionLabel={selectionLabel}
                onSelectionChange={onSelectionChange}
            />
        )

        fireEvent.click(getCheckbox('Tout sélectionner'))

        expect(onSelectionChange).toHaveBeenCalledWith([])
    })
})
