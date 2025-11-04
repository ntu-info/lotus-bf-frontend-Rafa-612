// src/components/QueryResultsModern.jsx - Enhanced version with consistent header
import { useEffect, useState } from 'react';
import { API_BASE } from '../api';
import ds from '../styles/designSystem';

// Helper function to highlight matching terms in title
function highlightTerms(title, query) {
  if (!title || !query) return title;
  
  const terms = query
    .replace(/\(|\)/g, ' ')
    .split(/\s+/)
    .filter(term => term && !['AND', 'OR', 'NOT', 'and', 'or', 'not'].includes(term))
    .map(term => term.toLowerCase().trim());
  
  if (terms.length === 0) return title;
  
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
  const [sortBy, setSortBy] = useState('desc'); // 'desc' = newest first, 'asc' = oldest first

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

  // Sort studies by year
  const sortedStudies = [...studies].sort((a, b) => {
    const yearA = parseInt(a.year) || 0;
    const yearB = parseInt(b.year) || 0;
    return sortBy === 'desc' ? yearB - yearA : yearA - yearB;
  });

  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header - consistent with other components */}
      <div style={{
        padding: `${ds.spacing.md} ${ds.spacing.lg}`,
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
          Query Results
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
            {studies.length} {studies.length === 1 ? 'study' : 'studies'} found
          </p>
          
          {/* Sort Options */}
          {studies.length > 0 && (
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
                Sort by Year:
              </span>
              {['desc', 'asc'].map(option => (
                <button
                  key={option}
                  onClick={() => setSortBy(option)}
                  style={{
                    padding: `${ds.spacing.xs} ${ds.spacing.md}`,
                    background: sortBy === option ? ds.colors.primary[100] : ds.colors.background.primary,
                    color: sortBy === option ? ds.colors.primary[700] : ds.colors.text.secondary,
                    border: `1.5px solid ${sortBy === option ? ds.colors.primary[400] : ds.colors.gray[300]}`,
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
                  {option === 'desc' ? 'Newest' : 'Oldest'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{
        overflowY: 'auto',
        maxHeight: '600px'
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
            {sortedStudies.map((study, idx) => (
              <div 
                key={idx} 
                style={{
                  padding: ds.spacing.lg,
                  borderBottom: idx < sortedStudies.length - 1 ? `1px solid ${ds.colors.gray[100]}` : 'none',
                  transition: ds.transitions.fast,
                  background: ds.colors.background.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ds.colors.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ds.colors.background.primary;
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: ds.spacing.md }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Title */}
                    <h3 style={{
                      fontSize: ds.fontSize.sm,
                      fontWeight: ds.fontWeight.semibold,
                      color: ds.colors.text.primary,
                      margin: `0 0 ${ds.spacing.sm} 0`,
                      lineHeight: ds.lineHeight.normal
                    }}>
                      {highlightTerms(study.title, query)}
                    </h3>

                    {/* Authors first - prevent breaking names */}
                    {study.authors && (
                      <p style={{
                        fontSize: ds.fontSize.xs,
                        color: ds.colors.text.secondary,
                        margin: `0 0 ${ds.spacing.sm} 0`,
                        lineHeight: ds.lineHeight.relaxed,
                        wordBreak: 'keep-all',
                        overflowWrap: 'break-word'
                      }}>
                        <strong style={{ fontWeight: ds.fontWeight.semibold }}>Authors:</strong> {study.authors}
                      </p>
                    )}

                    {/* Metadata: Journal • Year • PubMed */}
                    {(study.journal || study.year || study.pmid || study.PMID || study.pubmed_id || study.id) && (
                      <div style={{
                        display: 'flex',
                        gap: ds.spacing.sm,
                        alignItems: 'center',
                        marginBottom: ds.spacing.sm,
                        flexWrap: 'wrap',
                        fontSize: ds.fontSize.xs,
                        color: ds.colors.text.secondary,
                        fontWeight: ds.fontWeight.medium
                      }}>
                        {study.journal && (
                          <span>
                            <strong style={{ fontWeight: ds.fontWeight.semibold }}>Journal:</strong> {study.journal}
                          </span>
                        )}
                        {study.journal && study.year && <span style={{ color: ds.colors.gray[300] }}>•</span>}
                        {study.year && (
                          <span>
                            <strong style={{ fontWeight: ds.fontWeight.semibold }}>Year:</strong> {study.year}
                          </span>
                        )}
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
                    )}

                    {/* Abstract */}
                    {study.abstract && (
                      <p style={{
                        fontSize: ds.fontSize.xs,
                        color: ds.colors.text.tertiary,
                        margin: 0,
                        lineHeight: ds.lineHeight.relaxed,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}>
                        {study.abstract}
                      </p>
                    )}
                  </div>

                  {/* Right column - Save button only */}
                  <div style={{
                    flexShrink: 0
                  }}>
                    {/* Save Button - Icon only */}
                    <button
                      onClick={() => onSaveStudy(study)}
                      style={{
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