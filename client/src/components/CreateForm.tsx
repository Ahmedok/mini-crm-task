import { useState } from 'react';
import { createApplication, type Status } from '../api';

interface Props {
  onCreated: () => void;
}

export default function CreateForm({ onCreated }: Props) {
  const [clientName, setClientName] = useState('');
  const [phone, setPhone] = useState('');
  const [equipmentType, setEquipmentType] = useState('');
  const [comment, setComment] = useState('');
  const [status, setStatus] = useState<Status>('NEW');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName || !phone || !equipmentType) return;
    setSubmitting(true);
    try {
      await createApplication({ clientName, phone, equipmentType, comment: comment || null, status });
      setClientName('');
      setPhone('');
      setEquipmentType('');
      setComment('');
      setStatus('NEW');
      onCreated();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-form">
      <h2>New Application</h2>
      <div className="form-row">
        <input
          placeholder="Client name *"
          value={clientName}
          onChange={(e) => setClientName(e.target.value)}
          required
        />
        <input
          placeholder="Phone *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <input
          placeholder="Equipment type *"
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
          required
        />
      </div>
      <div className="form-row">
        <input
          placeholder="Comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="comment-input"
        />
        <select value={status} onChange={(e) => setStatus(e.target.value as Status)}>
          <option value="NEW">New</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="DONE">Done</option>
        </select>
        <button type="submit" disabled={submitting}>
          {submitting ? 'Saving…' : 'Add'}
        </button>
      </div>
    </form>
  );
}
