import type { ReactNode } from 'react'

export type Column<T> = {
    // Unique within a table. Used as the React key of the header and of every
    // cell in the column; it is deliberately not emitted in the DOM, so two
    // tables on the same page can reuse the same column ids.
    id: string
    header: ReactNode
    render: (row: T) => ReactNode
}

export type DataTableProps<T> = {
    // Required: `<caption>` is the accessible name of the table, and a data
    // table without one is hard to make sense of with a screen reader.
    caption: string
    // Read-only arrays: the table only iterates over them, and accepting
    // `readonly` lets callers pass frozen or `as const` data without a cast.
    rows: readonly T[]
    columns: readonly Column<T>[]
}
