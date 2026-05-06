"use client";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "확인",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
      <div className="w-full max-w-sm rounded-lg border border-[var(--app-line)] bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">{description}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[var(--app-line)] px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-lg bg-[var(--proto-brand)] px-3 py-2 text-sm font-semibold text-white hover:bg-[var(--proto-brand-dark)]"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
