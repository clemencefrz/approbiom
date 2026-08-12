import type { InstructionQuery } from '@shared/application/ports/instruction-query'
import { isAvisCRB, isAvisPrefet } from '@shared/domain/instruction'
import { gristReady } from './grist-ready'
import {
    asBoolean,
    asDate,
    asString,
    byRowId,
    fetchRowsOnce,
    lookup,
} from './grist-helpers'
import { COLUMNS, TABLE } from './grist-tables'

export function createGristInstructionQuery(): InstructionQuery {
    return {
        async list() {
            await gristReady()

            const [rows, crbs, demandes] = await Promise.all([
                fetchRowsOnce(TABLE.instruction, COLUMNS.instruction),
                fetchRowsOnce(TABLE.crb, COLUMNS.crb),
                fetchRowsOnce(
                    TABLE.demandeSubvention,
                    COLUMNS.demandeSubvention
                ),
            ])

            // `crb` and `subvention` are Refs: they hold a rowId. The domain
            // knows both by name, so the hop happens here and the screen is
            // left to group on names alone.
            const crbById = byRowId(crbs)
            const demandeById = byRowId(demandes)

            return rows.map((row) => ({
                crb: asString(lookup(crbById, row.crb)?.Nom),
                subvention: asString(lookup(demandeById, row.subvention)?.Nom),
                name: asString(row.nom),
                avisCrbRequis: asBoolean(row.Avis_CRB_Requis),
                dateSaisineCrb: asDate(row.Date_saisine_CRB),
                dateAvisCrb: asDate(row.Date_avis_CRB),
                // An empty cell means the step has not happened yet, which is
                // what "En attente" says.
                avisCRB: isAvisCRB(row.Avis_CRB) ? row.Avis_CRB : 'En attente',
                dateAvisPrefet: asDate(row.Date_avis_Prefet),
                avisPrefet: isAvisPrefet(row.Avis_Prefet)
                    ? row.Avis_Prefet
                    : 'En attente',
                phase: asString(row.Phase_de_l_instruction),
            }))
        },
    }
}
