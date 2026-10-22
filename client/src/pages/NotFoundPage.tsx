import { Link } from "react-router-dom";

export default function NotFoundPage() {
    return (
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
            <p className="text-slate-500">The page you are looking for does not exist.</p>
            <Link to="/" className="rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700">
                Back to the home page
            </Link>
        </div>
    );
}
