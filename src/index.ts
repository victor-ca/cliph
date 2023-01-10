import dotenv from "dotenv";
import { bootstrap } from "./bootstrap";

import { InMemoryRepo } from "./lib/in-mem/in-mem.employee.repo";

dotenv.config();
const port = process.env.PORT;

const app = bootstrap({ repo: new InMemoryRepo() });

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
