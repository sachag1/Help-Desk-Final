import type { TicketFilters } from "../utils/ticketFilters";
import {
    CATEGORY_FILTER_OPTIONS,
    DEFAULT_FILTERS,
    hasActiveFilters,
    PRIORITY_FILTER_OPTIONS,
    STATUS_FILTER_OPTIONS
} from "../utils/ticketFilters";
import type { CategoryFilter, PriorityFilter, StatusFilter } from "../utils/ticketFilters";
import SearchBar from "./SearchBar";
import SelectField from "./SelectField";

interface TicketFiltersBarProps {
    filters: TicketFilters;
    onChange: (filters: TicketFilters) => void;
}

// Search box and the Status / Priority / Category filters; they combine with each other
export default function TicketFiltersBar({ filters, onChange }: TicketFiltersBarProps) {
    return (
        <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <SearchBar value={filters.search} onChange={(search: string) => onChange({ ...filters, search })} />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <SelectField<StatusFilter>
                    id="filter-status"
                    label="Status"
                    value={filters.status}
                    options={STATUS_FILTER_OPTIONS}
                    placeholder="Status"
                    onChange={(status: StatusFilter) => onChange({ ...filters, status })}
                />
                <SelectField<PriorityFilter>
                    id="filter-priority"
                    label="Priority"
                    value={filters.priority}
                    options={PRIORITY_FILTER_OPTIONS}
                    placeholder="Priority"
                    onChange={(priority: PriorityFilter) => onChange({ ...filters, priority })}
                />
                <SelectField<CategoryFilter>
                    id="filter-category"
                    label="Category"
                    value={filters.category}
                    options={CATEGORY_FILTER_OPTIONS}
                    placeholder="Category"
                    onChange={(category: CategoryFilter) => onChange({ ...filters, category })}
                />
            </div>

            {hasActiveFilters(filters) && (
                <button
                    type="button"
                    onClick={() => onChange(DEFAULT_FILTERS)}
                    className="self-start text-sm font-medium text-violet-600 hover:underline"
                >
                    Clear search and filters
                </button>
            )}
        </div>
    );
}
