
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
        <header className="app-header">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/4b/National_Service_Scheme_symbol.svg" 
            alt="NSS Logo" 
            className="nss-logo" 
          />
          <h1>NSS REPORT GENERATOR</h1>
        </header>
        <main>
          <ReportForm />
        </main>
      </div>
    </div>
  );
}

export default App;
