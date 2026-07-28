export function Button({ className = '', variant = 'default', size = 'md', ...props }) {
  const base = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  };
  const sizes = { sm: 'h-9 px-3 text-sm', md: 'h-10 px-4', lg: 'h-11 px-6 text-base', icon: 'h-10 w-10' };
  const cls = [base, variants[variant] || variants.default, sizes[size] || sizes.md, className].join(' ');
  return <button className={cls} {...props} />;
}
