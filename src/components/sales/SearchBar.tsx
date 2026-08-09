'use client';

export default function SearchBar({
  onSearch,
}: {
  onSearch: (term: string) => void;
}) {
  return (
    <div
      style={{
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <input
        type="text"
        placeholder="Buscar producto..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.9rem 1.35rem',
          borderRadius: '50px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-soft)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
        }}
      />
    </div>
  );
}
