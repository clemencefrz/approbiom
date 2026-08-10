import './Concurrence.css'
import DataTable, { type Column } from '@shared/components/DataTable'
import MultiSelect, {
    type MultiSelectGroup,
} from '@shared/components/MultiSelect'
import { getOptions } from '@shared/utils/getOptions'
import type { PlanDApprovisionnement } from '@shared/domain/plan-d-approvisionnement'
import type { Ressource } from '@shared/domain/ressource'
import { useMemo, useState } from 'react'
import type { Commune } from '@shared/domain/commune'
import type { Departement } from '@shared/domain/departement'
import type { Region } from '@shared/domain/region'

type approvisionnementGroupedByPlanRessource = {
    plan_d_approvisionnement: PlanDApprovisionnement['nom']
    ressource: Ressource['description_courte']
    appel_a_projet: string
    departement_de_situation?: Commune['dep']
    sumTonnageTotal?: number
}

type Props = {
    approvisionnementGroupedByPlanRessource: approvisionnementGroupedByPlanRessource[]
    departementsByRegion: Record<Region['libelle'], Departement['dep'][]>
}
export default function Concurrence({
    approvisionnementGroupedByPlanRessource,
    departementsByRegion,
}: Props) {
    const [ressource, setRessource] = useState<string[]>([])
    const [appelAProjet, setAppelAProjet] = useState<string[]>([])
    const [departements, setDepartements] = useState<Departement['dep'][]>([])

    const ressourceOptions = getOptions(
        approvisionnementGroupedByPlanRessource,
        (item) => item.ressource
    )

    const appelAProjetOptions = getOptions(
        approvisionnementGroupedByPlanRessource,
        (item) => item.appel_a_projet
    )

    const departementOptions: readonly MultiSelectGroup<Departement['dep']>[] =
        Object.entries(departementsByRegion).map(([region, departements]) => ({
            id: region,
            label: region,
            options: departements.map((dep) => ({
                value: dep,
                label: dep,
            })),
        }))

    const filteredRows = useMemo(
        () =>
            approvisionnementGroupedByPlanRessource.filter(
                (item) =>
                    (ressource.length === 0 ||
                        ressource.includes(item.ressource)) &&
                    (appelAProjet.length === 0 ||
                        appelAProjet.includes(item.appel_a_projet))
            ),
        [approvisionnementGroupedByPlanRessource, ressource, appelAProjet]
    )

    const columns: readonly Column<approvisionnementGroupedByPlanRessource>[] =
        useMemo(
            () => [
                {
                    header: 'Plan d’approvisionnement',
                    id: 'plan_d_approvisionnement',
                    render: (item) => item.plan_d_approvisionnement,
                },
                {
                    header: 'Département de situation',
                    id: 'departement_de_situation',
                    render: (item) => item.departement_de_situation,
                },

                {
                    header: 'Tonnage total (en tonne de matière verte par an)',
                    id: 'tonnage_total',
                    render: (item) =>
                        !item.sumTonnageTotal || item.sumTonnageTotal === 0
                            ? 'N/A'
                            : item.sumTonnageTotal,
                },
            ],
            []
        )

    return (
        <div className="concurrence">
            <h1 className="fr-h3 concurrence__title">
                Concurrence et conflits d&apos;usage
            </h1>
            <div className="concurrence__filters">
                <div className="concurrence__filter">
                    <MultiSelect
                        label="Ressource"
                        options={ressourceOptions}
                        selectedValues={ressource}
                        onSelectionChange={setRessource}
                        showSelectAll
                    />
                </div>
                <div className="concurrence__filter">
                    <MultiSelect
                        label="Régions et départements"
                        options={departementOptions}
                        selectedValues={departements}
                        onSelectionChange={setDepartements}
                        showSelectAll
                    />
                </div>
                <div className="concurrence__filter">
                    <MultiSelect
                        label="Appel à projet"
                        options={appelAProjetOptions}
                        selectedValues={appelAProjet}
                        onSelectionChange={setAppelAProjet}
                        showSelectAll
                    />
                </div>
            </div>
            <div className="concurrence__table">
                <DataTable
                    caption={'Dossiers concernés'}
                    rows={filteredRows}
                    columns={columns}
                    stickyHeader
                    bordered
                />
            </div>
        </div>
    )
}
