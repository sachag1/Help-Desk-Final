import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

// Wraps the admin pages: a visitor who is not logged in is sent to the login page
export default function ProtectedRoute() {
    const { session } = useAuth();
    const location = useLocation();

    if (session === null) {
        return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
    }
    return <Outlet />;
}
