
import ReportForm from './components/ReportForm/ReportForm';
import './App.css'; // Just for specifics if needed

function App() {
  return (
    <div className="app-container">
      <div className="background-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
      </div>
      <div className="content-wrapper animate-fade-in">
        <header className="app-header">
          <h1>NSS Report Generator</h1>
          <p>Create professional, instant PDF reports for community activities</p>
        </header>
        <main>
          <ReportForm />
        </main>
      </div>
    </div>
  );
}

export default App;
