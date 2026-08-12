import type { ProgrammeAide } from '@shared/domain/programme-aide'

export interface ProgrammeAideQuery {
    list(): Promise<readonly ProgrammeAide[]>
}
