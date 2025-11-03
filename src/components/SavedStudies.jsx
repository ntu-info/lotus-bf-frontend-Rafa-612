// src/components/SavedStudies.jsx - Redesigned with Design System
import ds from '../styles/designSystem';

export function SavedStudies({ savedStudies, onRemove, onExport }) {
  return (
    <div style={{
      ...ds.createStyles.card(),
      padding: 0,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: ds.spacing.xl,
        borderBottom: `1px solid ${ds.colors.gray[200]}`,
        background: ds.colors.primary[50],
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div>
          <h2 style={{
            fontSize: ds.fontSize.lg,
            fontWeight: ds.fontWeight.bold,
            color: ds.colors.text.primary,
            margin: 0,
            lineHeight: ds.lineHeight.tight
          }}>
            Saved Studies
          </h2>
          <p style={{
            fontSize: ds.fontSize.xs,
            color: ds.colors.text.tertiary,
            margin: `${ds.spacing.xs} 0 0 0`,
            fontWeight: ds.fontWeight.medium
          }}>
            {savedStudies.length} {savedStudies.length === 1 ? 'study' : 'studies'} saved
          </p>
        </div>
        <button
          onClick={onExport}
          disabled={savedStudies.length === 0}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: ds.spacing.sm,
            padding: `${ds.spacing.sm} ${ds.spacing.lg}`,
            background: savedStudies.length === 0 ? ds.colors.gray[300] : ds.colors.primary[600],
            color: ds.colors.text.inverse,
            border: 'none',
            borderRadius: ds.borderRadius.md,
            fontSize: ds.fontSize.xs,
            fontWeight: ds.fontWeight.semibold,
            cursor: savedStudies.length === 0 ? 'not-allowed' : 'pointer',
            transition: ds.transitions.fast,
            boxShadow: ds.shadows.sm
          }}
          onMouseEnter={(e) => {
            if (savedStudies.length > 0) {
              e.currentTarget.style.background = ds.colors.primary[700];
              e.currentTarget.style.boxShadow = ds.shadows.md;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }
          }}
          onMouseLeave={(e) => {
            if (savedStudies.length > 0) {
              e.currentTarget.style.background = ds.colors.primary[600];
              e.currentTarget.style.boxShadow = ds.shadows.sm;
              e.currentTarget.style.transform = 'translateY(0)';
            }
          }}
        >
          <svg style={{ width: '14px', height: '14px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>

      {/* Content */}
      <div style={{
        overflowY: 'auto',
        maxHeight: '650px'
      }}>
        {savedStudies.length === 0 ? (
          <div style={{
            padding: ds.spacing['3xl'],
            textAlign: 'center'
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
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
            <p style={{
              fontSize: ds.fontSize.sm,
              color: ds.colors.text.disabled,
              marginBottom: ds.spacing.sm,
              fontWeight: ds.fontWeight.medium
            }}>
              No saved studies yet
            </p>
            <p style={{
              fontSize: ds.fontSize.xs,
              color: ds.colors.text.tertiary,
              lineHeight: ds.lineHeight.relaxed
            }}>
              Click the bookmark icon on any study to save it for later
            </p>
          </div>
        ) : (
          <div>
            {savedStudies.map((study) => (
              <div
                key={study.savedId}
                style={{
                  padding: ds.spacing.lg,
                  borderBottom: `1px solid ${ds.colors.gray[100]}`,
                  transition: ds.transitions.fast,
                  background: ds.colors.background.primary
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = ds.colors.primary[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = ds.colors.background.primary;
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: ds.spacing.md
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h4 style={{
                      fontSize: ds.fontSize.sm,
                      fontWeight: ds.fontWeight.semibold,
                      color: ds.colors.text.primary,
                      marginBottom: ds.spacing.xs,
                      lineHeight: ds.lineHeight.tight,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {study.title || 'Untitled Study'}
                    </h4>
                    <p style={{
                      fontSize: ds.fontSize.xs,
                      color: ds.colors.text.secondary,
                      marginBottom: ds.spacing.sm,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {study.authors || 'Unknown authors'}
                    </p>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: ds.spacing.sm,
                      fontSize: ds.fontSize.xs,
                      color: ds.colors.text.tertiary
                    }}>
                      <span style={{ fontWeight: ds.fontWeight.medium, color: ds.colors.text.secondary }}>
                        {study.journal || 'Unknown'}
                      </span>
                      <span style={{ color: ds.colors.gray[300] }}>•</span>
                      <span>{study.year || 'N/A'}</span>
                      {study.pmid && (
                        <>
                          <span style={{ color: ds.colors.gray[300] }}>•</span>
                          <a
                            href={`https://pubmed.ncbi.nlm.nih.gov/${study.pmid}/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: ds.spacing.xs,
                              color: ds.colors.primary[600],
                              textDecoration: 'none',
                              fontWeight: ds.fontWeight.medium,
                              transition: ds.transitions.fast
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.color = ds.colors.primary[700];
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.color = ds.colors.primary[600];
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            <svg style={{ width: '12px', height: '12px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => onRemove(study.savedId)}
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
                      e.currentTarget.style.background = `${ds.colors.error}15`;
                      e.currentTarget.style.color = ds.colors.error;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = ds.colors.gray[400];
                    }}
                    title="Remove from saved"
                  >
                    <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}