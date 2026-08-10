import './Concurrence.css'
import DataTable, { type Column } from '@shared/components/DataTable'
import MultiSelect, {
    type MultiSelectGroup,
} from '@shared/components/MultiSelect'
import { getOptions } from '@shared/utils/getOptions'
import type { ApprovisionnementByPlanAndRessource } from '@shared/application/read-models/approvisionnement-by-plan-and-ressource'
import type { DepartementsByRegion } from '@shared/application/read-models/departements-by-region'
import type { Departement } from '@shared/domain/departement'

import { useCallback, useMemo, useState } from 'react'
import type { Entreprise } from '@shared/domain/entreprise'

type Approvisionnement =
    ApprovisionnementByPlanAndRessource['approvisionnements'][number]

type Props = {
    approvisionnementsByPlanAndRessource: readonly ApprovisionnementByPlanAndRessource[]
    departementsByRegion: readonly DepartementsByRegion[]
}

export default function Concurrence({
    approvisionnementsByPlanAndRessource: approvisionnementsByPlanAndRessource,
    departementsByRegion,
}: Props) {
    const [ressource, setRessource] = useState<string[]>([])
    const [departements, setDepartements] = useState<Departement['dep'][]>([])
    const [fournisseurs, setFournisseurs] = useState<
        Entreprise['denomination'][]
    >([])

    const ressourceOptions = getOptions(
        approvisionnementsByPlanAndRessource,
        (item) => item.ressource
    )

    const fournisseurOptions = getOptions(
        approvisionnementsByPlanAndRessource.flatMap(
            (item) => item.approvisionnements
        ),
        (approvisionnement) => approvisionnement.fournisseur
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

    const isSelected = useCallback(
        (approvisionnement: Approvisionnement) =>
            (departements.length === 0 ||
                departements.includes(
                    approvisionnement.departementDeProvenance
                )) &&
            (fournisseurs.length === 0 ||
                fournisseurs.includes(approvisionnement.fournisseur)),
        [departements, fournisseurs]
    )

    const filteredRows = useMemo(
        () =>
            approvisionnementsByPlanAndRessource.filter(
                (item) =>
                    (ressource.length === 0 ||
                        ressource.includes(item.ressource)) &&
                    ((departements.length === 0 && fournisseurs.length === 0) ||
                        item.approvisionnements.some(isSelected))
            ),
        [
            approvisionnementsByPlanAndRessource,
            ressource,
            departements,
            fournisseurs,
            isSelected,
        ]
    )

    const getSelectedApprovisionnements = useCallback(
        (item: ApprovisionnementByPlanAndRessource) => {
            const selectedApprovisionnements =
                item.approvisionnements.filter(isSelected)

            return {
                departements: [
                    ...new Set(
                        selectedApprovisionnements.map(
                            (approvisionnement) =>
                                approvisionnement.departementDeProvenance
                        )
                    ),
                ].join(', '),
                sumTonnageRetenu: selectedApprovisionnements.reduce(
                    (sum, approvisionnement) =>
                        sum + (approvisionnement.tonnageTotal ?? 0),
                    0
                ),
            }
        },
        [isSelected]
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
                    header: 'Ressource',
                    id: 'ressource',
                    render: (item) => item.ressource,
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
                {
                    header: 'Départements retenus',
                    id: 'departements_retenus',
                    render: (item) =>
                        getSelectedApprovisionnements(item).departements,
                },
                {
                    header: 'Tonnage retenu (en tonne de matière verte par an)',
                    id: 'tonnage_retenu',
                    render: (item) =>
                        getSelectedApprovisionnements(item).sumTonnageRetenu,
                },
            ],
            [getSelectedApprovisionnements]
        )

    return (
        <div className="concurrence">
            <h1 className="fr-h3 concurrence__title">
                Concurrence et conflits d&apos;usages potentiels entre projets
            </h1>
            <p className="fr-h4 concurrence__filters_title">
                Filtres d&apos;analyse de la concurrence
            </p>
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
                        label="Fournisseur"
                        options={fournisseurOptions}
                        selectedValues={fournisseurs}
                        onSelectionChange={setFournisseurs}
                        showSelectAll
                    />
                </div>
            </div>
            <div className="concurrence__table">
                <DataTable
                    caption={'Dossiers concernés'}
                    description="Chaque ligne réunit un plan d’approvisionnement et une ressource."
                    showResultCount
                    rows={filteredRows}
                    columns={columns}
                    stickyHeader
                    bordered
                    multiLine
                />
            </div>
        </div>
    )
}
