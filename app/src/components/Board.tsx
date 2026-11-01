import { useState, type CSSProperties } from "react";
import {
  REGIONS,
  STAGES,
  checkKey,
  collectionSize,
  countDone,
  type Collection,
  type CollectionStore,
  type Region,
} from "../data";
import { CollectionPanel } from "./CollectionPanel";

type Props = Omit<CollectionStore, "today"> & {
  onSetDate: (key: string, date: string) => void;
  onSetContact: (key: string, contact: string) => void;
  onSetMethod: (key: string, method: string) => void;
};

// Regions are the swimlanes (rows); stages are the columns.
export function Board(props: Props) {
  // Local date as YYYY-MM-DD, so it compares directly with <input type="date"> values
  const today = new Date().toLocaleDateString("en-CA");
  // Which stage and region are open in the side panel, if any
  const [open, setOpen] = useState<{
    stage: string;
    region: Region;
    collection: Collection;
  } | null>(null);

  return (
    <div className="board-scroll">
      <div
        className="board-grid"
        style={{ "--stages": STAGES.length } as CSSProperties}
      >
        <div className="corner">Region</div>
        {STAGES.map((s, i) => (
          <div key={s.title} className="stage-head">
            <span className="stage-head__num">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <h2>{s.title}</h2>
              <p>
                Status: {s.status}
                {s.note && (
                  <span className="info">
                    <button
                      type="button"
                      className="info__icon"
                      aria-label={s.note}
                    >
                      i
                    </button>
                    <span className="info__tip" role="tooltip">
                      {s.note}
                    </span>
                  </span>
                )}
              </p>
            </div>
          </div>
        ))}

        {REGIONS.map((region) => (
          <RegionRow
            key={region}
            region={region}
            today={today}
            onOpenCollection={(stage, collection) =>
              setOpen({ stage, region, collection })
            }
            {...props}
          />
        ))}
      </div>

      {open && (
        <CollectionPanel
          {...open}
          today={today}
          onClose={() => setOpen(null)}
          {...props}
        />
      )}
    </div>
  );
}

function RegionRow({
  region,
  today,
  onOpenCollection,
  ...props
}: Props & {
  region: Region;
  today: string;
  onOpenCollection: (stage: string, collection: Collection) => void;
}) {
  return (
    <>
      <div className="region-head">{region}</div>
      {STAGES.map((s) => {
        const collection = s.collection?.(region);
        return (
          <div key={s.title} className="cell">
            {collection ? (
              <CollectionSummary
                stage={s.title}
                region={region}
                collection={collection}
                store={{ ...props, today }}
                onOpen={() => onOpenCollection(s.title, collection)}
              />
            ) : (
              s.checklist && (
                <Checklist
                  stage={s.title}
                  region={region}
                  items={s.checklist(region)}
                  dates={props.dates}
                  today={today}
                  onSetDate={props.onSetDate}
                />
              )
            )}
          </div>
        );
      })}
    </>
  );
}

function CollectionSummary({
  stage,
  region,
  collection,
  store,
  onOpen,
}: {
  stage: string;
  region: Region;
  collection: Collection;
  store: CollectionStore;
  onOpen: () => void;
}) {
  const total = collectionSize(collection);
  const done = countDone(stage, region, collection, store);

  return (
    <button type="button" className="collection-summary" onClick={onOpen}>
      <span className="collection-summary__text">
        {done}/{total} {collection.unit} {collection.doneLabel}
        <span aria-hidden="true"> ›</span>
      </span>
      <span className="collection-summary__bar" aria-hidden="true">
        <span style={{ width: `${(done / total) * 100}%` }} />
      </span>
    </button>
  );
}

// Renders **text** as bold; everything else stays plain
function withBold(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}

function Checklist({
  stage,
  region,
  items,
  dates,
  today,
  onSetDate,
}: Pick<Props, "dates" | "onSetDate"> & {
  stage: string;
  region: Region;
  items: readonly string[];
  today: string;
}) {
  return (
    <ul className="checklist">
      {items.map((item) => {
        const key = checkKey(stage, region, item);
        const date = dates[key] ?? "";
        const done = date !== "" && date <= today;

        return (
          <li key={item} className={`check${done ? " is-done" : ""}`}>
            {/* Ticked state follows the date; ticking sets today, unticking clears it */}
            <input
              type="checkbox"
              checked={done}
              onChange={() => onSetDate(key, done ? "" : today)}
              aria-label={`${item} done, ${region}`}
            />
            <span className="check__label">{withBold(item)}</span>

            <input
              type="date"
              className="check__date"
              value={date}
              onChange={(e) => onSetDate(key, e.target.value)}
              aria-label={`${item} date, ${region}`}
            />
          </li>
        );
      })}
    </ul>
  );
}
