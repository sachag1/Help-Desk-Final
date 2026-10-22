import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import type { LoginInput } from "../types/auth";
import { isRecord } from "../types/guards";
import { useAuth } from "../hooks/useAuth";
import { messageOf } from "../utils/errors";
import ErrorMessage from "../components/ErrorMessage";

const DEFAULT_DESTINATION = "/admin";

// Where to go after login: the protected page the visitor wanted, if any
function readDestination(state: unknown): string {
    return isRecord(state) && typeof state.from === "string" && state.from.startsWith("/admin") ? state.from : DEFAULT_DESTINATION;
}

export default function LoginPage() {
    const { session, login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [form, setForm] = useState<LoginInput>({ username: "", password: "" });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    if (session !== null) {
        return <Navigate to={DEFAULT_DESTINATION} replace />;
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>): void => {
        const field = event.target.name as keyof LoginInput;
        const value: string = event.target.value;
        setForm((previous: LoginInput) => ({ ...previous, [field]: value }));
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
        event.preventDefault();
        setError(null);

        if (form.username.trim() === "" || form.password === "") {
            setError("Please enter your username and password.");
            return;
        }

        setIsLoading(true);
        try {
            await login({ username: form.username.trim(), password: form.password });
            navigate(readDestination(location.state), { replace: true });
        } catch (caught: unknown) {
            setError(messageOf(caught, "Login failed"));
            setIsLoading(false);
        }
    };

    const inputClass = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-slate-900 outline-none focus:border-violet-500";

    return (
        <div className="mx-auto max-w-md">
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900">Administrator login</h1>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Username
                    <input name="username" value={form.username} onChange={handleChange} autoComplete="username" className={inputClass} />
                </label>

                <label className="flex flex-col gap-1 text-sm font-medium text-slate-700">
                    Password
                    <input name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" className={inputClass} />
                </label>

                {error !== null && <ErrorMessage message={error} />}

                <button
                    type="submit"
                    disabled={isLoading}
                    className="rounded-lg bg-violet-600 px-5 py-2 font-medium text-white hover:bg-violet-700 disabled:bg-slate-300"
                >
                    {isLoading ? "Logging in..." : "Login"}
                </button>
            </form>
        </div>
    );
}
