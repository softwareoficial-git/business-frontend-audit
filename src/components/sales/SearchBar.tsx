'use client';

export default function SearchBar({ onSearch }: { onSearch: (term: string) => void }) {
  return (
    <input
      type="text"
      placeholder="Buscar producto..."
      onChange={(e) => onSearch(e.target.value)}
      style={{
        width: '100%',
        padding: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
      }}
    />
  );
}
