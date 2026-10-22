import { useTickets } from "./hooks/useTickets";
import Loading from "./components/Loading";
import ErrorMessage from "./components/ErrorMessage";

export default function App() {
    const { tickets, isLoading, error } = useTickets();

    return (
        <div className="mx-auto max-w-4xl px-4 py-10">
            <h1 className="mb-6 text-3xl font-bold text-slate-900">Help Desk</h1>
            {isLoading && <Loading text="Loading tickets..." />}
            {error !== null && <ErrorMessage message={error} />}
            {!isLoading && error === null && tickets.length === 0 && <p className="text-slate-500">No support tickets were found.</p>}
            <ul className="flex flex-col gap-3">
                {tickets.map((ticket) => (
                    <li key={ticket.id} className="rounded-xl border border-slate-200 bg-white p-4">
                        <p className="font-semibold text-slate-900">{ticket.title}</p>
                        <p className="text-sm text-slate-500">{ticket.fullName} - {ticket.category} - {ticket.priority} - {ticket.status}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}
