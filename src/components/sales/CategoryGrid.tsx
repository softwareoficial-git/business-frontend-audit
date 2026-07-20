import { MOCK_CATEGORIES } from './data';
import Icon from '../Icon';

interface CategoryGridProps {
  onSelectCategory: (id: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({
  onSelectCategory,
  selectedCategoryId,
}: CategoryGridProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
        gap: 'var(--space-md)',
        padding: 'var(--space-md)',
      }}
    >
      {MOCK_CATEGORIES.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id)}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-md)',
            borderRadius: 'var(--radius-md)',
            border: `2px solid ${selectedCategoryId === cat.id ? 'var(--color-primary)' : 'var(--color-border)'}`,
            background: 'var(--color-background)',
            color:
              selectedCategoryId === cat.id
                ? 'var(--color-primary)'
                : 'var(--color-text)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Icon name={cat.icon} style={{ width: '32px', height: '32px' }} />
          <span style={{ marginTop: 'var(--space-xs)', fontWeight: 'bold' }}>
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}
