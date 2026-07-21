import type { ReactNode } from 'react'

export type Column<T> = {
    // Unique within a table. Used as the React key of the header and of every
    // cell in the column; it is deliberately not emitted in the DOM, so two
    // tables on the same page can reuse the same column ids.
    id: string
    header: ReactNode
    render: (row: T) => ReactNode
}

// The primary action of a row, rendered as a real `<button>` inside one cell.
// DSFR's `fr-enlarge-button` then stretches that button's click zone over the
// whole row, which is how the design system makes a container clickable: the
// role, the accessible name and the keyboard activation all come from the
// button, and the `<tr>` never becomes a focusable element with no role.
export type RowAction<T> = {
    // Id of the column whose cell hosts the button. Pick the column that
    // identifies the row: its rendered content becomes the button's label.
    columnId: string
    // Accessible name of the button, per row — "Ouvrir le plan Plan Nord"
    // rather than the bare "Plan Nord" the cell already shows. It must contain
    // the cell's visible text, so that someone driving the page by voice can
    // activate the row by reading out what they see (WCAG 2.5.3).
    label: (row: T) => string
    onActivate: (row: T) => void
}

export type DataTableProps<T> = {
    // Required: `<caption>` is the accessible name of the table, and a data
    // table without one is hard to make sense of with a screen reader.
    caption: string
    // Read-only arrays: the table only iterates over them, and accepting
    // `readonly` lets callers pass frozen or `as const` data without a cast.
    rows: readonly T[]
    columns: readonly Column<T>[]
    // Providing this is what makes rows interactive — there is deliberately no
    // separate `clickable` flag that could contradict it. Requiring a `label`
    // is what stops a clickable row from shipping without an accessible name.
    rowAction?: RowAction<T>
}
