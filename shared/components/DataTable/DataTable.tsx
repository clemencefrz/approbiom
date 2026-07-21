import type { DataTableProps } from './DataTable.types'

export default function DataTable<T>({
    caption,
    rows,
    columns,
}: DataTableProps<T>) {
    return (
        <table>
            <caption>{caption}</caption>
            <thead>
                <tr>
                    {columns.map((column) => (
                        // `scope="col"` ties every cell below to this header
                        // when a screen reader announces a row.
                        <th key={column.id} scope="col">
                            {column.header}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {/* The row index is a safe React key as long as the table only
                    ever displays `rows` in the given order. Sorting, filtering
                    or row selection would each break that assumption and are
                    the point at which callers should start supplying a stable
                    key themselves. */}
                {rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {columns.map((column) => (
                            <td key={column.id}>{column.render(row)}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    )
}
