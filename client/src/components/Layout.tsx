import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const linkClass = ({ isActive }: { isActive: boolean }): string =>
    `rounded-lg px-3 py-1.5 text-sm font-medium ${isActive ? "bg-violet-100 text-violet-700" : "text-slate-600 hover:bg-slate-100"}`;

// Navigation shared by every page
export default function Layout() {
    const { session, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = (): void => {
        logout();
        navigate("/admin/login", { replace: true });
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <header className="border-b border-slate-200 bg-white">
                <nav aria-label="Main navigation" className="mx-auto flex max-w-5xl flex-wrap items-center gap-x-2 gap-y-2 px-4 py-3">
                    <span className="mr-auto text-lg font-bold text-slate-900">Help Desk</span>
                    <NavLink to="/" end className={linkClass}>
                        Open a ticket
                    </NavLink>
                    {session === null ? (
                        <NavLink to="/admin/login" className={linkClass}>
                            Admin login
                        </NavLink>
                    ) : (
                        <>
                            <NavLink to="/admin" end className={linkClass}>
                                Dashboard
                            </NavLink>
                            <NavLink to="/admin/tickets" className={linkClass}>
                                Tickets
                            </NavLink>
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                            >
                                Logout ({session.username})
                            </button>
                        </>
                    )}
                </nav>
            </header>

            <main className="mx-auto w-full max-w-5xl px-4 py-8">
                <Outlet />
            </main>
        </div>
    );
}
