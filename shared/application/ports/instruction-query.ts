import type { Instruction } from '@shared/domain/instruction'

export interface InstructionQuery {
    list(): Promise<readonly Instruction[]>
}
