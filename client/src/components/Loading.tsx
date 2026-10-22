interface LoadingProps {
    text: string;
}

export default function Loading({ text }: LoadingProps) {
    return (
        <div className="flex items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-violet-600"></span>
            <span>{text}</span>
        </div>
    );
}
