export function getDateStatus(item: { dueDate?: string }) {
  const now = new Date();
  const due = item.dueDate ? new Date(item.dueDate) : null;

  const overdue = due && now > due;
  const nearDue =
    due &&
    now < due &&
    (due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) <= 3;

  return {
    overdue: overdue || false,
    nearDue: nearDue || false,
  };
}

