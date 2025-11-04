// src/components/RelatedTerms.jsx - Enhanced version with perfect design
import { useEffect, useState, useMemo } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

export function RelatedTerms({ query, onSelectTerm }) {
  const [relatedTerms, setRelatedTerms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedTargetTerm, setSelectedTargetTerm] = useState('');
  const [sortBy, setSortBy] = useState('count');

  const queryTerms = useMemo(() => {
    if (!query) return [];
    const terms = query
      .replace(/\(|\)/g, ' ')
      .split(/\s+/)
      .filter(term => term && !['AND', 'OR', 'NOT', 'and', 'or', 'not'].includes(term))
      .map(term => term.trim());
    return [...new Set(terms)];
  }, [query]);

  useEffect(() => {
    if (queryTerms.length > 0 && !queryTerms.includes(selectedTargetTerm)) {
      setSelectedTargetTerm(queryTerms[0]);
    } else if (queryTerms.length === 0) {
      // Clear selected term when query is empty
      setSelectedTargetTerm('');
      setRelatedTerms([]);
    }
  }, [queryTerms, selectedTargetTerm]);

  useEffect(() => {
    if (!selectedTargetTerm) {
      setRelatedTerms([]);
      setLoading(false);
      setError('');
      return;
    }

    let alive = true;
    const ac = new AbortController();

    const fetchRelatedTerms = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_BASE}/terms/${encodeURIComponent(selectedTargetTerm)}`;
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        
        const items = Array.isArray(data) ? data : (data.related || []);
        setRelatedTerms(items);
      } catch (e) {
        if (!alive) return;
        setError(`Failed to fetch related terms: ${e?.message || e}`);
        setRelatedTerms([]);
      } finally {
        if (alive) setLoading(false);
      }
    };

    fetchRelatedTerms();
    return () => { alive = false; ac.abort(); };
  }, [selectedTargetTerm]);

  const sortedTerms = useMemo(() => {
    if (!relatedTerms.length) return [];
    const sorted = [...relatedTerms];
    if (sortBy === 'count') {
      sorted.sort((a, b) => (b.co_count || 0) - (a.co_count || 0));
    } else if (sortBy === 'jaccard') {
      sorted.sort((a, b) => (b.jaccard || 0) - (a.jaccard || 0));
    }
    return sorted;
  }, [relatedTerms, sortBy]);

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
        <h2 style={{
          fontSize: ds.fontSize.lg,
          fontWeight: ds.fontWeight.bold,
          color: ds.colors.text.primary,
          margin: 0,
          lineHeight: ds.lineHeight.tight
        }}>
          Related Terms
        </h2>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: ds.spacing.xs
        }}>
          <p style={{
            fontSize: ds.fontSize.xs,
            color: ds.colors.text.tertiary,
            margin: 0,
            fontWeight: ds.fontWeight.medium
          }}>
            {relatedTerms.length} related terms found
          </p>
          
          {/* Sort Options */}
          {selectedTargetTerm && !loading && sortedTerms.length > 0 && (
            <div style={{
              display: 'flex',
              gap: ds.spacing.xs,
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: ds.fontSize.xs,
                color: ds.colors.text.tertiary,
                fontWeight: ds.fontWeight.semibold,
                marginRight: ds.spacing.xs
              }}>
                Sort by:
              </span>
              {['count', 'jaccard'].map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  style={{
                    padding: `${ds.spacing.xs} ${ds.spacing.md}`,
                    background: sortBy === option 
                      ? (option === 'count' ? '#ffedd5' : ds.colors.primary[100])
                      : ds.colors.background.primary,
                    color: sortBy === option 
                      ? (option === 'count' ? '#c2410c' : ds.colors.primary[700])
                      : ds.colors.text.secondary,
                    border: `1.5px solid ${sortBy === option 
                      ? (option === 'count' ? '#fb923c' : ds.colors.primary[400])
                      : ds.colors.gray[300]}`,
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.xs,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={(e) => {
                    if (sortBy !== option) {
                      e.currentTarget.style.background = ds.colors.gray[50];
                      e.currentTarget.style.borderColor = ds.colors.gray[400];
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (sortBy !== option) {
                      e.currentTarget.style.background = ds.colors.background.primary;
                      e.currentTarget.style.borderColor = ds.colors.gray[300];
                    }
                  }}
                >
                  {option === 'count' ? 'Co-count' : 'Jaccard Index'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: `${ds.spacing.lg} ${ds.spacing.lg}` }}>
        {/* Term Selector Pills */}
        {queryTerms.length > 0 && (
          <div style={{ marginBottom: ds.spacing.lg }}>
            <div style={{
              display: 'flex',
              gap: ds.spacing.xs,
              flexWrap: 'wrap',
              alignItems: 'center'
            }}>
              <span style={{
                fontSize: ds.fontSize.xs,
                color: ds.colors.text.tertiary,
                fontWeight: ds.fontWeight.semibold,
                marginRight: ds.spacing.xs
              }}>
                Show related terms for:
              </span>
              {queryTerms.map((term, idx) => (
                <button
                  key={`${term}-${idx}`}
                  onClick={() => setSelectedTargetTerm(term)}
                  style={{
                    padding: `${ds.spacing.xs} ${ds.spacing.md}`,
                    background: selectedTargetTerm === term
                      ? `linear-gradient(135deg, ${ds.colors.primary[500]}, ${ds.colors.primary[600]})`
                      : ds.colors.background.primary,
                    color: selectedTargetTerm === term 
                      ? ds.colors.text.inverse 
                      : ds.colors.text.secondary,
                    border: selectedTargetTerm === term
                      ? 'none'
                      : `1.5px solid ${ds.colors.gray[300]}`,
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.xs,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                    boxShadow: selectedTargetTerm === term 
                      ? `0 2px 8px ${ds.colors.primary[200]}` 
                      : '0 1px 2px 0 rgba(0, 0, 0, 0.04)',
                    transform: selectedTargetTerm === term ? 'translateY(-1px)' : 'none',
                    letterSpacing: '0.3px'
                  }}
                  onMouseEnter={(e) => {
                    if (selectedTargetTerm !== term) {
                      e.currentTarget.style.background = ds.colors.primary[50];
                      e.currentTarget.style.borderColor = ds.colors.primary[400];
                      e.currentTarget.style.color = ds.colors.primary[700];
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 2px 4px 0 rgba(0, 0, 0, 0.08)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedTargetTerm !== term) {
                      e.currentTarget.style.background = ds.colors.background.primary;
                      e.currentTarget.style.borderColor = ds.colors.gray[300];
                      e.currentTarget.style.color = ds.colors.text.secondary;
                      e.currentTarget.style.transform = 'none';
                      e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.04)';
                    }
                  }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {queryTerms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: ds.spacing['3xl']
          }}>
            <svg
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto',
                color: ds.colors.gray[300],
                marginBottom: ds.spacing.lg
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <p style={{
              color: ds.colors.text.disabled,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              Enter a query in the Query Builder to see related terms
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: ds.spacing['2xl']
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
              marginLeft: ds.spacing.md,
              fontWeight: ds.fontWeight.medium
            }}>
              Loading related terms...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div style={{
            padding: ds.spacing.lg,
            borderRadius: ds.borderRadius.lg,
            border: `2px solid ${ds.colors.error}40`,
            background: `${ds.colors.error}10`,
            color: ds.colors.error,
            fontSize: ds.fontSize.sm
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: ds.spacing.md }}>
              <svg style={{ width: '20px', height: '20px', flexShrink: 0 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <strong style={{ fontWeight: ds.fontWeight.semibold, display: 'block', marginBottom: ds.spacing.xs }}>Error Loading Terms</strong>
                {error}
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {selectedTargetTerm && !loading && !error && sortedTerms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: ds.spacing['2xl']
          }}>
            <svg
              style={{
                width: '48px',
                height: '48px',
                margin: '0 auto',
                color: ds.colors.gray[300],
                marginBottom: ds.spacing.lg
              }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p style={{
              color: ds.colors.text.disabled,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              No related terms found for "{selectedTargetTerm}"
            </p>
          </div>
        )}

        {/* Related Terms List */}
        {selectedTargetTerm && !loading && !error && sortedTerms.length > 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: ds.spacing.xs,
            maxHeight: '130px',
            overflowY: 'auto',
            paddingRight: ds.spacing.xs
          }}>
            {sortedTerms.map((item, idx) => (
              <button
                key={`${item.term}-${idx}`}
                onClick={() => onSelectTerm?.(item.term)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: `${ds.spacing.sm} ${ds.spacing.md}`,
                  background: 'transparent',
                  border: 'none',
                  borderRadius: ds.borderRadius.md,
                  cursor: 'pointer',
                  transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                  textAlign: 'left',
                  gap: ds.spacing.md
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ds.colors.primary[50];
                  e.currentTarget.style.transform = 'translateX(4px)';
                  // Enhance badges on hover
                  const badges = e.currentTarget.querySelectorAll('[data-badge]');
                  badges[0].style.transform = 'scale(1.05)';
                  badges[1].style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.transform = 'translateX(0)';
                  // Reset badges
                  const badges = e.currentTarget.querySelectorAll('[data-badge]');
                  badges[0].style.transform = 'scale(1)';
                  badges[1].style.transform = 'scale(1)';
                }}
              >
                <span style={{
                  fontSize: ds.fontSize.sm,
                  fontWeight: ds.fontWeight.medium,
                  color: ds.colors.text.secondary,
                  flex: 1,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  minWidth: 0
                }}>
                  {item.term}
                </span>
                <div style={{
                  display: 'flex',
                  gap: ds.spacing.xs,
                  alignItems: 'center',
                  flexShrink: 0
                }}>
                  {/* Show Co-count first when sorting by count, Jaccard first when sorting by jaccard */}
                  {sortBy === 'count' ? (
                    <>
                      <span
                        data-badge
                        style={{
                          fontSize: ds.fontSize.xs,
                          fontWeight: ds.fontWeight.semibold,
                          color: '#c2410c',
                          background: '#ffedd5',
                          padding: `${ds.spacing.xs} ${ds.spacing.sm}`,
                          borderRadius: ds.borderRadius.md,
                          minWidth: '44px',
                          textAlign: 'center',
                          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '1px solid #fed7aa'
                        }}
                      >
                        {item.co_count || 0}
                      </span>
                      <span
                        data-badge
                        style={{
                          fontSize: ds.fontSize.xs,
                          fontWeight: ds.fontWeight.semibold,
                          color: ds.colors.primary[700],
                          background: ds.colors.primary[50],
                          padding: `${ds.spacing.xs} ${ds.spacing.sm}`,
                          borderRadius: ds.borderRadius.md,
                          minWidth: '52px',
                          textAlign: 'center',
                          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                          border: `1px solid ${ds.colors.primary[100]}`
                        }}
                      >
                        {item.jaccard ? item.jaccard.toFixed(3) : '0.000'}
                      </span>
                    </>
                  ) : (
                    <>
                      <span
                        data-badge
                        style={{
                          fontSize: ds.fontSize.xs,
                          fontWeight: ds.fontWeight.semibold,
                          color: ds.colors.primary[700],
                          background: ds.colors.primary[50],
                          padding: `${ds.spacing.xs} ${ds.spacing.sm}`,
                          borderRadius: ds.borderRadius.md,
                          minWidth: '52px',
                          textAlign: 'center',
                          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                          border: `1px solid ${ds.colors.primary[100]}`
                        }}
                      >
                        {item.jaccard ? item.jaccard.toFixed(3) : '0.000'}
                      </span>
                      <span
                        data-badge
                        style={{
                          fontSize: ds.fontSize.xs,
                          fontWeight: ds.fontWeight.semibold,
                          color: '#c2410c',
                          background: '#ffedd5',
                          padding: `${ds.spacing.xs} ${ds.spacing.sm}`,
                          borderRadius: ds.borderRadius.md,
                          minWidth: '44px',
                          textAlign: 'center',
                          transition: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
                          border: '1px solid #fed7aa'
                        }}
                      >
                        {item.co_count || 0}
                      </span>
                    </>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}