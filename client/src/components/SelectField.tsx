import { Select } from "radix-ui";

interface SelectFieldProps<T extends string> {
    id: string;
    label: string;
    value: T | "";
    options: readonly T[];
    placeholder: string;
    onChange: (value: T) => void;
    error?: string;
    disabled?: boolean;
    hideLabel?: boolean;
}

// Radix Select over a fixed list of values; onChange only ever receives one of `options`
export default function SelectField<T extends string>({
    id,
    label,
    value,
    options,
    placeholder,
    onChange,
    error,
    disabled = false,
    hideLabel = false
}: SelectFieldProps<T>) {
    const handleValueChange = (next: string): void => {
        const match: T | undefined = options.find((option: T) => option === next);
        if (match !== undefined) {
            onChange(match);
        }
    };

    return (
        <div className="flex flex-col gap-1">
            <label id={`${id}-label`} htmlFor={id} className={hideLabel ? "sr-only" : "text-sm font-medium text-slate-700"}>
                {label}
            </label>

            <Select.Root value={value} onValueChange={handleValueChange} disabled={disabled}>
                <Select.Trigger
                    id={id}
                    aria-labelledby={`${id}-label`}
                    aria-invalid={error !== undefined}
                    aria-describedby={error !== undefined ? `${id}-error` : undefined}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border bg-white px-3 py-2 text-left text-slate-900 outline-none focus:border-violet-500 disabled:bg-slate-100 data-[placeholder]:text-slate-400 ${
                        error !== undefined ? "border-red-400" : "border-slate-300"
                    }`}
                >
                    <Select.Value placeholder={placeholder} />
                    <Select.Icon className="text-slate-400">&#9662;</Select.Icon>
                </Select.Trigger>

                <Select.Portal>
                    <Select.Content
                        position="popper"
                        sideOffset={4}
                        className="z-[60] w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
                    >
                        <Select.Viewport className="p-1">
                            {options.map((option: T) => (
                                <Select.Item
                                    key={option}
                                    value={option}
                                    className="cursor-pointer rounded-md px-3 py-2 text-sm text-slate-800 outline-none data-[highlighted]:bg-violet-50 data-[state=checked]:font-semibold"
                                >
                                    <Select.ItemText>{option}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Viewport>
                    </Select.Content>
                </Select.Portal>
            </Select.Root>

            {error !== undefined && (
                <p id={`${id}-error`} className="text-sm text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
