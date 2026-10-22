import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import NewTicketPage from "./pages/NewTicketPage";
import NotFoundPage from "./pages/NotFoundPage";
import TicketSubmittedPage from "./pages/TicketSubmittedPage";

export default function App() {
    return (
        <Routes>
            <Route element={<Layout />}>
                <Route path="/" element={<NewTicketPage />} />
                <Route path="/ticket-submitted" element={<TicketSubmittedPage />} />
                <Route path="*" element={<NotFoundPage />} />
            </Route>
        </Routes>
    );
}
