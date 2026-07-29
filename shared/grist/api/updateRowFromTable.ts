import type { CellValue } from 'grist/GristData'

/**
 *
 * @param tableId
 * @param rowId
 * @param updatedFields
 */
export async function updateRowFromTable(
    tableId: string,
    rowId: number,
    updatedFields: Record<string, CellValue>
): Promise<void> {
    //TODO: Comparez ancienne et nouvelle valeur pour éviter les boucles de mises à jour.
    try {
        await grist
            .getTable(tableId)
            .update({ id: rowId, fields: updatedFields })
    } catch (error) {
        throw new Error(`Failed to update row ${rowId} in table ${tableId}:`, {
            cause: error,
        })
    }
}
