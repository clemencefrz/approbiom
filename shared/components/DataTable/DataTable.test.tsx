import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
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
})
