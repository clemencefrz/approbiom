const REQUIRED_ACCESS = 'full'

export class GristUnavailableError extends Error {}

export class InsufficientAccessError extends Error {
    constructor(readonly accessLevel: string) {
        super(
            `Grist granted "${accessLevel}" access, "${REQUIRED_ACCESS}" is required.`
        )
    }
}

let handshake: Promise<void> | undefined
let grantedAccess = ''

export async function gristReady(): Promise<void> {
    if (typeof grist === 'undefined') {
        throw new GristUnavailableError('The Grist Plugin API is unavailable.')
    }

    handshake ??= new Promise<void>((resolve) => {
        grist.onOptions((_options, settings) => {
            grantedAccess = settings.accessLevel
            resolve()
        })
        grist.ready({ requiredAccess: REQUIRED_ACCESS })
    })

    await handshake

    if (grantedAccess !== REQUIRED_ACCESS) {
        throw new InsufficientAccessError(grantedAccess)
    }
}
