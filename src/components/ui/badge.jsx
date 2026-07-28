export function Badge({ className = '', children }) {
  return <span className={["inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold", className].join(' ')}>{children}</span>;
}
