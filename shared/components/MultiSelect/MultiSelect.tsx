import './MultiSelect.css'
import { useId, useState } from 'react'
import type {
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectOption,
    MultiSelectProps,
} from './MultiSelect.types'

function isGroup<T>(item: MultiSelectItem<T>): item is MultiSelectGroup<T> {
    return 'options' in item
}

export default function MultiSelect<T>({
    label,
    description,
    options,
    selectedValues,
    onSelectionChange,
    legend,
    hideLegend = false,
    showSelectAll = false,
}: MultiSelectProps<T>) {
    const id = useId()
    const listId = `${id}-list`
    const descriptionId = `${id}-description`

    const [isOpen, setIsOpen] = useState(false)

    // Selection is controlled: this is a read of the prop, never state.
    const selected = new Set(selectedValues)

    const allOptions = options.flatMap((item) =>
        isGroup(item) ? item.options : [item]
    )

    function selectableIn(candidates: readonly MultiSelectOption<T>[]) {
        return candidates.filter((option) => !option.disabled)
    }

    function isAllSelected(candidates: readonly MultiSelectOption<T>[]) {
        const selectable = selectableIn(candidates)

        return (
            selectable.length > 0 &&
            selectable.every((option) => selected.has(option.value))
        )
    }

    function reportSelection(next: Set<T>) {
        // Rebuilt from the list rather than appended to, so the caller always
        // gets the selection in the list's own order. `selectedValues` itself
        // is never touched, and the values are passed through by reference.
        onSelectionChange(
            allOptions
                .filter((option) => next.has(option.value))
                .map((option) => option.value)
        )
    }

    function toggleOption(value: T, checked: boolean) {
        const next = new Set(selected)
        if (checked) next.add(value)
        else next.delete(value)

        reportSelection(next)
    }

    function toggleAll(
        candidates: readonly MultiSelectOption<T>[],
        checked: boolean
    ) {
        const next = new Set(selected)
        for (const option of selectableIn(candidates)) {
            if (checked) next.add(option.value)
            else next.delete(option.value)
        }

        reportSelection(next)
    }

    function renderOption(option: MultiSelectOption<T>, key: string) {
        const optionId = `${id}-${key}`

        return (
            <div key={key}>
                <input
                    type="checkbox"
                    id={optionId}
                    checked={selected.has(option.value)}
                    disabled={option.disabled}
                    onChange={(event) =>
                        toggleOption(option.value, event.target.checked)
                    }
                />
                <label htmlFor={optionId}>{option.label}</label>
            </div>
        )
    }

    function renderGroup(group: MultiSelectGroup<T>) {
        const groupId = `${id}-${group.id}`
        const allSelected = isAllSelected(group.options)
        const someSelected = group.options.some((option) =>
            selected.has(option.value)
        )

        // The group's checkbox has no value of its own: it is a view of its
        // options, and toggling it toggles them. That is why `selectedValues`
        // only ever contains option values.
        return (
            <div key={group.id} className="shared-multi-select__group">
                <input
                    type="checkbox"
                    id={groupId}
                    checked={allSelected}
                    // Nothing to toggle, so the control has nothing to say.
                    disabled={selectableIn(group.options).length === 0}
                    // `indeterminate` is a DOM property with no HTML
                    // attribute, so it can only be set on the node itself.
                    ref={(input) => {
                        if (input)
                            input.indeterminate = someSelected && !allSelected
                    }}
                    onChange={(event) =>
                        toggleAll(group.options, event.target.checked)
                    }
                />
                <label htmlFor={groupId}>{group.label}</label>
                {group.description && <p>{group.description}</p>}
                {/* Indented by CSS rather than by nesting a list inside the
                    label's own box: the options are siblings of the group
                    checkbox in the accessibility tree, which is what a screen
                    reader should hear — the group checkbox is a shortcut, not
                    a parent node. */}
                <div className="shared-multi-select__group-options">
                    {group.options.map((option, index) =>
                        renderOption(option, `${group.id}-${index}`)
                    )}
                </div>
            </div>
        )
    }

    return (
        <div className="shared-multi-select">
            <button
                type="button"
                // The pair a screen reader needs to announce a disclosure: what
                // it opens, and whether it is open.
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-describedby={description ? descriptionId : undefined}
                onClick={() => setIsOpen((open) => !open)}
            >
                {label}
                {/* The chevron repeats what `aria-expanded` already says, so it
                    is decoration. Swapping the glyph rather than rotating it
                    keeps this component free of layout CSS it does not own. */}
                <span aria-hidden="true">{isOpen ? ' ▴' : ' ▾'}</span>
            </button>
            {description && <p id={descriptionId}>{description}</p>}
            {/* `hidden` rather than unmounting: it takes the list out of the
                tab order and out of the accessibility tree just the same, and
                it keeps `aria-controls` pointing at an element that exists. */}
            <div id={listId} hidden={!isOpen}>
                {showSelectAll && (
                    <button
                        type="button"
                        disabled={selectableIn(allOptions).length === 0}
                        onClick={() =>
                            toggleAll(allOptions, !isAllSelected(allOptions))
                        }
                    >
                        {isAllSelected(allOptions)
                            ? 'Tout désélectionner'
                            : 'Tout sélectionner'}
                    </button>
                )}
                <fieldset
                    // A group of checkboxes needs a name. The legend is it when
                    // there is one; otherwise the label of the control that
                    // opened the list already says what is being chosen.
                    aria-label={legend ? undefined : label}
                >
                    {legend && (
                        <legend
                            className={
                                hideLegend
                                    ? 'shared-multi-select__legend--hidden'
                                    : undefined
                            }
                        >
                            {legend}
                        </legend>
                    )}
                    {/* The index is a safe React key for a lone option as long
                        as the component only ever displays the list in the
                        given order, which it does. Groups key on their id. */}
                    {options.map((item, index) =>
                        isGroup(item)
                            ? renderGroup(item)
                            : renderOption(item, `option-${index}`)
                    )}
                </fieldset>
            </div>
        </div>
    )
}
