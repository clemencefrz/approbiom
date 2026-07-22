import Tag from '@shared/components/Tag'
import type { PlanType } from '../Accueil.types'

const COLOR: Record<PlanType, string> = {
    création: 'yellow-tournesol',
    modification: 'pink-tuile',
}

export default function TagType({ type }: { type: PlanType }) {
    return (
        <Tag color={COLOR[type]} size="sm">
            {type}
        </Tag>
    )
}
