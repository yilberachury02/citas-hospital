'use client';

export default function AlertMessage({ type = 'error', message, onClose }) {
  if (!message) return null;

  const isError = type === 'error';
  const isSuccess = type === 'success';

  return (
    <div
      className={`p-4 rounded-xl border flex items-start justify-between gap-3 text-sm animate-fadeIn ${
        isError
          ? 'bg-rose-50 border-rose-200 text-rose-800'
          : isSuccess
          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
          : 'bg-blue-50 border-blue-200 text-blue-800'
      }`}
    >
      <div className="flex items-start gap-2.5">
        <span className="text-base select-none mt-0.5">
          {isError ? '⚠️' : isSuccess ? '✅' : 'ℹ️'}
        </span>
        <span className="font-medium leading-relaxed">{message}</span>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 font-bold px-1 transition"
          aria-label="Cerrar"
        >
          ✕
        </button>
      )}
    </div>
  );
}
