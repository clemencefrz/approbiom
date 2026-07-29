import type { PlanApprovisionnement } from '@shared/entitie/plan_approvisionnement'
import { updateRowFromTable } from '@shared/grist/api/updateRowFromTable'

const TABLE_ID = 'Plan_d_approvisionnement'

export async function updatePlanStatus(
    planId: PlanApprovisionnement['id'],
    newStatus: PlanApprovisionnement['statut']
): Promise<void> {
    await updateRowFromTable(TABLE_ID, planId, {
        Statut: newStatus,
    })
}
