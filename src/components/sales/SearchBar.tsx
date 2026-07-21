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
        padding: '0.5rem',
        boxSizing: 'border-box',
      }}
    >
      <input
        type="text"
        placeholder="Buscar producto..."
        onChange={(e) => onSearch(e.target.value)}
        style={{
          width: '100%',
          padding: '0.9rem 1.35rem', // Reducido aproximadamente 10%
          borderRadius: '50px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          fontSize: '0.9rem', // Reducido ligeramente
          outline: 'none',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => {
          e.target.style.boxShadow = '0 0 0 2px var(--color-primary)';
          e.target.style.borderColor = 'transparent';
        }}
        onBlur={(e) => {
          e.target.style.boxShadow =
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
          e.target.style.borderColor = 'var(--color-border)';
        }}
      />
    </div>
  );
}
