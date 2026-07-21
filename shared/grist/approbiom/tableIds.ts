import type { Plan_d_approvisionnement } from './tables'

export type TableRowMap = {
    Plan_d_approvisionnement: Plan_d_approvisionnement
}

export type TableId = keyof TableRowMap

export const TABLE_IDS = {
    Plan_d_approvisionnement: 'Plan_d_approvisionnement',
} as const satisfies { [K in TableId]: K }

export const LOADED_TABLE_IDS = Object.values(TABLE_IDS)
