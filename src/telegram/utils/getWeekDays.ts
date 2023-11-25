export async function getNextWeekDates() {
  const today = new Date();
  const dayOfWeek = today.getDay();

  const startDayOfWeek = dayOfWeek === 6 || dayOfWeek === 5 ? 1 : dayOfWeek + 1;
  today.setDate(today.getDate() + ((startDayOfWeek - dayOfWeek + 7) % 7));

  const nextWeekDates = [];

  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(today);
    nextDate.setDate(today.getDate() + i);
    nextWeekDates.push(nextDate.toISOString().split('T')[0]);
  }
  return nextWeekDates;
}
