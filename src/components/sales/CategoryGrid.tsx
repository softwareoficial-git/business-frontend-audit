import Icon from '../Icon';

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface CategoryGridProps {
  categories: Category[];
  onSelectCategory: (id: string) => void;
  selectedCategoryId: string | null;
}

export default function CategoryGrid({
  categories,
  onSelectCategory,
  selectedCategoryId,
}: CategoryGridProps) {
  return (
    <div className="categories-area">
      {categories.map((cat) => (
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
            minWidth: '80px',
          }}
        >
          <Icon name={cat.icon} style={{ width: '24px', height: '24px' }} />
          <span
            style={{
              marginTop: 'var(--space-xs)',
              fontSize: '0.8rem',
              fontWeight: 'bold',
            }}
          >
            {cat.name}
          </span>
        </button>
      ))}
    </div>
  );
}
