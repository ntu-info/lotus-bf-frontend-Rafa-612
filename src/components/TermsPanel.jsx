// src/components/TermsPanel.jsx - Enhanced version with perfect search bar and modern typography
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

export function TermsPanel({ onPickTerm }) {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [displayCount, setDisplayCount] = useState(100);
  const [isFocused, setIsFocused] = useState(false);
  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    let alive = true;
    const ac = new AbortController();
    const load = async () => {
      setLoading(true);
      setErr('');
      try {
        const res = await fetch(`${API_BASE}/terms`, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setTerms(Array.isArray(data?.terms) ? data.terms : []);
      } catch (e) {
        if (!alive) return;
        setErr(`Failed to fetch terms: ${e?.message || e}`);
      } finally {
        if (alive) setLoading(false);
      }
    };
    load();
    return () => { alive = false; ac.abort(); };
  }, []);

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return terms;
    return terms
      .filter(t => t.toLowerCase().includes(s))
      .sort((a, b) => {
        const aLower = a.toLowerCase();
        const bLower = b.toLowerCase();
        const aStarts = aLower.startsWith(s);
        const bStarts = bLower.startsWith(s);
        if (aStarts && !bStarts) return -1;
        if (!aStarts && bStarts) return 1;
        return aLower.localeCompare(bLower);
      });
  }, [terms, search]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      setDisplayCount(prev => Math.min(prev + 50, filtered.length));
    }
  }, [filtered.length]);

  useEffect(() => {
    setDisplayCount(100);
  }, [search]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // ESC to clear search if focused
      if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        e.preventDefault();
        setSearch('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleClear = () => {
    setSearch('');
    inputRef.current?.focus();
  };

  return (
    <div style={{
      ...ds.createStyles.card(),
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 140px)',
      maxHeight: '1200px',
      padding: 0,
      overflow: 'hidden',
      fontFamily: "'Inter', sans-serif"
    }}>
      {/* Header */}
      <div style={{
        padding: `${ds.spacing.md} ${ds.spacing.lg}`,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50],
        flexShrink: 0
      }}>
        <h2 style={{
          fontSize: ds.fontSize.lg,
          fontWeight: 700,
          color: ds.colors.text.primary,
          margin: 0,
          lineHeight: 1.2,
          letterSpacing: '-0.02em'
        }}>
          Terms Library
        </h2>
        <p style={{
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary,
          margin: `${ds.spacing.xs} 0 0 0`,
          fontWeight: 500,
          letterSpacing: '-0.01em'
        }}>
          {terms.length} available terms
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <div style={{
        padding: `${ds.spacing.lg} ${ds.spacing.lg}`,
        borderBottom: `1px solid ${ds.colors.gray[100]}`,
        flexShrink: 0,
        background: ds.colors.background.primary
      }}>
        {/* Search Input Container */}
        <div style={{ 
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
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search terms... (⌘K)"
            style={{
              width: '100%',
              padding: `${ds.spacing.md} ${ds.spacing.md} ${ds.spacing.md} 42px`,
              paddingRight: search ? '40px' : ds.spacing.md,
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
              fontWeight: 500,
              letterSpacing: '-0.01em'
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

          {/* Clear Button (appears when typing) */}
          {search && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setSearch('');
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
                background: isFocused ? ds.colors.gray[100] : 'transparent',
                border: 'none',
                borderRadius: ds.borderRadius.md,
                cursor: 'pointer',
                color: ds.colors.gray[400],
                transition: 'all 150ms ease',
                zIndex: 1,
                opacity: 0.8
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = ds.colors.gray[200];
                e.currentTarget.style.color = ds.colors.gray[600];
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = isFocused ? ds.colors.gray[100] : 'transparent';
                e.currentTarget.style.color = ds.colors.gray[400];
                e.currentTarget.style.opacity = '0.8';
              }}
            >
              <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          padding: ds.spacing['2xl'],
          textAlign: 'center',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: `3px solid ${ds.colors.primary[200]}`,
            borderTopColor: ds.colors.primary[600],
            borderRadius: ds.borderRadius.full,
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            color: ds.colors.text.tertiary,
            fontSize: ds.fontSize.sm,
            marginTop: ds.spacing.lg,
            fontWeight: ds.fontWeight.medium
          }}>
            Loading terms...
          </p>
        </div>
      )}

      {/* Error State */}
      {err && (
        <div style={{
          margin: ds.spacing.xl,
          padding: ds.spacing.lg,
          borderRadius: ds.borderRadius.lg,
          border: `2px solid ${ds.colors.error}40`,
          background: `${ds.colors.error}10`,
          color: ds.colors.error,
          fontSize: ds.fontSize.sm,
          flex: 1
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: ds.spacing.md }}>
            <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <strong style={{ fontWeight: ds.fontWeight.semibold, display: 'block', marginBottom: ds.spacing.xs }}>Error Loading Terms</strong>
              {err}
            </div>
          </div>
        </div>
      )}

      {/* Terms List */}
      {!loading && !err && (
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: `${ds.spacing.md} ${ds.spacing.lg}`,
            minHeight: 0
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: ds.spacing['3xl'],
              animation: 'fadeIn 300ms ease'
            }}>
              <svg
                style={{
                  width: '56px',
                  height: '56px',
                  margin: '0 auto',
                  color: ds.colors.gray[300],
                  marginBottom: ds.spacing.lg
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                />
              </svg>
              <p style={{
                color: ds.colors.text.disabled,
                fontSize: ds.fontSize.base,
                fontWeight: ds.fontWeight.medium,
                marginBottom: ds.spacing.sm
              }}>
                {search ? `No terms matching "${search}"` : 'No terms available'}
              </p>
              <p style={{
                color: ds.colors.text.tertiary,
                fontSize: ds.fontSize.sm
              }}>
                Try adjusting your search or check back later
              </p>
            </div>
          ) : (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: ds.spacing.xs,
              animation: 'fadeIn 200ms ease'
            }}>
              {filtered.slice(0, displayCount).map((t, idx) => (
                <button
                  key={`${t}-${idx}`}
                  onClick={() => onPickTerm?.(t)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: `${ds.spacing.md} ${ds.spacing.lg}`,
                    borderRadius: ds.borderRadius.lg,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: ds.fontSize.sm,
                    fontWeight: 500,
                    color: ds.colors.text.secondary,
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    letterSpacing: '-0.01em'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = ds.colors.primary[50];
                    e.currentTarget.style.color = ds.colors.primary[700];
                    e.currentTarget.style.paddingLeft = `${parseInt(ds.spacing.lg) + 4}px`;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = ds.colors.text.secondary;
                    e.currentTarget.style.paddingLeft = ds.spacing.lg;
                  }}
                >
                  {t}
                </button>
              ))}
              {displayCount < filtered.length && (
                <div style={{
                  textAlign: 'center',
                  padding: ds.spacing.lg,
                  color: ds.colors.text.tertiary,
                  fontSize: ds.fontSize.xs,
                  fontWeight: ds.fontWeight.medium
                }}>
                  <svg 
                    style={{ 
                      width: '16px', 
                      height: '16px', 
                      display: 'inline-block',
                      marginRight: ds.spacing.xs,
                      animation: 'bounce 1s infinite'
                    }} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Scroll down to load more...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Footer Stats */}
      {!loading && !err && (
        <div style={{
          padding: `${ds.spacing.md} ${ds.spacing.xl}`,
          borderTop: `1px solid ${ds.colors.gray[100]}`,
          background: ds.colors.gray[50],
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary,
          fontWeight: 500,
          flexShrink: 0,
          letterSpacing: '-0.01em'
        }}>
          Showing <strong style={{ color: ds.colors.text.secondary }}>{Math.min(displayCount, filtered.length)}</strong> of{' '}
          <strong style={{ color: ds.colors.text.secondary }}>{filtered.length}</strong>{' '}
          {filtered.length === 1 ? 'term' : 'terms'}
          {search && <span style={{ color: ds.colors.primary[600] }}> matching "{search}"</span>}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes fadeIn {
          from { 
            opacity: 0; 
            transform: translateY(-4px);
          }
          to { 
            opacity: 1; 
            transform: translateY(0);
          }
        }
        
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-4px);
          }
        }
      `}</style>
    </div>
  );
}