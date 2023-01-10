import dotenv from "dotenv";
import { bootstrap } from "./bootstrap";
import { EmployeeRepo } from "./lib/employee.repo";
import { InMemoryRepo } from "./lib/in-mem/in-mem.employee.repo";

dotenv.config();
const port = process.env.PORT;
const repo: EmployeeRepo = new InMemoryRepo();

const app = bootstrap({ repo });

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
