import React, { useState, createContext, useContext } from 'react';

const SelectContext = createContext(null);

export function Select({ value, onValueChange, children }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative inline-block w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ className = '', children }) {
  const { isOpen, setIsOpen } = useContext(SelectContext);
  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={["flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className].join(' ')}
    >
      {children}
      <span className="ml-2 text-xs text-gray-400">▼</span>
    </button>
  );
}

export function SelectValue({ placeholder }) {
  const { value } = useContext(SelectContext);
  const displayValue = value && value !== 'all' 
    ? value.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : placeholder;
  return <span className="truncate">{displayValue}</span>;
}

export function SelectContent({ className = '', children }) {
  const { isOpen } = useContext(SelectContext);
  if (!isOpen) return null;
  return (
    <div className={["absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none", className].join(' ')}>
      {children}
    </div>
  );
}

export function SelectItem({ value, className = '', children }) {
  const { onValueChange, setIsOpen } = useContext(SelectContext);
  return (
    <div
      onClick={() => {
        onValueChange(value);
        setIsOpen(false);
      }}
      className={["cursor-pointer rounded-sm px-2 py-1.5 text-sm hover:bg-slate-100", className].join(' ')}
    >
      {children}
    </div>
  );
}