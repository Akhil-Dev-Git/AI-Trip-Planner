export function Alert({ className = '', children }) {
  return (
    <div className={["w-full rounded-md border border-yellow-300 bg-yellow-50 p-4 text-yellow-900", className].join(' ')}>
      {children}
    </div>
  );
}

export function AlertDescription({ className = '', children }) {
  return <div className={["text-sm", className].join(' ')}>{children}</div>;
}


