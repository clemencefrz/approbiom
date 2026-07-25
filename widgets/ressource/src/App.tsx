import { useGrist } from '@shared/hooks/useGrist'
import GristGate from '@shared/components/GristGate'
import { indexByKey } from '@shared/grist/api/client'

import { SPEC } from './grist'
import Ressource from './components/Ressource'

export default function App() {
    const gristState = useGrist(SPEC)

    return (
        <main className="app">
            <GristGate state={gristState}>
                {(data) => {
                    // The summary's Plan_d_approvisionnement is a Ref = the plan's
                    // rowId; index the summaries by it so each plan finds its row.
                    const summaryByPlanId = indexByKey(
                        data.Approvisionnement_summary_Plan_d_approvisionnement,
                        (summary) =>
                            typeof summary.Plan_d_approvisionnement === 'number'
                                ? summary.Plan_d_approvisionnement
                                : null
                    )

                    return (
                        <Ressource
                            plans={data.Plan_d_approvisionnement}
                            summaryByPlanId={summaryByPlanId}
                        />
                    )
                }}
            </GristGate>
        </main>
    )
}
