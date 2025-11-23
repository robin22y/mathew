export type BorrowDirection = "they_owe_me" | "i_owe_them";

export function generateReminderMessage(item: {
  borrowerName?: string;
  name: string;              // item or amount
  dueDate?: string | null;
  notes?: string;
  borrowDirection?: BorrowDirection; // NEW field
}) {
  const { borrowerName, name, dueDate, notes, borrowDirection } = item;

  const hasName = borrowerName && borrowerName.trim().length > 0;

  const due = dueDate
    ? new Date(dueDate).toLocaleDateString()
    : null;

  const noteText = notes && notes.trim().length > 0 ? `\nNote: ${notes}` : "";

  //
  // --------------------------
  //   CASE 1 – THEY OWE YOU
  // --------------------------
  //
  if (borrowDirection === "they_owe_me") {
    // With name + due date
    if (hasName && due) {
      return `Hey ${borrowerName}, just a quick reminder about the ${name} you borrowed from me.
It's due on ${due}.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    // With name, no due date
    if (hasName && !due) {
      return `Hey ${borrowerName}, just a quick reminder about the ${name} you borrowed from me.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    // No name, with due date
    if (!hasName && due) {
      return `Hey, just a quick reminder about the ${name} you borrowed from me.
It's due on ${due}.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    // No name, no due date
    return `Hey, just a quick reminder about the ${name} you borrowed from me.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
  }

  //
  // --------------------------
  //   CASE 2 – YOU OWE THEM
  // --------------------------
  //
  if (borrowDirection === "i_owe_them") {
    if (hasName && due) {
      return `Hey ${borrowerName}, just wanted to confirm about the ${name} I borrowed from you.
It's due on ${due}. I'll return/settle it on time.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    if (hasName && !due) {
      return `Hey ${borrowerName}, just wanted to confirm about the ${name} I borrowed from you.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    if (!hasName && due) {
      return `Hey, just wanted to confirm about the ${name} I borrowed from you.
It's due on ${due}. I'll return/settle it on time.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
    }

    return `Hey, just wanted to confirm about the ${name} I borrowed from you.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
  }

  //
  // ---------------------------------------
  //   FALLBACK — if direction missing
  //   (Treat as THEY OWE YOU, but soft)
  // ---------------------------------------
  //
  if (hasName) {
    return `Hey ${borrowerName}, just a quick reminder about the ${name} from last time.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
  }

  return `Hey, just a quick reminder about the ${name} from last time.${noteText}

(Sent via Borrbox)
https://app.borrbox.com`;
}

export function openWhatsApp(message: string) {
  const encoded = encodeURIComponent(message);
  const url = `https://api.whatsapp.com/send?text=${encoded}`;
  window.open(url, "_blank");
}

export function openSMS(message: string) {
  const encoded = encodeURIComponent(message);
  window.location.href = `sms:?body=${encoded}`;
}

export async function copyMessage(msg: string) {
  try {
    await navigator.clipboard.writeText(msg);
  } catch (e) {
    console.warn("Clipboard write failed", e);
  }
}

