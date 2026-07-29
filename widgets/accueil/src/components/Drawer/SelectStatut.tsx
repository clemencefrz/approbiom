import { RadioGroup, type RadioOption } from '@shared/components/Radio'
import type { PlanStatus } from '@shared/entitie/plan_approvisionnement'
import { updatePlanStatus } from '@shared/service/updatePlanStatus'

type StatusValue = PlanStatus | 'undefined'

const STATUT_OPTIONS: readonly RadioOption<StatusValue>[] = [
    { label: 'En fonctionnement', value: 'en fonctionnement' },
    { label: 'Obsolète', value: 'obsolète' },
    { label: 'Projet', value: 'projet' },
    { label: 'Abandonné', value: 'abandonné' },
    { label: 'Indéfini', value: 'undefined' },
]

function fromStatusToValue(status: string | null): StatusValue {
    switch (status?.toLowerCase()) {
        case 'en fonctionnement':
            return 'en fonctionnement'
        case 'obsolète':
            return 'obsolète'
        case 'projet':
            return 'projet'
        case 'abandonné':
            return 'abandonné'
        default:
            return 'undefined'
    }
}

export type SelectStatutProps = {
    planId: number
    statut: string | null
    onRefetchPlan: () => Promise<void>
}

export default function SelectStatut({
    planId,
    statut,
    onRefetchPlan,
}: SelectStatutProps) {
    async function onStatusChange(value: StatusValue) {
        const formattedValue = value === 'undefined' ? null : value

        try {
            await updatePlanStatus(planId, formattedValue)
            await onRefetchPlan()
        } catch (error) {
            //TODO: Affichez un message d’erreur à l’utilisateur.
            console.error('Failed to update plan status:', error)
        }
    }

    return (
        <RadioGroup
            options={STATUT_OPTIONS}
            value={fromStatusToValue(statut)}
            onChange={(value) => void onStatusChange(value)}
            legend="Statut du plan d'approvisionnement"
            description="Sélectionnez le statut actuel du plan d'approvisionnement."
        />
    )
}
