// DSFR 1.14.4 ships no "liste déroulante riche", so the UI is composed out of
// the primitives it does ship: `fr-label`/`fr-hint-text` for the libellé,
// `fr-select` for the box that opens the list, `fr-btn` for the select-all,
// `fr-fieldset` for the legend, `fr-checkbox-group` for the options.
import '@gouvfr/dsfr/dist/component/form/form.main.min.css'
import '@gouvfr/dsfr/dist/component/select/select.main.min.css'
import '@gouvfr/dsfr/dist/component/checkbox/checkbox.main.min.css'
import '@gouvfr/dsfr/dist/component/button/button.main.min.css'
import '@gouvfr/dsfr/dist/utility/icons/icons-system/icons-system.main.min.css'

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
    const labelId = `${id}-label`
    const triggerId = `${id}-trigger`
    const panelId = `${id}-panel`
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

    // Read off the list rather than off `selectedValues`, so a value the caller
    // kept around for an option that is no longer offered is not announced as
    // selected. In list order, like everything else the component reports.
    const selectedLabels = allOptions
        .filter((option) => selected.has(option.value))
        .map((option) => option.label)

    // What the control says once collapsed: the selection itself. The libellé
    // sits above it and is pulled into the accessible name, so this only has to
    // carry the options.
    const summary =
        selectedLabels.length === 0
            ? 'Aucune option sélectionnée'
            : selectedLabels.join(', ')

    function renderOption(option: MultiSelectOption<T>, key: string) {
        const optionId = `${id}-${key}`

        return (
            <div key={key} className="fr-checkbox-group fr-checkbox-group--sm">
                <input
                    type="checkbox"
                    id={optionId}
                    checked={selected.has(option.value)}
                    disabled={option.disabled}
                    onChange={(event) =>
                        toggleOption(option.value, event.target.checked)
                    }
                />
                <label className="fr-label" htmlFor={optionId}>
                    {option.label}
                </label>
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
                <div className="fr-checkbox-group fr-checkbox-group--sm">
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
                                input.indeterminate =
                                    someSelected && !allSelected
                        }}
                        onChange={(event) =>
                            toggleAll(group.options, event.target.checked)
                        }
                    />
                    <label className="fr-label" htmlFor={groupId}>
                        {group.label}
                        {group.description && (
                            <span className="fr-hint-text">
                                {group.description}
                            </span>
                        )}
                    </label>
                </div>
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

    const allSelected = isAllSelected(allOptions)

    return (
        <div className="fr-select-group shared-multi-select">
            {/* `htmlFor` on a `<button>` is valid — a button is a labelable
                element — so clicking the libellé focuses the control. The
                accessible name is spelled out with `aria-labelledby` all the
                same: a button takes its name from its own content first, and
                on its own it would only announce the selection. */}
            <label className="fr-label" htmlFor={triggerId}>
                <span id={labelId}>{label}</span>
                {description && (
                    <span className="fr-hint-text" id={descriptionId}>
                        {description}
                    </span>
                )}
            </label>
            <button
                type="button"
                id={triggerId}
                className="fr-select shared-multi-select__trigger"
                aria-labelledby={`${labelId} ${triggerId}`}
                aria-describedby={description ? descriptionId : undefined}
                // The pair a screen reader needs to announce a disclosure: what
                // it opens, and whether it is open.
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setIsOpen((open) => !open)}
            >
                {summary}
            </button>
            {/* `hidden` rather than unmounting: it takes the panel out of the
                tab order and out of the accessibility tree just the same, and
                it keeps `aria-controls` pointing at an element that exists. */}
            <div
                className="shared-multi-select__panel"
                id={panelId}
                hidden={!isOpen}
            >
                {showSelectAll && (
                    <button
                        type="button"
                        className={`fr-btn fr-btn--tertiary fr-btn--icon-left shared-multi-select__select-all ${
                            allSelected
                                ? 'fr-icon-close-circle-line'
                                : 'fr-icon-checkbox-circle-line'
                        }`}
                        disabled={selectableIn(allOptions).length === 0}
                        onClick={() => toggleAll(allOptions, !allSelected)}
                    >
                        {allSelected
                            ? 'Tout désélectionner'
                            : 'Tout sélectionner'}
                    </button>
                )}
                <fieldset
                    className="fr-fieldset"
                    // A group of checkboxes needs a name. The legend is it when
                    // there is one; otherwise the label of the control that
                    // opened the list already says what is being chosen.
                    aria-label={legend ? undefined : label}
                >
                    {legend && (
                        // `fr-sr-only` is DSFR's own visually-hidden utility,
                        // in `core`: it keeps the legend as the accessible name
                        // of the group while taking it off the screen.
                        <legend
                            className={`fr-fieldset__legend ${
                                hideLegend ? 'fr-sr-only' : ''
                            }`}
                        >
                            {legend}
                        </legend>
                    )}
                    <div className="fr-fieldset__element shared-multi-select__options">
                        {options.map((item, index) =>
                            isGroup(item)
                                ? renderGroup(item)
                                : renderOption(item, `option-${index}`)
                        )}
                    </div>
                </fieldset>
            </div>
        </div>
    )
}
