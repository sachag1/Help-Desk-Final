import { useState } from "react";
import { exportTicketsCsv } from "../services/ticketsApi";
import type { CsvFile } from "../services/ticketsApi";
import { saveBlob } from "../utils/download";
import { messageOf } from "../utils/errors";
import ErrorMessage from "./ErrorMessage";

// Downloads every ticket as a CSV file from the protected export endpoint
export default function ExportCsvButton() {
    const [isExporting, setIsExporting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleExport = async (): Promise<void> => {
        setIsExporting(true);
        setError(null);
        try {
            const file: CsvFile = await exportTicketsCsv();
            saveBlob(file.blob, file.filename);
        } catch (caught: unknown) {
            setError(`CSV export failed: ${messageOf(caught, "unknown error")}`);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col items-start gap-2 sm:items-end">
            <button
                type="button"
                onClick={() => void handleExport()}
                disabled={isExporting}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:bg-slate-300"
            >
                {isExporting ? "Exporting..." : "Export CSV"}
            </button>
            {error !== null && <ErrorMessage message={error} />}
        </div>
    );
}
