export function Label({ className = '', children, htmlFor }) {
  return (
    <label
      htmlFor={htmlFor}
      className={[
        'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
        className,
      ].join(' ')}
    >
      {children}
    </label>
  );
}


