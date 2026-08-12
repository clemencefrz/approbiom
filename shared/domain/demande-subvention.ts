import type { PlanDApprovisionnement } from './plan-d-approvisionnement'
import type { ProgrammeAide } from './programme-aide'

//table Demande_subvention dans grist
export type DemandeSubvention = {
    id: string // 'Nom' -> should be unique
    programmeAide: ProgrammeAide['id'] // -ref
    planDApprovisionnement: PlanDApprovisionnement['id']
}
