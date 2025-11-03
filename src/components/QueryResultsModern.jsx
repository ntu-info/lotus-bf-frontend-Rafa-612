// src/components/QueryResultsModern.jsx - Updated version/
import { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

// Helper function to highlight matching terms in title
function highlightTerms(title, query) {
  if (!title || !query) return title;
  
  // Extract individual terms from query (remove operators and parentheses)
  const terms = query
    .replace(/\(|\)/g, ' ')
    .split(/\s+/)
    .filter(term => term && !['AND', 'OR', 'NOT', 'and', 'or', 'not'].includes(term))
    .map(term => term.toLowerCase().trim());
  
  if (terms.length === 0) return title;
  
  // Create regex pattern for all terms
  const pattern = new RegExp(`(${terms.join('|')})`, 'gi');
  const parts = title.split(pattern);
  
  return parts.map((part, idx) => {
    const isMatch = terms.some(term => part.toLowerCase() === term);
    if (isMatch) {
      return (
        <mark
          key={idx}
          style={{
            background: ds.colors.primary[100],
            color: ds.colors.primary[800],
            fontWeight: ds.fontWeight.bold,
            padding: '2px 4px',
            borderRadius: '3px'
          }}
        >
          {part}
        </mark>
      );
    }
    return part;
  });
}

export function QueryResults({ query, onSaveStudy }) {
  const [studies, setStudies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!query) {
      setStudies([]);
      return;
    }
    
    let alive = true;
    const ac = new AbortController();
    
    const fetchStudies = async () => {
      setLoading(true);
      setError('');
      try {
        const url = `${API_BASE}/query/${encodeURIComponent(query)}/studies`;
        const res = await fetch(url, { signal: ac.signal });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
        if (!alive) return;
        const list = Array.isArray(data?.results) ? data.results : [];
        setStudies(list);
      } catch (e) {
        if (!alive) return;
        setError(`Failed to load studies: ${e?.message || e}`);
        setStudies([]);
        console.error('Studies API error:', e);
      } finally {
        if (alive) setLoading(false);
      }
    };
    
    fetchStudies();
    return () => { alive = false; ac.abort(); };
  }, [query]);

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header - 移除 Query 顯示 */}
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
            Query Results
          </h2>
          <p style={{
            fontSize: ds.fontSize.xs,
            color: ds.colors.text.tertiary,
            margin: `${ds.spacing.xs} 0 0 0`,
            fontWeight: ds.fontWeight.medium
          }}>
            {studies.length} {studies.length === 1 ? 'study' : 'studies'} found
          </p>
        </div>
      </div>

      {/* Content */}
      <div style={{
        overflowY: 'auto',
        maxHeight: '850px'
      }}>
        {!query ? (
          <div style={{
            padding: ds.spacing['3xl'],
            textAlign: 'center'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <p style={{
              color: ds.colors.text.disabled,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              Enter a query above to search for studies
            </p>
          </div>
        ) : loading ? (
          <div style={{
            padding: ds.spacing['3xl'],
            textAlign: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: `3px solid ${ds.colors.primary[200]}`,
              borderTopColor: ds.colors.primary[600],
              borderRadius: ds.borderRadius.full,
              margin: '0 auto',
              animation: 'spin 0.8s linear infinite'
            }} />
            <p style={{
              color: ds.colors.text.tertiary,
              marginTop: ds.spacing.lg,
              fontSize: ds.fontSize.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              Searching studies...
            </p>
          </div>
        ) : error ? (
          <div style={{
            padding: ds.spacing['2xl'],
            margin: ds.spacing.xl,
            borderRadius: ds.borderRadius.md,
            border: `1px solid ${ds.colors.error}40`,
            background: `${ds.colors.error}10`,
            textAlign: 'center'
          }}>
            <p style={{
              color: ds.colors.error,
              fontSize: ds.fontSize.sm,
              marginBottom: ds.spacing.md,
              fontWeight: ds.fontWeight.medium
            }}>
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()} 
              style={{
                ...ds.createStyles.button('secondary'),
                fontSize: ds.fontSize.xs
              }}
            >
              Retry
            </button>
          </div>
        ) : studies.length === 0 ? (
          <div style={{
            padding: ds.spacing['3xl'],
            textAlign: 'center'
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
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{
              color: ds.colors.text.disabled,
              fontSize: ds.fontSize.sm,
              marginBottom: ds.spacing.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              No studies found for this query
            </p>
            <p style={{
              fontSize: ds.fontSize.xs,
              color: ds.colors.text.tertiary
            }}>
              Try a different search term or adjust your query
            </p>
          </div>
        ) : (
          <div>
            {studies.map((study, idx) => (
              <div 
                key={idx} 
                style={{
                  padding: ds.spacing.lg,
                  borderBottom: idx < studies.length - 1 ? `1px solid ${ds.colors.gray[200]}` : 'none',
                  transition: ds.transitions.fast
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = ds.colors.gray[50]}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{
                  display: 'flex',
                  gap: ds.spacing.md,
                  alignItems: 'flex-start'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title with highlighted terms */}
                    <h3 style={{
                      fontSize: ds.fontSize.sm,
                      fontWeight: ds.fontWeight.semibold,
                      color: ds.colors.text.primary,
                      marginBottom: ds.spacing.xs,
                      lineHeight: ds.lineHeight.snug
                    }}>
                      {highlightTerms(study.title || 'Untitled study', query)}
                    </h3>
                    <p style={{
                      fontSize: ds.fontSize.xs,
                      color: ds.colors.text.secondary,
                      marginBottom: ds.spacing.xs,
                      lineHeight: ds.lineHeight.relaxed
                    }}>
                      {study.authors || 'Unknown authors'}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: ds.spacing.sm,
                      fontSize: ds.fontSize.xs,
                      color: ds.colors.text.tertiary,
                      flexWrap: 'wrap'
                    }}>
                      <span style={{ fontWeight: ds.fontWeight.medium, color: ds.colors.text.secondary }}>
                        {study.journal || 'Unknown journal'}
                      </span>
                      <span style={{ color: ds.colors.gray[300] }}>•</span>
                      <span>{study.year || 'N/A'}</span>
                      {(study.pmid || study.PMID || study.pubmed_id || study.id) && (
                        <>
                          <span style={{ color: ds.colors.gray[300] }}>•</span>
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid || study.PMID || study.pubmed_id || study.id}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: ds.spacing.xs,
                              color: ds.colors.primary[600],
                              textDecoration: 'none',
                              fontWeight: ds.fontWeight.semibold,
                              transition: ds.transitions.fast,
                              padding: '2px 8px',
                              borderRadius: ds.borderRadius.sm,
                              background: ds.colors.primary[50]
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = ds.colors.primary[100];
                              e.currentTarget.style.color = ds.colors.primary[700];
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = ds.colors.primary[50];
                              e.currentTarget.style.color = ds.colors.primary[600];
                            }}
                          >
                            <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            PubMed
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onSaveStudy(study)}
                    style={{
                      flexShrink: 0,
                      padding: ds.spacing.sm,
                      borderRadius: ds.borderRadius.md,
                      border: 'none',
                      background: 'transparent',
                      color: ds.colors.gray[400],
                      cursor: 'pointer',
                      transition: ds.transitions.fast
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = ds.colors.primary[50];
                      e.currentTarget.style.color = ds.colors.primary[600];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = ds.colors.gray[400];
                    }}
                    title="Save study"
                  >
                    <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                </div>
              </div>
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