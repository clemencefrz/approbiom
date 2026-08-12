import type { DemandeSubvention } from '@shared/domain/demande-subvention'

export interface DemandeSubventionQuery {
    list(): Promise<readonly DemandeSubvention[]>
}
