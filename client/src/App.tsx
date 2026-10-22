import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NewTicketPage from "./pages/NewTicketPage";
import NotFoundPage from "./pages/NotFoundPage";
import TicketsPage from "./pages/TicketsPage";
import TicketSubmittedPage from "./pages/TicketSubmittedPage";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<NewTicketPage />} />
                <Route path="/ticket-submitted" element={<TicketSubmittedPage />} />
                <Route path="/admin/login" element={<LoginPage />} />
                <Route element={<ProtectedRoute />}>
                    <Route path="/admin" element={<DashboardPage />} />
                    <Route path="/admin/tickets" element={<TicketsPage />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
