import type { BorrboxItem } from '../types';
import { getDateStatus } from '../utils/dateStatus';

interface ItemListProps {
  items: BorrboxItem[];
  onItemClick?: (item: BorrboxItem) => void;
}

function getDueStatus(dueDateString: string): { text: string; isOverdue: boolean } {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      text: `Due: ${dueDate.toLocaleDateString('en-GB', { weekday: 'short' })} · Overdue`,
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      text: 'Due: Today',
      isOverdue: false,
    };
  }
  if (diffDays === 1) {
    return {
      text: 'Due: Tomorrow',
      isOverdue: false,
    };
  }
  const dayName = dueDate.toLocaleDateString('en-GB', { weekday: 'short' });
  return {
    text: `Due: ${dayName} · ${diffDays} days left`,
    isOverdue: false,
  };
}

export function ItemList({ items, onItemClick }: ItemListProps) {
  const activeItems = items.filter((item) => !item.returned);

  if (activeItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
        <div className="w-24 h-24 bg-neutral-900 rounded-2xl flex items-center justify-center mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-neutral-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-neutral-100 mb-2">
          Track borrowed items and money.
        </h2>
        <p className="text-sm text-neutral-400 mb-6 max-w-xs">
          Never forget who owes you again.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 -mt-1 space-y-1.5">
      {activeItems.map((item) => {
        const dueStatus = getDueStatus(item.dueDate);
        const { overdue, nearDue } = getDateStatus(item);
        const accentColor = overdue
          ? 'before:bg-red-400'
          : item.type === 'money'
          ? 'before:bg-emerald-400'
          : 'before:bg-indigo-400';

        return (
          <button
            key={item.id}
            onClick={() => onItemClick?.(item)}
            className={`relative w-full text-left bg-neutral-900 rounded-xl p-3 border border-neutral-800 shadow-sm shadow-black/20 transition-all hover:bg-neutral-800 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:rounded-l-xl ${accentColor}`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="font-semibold text-neutral-100 mb-1 flex items-center">
                  {item.personName}
                  {overdue && (
                    <span className="text-red-400 text-xs ml-2">Overdue</span>
                  )}
                  {nearDue && (
                    <span className="text-yellow-400 text-xs ml-2">Due soon</span>
                  )}
                </div>
                <div className="text-sm text-neutral-300">
                  {item.type === 'money'
                    ? `£${item.amount?.toFixed(2)} (Money)`
                    : item.itemName || 'Item'}
                </div>
              </div>
            </div>
            <div
              className={`text-xs ${
                overdue
                  ? 'text-red-400 font-medium'
                  : dueStatus.text.includes('Today')
                  ? 'text-yellow-400'
                  : 'text-neutral-400'
              }`}
            >
              {dueStatus.text}
            </div>
          </button>
        );
      })}
    </div>
  );
}
