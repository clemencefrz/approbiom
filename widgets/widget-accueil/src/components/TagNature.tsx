import Tag from '@shared/components/Tag'
import type { PlanNature } from '../Accueil.types'

const COLOR: Record<PlanNature, string | undefined> = {
    prévision: undefined,
    constat: 'blue-ecume',
}

export default function TagNature({ nature }: { nature: PlanNature }) {
    return (
        <Tag color={COLOR[nature]} size="sm">
            {nature}
        </Tag>
    )
}
