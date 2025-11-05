// src/components/QueryBuilderModern.jsx - Enhanced with coordinate query hints
import { useRef, useState } from 'react';
import ds from '../styles/designSystem';

export function QueryBuilder({ query, setQuery }) {
  const [isFocused, setIsFocused] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef(null);

  const handleOperator = (op) => {
    setQuery(prev => prev ? `${prev} ${op}` : op);
    // Focus back on input after clicking operator
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
    // ESC to clear
    if (e.key === 'Escape') {
      e.preventDefault();
      setQuery('');
    }
  };

  // Keyboard shortcuts
  const handleGlobalKeyDown = (e) => {
    // Cmd/Ctrl + / to focus query builder
    if ((e.metaKey || e.ctrlKey) && e.key === '/') {
      e.preventDefault();
      inputRef.current?.focus();
    }
  };

  // Add global keyboard listener
  useState(() => {
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  });

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: `${ds.spacing.md} ${ds.spacing.lg}`,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50],
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
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
          
          {/* Hint Toggle Button */}
          <button
            onClick={() => setShowHint(!showHint)}
            style={{
              padding: `${ds.spacing.xs} ${ds.spacing.sm}`,
              background: showHint ? ds.colors.primary[100] : ds.colors.background.primary,
              color: showHint ? ds.colors.primary[700] : ds.colors.text.secondary,
              border: `1.5px solid ${showHint ? ds.colors.primary[300] : ds.colors.gray[300]}`,
              borderRadius: ds.borderRadius.md,
              fontSize: ds.fontSize.xs,
              fontWeight: ds.fontWeight.semibold,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              gap: ds.spacing.xs
            }}
            onMouseEnter={(e) => {
              if (!showHint) {
                e.currentTarget.style.background = ds.colors.gray[100];
                e.currentTarget.style.borderColor = ds.colors.gray[400];
              }
            }}
            onMouseLeave={(e) => {
              if (!showHint) {
                e.currentTarget.style.background = ds.colors.background.primary;
                e.currentTarget.style.borderColor = ds.colors.gray[300];
              }
            }}
          >
            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Hints
          </button>
        </div>
      </div>

      {/* Hint Panel - 展開時顯示 */}
      {showHint && (
        <div style={{
          padding: ds.spacing.lg,
          background: ds.colors.primary[25],
          borderBottom: `1px solid ${ds.colors.primary[100]}`,
          fontSize: ds.fontSize.sm,
          color: ds.colors.text.secondary
        }}>
          <div style={{ marginBottom: ds.spacing.md }}>
            <strong style={{ color: ds.colors.primary[700] }}>Basic Operators:</strong>
            <ul style={{ margin: `${ds.spacing.xs} 0 0 0`, paddingLeft: ds.spacing.lg }}>
              <li><code>emotion AND memory</code> - Both terms must appear</li>
              <li><code>emotion OR memory</code> - Either term can appear</li>
              <li><code>emotion NOT anxiety</code> - Must have emotion but not anxiety</li>
            </ul>
          </div>
          
          <div style={{ marginBottom: ds.spacing.md }}>
            <strong style={{ color: ds.colors.primary[700] }}>Using Parentheses () for Complex Queries:</strong>
            <ul style={{ margin: `${ds.spacing.xs} 0 0 0`, paddingLeft: ds.spacing.lg }}>
              <li><code>emotion AND (amygdala OR hippocampus)</code> - Emotion with either brain region</li>
              <li><code>emotion AND (amygdala NOT frontal cortex)</code> - Emotion and amygdala, but exclude frontal cortex</li>
              <li><code>(fear OR anxiety) AND memory</code> - Either fear or anxiety, combined with memory</li>
            </ul>
          </div>
          
          <div>
            <strong style={{ color: ds.colors.primary[700] }}>Coordinate Search:</strong>
            <ul style={{ margin: `${ds.spacing.xs} 0 0 0`, paddingLeft: ds.spacing.lg }}>
              <li><code>[-22,0,20]</code> - Search near this coordinate (MNI space)</li>
              <li><code>[-22,0,20] NOT emotion</code> - Coordinate but exclude emotion studies</li>
              <li><code>[0,-52,8] AND (memory OR learning)</code> - Coordinate with memory or learning</li>
            </ul>
          </div>
          
          <p style={{ 
            marginTop: ds.spacing.md, 
            fontSize: ds.fontSize.xs, 
            color: ds.colors.text.tertiary,
            fontStyle: 'italic'
          }}>
            💡 Tips: Use parentheses () to group terms and control search logic | Coordinates are in MNI space [x, y, z] format
          </p>
        </div>
      )}
      
      {/* Content */}
      <div style={{ padding: `${ds.spacing.lg} ${ds.spacing.lg}` }}>
        {/* Enhanced Search Input */}
        <div style={{ 
          marginBottom: ds.spacing.md,
          position: 'relative',
          display: 'flex',
          alignItems: 'center'
        }}>
          {/* Search Icon */}
          <svg 
            style={{
              position: 'absolute',
              left: ds.spacing.md,
              width: '18px',
              height: '18px',
              color: isFocused ? ds.colors.primary[500] : ds.colors.gray[400],
              pointerEvents: 'none',
              transition: 'color 200ms ease',
              zIndex: 1
            }}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g., emotion AND (amygdala NOT frontal) | [-22,0,20] (⌘/)"
            style={{
              width: '100%',
              padding: `${ds.spacing.md} ${ds.spacing.md} ${ds.spacing.md} 42px`,
              paddingRight: query ? '40px' : ds.spacing.md,
              borderRadius: ds.borderRadius.md,
              border: `2px solid ${isFocused ? ds.colors.primary[500] : ds.colors.gray[200]}`,
              fontSize: ds.fontSize.sm,
              color: ds.colors.text.primary,
              background: isFocused ? ds.colors.background.primary : ds.colors.gray[50],
              transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
              outline: 'none',
              boxShadow: isFocused 
                ? `0 0 0 3px ${ds.colors.primary[50]}, 0 1px 2px 0 rgba(0, 0, 0, 0.05)`
                : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
              fontWeight: ds.fontWeight.medium
            }}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onMouseEnter={(e) => {
              if (!isFocused) {
                e.target.style.borderColor = ds.colors.gray[300];
                e.target.style.background = ds.colors.background.primary;
              }
            }}
            onMouseLeave={(e) => {
              if (!isFocused) {
                e.target.style.borderColor = ds.colors.gray[200];
                e.target.style.background = ds.colors.gray[50];
              }
            }}
          />

          {/* Clear Button */}
          {query && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setQuery('');
                inputRef.current?.focus();
              }}
              style={{
                position: 'absolute',
                right: ds.spacing.sm,
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isFocused ? ds.colors.gray[200] : ds.colors.gray[100],
                border: 'none',
                borderRadius: ds.borderRadius.full,
                color: ds.colors.text.secondary,
                cursor: 'pointer',
                transition: 'all 150ms ease',
                zIndex: 2
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ds.colors.gray[300];
                e.currentTarget.style.color = ds.colors.text.primary;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isFocused ? ds.colors.gray[200] : ds.colors.gray[100];
                e.currentTarget.style.color = ds.colors.text.secondary;
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Operator Buttons */}
        <div style={{
          display: 'flex',
          gap: ds.spacing.sm,
          flexWrap: 'wrap'
        }}>
          {['AND', 'OR', 'NOT', '(', ')'].map((op) => (
            <button
              key={op}
              onClick={() => handleOperator(op)}
              style={{
                flex: op === '(' || op === ')' ? '0 0 36px' : '0 0 56px',
                padding: `${ds.spacing.xs} ${ds.spacing.md}`,
                background: ds.colors.background.primary,
                color: ds.colors.text.secondary,
                border: `1.5px solid ${ds.colors.gray[300]}`,
                borderRadius: ds.borderRadius.md,
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.semibold,
                cursor: 'pointer',
                transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ds.colors.primary[50];
                e.currentTarget.style.borderColor = ds.colors.primary[400];
                e.currentTarget.style.color = ds.colors.primary[700];
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = ds.colors.background.primary;
                e.currentTarget.style.borderColor = ds.colors.gray[300];
                e.currentTarget.style.color = ds.colors.text.secondary;
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.04)';
              }}
              onMouseDown={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'inset 0 1px 2px 0 rgba(0, 0, 0, 0.1)';
              }}
              onMouseUp={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.08)';
              }}
            >
              {op}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}