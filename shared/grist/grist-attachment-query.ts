import type { AttachmentQuery } from '@shared/application/ports/attachment-query'
import { gristReady } from './grist-ready'
import { asIdList, asNumber, asString, fetchRowsOnce } from './grist-helpers'
import { COLUMNS, TABLE } from './grist-tables'

type AttachmentMetadata = {
    name: string
    sizeInBytes: number
}

async function getAccessToken() {
    await gristReady()

    return grist.docApi.getAccessToken({ readOnly: true })
}

async function fetchMetadata(): Promise<Map<number, AttachmentMetadata>> {
    const { baseUrl, token } = await getAccessToken()

    const response = await fetch(`${baseUrl}/attachments?auth=${token}`)
    if (!response.ok) {
        throw new Error(
            `Grist attachments could not be read — ${response.status} ${response.statusText}. `
        )
    }

    const { records } = (await response.json()) as {
        records?: { id?: number; fields?: Record<string, unknown> }[]
    }

    return new Map(
        (records ?? []).flatMap(({ id, fields }) =>
            typeof id === 'number'
                ? [
                      [
                          id,
                          {
                              name: asString(fields?.fileName),
                              sizeInBytes: asNumber(fields?.fileSize) ?? 0,
                          },
                      ] as const,
                  ]
                : []
        )
    )
}

export function createGristAttachmentQuery(): AttachmentQuery {
    return {
        async list() {
            await gristReady()

            const [rows, metadata] = await Promise.all([
                fetchRowsOnce(TABLE.attachment, COLUMNS.attachment),
                fetchMetadata(),
            ])

            // One row carries a whole cell of files, all filed under the same
            // type — the domain holds one file each, so the cell is spread out
            // here rather than by every screen that lists one.
            return rows.flatMap((row) =>
                asIdList(row.piece_jointe).flatMap((id) => {
                    // An id the store no longer knows has no file behind it to
                    // name, to weigh or to hand over.
                    const file = metadata.get(id)
                    if (file === undefined) return []

                    return {
                        id,
                        planDApprovisionnement:
                            asNumber(row.Plan_d_approvisionnement) ?? 0,
                        type: asString(row.type),
                        ...file,
                    }
                })
            )
        },

        async getFileUrl(id) {
            const { baseUrl, token } = await getAccessToken()

            return `${baseUrl}/attachments/${id}/download?auth=${token}`
        },
    }
}
