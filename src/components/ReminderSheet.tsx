import { useMemo, useState } from 'react';
import type { BorrboxItem } from '../types';

type ReminderTone = 'polite' | 'friendly' | 'direct' | 'funny';

interface ReminderSheetProps {
  item: BorrboxItem;
  onClose: () => void;
}

function formatReminderDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function getDuePhrase(dueDateString: string): string {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const due = new Date(dueDateString);
  due.setHours(0, 0, 0, 0);

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const days = Math.abs(diffDays);
    return days === 1 ? 'was due yesterday' : `is ${days} days overdue`;
  }
  if (diffDays === 0) return 'is due today';
  if (diffDays === 1) return 'is due tomorrow';
  return `is due on ${formatReminderDate(dueDateString)}`;
}

function buildToneMessage(item: BorrboxItem, tone: ReminderTone): string {
  const name = item.personName || 'there';
  const description =
    item.type === 'money'
      ? `£${(item.amount ?? 0).toFixed(2)}`
      : item.itemName || 'item';
  const duePhrase = getDuePhrase(item.dueDate);

  if (item.direction === 'i_borrowed') {
    // You borrowed from them
    switch (tone) {
      case 'friendly':
        return `Hey ${name}! Just a quick note about the ${description} I borrowed from you – it ${duePhrase}. I'll sort it on time. (Sent via Borrbox)`;

      case 'direct':
        return `Hi ${name}, this is about the ${description} I borrowed from you – it ${duePhrase}. I'll return/settle it as agreed. (Sent via Borrbox)`;

      case 'funny':
        return `Hey ${name}, remember that ${description} I kidnapped from you? 😅 It ${duePhrase}. I'll bring it back before it files a missing item report. (Sent via Borrbox)`;

      case 'polite':
      default:
        return `Hi ${name}, just checking in about the ${description} I borrowed from you. It ${duePhrase}. I'll return/settle it on time. (Sent via Borrbox)`;
    }
  }

  // They borrowed from you
  switch (tone) {
    case 'friendly':
      return `Hey ${name}! Just a friendly reminder about the ${description} you borrowed – it ${duePhrase}. When you get a moment, could you return/settle it? (Sent via Borrbox)`;

    case 'direct':
      return `Hi ${name}, this is a reminder about the ${description} you borrowed. It ${duePhrase}. Please return/settle it. (Sent via Borrbox)`;

    case 'funny':
      return `Oi ${name} 😄 remember that ${description} you borrowed? It ${duePhrase}. My ${description} misses home – can you send it back soon? (Sent via Borrbox)`;

    case 'polite':
    default:
      return `Hi ${name}, just a quick reminder about the ${description} you borrowed from me. It ${duePhrase}. Could you please return/settle it when you can? (Sent via Borrbox)`;
  }
}

export default function ReminderSheet({ item, onClose }: ReminderSheetProps) {
  const [tone, setTone] = useState<ReminderTone>('polite');
  const [copied, setCopied] = useState(false);

  const message = useMemo(() => buildToneMessage(item, tone), [item, tone]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  function handleWhatsApp() {
    const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  }

  function handleSMS() {
    const url = `sms:?&body=${encodeURIComponent(message)}`;
    window.location.href = url;
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />
      <div className="fixed inset-x-0 bottom-0 z-50 bg-neutral-900 rounded-t-2xl border-t border-neutral-800 max-h-[80vh] overflow-y-auto">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold text-neutral-100">Send Reminder</h3>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-100 text-sm"
          >
            Close
          </button>
        </div>

        <div className="px-4 pb-4 space-y-4">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
              Tone
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTone('polite')}
                className={`py-2 rounded-lg text-sm ${
                  tone === 'polite'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                🤝 Polite
              </button>
              <button
                onClick={() => setTone('friendly')}
                className={`py-2 rounded-lg text-sm ${
                  tone === 'friendly'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                😄 Friendly
              </button>
              <button
                onClick={() => setTone('direct')}
                className={`py-2 rounded-lg text-sm ${
                  tone === 'direct'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                🎯 Direct
              </button>
              <button
                onClick={() => setTone('funny')}
                className={`py-2 rounded-lg text-sm ${
                  tone === 'funny'
                    ? 'bg-neutral-100 text-neutral-900 font-semibold'
                    : 'bg-neutral-800 text-neutral-200'
                }`}
              >
                🤪 Funny
              </button>
            </div>
          </div>

          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-400 mb-2">
              Message preview
            </div>
            <div className="bg-neutral-800 rounded-lg p-3 text-sm text-neutral-100 whitespace-pre-line">
              {message}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={handleCopy}
              className="py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-xs font-medium text-neutral-100"
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              onClick={handleWhatsApp}
              className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white"
            >
              WhatsApp
            </button>
            <button
              onClick={handleSMS}
              className="py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-medium text-white"
            >
              SMS
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
