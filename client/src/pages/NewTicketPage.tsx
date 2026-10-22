import { useNavigate } from "react-router-dom";
import type { CreateTicketInput, PublicTicket } from "../types/ticket";
import { createTicket } from "../services/ticketsApi";
import TicketForm from "../components/TicketForm";

export default function NewTicketPage() {
    const navigate = useNavigate();

    // The confirmation page is reached only after the server answered with success
    const handleSubmitTicket = async (input: CreateTicketInput): Promise<void> => {
        const ticket: PublicTicket = await createTicket(input);
        navigate("/ticket-submitted", { state: { ticketId: ticket.id } });
    };

    return (
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
            <header>
                <h1 className="text-3xl font-bold text-slate-900">Open a support ticket</h1>
                <p className="text-slate-500">Tell us what is wrong and we will get back to you.</p>
            </header>
            <TicketForm onSubmitTicket={handleSubmitTicket} />
        </div>
    );
}
