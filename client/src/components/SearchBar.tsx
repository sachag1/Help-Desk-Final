import type { ChangeEvent } from "react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        onChange(event.target.value);
    };

    return (
        <input
            type="search"
            value={value}
            onChange={handleChange}
            placeholder="Search by title, customer name or email"
            aria-label="Search tickets"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500"
        />
    );
}
