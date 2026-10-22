import { Link, Navigate, useLocation } from "react-router-dom";
import { isRecord } from "../types/guards";

interface SubmittedState {
    ticketId: string;
}

function isSubmittedState(value: unknown): value is SubmittedState {
    return isRecord(value) && typeof value.ticketId === "string";
}

export default function TicketSubmittedPage() {
    const location = useLocation();
    const state: unknown = location.state;

    // Opening this page directly (without having submitted a ticket) goes back to the form
    if (!isSubmittedState(state)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border border-green-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Thank you!</h1>
            <p role="status" className="text-lg text-green-700">
                Your support ticket was submitted successfully.
            </p>
            <p className="text-sm text-slate-500">
                Ticket number: <span className="font-mono text-slate-800">{state.ticketId}</span>
            </p>
            <Link to="/" className="rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700">
                Open another ticket
            </Link>
        </div>
    );
}
