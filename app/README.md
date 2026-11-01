# Polling day materials

Tracks HTV cards, T-shirts and yard signs through three stages (received, ready
for pickup or post, picked up or posted) for each Victorian Legislative Council
region. Progress is saved in the browser's localStorage.

Regions, districts and each region's distribution method live in
`src/data.ts`; see `../htv-regional-distribution.drawio` for the process.

```sh
npm install
npm run dev     # local dev server
npm run build   # type-check and build to dist/
npm run lint
```
