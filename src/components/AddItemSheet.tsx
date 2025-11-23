import { useState, useEffect } from 'react';
import type { BorrboxItem } from '../types';

interface AddItemSheetProps {
  open?: boolean;
  onClose?: () => void;
  editingItem?: BorrboxItem | null;
  onSave?: (id: string | null, item: Partial<BorrboxItem> | BorrboxItem) => void;
}

export function AddItemSheet({ open = false, onClose, editingItem, onSave }: AddItemSheetProps) {
  const [type, setType] = useState<'money' | 'object'>('money');
  const [direction, setDirection] = useState<'they_borrowed' | 'i_borrowed'>('they_borrowed');
  const [borrowDirection, setBorrowDirection] = useState<'they_owe_me' | 'i_owe_them'>('they_owe_me');
  const [amount, setAmount] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [personName, setPersonName] = useState<string>('');
  const [borrowerPhone, setBorrowerPhone] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (open) {
      if (editingItem) {
        setType(editingItem.type);
        setDirection(editingItem.direction);
        setBorrowDirection(editingItem.borrowDirection || (editingItem.direction === 'they_borrowed' ? 'they_owe_me' : 'i_owe_them'));
        setAmount(editingItem.amount?.toString() || '');
        setItemName(editingItem.itemName || '');
        setPersonName(editingItem.personName);
        setBorrowerPhone((editingItem as any).borrowerPhone || '');
        setDueDate(editingItem.dueDate.split('T')[0]);
        setNotes(editingItem.notes || '');
      } else {
        setType('money');
        setDirection('they_borrowed');
        setBorrowDirection('they_owe_me');
        setAmount('');
        setItemName('');
        setPersonName('');
        setBorrowerPhone('');
        const defaultDueDate = new Date();
        defaultDueDate.setDate(defaultDueDate.getDate() + 3);
        setDueDate(defaultDueDate.toISOString().split('T')[0]);
        setNotes('');
      }
    }
  }, [open, editingItem]);

  const handleSave = () => {
    if (!personName.trim()) return;
    if (type === 'money' && !amount.trim()) return;
    if (type === 'object' && !itemName.trim()) return;
    if (!dueDate) return;

    if (editingItem) {
      const updates: Partial<BorrboxItem> = {
        type,
        direction,
        borrowDirection,
        personName: personName.trim(),
        borrowerPhone: borrowerPhone.trim() || undefined,
        amount: type === 'money' ? parseFloat(amount) : undefined,
        itemName: type === 'object' ? itemName.trim() : undefined,
        notes: notes.trim() || undefined,
        dueDate: new Date(dueDate).toISOString(),
      };
      onSave?.(editingItem.id, updates);
    } else {
      const newItem: BorrboxItem = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type,
        direction,
        borrowDirection,
        personName: personName.trim(),
        amount: type === 'money' ? parseFloat(amount) : undefined,
        itemName: type === 'object' ? itemName.trim() : undefined,
        notes: notes.trim() || undefined,
        borrowedAt: new Date().toISOString(),
        dueDate: new Date(dueDate).toISOString(),
        returned: false,
      };
      onSave?.(null, newItem);
    }

    onClose?.();
  };

  if (!open) return null;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div className={`fixed bottom-0 left-0 right-0 bg-neutral-900 rounded-t-2xl z-50 max-h-[90vh] overflow-y-auto transition-all duration-300 ${open ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
        <div className="sticky top-0 bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-100">
            {editingItem ? 'Edit Item' : 'Add Borrowed Item'}
          </h2>
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Direction
            </label>
            <div className="flex gap-2 bg-neutral-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setDirection('they_borrowed');
                  setBorrowDirection('they_owe_me');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  direction === 'they_borrowed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                They Borrowed
              </button>
              <button
                type="button"
                onClick={() => {
                  setDirection('i_borrowed');
                  setBorrowDirection('i_owe_them');
                }}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  direction === 'i_borrowed'
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                I Borrowed
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Item Type
            </label>
            <div className="flex gap-2 bg-neutral-800 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setType('money')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  type === 'money'
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                Money
              </button>
              <button
                type="button"
                onClick={() => setType('object')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  type === 'object'
                    ? 'bg-indigo-600 text-white'
                    : 'text-neutral-400 hover:text-neutral-100'
                }`}
              >
                Object
              </button>
            </div>
          </div>

          {type === 'money' ? (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  £
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="0.00"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Item Name
              </label>
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="e.g., Hammer, Book"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Borrower's name
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Borrower's name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={borrowerPhone}
              onChange={(e) => setBorrowerPhone(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Notes (optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2.5 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              placeholder="Additional notes..."
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
          >
            {editingItem ? 'Save Changes' : 'Save Item'}
          </button>
        </div>
      </div>
    </>
  );
}
