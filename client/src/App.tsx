import { useCallback, useEffect, useState } from 'react';
import { type Application, type Status, getApplications } from './api';
import ApplicationList from './components/ApplicationList';
import CreateForm from './components/CreateForm';
import StatusFilter from './components/StatusFilter';
import './App.css';

export default function App() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filter, setFilter] = useState<Status | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setApplications(await getApplications(filter));
    } catch {
      setError('Failed to load applications.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="app">
      <header>
        <h1>Mini CRM</h1>
      </header>
      <main>
        <CreateForm onCreated={load} />
        <div className="list-section">
          <StatusFilter current={filter} onChange={setFilter} />
          {loading && <p className="loading">Loading…</p>}
          {error && <p className="error">{error}</p>}
          {!loading && <ApplicationList applications={applications} onChanged={load} />}
        </div>
      </main>
    </div>
  );
}
