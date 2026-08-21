export function Pagination({ meta, onPageChange }) {
  if (!meta || meta.last_page <= 1) return null

  return (
    <div className="mt-4 flex justify-center gap-2">
      <button
        disabled={meta.page <= 1}
        onClick={() => onPageChange(meta.page - 1)}
        className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Previous
      </button>
      <span className="flex items-center px-2 text-sm text-neutral-500">
        {meta.page} / {meta.last_page}
      </span>
      <button
        disabled={meta.page >= meta.last_page}
        onClick={() => onPageChange(meta.page + 1)}
        className="rounded-md border border-neutral-200 px-3 py-1.5 text-sm disabled:opacity-40"
      >
        Next
      </button>
    </div>
  )
}
