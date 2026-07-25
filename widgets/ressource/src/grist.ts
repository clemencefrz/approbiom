import type {
    FetchedData,
    TableSpec,
} from '@shared/grist/approbiom/getApprobiomTables'

export const SPEC = {
    Plan_d_approvisionnement: ['id', 'Nom'],
    Approvisionnement_summary_Plan_d_approvisionnement: [
        'Plan_d_approvisionnement',
        'Total_en_tMv_an_',
    ],
} as const satisfies TableSpec

export type Fetched_Plan_d_approvisionnement = FetchedData<
    typeof SPEC
>['Plan_d_approvisionnement'][number]

export type Approvisionnement_summary_Plan_d_approvisionnement = FetchedData<
    typeof SPEC
>['Approvisionnement_summary_Plan_d_approvisionnement'][number]
