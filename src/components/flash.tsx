export function Flash({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <div role="status" className="rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700 dark:text-green-400">
      {msg}
    </div>
  )
}
