
import ReportForm from './components/ReportForm/ReportForm';
import './App.css'; // Just for specifics if needed

function App() {
  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>
      <div className="content-wrapper animate-fade-in">
        <main>
          <ReportForm />
        </main>
        
        <footer className="app-footer">
          <p>
            Made with <span className="heart-pulse">❤️</span> by <strong className="author-name">i4_abhi</strong>
          </p>
          <a href="https://www.instagram.com/i4_abhi" target="_blank" rel="noopener noreferrer" className="social-link">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
            </svg>
            <span>Follow on Instagram</span>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
