// Activity log for the home page. These are sample entries with made-up
// contacts and booths; they'll be replaced by real events as the checklist
// and collection data start recording them.
export type Activity = {
  at: string; // local date and time, YYYY-MM-DDTHH:MM
  text: string; // **text** renders bold
};

export const ACTIVITY: Activity[] = [
  {
    at: "2026-11-02T11:30",
    text: "All **Southern Metropolitan** districts have been collected",
  },
  {
    at: "2026-11-02T11:27",
    text: "**Altona North Primary School** (Williamstown District) materials are in the post",
  },
  {
    at: "2026-11-02T11:02",
    text: "**Priya Raman** has collected the district kit for Box Hill (North-Eastern Metropolitan)",
  },
  {
    at: "2026-11-02T10:54",
    text: "**Daniel Okafor** has collected the booth kit for **Newport Lakes Primary School** (Williamstown District)",
  },
  {
    at: "2026-11-02T10:18",
    text: "**Seddon Community Hall** (Footscray District) is ready for pick up",
  },
  {
    at: "2026-11-02T09:41",
    text: "**Margaret Doyle** has collected the district kit for Bendigo East (Northern Victoria)",
  },
  {
    at: "2026-11-02T09:05",
    text: "Yard signs received for **Western Victoria**",
  },
  {
    at: "2026-11-01T16:48",
    text: "**Tom Nguyen** has collected the district kit for Frankston (South-Eastern Metropolitan)",
  },
  {
    at: "2026-11-01T15:12",
    text: "All **Brunswick District** booths are ready for pick up",
  },
  {
    at: "2026-11-01T13:36",
    text: "**Sarah Whitfield** has collected the district kit for Kew (Southern Metropolitan)",
  },
  {
    at: "2026-11-01T11:20",
    text: "HTV cards received for all regions",
  },
  {
    at: "2026-11-01T09:15",
    text: "T-shirt delivery for **Eastern Victoria** scheduled for 4 November",
  },
];
