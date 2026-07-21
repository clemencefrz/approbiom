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
})
