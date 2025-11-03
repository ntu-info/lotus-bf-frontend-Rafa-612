// src/App.jsx - Redesigned with Header + Footer + Fixed Layout
import { useState, useCallback } from 'react';
import { TermsPanel } from './components/TermsPanel';
import { QueryBuilder } from './components/QueryBuilderModern';
import { QueryResults } from './components/QueryResultsModern';
import { NiiViewer } from './components/NiiViewer';
import { SavedStudies } from './components/SavedStudies';
import { useUrlQueryState } from './hooks/useUrlQueryState';
import ds from './styles/designSystem';
import './App.css';

export default function App() {
  const [query, setQuery] = useUrlQueryState('q');
  const [savedStudies, setSavedStudies] = useState([]);

  const handleTermClick = useCallback((term) => {
    setQuery((q) => (q ? `${q} ${term}` : term));
  }, [setQuery]);

  const handleSaveStudy = useCallback((study) => {
    setSavedStudies(prev => {
      const id = study.pmid || study.title;
      if (prev.find(s => (s.pmid || s.title) === id)) return prev;
      return [...prev, { ...study, savedId: Date.now() }];
    });
  }, []);

  const handleRemoveStudy = useCallback((savedId) => {
    setSavedStudies(prev => prev.filter(s => s.savedId !== savedId));
  }, []);

  const handleExport = useCallback(() => {
    const data = JSON.stringify(savedStudies, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `saved_studies_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [savedStudies]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: `linear-gradient(to bottom right, ${ds.colors.gray[50]}, ${ds.colors.gray[100]})`,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header - 吸頂 */}
      <header style={{
        ...ds.components.header,
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        <div style={{
          maxWidth: '100%',
          margin: '0 auto'
        }}>
          <h1 style={{
            fontSize: ds.fontSize['2xl'],
            fontWeight: ds.fontWeight.bold,
            color: ds.colors.primary[600],
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            LoTUS-BF
          </h1>
          <p style={{
            fontSize: ds.fontSize.sm,
            color: ds.colors.text.tertiary,
            margin: `${ds.spacing.xs} 0 0 0`,
            fontWeight: ds.fontWeight.medium
          }}>
            Location-or-Term Unified Search for Brain Functions
          </p>
        </div>
      </header>

      {/* Main Content Area - 允許內容超出視窗，可滾動 */}
      <main style={{
        flex: 1,
        padding: ds.spacing.xl,
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 24%) minmax(400px, 48%) minmax(320px, 28%)',
        gap: ds.spacing.xl,
        alignItems: 'start',
        boxSizing: 'border-box',
        minHeight: 'calc(100vh - 120px)' // 確保有足夠高度讓 Footer 在底部
      }}>
        {/* Left Panel - Terms (Sticky，內部滾動) */}
        <div style={{
          position: 'sticky',
          top: 'calc(80px + 1.5rem)', // Header 高度 + padding
          maxHeight: 'calc(100vh - 120px)',
          overflow: 'hidden'
        }}>
          <TermsPanel onPickTerm={handleTermClick} />
        </div>

        {/* Middle Panel - Query Builder + Results (自然流動) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: ds.spacing.xl
        }}>
          <QueryBuilder query={query} setQuery={setQuery} />
          <QueryResults query={query} onSaveStudy={handleSaveStudy} />
        </div>

        {/* Right Panel - Viewer + Saved Studies (自然流動) */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: ds.spacing.xl
        }}>
          <NiiViewer query={query} />
          <SavedStudies
            savedStudies={savedStudies}
            onRemove={handleRemoveStudy}
            onExport={handleExport}
          />
        </div>
      </main>

      {/* Footer - 內容底部，需滾動才能看到 */}
      <footer style={{
        background: ds.colors.background.primary,
        borderTop: `1px solid ${ds.colors.gray[200]}`,
        padding: `${ds.spacing.lg} ${ds.spacing.xl}`,
        marginTop: ds.spacing['2xl']
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: ds.fontSize.xs,
          color: ds.colors.text.tertiary
        }}>
          <div style={{ display: 'flex', gap: ds.spacing.lg, alignItems: 'center' }}>
            <span style={{ fontWeight: ds.fontWeight.medium }}>
              © 2025 LoTUS-BF
            </span>
            <span style={{ color: ds.colors.gray[300] }}>|</span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
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
              GitHub
            </a>
            <span style={{ color: ds.colors.gray[300] }}>|</span>
            <a
              href="https://docs.example.com"
              target="_blank"
              rel="noopener noreferrer"
              style={{
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
              Documentation
            </a>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: ds.spacing.sm,
            alignItems: 'center'
          }}>
            <span>Powered by</span>
            <span style={{ 
              fontWeight: ds.fontWeight.semibold,
              color: ds.colors.text.secondary 
            }}>
              Neurosynth
            </span>
          </div>
        </div>
      </footer>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 1200px) {
          main {
            grid-template-columns: 250px 1fr 300px !important;
            gap: ${ds.spacing.lg} !important;
            padding: ${ds.spacing.lg} !important;
          }
        }
        
        @media (max-width: 1024px) {
          main {
            grid-template-columns: 1fr !important;
            padding: ${ds.spacing.md} !important;
          }
          
          main > div:first-child {
            position: static !important;
            max-height: none !important;
          }
        }
      `}</style>
    </div>
  );
}