import type { CreateTicketInput, TicketFormErrors, TicketFormState } from "../types/ticket";
import { isTicketCategory, isTicketPriority } from "../types/guards";

const EMAIL_PATTERN: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_CHARACTERS: RegExp = /^[\d\s\-()+]+$/;

function isValidPhone(phone: string): boolean {
    const digits: number = phone.replace(/\D/g, "").length;
    return PHONE_CHARACTERS.test(phone) && digits >= 7 && digits <= 15;
}

// Same rules as the server: the server validates again, this only gives quick feedback
export function validateTicketForm(form: TicketFormState): TicketFormErrors {
    const errors: TicketFormErrors = {};
    const fullName: string = form.fullName.trim();
    const email: string = form.email.trim();
    const phone: string = form.phone.trim();
    const title: string = form.title.trim();
    const description: string = form.description.trim();

    if (fullName === "") errors.fullName = "Full name is required.";
    else if (fullName.length < 2) errors.fullName = "Please enter your full name (at least 2 characters).";

    if (email === "") errors.email = "Email is required.";
    else if (!EMAIL_PATTERN.test(email)) errors.email = "Please enter a valid email address.";

    if (phone === "") errors.phone = "Phone is required.";
    else if (!isValidPhone(phone)) errors.phone = "Please enter a valid phone number (7 to 15 digits).";

    if (title === "") errors.title = "Title is required.";
    else if (title.length < 3) errors.title = "Please enter a meaningful title (at least 3 characters).";

    if (form.category === "") errors.category = "Please choose a category.";
    if (form.priority === "") errors.priority = "Please choose a priority.";

    if (description === "") errors.description = "Description is required.";
    else if (description.length < 10) errors.description = "Please describe the problem (at least 10 characters).";

    return errors;
}

// Returns the data to send, or null when the form is not valid
export function toCreateTicketInput(form: TicketFormState): CreateTicketInput | null {
    if (Object.keys(validateTicketForm(form)).length > 0 || !isTicketCategory(form.category) || !isTicketPriority(form.priority)) {
        return null;
    }
    return {
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category,
        priority: form.priority
    };
}
