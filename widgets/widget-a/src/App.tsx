import Button from '@shared/components/Button'
import './App.css'
import { useEffect, useState } from 'react'

// No import for `grist`: grist-plugin-api.js is loaded by a <script> tag in
// index.html and installs `grist` as a global. shared/grist/grist-plugin-api.d.ts
// is what makes it typed.

export default function App() {
    const [records, setRecords] = useState<grist.RowRecord[] | null>(null)
    useEffect(() => {
        grist.onRecords((records) => {
            setRecords(records)
        })
        grist.ready()
    }, [])
    return (
        <main className="app">
            <h1>Hello world — Widget A</h1>
            <p>{JSON.stringify(records)}</p>
            <p>Widget Grist personnalisé, en attente de données.</p>
            <Button onClick={() => alert('Widget A')}>Bouton partagé</Button>
        </main>
    )
}
