import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { EmployeeRepo } from "./lib/employee.repo";
import { InMemoryRepo } from "./lib/in-mem/in-mem.employee.repo";

dotenv.config();
const port = process.env.PORT;
const repo: EmployeeRepo = new InMemoryRepo();

const app: Express = express();
app.use(express.json());

app.get("/statistics", async (req: Request, res: Response) => {
  const data = await repo.getOverallSalaryStatics();
  res.send(data);
});

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
});
