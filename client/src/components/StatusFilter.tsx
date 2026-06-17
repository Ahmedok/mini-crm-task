import { type Status } from '../api';

interface Props {
  current: Status | undefined;
  onChange: (status: Status | undefined) => void;
}

const FILTERS: { label: string; value: Status | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'New', value: 'NEW' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Done', value: 'DONE' },
];

export default function StatusFilter({ current, onChange }: Props) {
  return (
    <div className="status-filter">
      {FILTERS.map(({ label, value }) => (
        <button
          key={label}
          className={current === value ? 'active' : ''}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
