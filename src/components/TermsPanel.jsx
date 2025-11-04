// src/components/TermsPanel.jsx - 方案4: 內縮陰影（按下感）
import { useEffect, useMemo, useState, useRef, useCallback } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

export function TermsPanel({ onPickTerm }) {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const [displayCount, setDisplayCount] = useState(100);
  const scrollRef = useRef(null);

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
      .sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));
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

  return (
    <div style={{
      ...ds.createStyles.card(),
      display: 'flex',
      flexDirection: 'column',
      height: 'calc(100vh - 140px)',
      maxHeight: '1200px',
      padding: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50],
        flexShrink: 0
      }}>
        <h2 style={{
          fontSize: ds.fontSize.lg,
          fontWeight: ds.fontWeight.bold,
          color: ds.colors.text.primary,
          margin: 0,
          lineHeight: ds.lineHeight.tight
        }}>
          Terms Library
        </h2>
        <p style={{
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary,
          margin: `${ds.spacing.xs} 0 0 0`,
          fontWeight: ds.fontWeight.medium
        }}>
          {terms.length} available terms
        </p>
      </div>

      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[100]}`,
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', gap: ds.spacing.sm }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <svg 
              style={{
                position: 'absolute',
                left: ds.spacing.md,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: ds.colors.gray[400],
                pointerEvents: 'none'
              }}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search terms..."
              style={{
                ...ds.components.input,
                width: '100%',
                paddingLeft: '36px',
                fontSize: ds.fontSize.sm
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#f9fafb';
                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.06)';
                e.target.style.transform = 'none';
              }}
              onMouseEnter={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = ds.colors.gray[400];
                }
              }}
              onMouseLeave={(e) => {
                if (document.activeElement !== e.target) {
                  e.target.style.borderColor = ds.colors.gray[300];
                }
              }}
              onBlur={(e) => {
                e.target.style.borderColor = ds.colors.gray[300];
                e.target.style.background = '#ffffff';
                e.target.style.boxShadow = 'none';
                e.target.style.transform = 'translateY(0)';
              }}
            />
          </div>
          <button
            onClick={() => setSearch('')}
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
              boxShadow: ds.shadows.sm,
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#fee2e2';
              e.currentTarget.style.borderColor = ds.colors.error;
              e.currentTarget.style.color = ds.colors.error;
              e.currentTarget.style.boxShadow = ds.shadows.md;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ds.colors.gray[100];
              e.currentTarget.style.borderColor = ds.colors.gray[300];
              e.currentTarget.style.color = ds.colors.text.secondary;
              e.currentTarget.style.boxShadow = ds.shadows.sm;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Clear
          </button>
        </div>
      </div>

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
            width: '32px',
            height: '32px',
            border: `3px solid ${ds.colors.primary[200]}`,
            borderTopColor: ds.colors.primary[600],
            borderRadius: ds.borderRadius.full,
            animation: 'spin 0.8s linear infinite'
          }} />
          <p style={{
            color: ds.colors.text.tertiary,
            fontSize: ds.fontSize.sm,
            marginTop: ds.spacing.md,
            fontWeight: ds.fontWeight.medium
          }}>
            Loading terms...
          </p>
        </div>
      )}

      {err && (
        <div style={{
          margin: ds.spacing.xl,
          padding: ds.spacing.lg,
          borderRadius: ds.borderRadius.md,
          border: `1px solid ${ds.colors.error}40`,
          background: `${ds.colors.error}10`,
          color: ds.colors.error,
          fontSize: ds.fontSize.sm,
          flex: 1
        }}>
          <strong style={{ fontWeight: ds.fontWeight.semibold }}>Error:</strong> {err}
        </div>
      )}

      {!loading && !err && (
        <div 
          ref={scrollRef}
          onScroll={handleScroll}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
            minHeight: 0
          }}
        >
          {filtered.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: ds.spacing['2xl'],
              color: ds.colors.text.disabled,
              fontSize: ds.fontSize.sm
            }}>
              {search ? `No terms matching "${search}"` : 'No terms available'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: ds.spacing.xs }}>
              {filtered.slice(0, displayCount).map((t, idx) => (
                <button
                  key={`${t}-${idx}`}
                  onClick={() => {
                    onPickTerm?.(t);
                  }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: `${ds.spacing.sm} ${ds.spacing.md}`,
                    borderRadius: ds.borderRadius.md,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    fontSize: ds.fontSize.sm,
                    fontWeight: ds.fontWeight.medium,
                    color: ds.colors.text.secondary,
                    transition: ds.transitions.fast
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = ds.colors.primary[50];
                    e.currentTarget.style.color = ds.colors.primary[700];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = ds.colors.text.secondary;
                  }}
                >
                  {t}
                </button>
              ))}
              {displayCount < filtered.length && (
                <div style={{
                  textAlign: 'center',
                  padding: ds.spacing.md,
                  color: ds.colors.text.tertiary,
                  fontSize: ds.fontSize.xs
                }}>
                  Scroll down to load more...
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!loading && !err && (
        <div style={{
          padding: `${ds.spacing.md} ${ds.spacing.xl}`,
          borderTop: `1px solid ${ds.colors.gray[100]}`,
          background: ds.colors.gray[50],
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary,
          fontWeight: ds.fontWeight.medium,
          flexShrink: 0
        }}>
          Showing {Math.min(displayCount, filtered.length)} of {filtered.length} {filtered.length === 1 ? 'term' : 'terms'}
          {search && ` matching "${search}"`}
        </div>
      )}

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}