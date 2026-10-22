import { PublicTicket } from "../type/ticket";

interface CsvColumn {
    header: string;
    read: (ticket: PublicTicket) => string;
}

// Column order of the exported file
const COLUMNS: readonly CsvColumn[] = [
    { header: "Ticket ID", read: (ticket: PublicTicket) => ticket.id },
    { header: "Title", read: (ticket: PublicTicket) => ticket.title },
    { header: "Customer Name", read: (ticket: PublicTicket) => ticket.fullName },
    { header: "Email", read: (ticket: PublicTicket) => ticket.email },
    { header: "Phone", read: (ticket: PublicTicket) => ticket.phone },
    { header: "Category", read: (ticket: PublicTicket) => ticket.category },
    { header: "Priority", read: (ticket: PublicTicket) => ticket.priority },
    { header: "Status", read: (ticket: PublicTicket) => ticket.status },
    { header: "Description", read: (ticket: PublicTicket) => ticket.description },
    { header: "Created At", read: (ticket: PublicTicket) => ticket.createdAt },
    { header: "Updated At", read: (ticket: PublicTicket) => ticket.updatedAt }
];

const FORMULA_START: RegExp = /^[=+\-@\t\r]/;
const INTERNATIONAL_PHONE: RegExp = /^\+\d[\d\s\-()]*$/;

// Quotes the value and neutralises spreadsheet formulas typed by customers (CSV injection)
function toCell(value: string): string {
    const safe: string = FORMULA_START.test(value) && !INTERNATIONAL_PHONE.test(value) ? `'${value}` : value;
    return `"${safe.replace(/"/g, '""')}"`;
}

export function ticketsToCsv(tickets: PublicTicket[]): string {
    const lines: string[] = [COLUMNS.map((column: CsvColumn) => toCell(column.header)).join(",")];
    for (const ticket of tickets) {
        lines.push(COLUMNS.map((column: CsvColumn) => toCell(column.read(ticket))).join(","));
    }
    // The BOM lets Excel open the file as UTF-8
    return `﻿${lines.join("\r\n")}\r\n`;
}
