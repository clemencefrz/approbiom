import { useGrist } from '@shared/hooks/useGrist'
import GristGate from '@shared/components/GristGate'
import Concurrence from './components/Concurrence'

export default function App() {
    const gristState = useGrist({
        Approvisionnement_summary_Plan_d_approvisionnement_Ressource: [
            'id',
            'Ressource',
            'Plan_d_approvisionnement',
            'Appel_a_projet',
            'Total_en_tMv_an_',
        ],
        Plan_d_approvisionnement: ['id', 'Nom', 'Installation'],
        Meta_Ressource: ['id', 'Description_courte'],
        Installation: ['id', 'Nom', 'Commune'],
        INSEE_Commune: ['id', 'LIBELLE', 'DEP'],
    })

    return (
        <main className="app">
            <GristGate state={gristState}>
                {(data) => {
                    const approvisionnementGroupedByPlanRessource =
                        data.Approvisionnement_summary_Plan_d_approvisionnement_Ressource.map(
                            (item) => {
                                const plan = data.Plan_d_approvisionnement.find(
                                    (plan) =>
                                        plan.id ===
                                        item.Plan_d_approvisionnement
                                )
                                const ressource = data.Meta_Ressource.find(
                                    (res) => res.id === item.Ressource
                                )

                                let appelAProjet = ''
                                if (typeof item.Appel_a_projet === 'string') {
                                    appelAProjet = item.Appel_a_projet
                                }

                                let tonnageTotal: number | undefined = undefined
                                if (typeof item.Total_en_tMv_an_ === 'number') {
                                    tonnageTotal = item.Total_en_tMv_an_
                                }

                                const installation = data.Installation.find(
                                    (inst) => inst.id === plan?.Installation
                                )
                                const commune = data.INSEE_Commune.find(
                                    (comm) => comm.id === installation?.Commune
                                )
                                const departementDeSituation =
                                    commune?.DEP ?? undefined

                                return {
                                    plan_d_approvisionnement: plan?.Nom ?? '',
                                    ressource:
                                        ressource?.Description_courte ?? '',
                                    appel_a_projet: appelAProjet,
                                    departement_de_situation:
                                        departementDeSituation,
                                    tonnage_total: tonnageTotal,
                                }
                            }
                        )

                    return (
                        <Concurrence
                            approvisionnementGroupedByPlanRessource={
                                approvisionnementGroupedByPlanRessource
                            }
                        />
                    )
                }}
            </GristGate>
        </main>
    )
}
