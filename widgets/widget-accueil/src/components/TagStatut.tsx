import Tag from '@shared/components/Tag'
import type { PlanStatut } from '../Accueil.types'

const COLOR: Record<PlanStatut, string | undefined> = {
    projet: 'purple-glycine',
    'en fonctionnement': 'green-emeraude',
    abandonné: undefined,
    obsolète: 'yellow-moutarde',
}

export default function TagStatut({ statut }: { statut: PlanStatut }) {
    return (
        <Tag color={COLOR[statut]} size="sm">
            {statut}
        </Tag>
    )
}
