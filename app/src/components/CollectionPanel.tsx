import { useEffect, useRef } from "react";
import {
  checkKey,
  collectionItem,
  collectionSize,
  countDone,
  isDone,
  missingForTick,
  needsContact,
  type Collection,
  type CollectionStore,
  type Region,
} from "../data";

type Props = CollectionStore & {
  stage: string;
  region: Region;
  collection: Collection;
  onSetDate: (key: string, date: string) => void;
  onSetContact: (key: string, contact: string) => void;
  onSetMethod: (key: string, method: string) => void;
  onClose: () => void;
};

// Side panel for editing a region's districts or booths. A modal <dialog>
// gives us Esc-to-close and keeps keyboard focus inside while it's open.
export function CollectionPanel({
  stage,
  region,
  collection,
  dates,
  contacts,
  methods,
  today,
  onSetDate,
  onSetContact,
  onSetMethod,
  onClose,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const store = { dates, contacts, methods, today };
  const { doneLabel, contactLabel } = collection;
  const columns = 3 + (collection.methods ? 1 : 0) + (contactLabel ? 1 : 0);
  const done = countDone(stage, region, collection, store);

  return (
    <dialog
      ref={ref}
      className="drawer"
      aria-labelledby="drawer-title"
      onClose={onClose}
      // Clicks on the dimmed backdrop land on the dialog element itself
      onClick={(e) => e.target === ref.current && ref.current.close()}
    >
      <div className="drawer__body">
        <header className="drawer__head">
          <div>
            <h2 id="drawer-title">{region}</h2>
            <p>
              {stage} · {done}/{collectionSize(collection)} {collection.unit} {doneLabel}
            </p>
          </div>
          <button
            type="button"
            className="drawer__close"
            onClick={() => ref.current?.close()}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <table className="collection-table">
          <thead>
            <tr>
              <th>
                <span className="visually-hidden">{doneLabel}</span>
              </th>
              <th>{collection.itemLabel}</th>
              {collection.methods && <th>How</th>}
              <th>Date</th>
              {contactLabel && <th>{contactLabel}</th>}
            </tr>
          </thead>
          {collection.groups.map((group, gi) => (
            <tbody key={group.heading ?? gi}>
              {group.heading && (
                <tr className="collection-table__group">
                  <th colSpan={columns} scope="rowgroup">
                    {group.heading}
                    <span>
                      {countDone(stage, region, collection, store, [group])}/{group.items.length}
                    </span>
                  </th>
                </tr>
              )}
              {group.items.map((item) => {
                const key = checkKey(stage, region, collectionItem(group.heading, item));
                const date = dates[key] ?? "";
                const contact = contacts[key] ?? "";
                const method = methods[key] ?? "";
                const missing = missingForTick(key, collection, store);
                const itemDone = isDone(key, collection, store);
                const name = group.heading ? `${group.heading} ${item}` : item;

                return (
                  <tr key={item} className={itemDone ? "is-done" : undefined}>
                    <td>
                      {/* Method and contact (where required) come first; ticking sets today, unticking clears the date */}
                      <input
                        type="checkbox"
                        checked={itemDone}
                        disabled={!!missing}
                        title={missing || undefined}
                        onChange={() => onSetDate(key, itemDone ? "" : today)}
                        aria-label={`${name} ${doneLabel}`}
                      />
                    </td>
                    <td className="collection-table__name">{item}</td>
                    {collection.methods && (
                      <td>
                        <select
                          className="collection-table__method"
                          value={method}
                          onChange={(e) => onSetMethod(key, e.target.value)}
                          aria-label={`${name} how`}
                        >
                          <option value="">–</option>
                          {collection.methods.map((m) => (
                            <option key={m}>{m}</option>
                          ))}
                        </select>
                      </td>
                    )}
                    <td>
                      <input
                        type="date"
                        className="check__date"
                        value={date}
                        onChange={(e) => onSetDate(key, e.target.value)}
                        aria-label={`${name} date`}
                      />
                    </td>
                    {contactLabel && (
                      <td>
                        <input
                          className="collection-table__contact"
                          // Only asked for when this item's method needs it
                          disabled={!needsContact(collection, method)}
                          value={contact}
                          onChange={(e) => onSetContact(key, e.target.value)}
                          placeholder="Name"
                          aria-label={`${name} ${contactLabel.toLowerCase()}`}
                        />
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          ))}
        </table>
      </div>
    </dialog>
  );
}
