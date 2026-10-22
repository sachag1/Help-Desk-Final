interface StatCardProps {
    label: string;
    value: number;
    tone?: "default" | "warning" | "danger" | "success";
}

const TONES: Record<NonNullable<StatCardProps["tone"]>, string> = {
    default: "text-slate-900",
    warning: "text-amber-600",
    danger: "text-red-600",
    success: "text-green-600"
};

export default function StatCard({ label, value, tone = "default" }: StatCardProps) {
    return (
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className={`text-3xl font-bold ${TONES[tone]}`}>{value}</p>
            <p className="text-sm text-slate-500">{label}</p>
        </div>
    );
}
