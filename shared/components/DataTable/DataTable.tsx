// The DSFR table script is deliberately not loaded — it only drives sorting and
// row selection, which this component does not do. Horizontal scrolling is pure
// CSS (`.fr-table__container { overflow: auto }`).
import '@gouvfr/dsfr/dist/component/table/table.main.min.css'
import './DataTable.css'
import type { Column, DataTableProps } from './DataTable.types'

export default function DataTable<T>({
    caption,
    rows,
    columns,
    rowAction,
}: DataTableProps<T>) {
    // The cell named by `rowAction.columnId` wraps its content in a button;
    // every other cell renders exactly as it did before. The button is what
    // carries the interactivity — DSFR only widens its click zone — so a table
    // without a `rowAction` stays entirely non-interactive.
    function renderCell(row: T, column: Column<T>) {
        const content = column.render(row)

        if (rowAction?.columnId !== column.id) return content

        return (
            <button
                type="button"
                className="shared-data-table__row-action"
                // The visible text is the cell content; this says what
                // activating it does.
                aria-label={rowAction.label(row)}
                onClick={() => rowAction.onActivate(row)}
            >
                {content}
            </button>
        )
    }

    return (
        <div className="fr-table">
            <div className="fr-table__wrapper">
                <div className="fr-table__container">
                    <div className="fr-table__content">
                        <table>
                            <caption>{caption}</caption>
                            <thead>
                                <tr>
                                    {columns.map((column) => (
                                        // `scope="col"` ties every cell below
                                        // to this header when a screen reader
                                        // announces a row.
                                        <th key={column.id} scope="col">
                                            {column.header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {/* The row index is a safe React key as long as
                                    the table only ever displays `rows` in the
                                    given order. Sorting, filtering or row
                                    selection would each break that assumption
                                    and are the point at which callers should
                                    start supplying a stable key themselves. */}
                                {rows.map((row, rowIndex) => (
                                    <tr
                                        key={rowIndex}
                                        className={
                                            rowAction
                                                ? 'fr-enlarge-button'
                                                : undefined
                                        }
                                    >
                                        {columns.map((column) => (
                                            <td key={column.id}>
                                                {renderCell(row, column)}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
