import type { Departement } from '@shared/domain/departement'
import type { Region } from '@shared/domain/region'

export type departementsByRegion = {
    region: Pick<Region, 'libelle' | 'reg'>
    departements: readonly Pick<Departement, 'dep'>[]
}
