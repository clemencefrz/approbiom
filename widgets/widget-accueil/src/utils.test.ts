import { describe, expect, it } from 'vitest'
import type { PlanRow } from './Accueil.types'
import { getFilteredRows } from './utils'

// An object rather than a growing list of positional arguments: only the fields
// a test is about are worth spelling out, and the rest never varies.
function planWith(row: Partial<PlanRow>): PlanRow {
    return {
        id: 1,
        nom: 'Plan',
        statut: 'projet',
        departementDeSituation: 'Poitiers (86)',
        appelAProjet: 'CRA NA (2024)',
        avisCrb: 'favorable',
        type: 'création',
        usage: 'énergie',
        miseEnServiceProjet: 2025,
        natureDonnee: 'prévision',
        ...row,
    }
}

// Two of the three share a statut and a lieu, so filtering on either has
// something to keep and something to drop. The third carries no appel à projet:
// that empty string is a value the filter has to be able to select.
const rcu = planWith({
    id: 1,
    nom: 'RCU Grand Poitiers 1 Biard',
    statut: 'projet',
    departementDeSituation: 'Poitiers (86)',
    appelAProjet: 'CRA NA (2024)',
    avisCrb: 'favorable',
})
const biosyl = planWith({
    id: 2,
    nom: 'Biosyl Limousin C',
    statut: 'abandonné',
    departementDeSituation: 'Guéret (23)',
    appelAProjet: 'GRANULE (2023)',
    avisCrb: 'défavorable',
})
const orpinia = planWith({
    id: 5,
    nom: 'ORPINIA phase 1',
    statut: 'projet',
    departementDeSituation: 'Poitiers (86)',
    appelAProjet: '',
    avisCrb: 'en attente',
})

const plans: readonly PlanRow[] = [rcu, biosyl, orpinia]

describe('getFilteredRows', () => {
    describe('on nom', () => {
        it('keeps the rows whose name contains the query', () => {
            expect(getFilteredRows(plans, { nom: 'Biosyl' })).toEqual([biosyl])
        })

        it('matches anywhere in the name, not only at its start', () => {
            expect(getFilteredRows(plans, { nom: 'Poitiers' })).toEqual([rcu])
        })

        it('ignores case on the query', () => {
            expect(getFilteredRows(plans, { nom: 'rcu' })).toEqual([rcu])
        })

        it('ignores case on the name', () => {
            expect(getFilteredRows(plans, { nom: 'Phase' })).toEqual([orpinia])
        })

        it('ignores the spaces around the query', () => {
            expect(getFilteredRows(plans, { nom: '  Biosyl  ' })).toEqual([
                biosyl,
            ])
        })

        it('returns nothing when no name matches', () => {
            expect(getFilteredRows(plans, { nom: 'Chaufferie' })).toEqual([])
        })

        it('keeps the rows in the order they were given', () => {
            // '1' is in the first and the last name, not in the middle one, so
            // a result that came back reordered would show up here.
            expect(getFilteredRows(plans, { nom: '1' })).toEqual([rcu, orpinia])
        })
    })

    describe('on statuts', () => {
        it('keeps the rows carrying the selected statut', () => {
            expect(getFilteredRows(plans, { statuts: ['abandonné'] })).toEqual([
                biosyl,
            ])
        })

        it('keeps the rows carrying any of several statuts, in order', () => {
            expect(
                getFilteredRows(plans, { statuts: ['abandonné', 'projet'] })
            ).toEqual([rcu, biosyl, orpinia])
        })

        it('returns nothing when no row carries the selected statut', () => {
            expect(getFilteredRows(plans, { statuts: ['obsolète'] })).toEqual(
                []
            )
        })
    })

    describe('on appelsAProjet', () => {
        it('keeps the rows attached to the selected call', () => {
            expect(
                getFilteredRows(plans, { appelsAProjet: ['GRANULE (2023)'] })
            ).toEqual([biosyl])
        })

        it('keeps the rows attached to any of several calls, in order', () => {
            expect(
                getFilteredRows(plans, {
                    appelsAProjet: ['GRANULE (2023)', 'CRA NA (2024)'],
                })
            ).toEqual([rcu, biosyl])
        })

        it('selects the rows attached to no call at all', () => {
            // « Aucun » is the empty string, a value like any other here — which
            // only works because an empty *selection* is what means "no filter".
            expect(getFilteredRows(plans, { appelsAProjet: [''] })).toEqual([
                orpinia,
            ])
        })
    })

    describe('on lieux', () => {
        it('keeps the rows situated in the selected commune', () => {
            expect(getFilteredRows(plans, { lieux: ['Guéret (23)'] })).toEqual([
                biosyl,
            ])
        })

        it('keeps the rows of several communes, in order', () => {
            // What selecting a whole département amounts to: the group's
            // checkbox hands over every commune it holds.
            expect(
                getFilteredRows(plans, {
                    lieux: ['Poitiers (86)', 'Guéret (23)'],
                })
            ).toEqual([rcu, biosyl, orpinia])
        })

        it('returns nothing when no row is situated there', () => {
            expect(getFilteredRows(plans, { lieux: ['Lacq (64)'] })).toEqual([])
        })
    })

    describe('on avis', () => {
        it('keeps the rows carrying the selected avis', () => {
            expect(getFilteredRows(plans, { avis: ['en attente'] })).toEqual([
                orpinia,
            ])
        })

        it('keeps the rows carrying any of several avis, in order', () => {
            expect(
                getFilteredRows(plans, { avis: ['en attente', 'favorable'] })
            ).toEqual([rcu, orpinia])
        })

        it('returns nothing when no row carries the selected avis', () => {
            expect(
                getFilteredRows(plans, { avis: ['favorable avec réserve'] })
            ).toEqual([])
        })
    })

    describe('with nothing to filter on', () => {
        it('returns every row when no criterion is given', () => {
            expect(getFilteredRows(plans)).toEqual(plans)
        })

        it('returns every row when the search is cleared', () => {
            expect(getFilteredRows(plans, { nom: '' })).toEqual(plans)
        })

        it('returns every row when no statut is selected', () => {
            expect(getFilteredRows(plans, { statuts: [] })).toEqual(plans)
        })

        it('returns every row once every criterion is cleared', () => {
            // What the reset button leaves behind.
            expect(
                getFilteredRows(plans, {
                    nom: '',
                    statuts: [],
                    lieux: [],
                    appelsAProjet: [],
                    avis: [],
                })
            ).toEqual(plans)
        })
    })

    describe('with several criteria', () => {
        it('keeps only the rows matching all of them', () => {
            // 'i' is in all three names; the statut is what narrows it down.
            expect(
                getFilteredRows(plans, { nom: 'i', statuts: ['projet'] })
            ).toEqual([rcu, orpinia])
        })

        it('returns nothing when no row matches both', () => {
            expect(
                getFilteredRows(plans, {
                    nom: 'Biosyl',
                    statuts: ['projet'],
                })
            ).toEqual([])
        })
    })

    it('hands back the very rows it was given', () => {
        expect(getFilteredRows(plans, { nom: 'rcu' })[0]).toBe(rcu)
    })

    it('leaves the rows it was given untouched', () => {
        const rows = [rcu, biosyl, orpinia]

        getFilteredRows(rows, { nom: 'rcu', statuts: ['projet'] })

        expect(rows).toEqual([rcu, biosyl, orpinia])
    })
})
