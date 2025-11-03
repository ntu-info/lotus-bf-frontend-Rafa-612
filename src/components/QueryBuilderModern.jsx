// src/components/QueryBuilderModern.jsx - Updated with blue background header/
import ds from '../styles/designSystem';

export function QueryBuilder({ query, setQuery }) {
  const handleOperator = (op) => {
    setQuery(prev => prev ? `${prev} ${op}` : op);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header - 添加淡藍色背景 */}
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50]
      }}>
        <div>
          <h2 style={{
            fontSize: ds.fontSize.lg,
            fontWeight: ds.fontWeight.bold,
            color: ds.colors.text.primary,
            margin: 0,
            lineHeight: ds.lineHeight.tight
          }}>
            Query Builder
          </h2>
          <p style={{
            fontSize: ds.fontSize.xs,
            color: ds.colors.text.tertiary,
            margin: `${ds.spacing.xs} 0 0 0`,
            fontWeight: ds.fontWeight.medium
          }}>
            Build complex search queries
          </p>
        </div>
      </div>
      
      {/* Content */}
      <div style={{ padding: ds.spacing.xl }}>
        {/* Input */}
        <div style={{ marginBottom: ds.spacing.lg }}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., emotion AND memory NOT anxiety"
            style={{
              ...ds.components.input,
              width: '100%',
              padding: `${ds.spacing.md} ${ds.spacing.lg}`,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.normal
            }}
            onFocus={(e) => {
              e.target.style.borderColor = ds.colors.primary[500];
              e.target.style.boxShadow = `0 0 0 3px ${ds.colors.primary[100]}`;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = ds.colors.gray[300];
              e.target.style.boxShadow = 'none';
            }}
          />
        </div>

        {/* Operators */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: ds.spacing.sm,
          marginBottom: ds.spacing.lg
        }}>
          {['AND', 'OR', 'NOT', '(', ')'].map(op => (
            <button
              key={op}
              onClick={() => handleOperator(op)}
              style={{
                minWidth: op === '(' || op === ')' ? '48px' : '72px',
                padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                background: ds.colors.background.primary,
                color: ds.colors.text.primary,
                border: `1.5px solid ${ds.colors.gray[300]}`,
                borderRadius: ds.borderRadius.md,
                fontSize: ds.fontSize.sm,
                fontWeight: ds.fontWeight.semibold,
                cursor: 'pointer',
                transition: ds.transitions.fast,
                boxShadow: ds.shadows.sm
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ds.colors.gray[50];
                e.currentTarget.style.borderColor = ds.colors.primary[500];
                e.currentTarget.style.color = ds.colors.primary[700];
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = ds.shadows.md;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ds.colors.background.primary;
                e.currentTarget.style.borderColor = ds.colors.gray[300];
                e.currentTarget.style.color = ds.colors.text.primary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = ds.shadows.sm;
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {op}
            </button>
          ))}
          <button
            onClick={() => setQuery('')}
            style={{
              minWidth: '72px',
              padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
              background: ds.colors.gray[100],
              color: ds.colors.text.secondary,
              border: `1.5px solid ${ds.colors.gray[300]}`,
              borderRadius: ds.borderRadius.md,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.semibold,
              cursor: 'pointer',
              transition: ds.transitions.fast,
              boxShadow: ds.shadows.sm
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ds.colors.gray[200];
              e.currentTarget.style.borderColor = ds.colors.gray[400];
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = ds.shadows.md;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ds.colors.gray[100];
              e.currentTarget.style.borderColor = ds.colors.gray[300];
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = ds.shadows.sm;
            }}
          >
            Reset
          </button>
        </div>

        {/* Tip */}
        <div style={{
          padding: ds.spacing.md,
          borderRadius: ds.borderRadius.md,
          background: ds.colors.primary[50],
          border: `1px solid ${ds.colors.primary[100]}`,
          fontSize: ds.fontSize.xs,
          color: ds.colors.primary[700],
          lineHeight: ds.lineHeight.relaxed
        }}>
          <strong style={{ fontWeight: ds.fontWeight.semibold }}>💡 Tip:</strong> Use the operators above (AND, OR, NOT, parentheses) to build complex queries
        </div>
      </div>
    </div>
  );
}