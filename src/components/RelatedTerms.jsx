// src/components/RelatedTerms.jsx - Fixed version
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
    }
  }, [queryTerms, selectedTargetTerm]);

  useEffect(() => {
    if (!selectedTargetTerm) {
      setRelatedTerms([]);
      return;
    }

    let alive = true;
    const ac = new AbortController();

    const fetchRelatedTerms = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_BASE}/terms/${encodeURIComponent(selectedTargetTerm)}`;
        console.log('=== Fetching Related Terms ===');
        console.log('URL:', url);
        
        const res = await fetch(url, { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        
        console.log('=== Raw API Response ===');
        console.log('Full data:', JSON.stringify(data, null, 2));
        console.log('Type of data:', typeof data);
        console.log('Is array?', Array.isArray(data));
        
        let related = [];
        if (Array.isArray(data?.related)) {
          related = data.related;
          console.log('Found data.related (array)');
        } else if (Array.isArray(data?.terms)) {
          related = data.terms;
          console.log('Found data.terms (array)');
        } else if (Array.isArray(data)) {
          related = data;
          console.log('Data is array');
        } else {
          console.log('Unknown data format, checking all keys:', Object.keys(data || {}));
        }
        
        console.log('=== Parsed Related Terms ===');
        console.log('Number of terms:', related.length);
        if (related.length > 0) {
          console.log('First item:', JSON.stringify(related[0], null, 2));
          console.log('First item keys:', Object.keys(related[0]));
          console.log('First item count field:', related[0].count);
          console.log('First item co_occurrence field:', related[0].co_occurrence);
          console.log('First item frequency field:', related[0].frequency);
          console.log('First item all numeric fields:', 
            Object.entries(related[0])
              .filter(([k, v]) => typeof v === 'number')
              .map(([k, v]) => `${k}: ${v}`)
          );
        }
        
        setRelatedTerms(related);
      } catch (e) {
        if (!alive) return;
        console.error('=== Fetch Error ===', e);
        setError(`Failed to fetch related terms: ${e?.message || e}`);
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
      sorted.sort((a, b) => {
        const countA = Number(a.co_count) || Number(a.count) || Number(a.co_occurrence) || Number(a.frequency) || 0;
        const countB = Number(b.co_count) || Number(b.count) || Number(b.co_occurrence) || Number(b.frequency) || 0;
        console.log(`Sorting by count: ${a.term}=${countA}, ${b.term}=${countB}`);
        return countB - countA;
      });
    } else {
      sorted.sort((a, b) => {
        const jA = Number(a.jaccard) || Number(a.jaccard_score) || Number(a.similarity) || 0;
        const jB = Number(b.jaccard) || Number(b.jaccard_score) || Number(b.similarity) || 0;
        return jB - jA;
      });
    }
    return sorted;
  }, [relatedTerms, sortBy]);

  const getCount = (item) => {
    console.log('Getting count for:', item.term, 'Raw item:', item);
    const count = item.co_count ?? item.count ?? item.co_occurrence ?? item.frequency ?? item.n ?? item.num;
    console.log('  count field:', item.count);
    console.log('  co_occurrence field:', item.co_occurrence);
    console.log('  frequency field:', item.frequency);
    console.log('  Final count value:', count);
    return count !== undefined && count !== null ? count : 'N/A';
  };

  const getJaccard = (item) => {
    const jaccard = item.jaccard ?? item.jaccard_score ?? item.similarity ?? item.j;
    if (jaccard === undefined || jaccard === null) return 'N/A';
    return typeof jaccard === 'number' ? jaccard.toFixed(3) : jaccard;
  };

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50]
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: ds.spacing.lg
        }}>
          {/* Title and Sort by - same row */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: ds.spacing.lg
          }}>
            <div style={{ flex: 1 }}>
              <h2 style={{
                fontSize: ds.fontSize.lg,
                fontWeight: ds.fontWeight.bold,
                color: ds.colors.text.primary,
                margin: 0,
                lineHeight: ds.lineHeight.tight
              }}>
                Related Terms
              </h2>
              <p style={{
                fontSize: ds.fontSize.xs,
                color: ds.colors.text.tertiary,
                margin: `${ds.spacing.xs} 0 0 0`,
                fontWeight: ds.fontWeight.medium
              }}>
                {queryTerms.length > 0 ? `Explore related terms` : 'Enter a query to see related terms'}
              </p>
            </div>

            {/* Sort by on the right */}
            {queryTerms.length > 0 && (
              <div style={{
                display: 'flex',
                gap: ds.spacing.xs,
                background: ds.colors.gray[100],
                padding: ds.spacing.xs,
                borderRadius: ds.borderRadius.lg,
                flexShrink: 0
              }}>
                <button
                  onClick={() => setSortBy('count')}
                  style={{
                    padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                    background: sortBy === 'count' 
                      ? ds.colors.background.primary
                      : 'transparent',
                    color: sortBy === 'count' 
                      ? ds.colors.primary[600]
                      : ds.colors.text.secondary,
                    border: 'none',
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.sm,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: sortBy === 'count' ? ds.shadows.sm : 'none'
                  }}
                >
                  Count
                </button>
                <button
                  onClick={() => setSortBy('jaccard')}
                  style={{
                    padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                    background: sortBy === 'jaccard' 
                      ? ds.colors.background.primary
                      : 'transparent',
                    color: sortBy === 'jaccard' 
                      ? ds.colors.primary[600]
                      : ds.colors.text.secondary,
                    border: 'none',
                    borderRadius: ds.borderRadius.md,
                    fontSize: ds.fontSize.sm,
                    fontWeight: ds.fontWeight.semibold,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: sortBy === 'jaccard' ? ds.shadows.sm : 'none'
                  }}
                >
                  J Score
                </button>
              </div>
            )}
          </div>

          {/* Target selector */}
          {queryTerms.length > 0 && (
            <div>
              <div style={{
                fontSize: ds.fontSize.xs,
                fontWeight: ds.fontWeight.bold,
                color: ds.colors.text.secondary,
                marginBottom: ds.spacing.xs,
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
              }}>
                Target Term
              </div>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: ds.spacing.xs
              }}>
                {queryTerms.map(term => (
                  <button
                    key={term}
                    onClick={() => setSelectedTargetTerm(term)}
                    style={{
                      padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
                      background: selectedTargetTerm === term 
                        ? `linear-gradient(135deg, ${ds.colors.primary[500]}, ${ds.colors.primary[600]})`
                        : ds.colors.background.primary,
                      color: selectedTargetTerm === term 
                        ? ds.colors.text.inverse 
                        : ds.colors.text.primary,
                      border: selectedTargetTerm === term
                        ? 'none'
                        : `2px solid ${ds.colors.gray[300]}`,
                      borderRadius: ds.borderRadius.lg,
                      fontSize: ds.fontSize.sm,
                      fontWeight: ds.fontWeight.semibold,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: selectedTargetTerm === term 
                        ? `0 4px 12px ${ds.colors.primary[200]}` 
                        : ds.shadows.sm,
                      transform: selectedTargetTerm === term ? 'translateY(-1px)' : 'none'
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTargetTerm !== term) {
                        e.currentTarget.style.borderColor = ds.colors.primary[400];
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = ds.shadows.md;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTargetTerm !== term) {
                        e.currentTarget.style.borderColor = ds.colors.gray[300];
                        e.currentTarget.style.transform = 'none';
                        e.currentTarget.style.boxShadow = ds.shadows.sm;
                      }
                    }}
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{
        padding: ds.spacing.xl,
        paddingBottom: ds.spacing['2xl']
      }}>
        {queryTerms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: ds.spacing['2xl'],
            color: ds.colors.text.tertiary,
            fontSize: ds.fontSize.sm
          }}>
            Enter a query in the Query Builder to see related terms
          </div>
        )}

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

        {error && (
          <div style={{
            padding: ds.spacing.lg,
            borderRadius: ds.borderRadius.md,
            border: `1px solid ${ds.colors.error}40`,
            background: `${ds.colors.error}10`,
            color: ds.colors.error,
            fontSize: ds.fontSize.sm
          }}>
            <strong style={{ fontWeight: ds.fontWeight.semibold }}>Error:</strong> {error}
          </div>
        )}

        {selectedTargetTerm && !loading && !error && sortedTerms.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: ds.spacing['2xl'],
            color: ds.colors.text.tertiary,
            fontSize: ds.fontSize.sm,
            height: "1000px"
          }}>
            No related terms found for "{selectedTargetTerm}"
          </div>
        )}

        {selectedTargetTerm && !loading && !error && sortedTerms.length > 0 && (
          <div style={{
            overflowX: 'auto',
            overflowY: 'hidden',
            display: 'flex',
            gap: ds.spacing.md,
            padding: `${ds.spacing.sm} 0 ${ds.spacing.md} 0`,
            scrollbarWidth: 'thin',
            scrollbarColor: `${ds.colors.gray[300]} ${ds.colors.gray[100]}`,
            marginBottom: ds.spacing.sm
          }}>
            {sortedTerms.map((item, idx) => (
              <button
                key={`${item.term}-${idx}`}
                onClick={() => onSelectTerm?.(item.term)}
                style={{
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  gap: ds.spacing.xs,
                  padding: `${ds.spacing.md} ${ds.spacing.lg}`,
                  background: ds.colors.primary[50],
                  border: `1.5px solid ${ds.colors.primary[200]}`,
                  borderRadius: ds.borderRadius.full,
                  cursor: 'pointer',
                  transition: ds.transitions.fast,
                  boxShadow: ds.shadows.sm,
                  minWidth: '140px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ds.colors.primary[100];
                  e.currentTarget.style.borderColor = ds.colors.primary[400];
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = ds.shadows.lg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ds.colors.primary[50];
                  e.currentTarget.style.borderColor = ds.colors.primary[200];
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = ds.shadows.sm;
                }}
              >
                <div style={{
                  fontSize: ds.fontSize.sm,
                  fontWeight: ds.fontWeight.semibold,
                  color: ds.colors.primary[700],
                  wordBreak: 'break-word',
                  textAlign: 'left'
                }}>
                  {item.term}
                </div>
                <div style={{
                  display: 'flex',
                  gap: ds.spacing.md,
                  fontSize: ds.fontSize.xs,
                  color: ds.colors.text.tertiary
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: ds.spacing.xs
                  }}>
                    <span style={{ fontWeight: ds.fontWeight.medium }}>Count:</span>
                    <span style={{ 
                      fontWeight: ds.fontWeight.bold,
                      color: ds.colors.primary[600]
                    }}>
                      {getCount(item)}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: ds.spacing.xs
                  }}>
                    <span style={{ fontWeight: ds.fontWeight.medium }}>J:</span>
                    <span style={{ 
                      fontWeight: ds.fontWeight.bold,
                      color: ds.colors.primary[600]
                    }}>
                      {getJaccard(item)}
                    </span>
                  </div>
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
        
        div::-webkit-scrollbar {
          height: 8px;
        }
        
        div::-webkit-scrollbar-track {
          background: ${ds.colors.gray[100]};
          border-radius: ${ds.borderRadius.md};
          margin: 0 ${ds.spacing.md};
        }
        
        div::-webkit-scrollbar-thumb {
          background: ${ds.colors.gray[300]};
          border-radius: ${ds.borderRadius.md};
        }
        
        div::-webkit-scrollbar-thumb:hover {
          background: ${ds.colors.gray[400]};
        }
      `}</style>
    </div>
  );
}