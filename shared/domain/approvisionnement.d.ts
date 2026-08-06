import type { PlanDApprovisionnement } from './plan-d-approvisionnement'
import type { Departement } from './departement'

export type Approvisionnement = {
    PlanDApprovisionnement: PlanDApprovisionnement['id']
    DepartementDeProvenance: Departement['dep']
    TonnageTotal: number
}
