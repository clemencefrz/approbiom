import type { ApprovisionnementQuery } from '@shared/application/ports/approvisionnement-query'
import type { ApprovisionnementByPlanAndRessource } from '@shared/application/read-models/approvisionnement-by-plan-and-ressource'
import { fetchRows } from '@shared/grist/api/client'
import { gristReady } from './grist-ready'
import { asNumber, asString, byColumn, byRowId, lookup } from './grist-helpers'

const GRIST_TABLE_ID_ROW_BY_PLAN_AND_RESSOURCE =
    'Approvisionnement_summary_Plan_d_approvisionnement_Ressource'
const GRIST_TABLE_ID_ROWS_BY_DEPARTEMENT_DE_PROVENANCE_PLAN_RESSOURCE =
    'Approvisionnement_summary_Departement_de_provenance_Plan_d_approvisionnement_Ressource'
const GRIST_TABLE_ID_META_RESSOURCE = 'Meta_Ressource'
const GRIST_TABLE_ID_PLAN_D_APPROVISIONNEMENT = 'Plan_d_approvisionnement'
const GRIST_TABLE_ID_INSTALLATION = 'Installation'
const GRIST_TABLE_ID_INSEE_COMMUNE = 'INSEE_Commune'
const GRIST_TABLE_ID_INSEE_DEPARTEMENT = 'INSEE_Departement'

type RequestedApprovisionnement =
    ApprovisionnementByPlanAndRessource['approvisionnements'][number]

/** The pair both summaries are grouped by, as a Map key. */
const pairKey = (plan: unknown, ressource: unknown) =>
    `${String(plan)}:${String(ressource)}`

export function createGristApprovisionnementQuery(): ApprovisionnementQuery {
    return {
        async listByPlanAndRessource() {
            await gristReady()

            const [
                totals,
                provenances,
                plans,
                ressources,
                installations,
                communes,
                departements,
            ] = await Promise.all([
                fetchRows(GRIST_TABLE_ID_ROW_BY_PLAN_AND_RESSOURCE, [
                    'Plan_d_approvisionnement',
                    'Ressource',
                    'Total_en_tMv_an_',
                ]),
                fetchRows(
                    GRIST_TABLE_ID_ROWS_BY_DEPARTEMENT_DE_PROVENANCE_PLAN_RESSOURCE,
                    [
                        'Plan_d_approvisionnement',
                        'Ressource',
                        'Departement_de_provenance',
                        'Total_en_tMv_an_',
                    ]
                ),
                fetchRows(GRIST_TABLE_ID_PLAN_D_APPROVISIONNEMENT, [
                    'id',
                    'Nom',
                    'Installation',
                ]),
                fetchRows(GRIST_TABLE_ID_META_RESSOURCE, [
                    'id',
                    'Description_courte',
                ]),
                fetchRows(GRIST_TABLE_ID_INSTALLATION, ['id', 'Commune']),
                fetchRows(GRIST_TABLE_ID_INSEE_COMMUNE, ['id', 'DEP']),
                fetchRows(GRIST_TABLE_ID_INSEE_DEPARTEMENT, [
                    'id',
                    'DEP',
                    'LIBELLE',
                ]),
            ])

            const planById = byRowId(plans)
            const ressourceById = byRowId(ressources)
            const installationById = byRowId(installations)
            const communeById = byRowId(communes)

            // Départements are joined two ways: by rowId for the provenance Ref,
            // by code for the situation, which the commune carries as text.
            const departementById = byRowId(departements)
            const departementByCode = byColumn(departements, 'DEP')

            const approvisionnementsByPair = new Map<
                string,
                RequestedApprovisionnement[]
            >()
            for (const provenance of provenances) {
                const key = pairKey(
                    provenance.Plan_d_approvisionnement,
                    provenance.Ressource
                )
                const group = approvisionnementsByPair.get(key) ?? []
                group.push({
                    departementDeProvenance: asString(
                        lookup(
                            departementById,
                            provenance.Departement_de_provenance
                        )?.DEP
                    ),
                    tonnageTotal: asNumber(provenance.Total_en_tMv_an_) ?? 0,
                })
                approvisionnementsByPair.set(key, group)
            }

            return totals.map((total) => {
                const plan = lookup(planById, total.Plan_d_approvisionnement)
                const installation = lookup(
                    installationById,
                    plan?.Installation
                )
                const commune = lookup(communeById, installation?.Commune)
                const departement = departementByCode.get(
                    asString(commune?.DEP)
                )

                return {
                    planDApprovisionnement: asString(plan?.Nom),
                    ressource: asString(
                        lookup(ressourceById, total.Ressource)
                            ?.Description_courte
                    ),
                    departementDeSituation: asString(departement?.LIBELLE),
                    approvisionnements:
                        approvisionnementsByPair.get(
                            pairKey(
                                total.Plan_d_approvisionnement,
                                total.Ressource
                            )
                        ) ?? [],
                    sumTonnageTotal: asNumber(total.Total_en_tMv_an_),
                }
            })
        },
    }
}
