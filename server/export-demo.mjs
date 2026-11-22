import { writeFileSync } from "node:fs";

import { demoListings } from "../src/lib/demo.ts";

const destination = process.argv[2] ?? new URL(".demo-listings.json", import.meta.url);
writeFileSync(destination, JSON.stringify(demoListings, null, 2) + "\n", "utf8");
