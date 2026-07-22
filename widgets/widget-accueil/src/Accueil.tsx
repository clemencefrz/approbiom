import '@gouvfr/dsfr/dist/component/button/button.main.min.css'
import '@gouvfr/dsfr/dist/component/link/link.main.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-user/icons-user.main.min.css'

import './Accueil.css'
import DataTable, { type Column } from '@shared/components/DataTable'
import MultiSelect from '@shared/components/MultiSelect'
import SearchBar from '@shared/components/SearchBar'
import Tag from '@shared/components/Tag'
import TagNature from './components/TagNature'
import TagStatut from './components/TagStatut'
import TagType from './components/TagType'
import TagUsage from './components/TagUsage'
import {
    APPEL_A_PROJET_OPTIONS,
    AVIS_CRB_OPTIONS,
    LIEU_OPTIONS,
    PLANS,
    STATUT_OPTIONS,
} from './Accueil.data'
import type { AvisCrb, PlanRow, PlanStatut } from './Accueil.types'
import { useState } from 'react'
import { getFilteredRows } from './utils'

const columns: readonly Column<PlanRow>[] = [
    {
        id: 'nom',
        header: 'Nom du dossier',
        render: (plan) => plan.nom,
    },
    {
        id: 'departement-de-situation',
        header: 'Département de situation',
        render: (plan) => plan.departementDeSituation,
    },
    {
        id: 'appel-a-projet',
        header: 'Appel à projet',
        render: (plan) => plan.appelAProjet,
    },
    {
        id: 'type',
        header: 'Type de plan',
        render: (plan) => (
            <>
                <TagType type={plan.type} />
                {plan.version && (
                    <span className="accueil__version">{plan.version}</span>
                )}
            </>
        ),
    },
    {
        id: 'usage',
        header: 'Usage',
        render: (plan) => <TagUsage usage={plan.usage} />,
    },
    {
        id: 'mise-en-service',
        header: 'Mise en service projet',
        // The only tag on the page that stands for nothing in the domain — it
        // says a year is missing — so it is drawn from the generic component
        // rather than given a component of its own.
        render: (plan) =>
            plan.miseEnServiceProjet ?? (
                <Tag color="pink-macaron" size="sm">
                    non
                </Tag>
            ),
    },
    {
        id: 'nature-donnee',
        header: 'Nature de la donnée',
        render: (plan) => <TagNature nature={plan.natureDonnee} />,
    },
    {
        id: 'statut',
        header: 'Statut',
        render: (plan) => <TagStatut statut={plan.statut} />,
    },
    {
        id: 'action',
        header: 'Action',
        // `href="#"` is a placeholder: where a row leads is not decided yet, and
        // an `<a>` without one is not a link at all. It becomes the route to the
        // dossier once there is one.
        render: () => (
            <a className="fr-link" href="#">
                Voir le dossier
            </a>
        ),
    },
]

export default function Accueil() {
    const [nom, setNom] = useState('')
    const [statuts, setStatuts] = useState<PlanStatut[]>([])
    const [lieux, setLieux] = useState<string[]>([])
    const [appelsAProjet, setAppelsAProjet] = useState<string[]>([])
    const [avis, setAvis] = useState<AvisCrb[]>([])

    // Bumped on reset, and used as the key of the search bar: the field holds
    // the text the user typed itself, so emptying `nom` here would leave the
    // word on screen filtering nothing. Remounting is what clears it, short of
    // giving SearchBar a controlled value.
    const [searchGeneration, setSearchGeneration] = useState(0)

    const displayedRows = getFilteredRows(PLANS, {
        nom,
        statuts,
        lieux,
        appelsAProjet,
        avis,
    })

    const hasFilters =
        nom !== '' ||
        statuts.length > 0 ||
        lieux.length > 0 ||
        appelsAProjet.length > 0 ||
        avis.length > 0

    function resetFilters() {
        setNom('')
        setStatuts([])
        setLieux([])
        setAppelsAProjet([])
        setAvis([])
        setSearchGeneration((generation) => generation + 1)
    }

    return (
        <div className="accueil">
            <header className="accueil__header">
                <h1 className="fr-h3 accueil__title">
                    Suivi des plans d’approvisionnement
                </h1>
            </header>

            <SearchBar
                key={searchGeneration}
                label="Rechercher un dossier par nom"
                placeholder="Rechercher un dossier par nom"
                onSearch={setNom}
            />

            <div className="accueil__filters">
                <p className="accueil__filters-label">Filtrer :</p>
                <div className="accueil__filter">
                    <MultiSelect
                        label="Statut"
                        options={STATUT_OPTIONS}
                        selectedValues={statuts}
                        onSelectionChange={setStatuts}
                        showSelectAll
                    />
                </div>
                <div className="accueil__filter">
                    <MultiSelect
                        label="Lieu"
                        options={LIEU_OPTIONS}
                        selectedValues={lieux}
                        onSelectionChange={setLieux}
                        showSelectAll
                        legend="Communes, par département"
                        hideLegend
                    />
                </div>
                <div className="accueil__filter">
                    <MultiSelect
                        label="Appel à projet"
                        options={APPEL_A_PROJET_OPTIONS}
                        selectedValues={appelsAProjet}
                        onSelectionChange={setAppelsAProjet}
                        showSelectAll
                    />
                </div>
                <div className="accueil__filter">
                    <MultiSelect
                        label="Avis CRB"
                        options={AVIS_CRB_OPTIONS}
                        selectedValues={avis}
                        onSelectionChange={setAvis}
                        showSelectAll
                    />
                </div>
                <button
                    type="button"
                    className="fr-btn fr-btn--tertiary accueil__reset"
                    onClick={resetFilters}
                    disabled={!hasFilters}
                >
                    Réinitialiser les filtres
                </button>
            </div>

            <div className="accueil__table">
                <DataTable
                    caption="Liste des plans d’approvisionnement"
                    rows={displayedRows}
                    columns={columns}
                    bordered
                    stickyHeader
                />
            </div>
        </div>
    )
}
