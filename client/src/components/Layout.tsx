import { NavLink, Outlet } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`;

// Navigation shared by every page
export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
                    <span className="mr-auto text-lg font-bold text-slate-900">Help Desk</span>
                    <NavLink to="/" end className={linkClass}>
                        Open a ticket
                    </NavLink>
                </nav>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
