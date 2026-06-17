import { type Application, type Status, updateApplication, deleteApplication } from '../api';

interface Props {
  applications: Application[];
  onChanged: () => void;
}

const STATUS_LABELS: Record<Status, string> = {
  NEW: 'New',
  IN_PROGRESS: 'In Progress',
  DONE: 'Done',
};

export default function ApplicationList({ applications, onChanged }: Props) {
  const handleStatusChange = async (id: number, status: Status) => {
    await updateApplication(id, { status });
    onChanged();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this application?')) return;
    await deleteApplication(id);
    onChanged();
  };

  if (applications.length === 0) {
    return <p className="empty">No applications found.</p>;
  }

  return (
    <table className="app-table">
      <thead>
        <tr>
          <th>Client</th>
          <th>Phone</th>
          <th>Equipment</th>
          <th>Comment</th>
          <th>Status</th>
          <th>Created</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app.id}>
            <td>{app.clientName}</td>
            <td>{app.phone}</td>
            <td>{app.equipmentType}</td>
            <td className="comment">{app.comment ?? '—'}</td>
            <td>
              <select
                value={app.status}
                onChange={(e) => handleStatusChange(app.id, e.target.value as Status)}
                className={`status-badge status-${app.status.toLowerCase()}`}
              >
                {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                  <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                ))}
              </select>
            </td>
            <td className="date">{new Date(app.createdAt).toLocaleDateString()}</td>
            <td>
              <button className="btn-delete" onClick={() => handleDelete(app.id)}>✕</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
