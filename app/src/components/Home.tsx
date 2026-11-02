import { ACTIVITY, type Activity } from "../activity";
import { withBold } from "../withBold";

// "10.54am", matching how times are written in updates
function formatTime(at: string) {
  const [h, m] = at.slice(11, 16).split(":").map(Number);
  const hour = h % 12 || 12;
  return `${hour}.${String(m).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
}

// "Monday 2 November"
function formatDay(day: string) {
  return new Date(`${day}T00:00`).toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

// Newest first, grouped by day
function byDay(entries: Activity[]) {
  const days = new Map<string, Activity[]>();
  for (const entry of [...entries].sort((a, b) => b.at.localeCompare(a.at))) {
    const day = entry.at.slice(0, 10);
    days.set(day, [...(days.get(day) ?? []), entry]);
  }
  return [...days];
}

export function Home() {
  return (
    <section className="activity">
      <h2 className="activity__title">Activity</h2>
      {byDay(ACTIVITY).map(([day, entries]) => (
        <div key={day} className="activity__day">
          <h3>{formatDay(day)}</h3>
          <ol className="activity__list">
            {entries.map((e) => (
              <li key={e.at + e.text}>
                <time dateTime={e.at}>{formatTime(e.at)}</time>
                <span>{withBold(e.text)}</span>
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
