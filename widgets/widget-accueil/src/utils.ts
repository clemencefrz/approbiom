import type { AvisCrb, PlanRow, PlanStatut } from './Accueil.types'

export type PlanFilters = {
    nom?: string
    statuts?: readonly PlanStatut[]
    appelsAProjet?: readonly string[]
    lieux?: readonly string[]
    avis?: readonly AvisCrb[]
}

function matchesSelection<T>(selection: readonly T[], value: T): boolean {
    return selection.length === 0 || selection.includes(value)
}

export function getFilteredRows(
    rows: readonly PlanRow[],
    {
        nom = '',
        statuts = [],
        appelsAProjet = [],
        lieux = [],
        avis = [],
    }: PlanFilters = {}
): PlanRow[] {
    const query = nom.trim().toLowerCase()

    return rows.filter(
        (row) =>
            (query === '' || row.nom.toLowerCase().includes(query)) &&
            matchesSelection(statuts, row.statut) &&
            matchesSelection(appelsAProjet, row.appelAProjet) &&
            matchesSelection(lieux, row.departementDeSituation) &&
            matchesSelection(avis, row.avisCrb)
    )
}
