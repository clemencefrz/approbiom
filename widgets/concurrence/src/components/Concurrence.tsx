import './Concurrence.css'
import DataTable, { type Column } from '@shared/components/DataTable'
import MultiSelect from '@shared/components/MultiSelect'
import { getOptions } from '@shared/utils/getOptions'
import type { PlanApprovisionnement } from '@shared/domain/plan_approvisionnement'
import type { Ressource } from '@shared/domain/ressource'
import { useState } from 'react'
import type { Commune } from '@shared/domain/commune'

type approvisionnementGroupedByPlanRessource = {
    plan_d_approvisionnement: PlanApprovisionnement['nom']
    ressource: Ressource['description_courte']
    appel_a_projet: string
    departement_de_situation?: Commune['dep']
    tonnage_total?: number
}

type Props = {
    approvisionnementGroupedByPlanRessource: approvisionnementGroupedByPlanRessource[]
}
export default function Concurrence({
    approvisionnementGroupedByPlanRessource,
}: Props) {
    const [ressource, setRessource] = useState<string[]>([])
    const [appelAProjet, setAppelAProjet] = useState<string[]>([])

    const ressourceOptions = getOptions(
        approvisionnementGroupedByPlanRessource,
        (item) => item.ressource
    )

    const appelAProjetOptions = getOptions(
        approvisionnementGroupedByPlanRessource,
        (item) => item.appel_a_projet
    )

    const filteredRows = approvisionnementGroupedByPlanRessource.filter(
        (item) =>
            (ressource.length === 0 || ressource.includes(item.ressource)) &&
            (appelAProjet.length === 0 ||
                appelAProjet.includes(item.appel_a_projet))
    )

    const columns: readonly Column<approvisionnementGroupedByPlanRessource>[] =
        [
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
                    !item.tonnage_total || item.tonnage_total === 0
                        ? 'N/A'
                        : item.tonnage_total,
            },
        ]

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
