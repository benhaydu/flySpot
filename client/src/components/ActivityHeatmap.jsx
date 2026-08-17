function localISODate(date) {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Groups a flat list of days into week-columns (Sun-Sat), matching a
// calendar-style grid. Pads the first week with nulls if it doesn't start
// on a Sunday.
function buildWeeks(days) {
  const weeks = [];
  let week = new Array(days[0].dow).fill(null);
  for (const day of days) {
    week.push(day);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) weeks.push(week);
  return weeks;
}

export default function ActivityHeatmap({ activity }) {
  const countByDate = new Map(activity.map(a => [a.date, a.count]));

  const today = new Date();
  const days = [];
  for (let i = 83; i >= 0; i--) {
    // Date(year, month, day - i) handles month/year rollover automatically —
    // no manual date-math needed, and it's local-time, not UTC.
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
    const key = localISODate(d);
    days.push({ date: key, count: countByDate.get(key) || 0, dow: d.getDay() });
  }

  const weeks = buildWeeks(days);

  const LEVELS = ['var(--surface2)', '#215753', '#368143', '#48a436', 'var(--accent-green)'];

    function levelFor(count) {
    if (count === 0) return 0;
    if (count === 1) return 1;
    if (count <= 3) return 2;
    if (count <= 6) return 3;
    return 4;
}

  return (
    <div style={s.grid}>
      {weeks.map((week, wi) => (
        <div key={wi} style={s.col}>
          {week.map((day, di) => (
            <div
              key={di}
              title={day ? `${day.date}: ${day.count} catch${day.count === 1 ? '' : 'es'}` : ''}
              style={{
                ...s.cell,
                opacity: day ? 1 : 0,
                background: day ? LEVELS[levelFor(day.count)] : 'transparent',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

const s = {
  grid: { display: 'flex', gap: '3px' },
  col:  { display: 'flex', flexDirection: 'column', gap: '3px' },
  cell: { width: '10px', height: '10px', border: '1px solid var(--border)' },
};