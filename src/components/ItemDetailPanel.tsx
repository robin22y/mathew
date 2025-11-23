import { useState } from 'react';
import type { BorrboxItem } from '../types';
import ReminderSheet from './ReminderSheet';

interface ItemDetailPanelProps {
  open?: boolean;
  onClose?: () => void;
  item?: BorrboxItem | null;
  onEdit?: () => void;
  onMarkReturned?: () => void;
  onDelete?: () => void;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function isOverdueDate(dateString: string): boolean {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dateString);
  due.setHours(0, 0, 0, 0);
  return due.getTime() < now.getTime();
}

function getDueStatus(dueDateString: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateString);
  dueDate.setHours(0, 0, 0, 0);
  const diffTime = dueDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return `Overdue: ${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'}`;
  }
  if (diffDays === 0) {
    return 'Due today';
  }
  if (diffDays === 1) {
    return 'Due tomorrow';
  }
  return `${diffDays} days left`;
}

export function ItemDetailPanel({
  open = false,
  onClose,
  item,
  onEdit,
  onMarkReturned,
  onDelete,
}: ItemDetailPanelProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReminder, setShowReminder] = useState(false);

  if (!open || !item) return null;

  const borrowedDate = formatDate(item.borrowedAt);
  const dueDateFormatted = formatDate(item.dueDate);
  const dueStatus = getDueStatus(item.dueDate);
  const isOverdue = isOverdueDate(item.dueDate);
  const directionText = item.direction === 'they_borrowed' ? 'They owe you' : 'You owe them';

  const handleMarkReturnedClick = () => {
    setIsAnimating(true);
    setTimeout(() => {
      if (onMarkReturned) {
        onMarkReturned();
      }
      if (onClose) {
        onClose();
      }
    }, 400);
  };

  const personName = item.personName?.trim() || '';
  const rightSide =
    item.type === 'money'
      ? `£${item.amount?.toFixed(2)} (Money)`
      : item.itemName?.trim() || 'Item';
  const displayTitle = !personName ? rightSide : `${personName} — ${rightSide}`;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      <div
        className={`fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl z-50 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
          open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        } ${isAnimating ? 'opacity-0 scale-95' : ''}`}
      >
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-neutral-100">Item Details</h2>
          <div className="w-6" />
        </div>

        <div className="p-4 space-y-6">
          <div>
            <div
              className="text-xl font-semibold text-neutral-100 mb-1 truncate"
              title={displayTitle}
            >
              {displayTitle}
            </div>
            <div
              className="text-sm text-neutral-400 mt-1 truncate"
              title={directionText}
            >
              {directionText}
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-neutral-400">Borrowed on:</span>
              <span className="text-neutral-100 truncate" title={borrowedDate}>
                {borrowedDate}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-400">Due:</span>
              <span
                className={`truncate ${
                  isOverdue ? 'text-red-400 font-medium' : 'text-neutral-100'
                }`}
                title={`${dueDateFormatted} (${dueStatus})`}
              >
                {dueDateFormatted} ({dueStatus})
              </span>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
              Notes
            </div>
            <div className="text-sm text-neutral-300 bg-neutral-800 rounded-lg p-3">
              {item.notes || 'No notes'}
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              onClick={() => setShowReminder(true)}
              className="w-full py-3 bg-amber-600 rounded-xl text-white font-semibold disabled:bg-amber-900"
            >
              Send Reminder
            </button>

            <button
              onClick={handleMarkReturnedClick}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium rounded-lg transition-all duration-400"
            >
              Mark as Returned
            </button>

            <button
              onClick={onEdit}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-medium rounded-lg transition-colors"
            >
              Edit Item
            </button>

            <button
              onClick={onDelete}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 text-red-400 font-medium rounded-lg transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      </div>

      {showReminder && (
        <ReminderSheet
          item={item as BorrboxItem}
          onClose={() => setShowReminder(false)}
        />
      )}
    </>
  );
}
