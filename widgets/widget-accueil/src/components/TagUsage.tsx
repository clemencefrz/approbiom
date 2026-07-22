import Tag from '@shared/components/Tag'
import type { PlanUsage } from '../Accueil.types'

const COLOR: Record<PlanUsage, string> = {
    énergie: 'blue-ecume',
    matériau: 'purple-glycine',
    chimie: 'blue-cumulus',
}

export default function TagUsage({ usage }: { usage: PlanUsage }) {
    return (
        <Tag color={COLOR[usage]} size="sm">
            {usage}
        </Tag>
    )
}
