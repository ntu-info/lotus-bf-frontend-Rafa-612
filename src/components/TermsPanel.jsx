// src/components/TermsPanel.jsx - Redesigned with Design System
import { useEffect, useMemo, useState } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

export function TermsPanel({ onPickTerm }) {
  const [terms, setTerms] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

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

  return (
    <div style={{
      ...ds.createStyles.card(),
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50]
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

      {/* Search Bar */}
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[100]}`
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
                e.target.style.borderColor = ds.colors.primary[500];
                e.target.style.boxShadow = `0 0 0 3px ${ds.colors.primary[100]}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = ds.colors.gray[300];
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <button
            onClick={() => setSearch('')}
            style={{
              ...ds.createStyles.button('secondary'),
              flexShrink: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = ds.colors.gray[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = ds.colors.gray[100];
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div style={{
          padding: ds.spacing['2xl'],
          textAlign: 'center'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: `3px solid ${ds.colors.primary[200]}`,
            borderTopColor: ds.colors.primary[600],
            borderRadius: ds.borderRadius.full,
            margin: '0 auto',
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

      {/* Error State */}
      {err && (
        <div style={{
          margin: ds.spacing.xl,
          padding: ds.spacing.lg,
          borderRadius: ds.borderRadius.md,
          border: `1px solid ${ds.colors.error}40`,
          background: `${ds.colors.error}10`,
          color: ds.colors.error,
          fontSize: ds.fontSize.sm
        }}>
          <strong style={{ fontWeight: ds.fontWeight.semibold }}>Error:</strong> {err}
        </div>
      )}

      {/* Terms List */}
      {!loading && !err && (
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
          minHeight: 0
        }}>
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
              {filtered.slice(0, 500).map((t, idx) => (
                <button
                  key={`${t}-${idx}`}
                  onClick={() => {
                    onPickTerm?.(t);
                    setSearch(t); // 直接複製到 search bar
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
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {!loading && !err && (
        <div style={{
          padding: `${ds.spacing.md} ${ds.spacing.xl}`,
          borderTop: `1px solid ${ds.colors.gray[100]}`,
          background: ds.colors.gray[50],
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary,
          fontWeight: ds.fontWeight.medium
        }}>
          {filtered.length} {filtered.length === 1 ? 'term' : 'terms'}
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