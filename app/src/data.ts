export const MATERIALS = ["HTV cards", "T-shirts", "Yard signs"] as const;
export type Material = (typeof MATERIALS)[number];

// Legislative Council regions, as in htv-regional-distribution.drawio
export const REGIONS = [
  "Eastern Victoria",
  "Northern Victoria",
  "Western Victoria",
  "North-Eastern Metropolitan",
  "South-Eastern Metropolitan",
  "Southern Metropolitan",
  "Northern Metropolitan",
  "Western Metropolitan",
] as const;
export type Region = (typeof REGIONS)[number];

// Legislative Assembly districts in each region (2026 boundaries, per
// tallyroom.com.au/vic2026).
export const REGION_DISTRICTS: Record<Region, readonly string[]> = {
  "Eastern Victoria": [
    "Bass",
    "Evelyn",
    "Gippsland East",
    "Gippsland South",
    "Hastings",
    "Monbulk",
    "Mornington",
    "Morwell",
    "Narracan",
    "Nepean",
    "Pakenham",
  ],
  "Northern Victoria": [
    "Benambra",
    "Bendigo East",
    "Bendigo West",
    "Eildon",
    "Euroa",
    "Macedon",
    "Mildura",
    "Murray Plains",
    "Ovens Valley",
    "Shepparton",
    "Yan Yean",
  ],
  "Western Victoria": [
    "Bellarine",
    "Eureka",
    "Geelong",
    "Lara",
    "Lowan",
    "Melton",
    "Polwarth",
    "Ripon",
    "South Barwon",
    "South-West Coast",
    "Wendouree",
  ],
  "North-Eastern Metropolitan": [
    "Bayswater",
    "Box Hill",
    "Bulleen",
    "Bundoora",
    "Croydon",
    "Eltham",
    "Glen Waverley",
    "Ivanhoe",
    "Mill Park",
    "Ringwood",
    "Warrandyte",
  ],
  "South-Eastern Metropolitan": [
    "Berwick",
    "Carrum",
    "Clarinda",
    "Cranbourne",
    "Dandenong",
    "Frankston",
    "Mordialloc",
    "Mulgrave",
    "Narre Warren North",
    "Narre Warren South",
    "Rowville",
  ],
  "Southern Metropolitan": [
    "Albert Park",
    "Ashwood",
    "Bentleigh",
    "Brighton",
    "Caulfield",
    "Hawthorn",
    "Kew",
    "Malvern",
    "Oakleigh",
    "Prahran",
    "Sandringham",
  ],
  "Northern Metropolitan": [
    "Broadmeadows",
    "Brunswick",
    "Essendon",
    "Greenvale",
    "Kalkallo",
    "Melbourne",
    "Northcote",
    "Pascoe Vale",
    "Preston",
    "Richmond",
    "Thomastown",
  ],
  "Western Metropolitan": [
    "Footscray",
    "Kororoit",
    "Laverton",
    "Niddrie",
    "Point Cook",
    "St Albans",
    "Sunbury",
    "Sydenham",
    "Tarneit",
    "Werribee",
    "Williamstown",
  ],
};

// One value per checklist item, keyed by checkKey(stage, region, item): its
// date (YYYY-MM-DD, done or scheduled), contact name, or method.
export type ItemValues = Record<string, string>;

export const checkKey = (stage: string, region: Region, item: string) =>
  `${stage}|${region}|${item}`;

// Items collected one at a time in the side panel: either a flat list (e.g.
// districts) or items grouped under a heading (e.g. booths by district).
export type Collection = {
  unit: string; // plural, for counts: "districts", "booths"
  itemLabel: string; // column heading: "District", "Booth"
  doneLabel: string; // what ticked means: "collected", "ready for pick up"
  // Heading for a required name column ("Collected by"); omit for no column
  contactLabel?: string;
  // Optional "how" choice per item (e.g. posted or collected). When set, the
  // name column only applies to items done by contactMethod.
  methods?: readonly string[];
  contactMethod?: string;
  groups: { heading?: string; items: readonly string[] }[];
};

// Grouped items include their heading, so "Booth 1" in one district doesn't
// clash with "Booth 1" in another.
export const collectionItem = (heading: string | undefined, item: string) =>
  heading ? `${heading}/${item}` : item;

export const collectionSize = (c: Collection) =>
  c.groups.reduce((n, g) => n + g.items.length, 0);

export type CollectionStore = {
  dates: ItemValues;
  contacts: ItemValues;
  methods: ItemValues;
  today: string;
};

// Does this item need a contact name, given its chosen method?
export const needsContact = (collection: Collection, method: string) =>
  !!collection.contactLabel &&
  (!collection.methods || method === collection.contactMethod);

// What's still needed before an item can be ticked, or "" if nothing
export function missingForTick(
  key: string,
  collection: Collection,
  store: CollectionStore,
) {
  const method = store.methods[key] ?? "";
  if (collection.methods && !method) return "Choose how first";
  if (
    needsContact(collection, method) &&
    (store.contacts[key] ?? "").trim() === ""
  )
    return "Add a name first";
  return "";
}

// An item is done once it has everything it needs (method, contact) and a
// date of today or earlier.
export function isDone(
  key: string,
  collection: Collection,
  store: CollectionStore,
) {
  const date = store.dates[key] ?? "";
  return (
    !missingForTick(key, collection, store) &&
    date !== "" &&
    date <= store.today
  );
}

export function countDone(
  stage: string,
  region: Region,
  collection: Collection,
  store: CollectionStore,
  groups = collection.groups,
) {
  return groups
    .flatMap((g) =>
      g.items.map((i) => checkKey(stage, region, collectionItem(g.heading, i))),
    )
    .filter((key) => isDone(key, collection, store)).length;
}

// Booth names aren't announced yet, so each district gets numbered placeholders
const PLACEHOLDER_BOOTHS = Array.from(
  { length: 10 },
  (_, i) => `Booth ${i + 1}`,
);

// How each region's materials get to booths (see htv-regional-distribution.drawio)
type Distribution = "posted" | "booth pick-up" | "district pick-up";

const DISTRIBUTION: Record<Region, Distribution> = {
  "Eastern Victoria": "posted",
  "Northern Victoria": "posted",
  "Western Victoria": "posted",
  "North-Eastern Metropolitan": "district pick-up",
  "South-Eastern Metropolitan": "district pick-up",
  "Southern Metropolitan": "district pick-up",
  "Northern Metropolitan": "booth pick-up",
  "Western Metropolitan": "booth pick-up",
};

type Labels = Omit<Collection, "unit" | "itemLabel" | "groups">;

const COLLECTED: Labels = { doneLabel: "collected", contactLabel: "Collected by" };

const boothCollection = (region: Region, labels: Labels): Collection => ({
  unit: "booths",
  itemLabel: "Booth",
  ...labels,
  groups: REGION_DISTRICTS[region].map((d) => ({
    heading: d,
    items: PLACEHOLDER_BOOTHS,
  })),
});

const districtCollection = (region: Region, labels: Labels): Collection => ({
  unit: "districts",
  itemLabel: "District",
  ...labels,
  groups: [{ items: REGION_DISTRICTS[region] }],
});

// Stage Two checklist items. Items are placeholders for now.
const STAGE_TWO_ITEMS: Record<Distribution, readonly string[]> = {
  posted: ["Broken into **booths** with **t-shirt** allowance for postage"],
  "district pick-up": [
    "Broken into **districts** with **sign and t-shirt** allowance for pick up",
  ],
  // Tracked district by district instead (see Stage Two's collection)
  "booth pick-up": [],
};

function stageThreeCollection(region: Region): Collection {
  switch (DISTRIBUTION[region]) {
    case "posted":
      return boothCollection(region, {
        doneLabel: "posted or collected",
        contactLabel: "Collected by",
        methods: ["Posted", "Collected"],
        contactMethod: "Collected",
      });
    case "booth pick-up":
      return boothCollection(region, COLLECTED);
    case "district pick-up":
      return districtCollection(region, COLLECTED);
  }
}

export type Stage = {
  title: string;
  status: string;
  note?: string;
  // Checklist items shown in each region's cell for this stage
  checklist?: (region: Region) => readonly string[];
  // Tracked item by item in a side panel instead of the checklist
  collection?: (region: Region) => Collection | undefined;
};

export const STAGES: Stage[] = [
  {
    title: "Stage One",
    status: "Received",
    note: "Dates in the future are scheduled deliveries, dates today or in the past are marked as received",
    checklist: () => MATERIALS,
  },
  {
    title: "Stage Two",
    status: "Ready for pickup or post",
    checklist: (region) => STAGE_TWO_ITEMS[DISTRIBUTION[region]],
    collection: (region) =>
      DISTRIBUTION[region] === "booth pick-up"
        ? districtCollection(region, {
            doneLabel: "with all booths ready for pick up",
          })
        : undefined,
  },
  {
    title: "Stage Three",
    status: "Picked up or posted",
    collection: stageThreeCollection,
  },
];
