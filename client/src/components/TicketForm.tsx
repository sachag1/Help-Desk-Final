import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from "../types/ticket";
import type { CreateTicketInput, TicketCategory, TicketFormErrors, TicketFormState, TicketPriority } from "../types/ticket";
import { toCreateTicketInput, validateTicketForm } from "../utils/validateTicketForm";
import { messageOf } from "../utils/errors";
import ErrorMessage from "./ErrorMessage";
import SelectField from "./SelectField";

interface TicketFormProps {
    onSubmitTicket: (input: CreateTicketInput) => Promise<void>;
}

type TextField = "fullName" | "email" | "phone" | "title" | "description";

const emptyForm: TicketFormState = {
    fullName: "",
    email: "",
    phone: "",
    title: "",
    description: "",
    category: "",
    priority: ""
};

const inputClass = (hasError: boolean): string =>
    `w-full rounded-lg border bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500 ${hasError ? "border-red-400" : "border-slate-300"}`;
const labelClass = "flex flex-col gap-1 text-sm font-medium text-slate-700";

export default function TicketForm({ onSubmitTicket }: TicketFormProps) {
    const [form, setForm] = useState<TicketFormState>(emptyForm);
    const [errors, setErrors] = useState<TicketFormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const clearError = (field: keyof TicketFormState): void => {
        setErrors((previous: TicketFormErrors) => ({ ...previous, [field]: undefined }));
    };

    const handleTextChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>): void => {
        const field = event.target.name as TextField;
        const value: string = event.target.value;
        setForm((previous: TicketFormState) => ({ ...previous, [field]: value }));
        clearError(field);
    };

    const handleCategoryChange = (category: TicketCategory): void => {
        setForm((previous: TicketFormState) => ({ ...previous, category }));
        clearError("category");
    };

    const handlePriorityChange = (priority: TicketPriority): void => {
        setForm((previous: TicketFormState) => ({ ...previous, priority }));
        clearError("priority");
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setSubmitError(null);

        const found: TicketFormErrors = validateTicketForm(form);
        setErrors(found);
        const input: CreateTicketInput | null = toCreateTicketInput(form);
        if (input === null) {
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmitTicket(input);
        } catch (caught: unknown) {
            setSubmitError(`The ticket was not sent: ${messageOf(caught, "unknown error")}`);
            setIsSubmitting(false);
        }
    };

    const renderError = (field: keyof TicketFormState) =>
        errors[field] !== undefined ? (
            <span id={`${field}-error`} className="text-sm font-normal text-red-600">
                {errors[field]}
            </span>
        ) : null;

    return (
        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                    Full name
                    <input
                        name="fullName"
                        value={form.fullName}
                        onChange={handleTextChange}
                        autoComplete="name"
                        aria-invalid={errors.fullName !== undefined}
                        aria-describedby={errors.fullName !== undefined ? "fullName-error" : undefined}
                        className={inputClass(errors.fullName !== undefined)}
                    />
                    {renderError("fullName")}
                </label>

                <label className={labelClass}>
                    Email
                    <input
                        name="email"
                        type="email"
                        value={form.email}
                        onChange={handleTextChange}
                        autoComplete="email"
                        aria-invalid={errors.email !== undefined}
                        aria-describedby={errors.email !== undefined ? "email-error" : undefined}
                        className={inputClass(errors.email !== undefined)}
                    />
                    {renderError("email")}
                </label>

                <label className={labelClass}>
                    Phone
                    <input
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleTextChange}
                        autoComplete="tel"
                        aria-invalid={errors.phone !== undefined}
                        aria-describedby={errors.phone !== undefined ? "phone-error" : undefined}
                        className={inputClass(errors.phone !== undefined)}
                    />
                    {renderError("phone")}
                </label>

                <label className={labelClass}>
                    Title
                    <input
                        name="title"
                        value={form.title}
                        onChange={handleTextChange}
                        aria-invalid={errors.title !== undefined}
                        aria-describedby={errors.title !== undefined ? "title-error" : undefined}
                        className={inputClass(errors.title !== undefined)}
                    />
                    {renderError("title")}
                </label>

                <SelectField<TicketCategory>
                    id="category"
                    label="Category"
                    value={form.category}
                    options={TICKET_CATEGORIES}
                    placeholder="Choose a category"
                    onChange={handleCategoryChange}
                    error={errors.category}
                />

                <SelectField<TicketPriority>
                    id="priority"
                    label="Priority"
                    value={form.priority}
                    options={TICKET_PRIORITIES}
                    placeholder="Choose a priority"
                    onChange={handlePriorityChange}
                    error={errors.priority}
                />
            </div>

            <label className={labelClass}>
                Description
                <textarea
                    name="description"
                    value={form.description}
                    onChange={handleTextChange}
                    rows={5}
                    aria-invalid={errors.description !== undefined}
                    aria-describedby={errors.description !== undefined ? "description-error" : undefined}
                    className={inputClass(errors.description !== undefined)}
                />
                {renderError("description")}
            </label>

            {submitError !== null && <ErrorMessage message={submitError} />}

            <button
                type="submit"
                disabled={isSubmitting}
                className="self-start rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700 disabled:bg-slate-300"
            >
                {isSubmitting ? "Sending..." : "Submit ticket"}
            </button>
        </form>
    );
}
