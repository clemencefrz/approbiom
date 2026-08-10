import type { Departement } from './departement'
import type { PlanDApprovisionnement } from './plan-d-approvisionnement'

export type Approvisionnement = {
    planDApprovisionnement: PlanDApprovisionnement['id']
    departementDeProvenance: Departement['dep']
    //fournisseur
    tonnageTotal: number
}
