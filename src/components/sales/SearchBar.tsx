'use client';

import { useState } from 'react';
import { getPrediction } from '../../lib/searchUtils';

export default function SearchBar({
  onSearch,
  products,
}: {
  onSearch: (term: string) => void;
  products: any[];
}) {
  const [term, setTerm] = useState('');
  const prediction = getPrediction(products, term);
  const displayPrediction = prediction.startsWith(term)
    ? prediction.slice(term.length)
    : '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTerm(value);
    onSearch(value);
  };

  return (
    <div
      style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}
    >
      <div
        style={{
          position: 'absolute',
          top: '0.9rem',
          left: '1.35rem',
          pointerEvents: 'none',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          width: 'calc(100% - 2.7rem)',
        }}
      >
        <span
          style={{
            color: 'transparent',
            font: 'inherit',
            fontSize: '0.9rem',
          }}
        >
          {term}
        </span>
        <span
          style={{
            color: '#a0a0a0',
            font: 'inherit',
            fontSize: '0.9rem',
          }}
        >
          {displayPrediction}
        </span>
      </div>
      <input
        type="text"
        placeholder="Buscar producto..."
        value={term}
        onChange={handleChange}
        style={{
          width: '100%',
          padding: '0.9rem 1.35rem',
          borderRadius: '50px',
          border: '1px solid var(--color-border)',
          backgroundColor: 'transparent', // Make transparent to show prediction
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-soft)',
          fontSize: '0.9rem',
          outline: 'none',
          transition: 'all 0.3s ease',
          boxSizing: 'border-box',
          position: 'relative',
          zIndex: 1,
        }}
      />
    </div>
  );
}
