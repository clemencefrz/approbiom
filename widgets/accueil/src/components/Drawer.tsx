import '@gouvfr/dsfr/dist/component/button/button.main.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.main.min.css'
import './Drawer.css'
import Tag from '@shared/components/Tag'
import type { PlanDapprovisionnementAccueil } from '../grist'
import { isLaureat } from '../utils'
import { useEffect, useId, useRef } from 'react'

const A_VENIR = 'À venir'

export type DrawerProps = {
    plan: PlanDapprovisionnementAccueil
    phasesInstruction: readonly string[]
    onClose: () => void
}

export default function Drawer({
    plan,
    phasesInstruction,
    onClose,
}: DrawerProps) {
    const titleId = useId()
    const closeRef = useRef<HTMLButtonElement>(null)

    // Focus goes into the panel, or a keyboard user would still be behind it,
    // tabbing through a table they can no longer see.
    useEffect(() => {
        closeRef.current?.focus()
    }, [])

    useEffect(() => {
        function closeOnEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') onClose()
        }

        // On the document rather than on the panel: Escape has to work wherever
        // the focus has wandered inside it.
        document.addEventListener('keydown', closeOnEscape)

        return () => {
            document.removeEventListener('keydown', closeOnEscape)
        }
    }, [onClose])

    return (
        <>
            {/* Clicking beside the panel closes it, as DSFR's own modal does.
                Deliberately not a button: the close button is what the keyboard
                reaches, and a second one here would only pad the tab order. */}
            <div className="drawer__backdrop" onClick={onClose} />

            <section
                className="drawer"
                role="dialog"
                aria-modal="true"
                aria-labelledby={titleId}
            >
                <button
                    ref={closeRef}
                    type="button"
                    className="fr-btn fr-btn--close"
                    onClick={onClose}
                >
                    Fermer
                </button>

                <div className="drawer__heading">
                    <h2 className="fr-h2 drawer__title" id={titleId}>
                        {plan.Nom}
                    </h2>
                    <div className="drawer__tags">
                        {isLaureat(plan.est_Laureat) && (
                            <Tag color="yellow-tournesol">Lauréat</Tag>
                        )}
                        {phasesInstruction.map((phase, index) => (
                            <Tag key={index} color="purple-glycine">
                                {phase}
                            </Tag>
                        ))}
                        {phasesInstruction.length === 0 && (
                            <Tag>Fil d’instruction non défini</Tag>
                        )}
                    </div>
                </div>

                <dl className="drawer__facts fr-mt-4w fr-mb-4w">
                    <div className="fr-text--sm">
                        <dt>Appel à projet&nbsp;:&nbsp;</dt>
                        <dd className="fr-text--bold">
                            {plan.Appel_a_projet || 'Aucun'}
                        </dd>
                    </div>
                    <div className="fr-text--sm">
                        <dt>CRB compétentes&nbsp;:&nbsp;</dt>
                        <dd className="fr-text--bold">
                            {plan.CRB_competentes || 'Aucune'}
                        </dd>
                    </div>
                </dl>

                <section className="drawer__panel fr-p-3w fr-mb-3w">
                    <h3 className="fr-text--md">Pièces du dossier</h3>
                    <p className="drawer__pending fr-mb-3w">{A_VENIR}</p>

                    <ul className="fr-btns-group fr-btns-group--inline-md">
                        <li>
                            <button
                                type="button"
                                className="fr-btn fr-btn--secondary"
                                disabled
                            >
                                Voir le dossier complet
                            </button>
                        </li>
                        <li>
                            <button
                                type="button"
                                className="fr-btn fr-btn--secondary fr-btn--icon-left fr-icon-download-line"
                                disabled
                            >
                                Télécharger le dossier complet
                            </button>
                        </li>
                    </ul>
                </section>

                <section className="drawer__panel fr-p-3w">
                    <h3 className="fr-text--md">Chronologie du dossier</h3>
                    <p className="drawer__pending">{A_VENIR}</p>
                </section>
            </section>
        </>
    )
}
