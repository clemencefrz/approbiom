import './Concurrence.css'
import DataTable, { type Column } from '@shared/components/DataTable'
import MultiSelect, {
    type MultiSelectGroup,
} from '@shared/components/MultiSelect'
import { getOptions } from '@shared/utils/getOptions'
import type { ApprovisionnementByPlanAndRessource } from '@shared/application/read-models/approvisionnement-by-plan-and-ressource'
import type { DepartementsByRegion } from '@shared/application/read-models/departements-by-region'
import type { Departement } from '@shared/domain/departement'
import { useMemo, useState } from 'react'

type Props = {
    approvisionnements: readonly ApprovisionnementByPlanAndRessource[]
    departementsByRegion: readonly DepartementsByRegion[]
}

export default function Concurrence({
    approvisionnements,
    departementsByRegion,
}: Props) {
    const [ressource, setRessource] = useState<string[]>([])
    const [departements, setDepartements] = useState<Departement['dep'][]>([])

    const ressourceOptions = getOptions(
        approvisionnements,
        (item) => item.ressource
    )

    const departementOptions: readonly MultiSelectGroup<Departement['dep']>[] =
        departementsByRegion.map(({ region, departements }) => ({
            id: region.reg,
            label: region.libelle,
            options: departements.map(({ dep }) => ({
                value: dep,
                label: dep,
            })),
        }))

    const filteredRows = useMemo(
        () =>
            approvisionnements.filter(
                (item) =>
                    (ressource.length === 0 ||
                        ressource.includes(item.ressource)) &&
                    // Matched on provenance: the options are département codes,
                    // and provenance is the only column carrying one.
                    (departements.length === 0 ||
                        item.approvisionnements.some((approvisionnement) =>
                            departements.includes(
                                approvisionnement.departementDeProvenance
                            )
                        ))
            ),
        [approvisionnements, ressource, departements]
    )

    const columns: readonly Column<ApprovisionnementByPlanAndRessource>[] =
        useMemo(
            () => [
                {
                    header: 'Plan d’approvisionnement',
                    id: 'plan_d_approvisionnement',
                    render: (item) => item.planDApprovisionnement,
                },
                {
                    header: 'Département de situation',
                    id: 'departement_de_situation',
                    render: (item) => item.departementDeSituation,
                },
                {
                    header: 'Départements de provenance',
                    id: 'departements_de_provenance',
                    render: (item) =>
                        item.approvisionnements
                            .map(
                                (approvisionnement) =>
                                    approvisionnement.departementDeProvenance
                            )
                            .join(', '),
                },
                {
                    header: 'Tonnage total (en tonne de matière verte par an)',
                    id: 'tonnage_total',
                    render: (item) =>
                        !item.sumTonnageTotal ? 'N/A' : item.sumTonnageTotal,
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
