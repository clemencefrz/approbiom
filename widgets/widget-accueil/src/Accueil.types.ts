// The shape the page displays, which is not the shape Grist stores: a row here
// is one line of the table in the mockup, already reduced to what is drawn.
// Wiring the real data in means mapping `Plan_d_approvisionnement` onto this
// type, so the layout below never has to know about the document's columns.

export type PlanType = 'création' | 'modification'

// The values the document actually holds today. A usage it does not cover yet
// — « carburant », say — is a value to add here and a colour to add with it.
export type PlanUsage = 'énergie' | 'matériau' | 'chimie'

export type PlanNature = 'prévision' | 'constat'

export type PlanStatut =
    'projet' | 'en fonctionnement' | 'abandonné' | 'obsolète'

// Invented: the Grist document has no such column today, so unlike every other
// field here this one has no source to be mapped from. It exists to let the
// « Avis CRB » filter do something; the day the document carries the avis, these
// values are what it will have to line up with.
export type AvisCrb =
    'favorable' | 'favorable avec réserve' | 'défavorable' | 'en attente'

export type PlanRow = {
    id: number
    nom: string
    departementDeSituation: string
    appelAProjet: string
    type: PlanType
    // Drawn under the type tag — only the rows that have been revised carry
    // one, hence optional.
    version?: string
    usage: PlanUsage
    // `null` is a plan with no planned commissioning year, drawn as a « non »
    // tag rather than as a year.
    miseEnServiceProjet: number | null
    natureDonnee: PlanNature
    statut: PlanStatut
    avisCrb: AvisCrb
}

// One of the chips under the filters: a filter that has been applied, summed up
// in a single line of text. The page draws them, it does not derive them — the
// day the filters hold state, this is what that state produces.
export type ActiveFilter = {
    id: string
    label: string
}
