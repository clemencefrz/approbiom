import type {
    Approvisionnement_summary_Plan_d_approvisionnement,
    Fetched_Plan_d_approvisionnement,
} from '../grist'

type RessourceProps = {
    plans: readonly Fetched_Plan_d_approvisionnement[]
    summaryByPlanId: ReadonlyMap<
        number,
        Approvisionnement_summary_Plan_d_approvisionnement
    >
}

export default function Ressource({ plans, summaryByPlanId }: RessourceProps) {
    return (
        <table>
            <thead>
                <tr>
                    <th>Plan d’approvisionnement</th>
                    <th>Total (tMv/an)</th>
                </tr>
            </thead>
            <tbody>
                {plans.map((plan) => (
                    <tr key={plan.id}>
                        <td>{plan.Nom}</td>
                        <td>
                            {summaryByPlanId.get(plan.id)?.Total_en_tMv_an_ ??
                                '—'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
