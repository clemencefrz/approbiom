import type { Crb } from './crb'
import type { DemandeSubvention } from './demande-subvention'
//table Instruction_crb
export type Instruction = {
    crb: Crb['name'] //crb
    subvention: DemandeSubvention['id']
    name: string // nom
    avisCrbRequis: boolean //$Avis_CRB_Requis
    dateSaisineCrb: Date | null // $Date_saisine_CRB
    dateAvisCrb: Date | null // $Date_avis_CRB
    avisCRB: AvisCRB //$Avis_CRB
    dateAvisPrefet: Date | null //$Date_avis_Prefet
    avisPrefet: AvisPrefet //$Avis_Prefet
    phase: string // $Phase_de_l_instruction
}

export type AvisCRB =
    | 'Avis favorable'
    | 'Avis favorable avec réserves'
    | 'Avis réservé'
    | 'En attente'
    | 'Non demandé'
    | 'Avis défavorable'

export type AvisPrefet =
    | 'Avis favorable'
    | 'Avis favorable avec réserves'
    | 'Avis réservé'
    | 'En attente'
    | 'Avis défavorable'
