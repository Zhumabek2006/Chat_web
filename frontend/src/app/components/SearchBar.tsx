import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search
        className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: 'var(--sp-text-muted)' }}
      />
      <input
        id="sidebar-search"
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="sp-input"
        style={{
          paddingLeft: '44px',
          paddingRight: '16px',
          borderRadius: 'var(--sp-r-full)',
          fontSize: '14px',
        }}
      />
    </div>
  );
}
