import { useGrist } from '@shared/hooks/useGrist'
import GristGate from '@shared/components/GristGate'
import Accueil from './components/Accueil'
import { ACCUEIL_SPEC } from './grist'
import { getPhasesInstructionByPlanId } from './utils'
import {
    FAKE_DEMANDES_SUBVENTION,
    FAKE_INSTRUCTIONS_CRB,
    FAKE_PLANS,
} from './data/fakePlans'

export default function App() {
    const gristState = useGrist(ACCUEIL_SPEC)

    return (
        <main className="app">
            <GristGate
                state={gristState}
                fakeData={{
                    Plan_d_approvisionnement: FAKE_PLANS,
                    Demande_subvention: FAKE_DEMANDES_SUBVENTION,
                    Instruction_crb: FAKE_INSTRUCTIONS_CRB,
                }}
            >
                {(data) => (
                    <Accueil
                        plansApprovisionnement={data.Plan_d_approvisionnement}
                        phasesInstructionByPlanId={getPhasesInstructionByPlanId(
                            data.Demande_subvention,
                            data.Instruction_crb
                        )}
                    />
                )}
            </GristGate>
        </main>
    )
}
