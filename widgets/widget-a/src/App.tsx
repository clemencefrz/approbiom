import Button from '@shared/components/Button'
import './App.css'
import { useEffect, useState } from 'react'

const REQUIRED_ACCESS = 'full'

export default function App() {
    const [records, setRecords] = useState<grist.RowRecord[] | null>(null)
    const [accessLevel, setAccessLevel] = useState<string | null>(null)

    useEffect(() => {
        grist.onRecords((records) => {
            setRecords(records)
        })
        grist.onOptions((_options, settings) => {
            setAccessLevel(settings.accessLevel)
        })
        grist.ready({
            requiredAccess: REQUIRED_ACCESS,
        })
    }, [])

    if (accessLevel === null) {
        return (
            <main className="app">
                <p>Connexion à Grist en cours…</p>
            </main>
        )
    }

    if (accessLevel !== REQUIRED_ACCESS) {
        return (
            <main className="app">
                <p>
                    Ce widget a besoin d’un accès complet au document. Ouvrez le
                    panneau de configuration du widget et choisissez « Accès
                    complet au document ».
                </p>
            </main>
        )
    }

    return (
        <main className="app">
            <h1>Hello world — Widget A</h1>
            <p>{JSON.stringify(records)}</p>
            <p>Widget Grist personnalisé, en attente de données.</p>
            <Button onClick={() => alert('Widget A')}>Bouton partagé</Button>
        </main>
    )
}
