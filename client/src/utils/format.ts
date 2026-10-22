// Readable local date and time for an ISO date string
export function formatDateTime(iso: string): string {
    const date: Date = new Date(iso);
    if (Number.isNaN(date.getTime())) {
        return iso;
    }
    return date.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}
