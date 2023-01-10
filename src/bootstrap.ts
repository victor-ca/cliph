import express, { Express, Request, Response } from "express";
import { EmployeeRepo } from "./lib/employee.repo";
import { allowedCurrencies, Employee } from "./model/employee";

export const bootstrap = ({ repo }: { repo: EmployeeRepo }): Express => {
  const app: Express = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.static("public"));

  app.delete("/employees/:employeeName", (req: Request, res: Response) => {
    repo
      .deleteRecord(req.params.employeeName)
      .then((emp) => res.send(emp))
      .catch(() => {
        res.statusCode = 500;
        res.send({ error: "delete failed" });
      });
  });

  app.post("/employees", async (req: Request, res: Response) => {
    const {
      currency,
      department,
      name,
      salary: salaryStr,
      sub_department,
      on_contract: on_contractStr,
    } = req.body as Employee;
    const salary = +salaryStr;
    const on_contract = !!on_contractStr;
    const errors: (undefined | string | boolean)[] = [
      !allowedCurrencies.includes(currency) &&
        `invalid currency: ${currency || "none"}`,
      !department && "department is required",
      !name && "name is required",
      (salary <= 0 || salary > 10000000) && `invalid salary: ${salary || "0"}`,
      !sub_department && "sub_department is required",
    ].filter((x) => !!x);

    if (!!errors.length) {
      res.statusCode = 400;
      res.send({ errors });
      return;
    }

    const newEmp = await repo.addRecord({
      currency,
      department,
      name,
      salary,
      sub_department,
      on_contract,
    });
    res.send(newEmp);
  });

  app.get("/statistics", async (req: Request, res: Response) => {
    const data = await repo.getOverallSalaryStatics();
    res.send(data);
  });

  app.get("/statistics/contractors", async (req: Request, res: Response) => {
    const data = await repo.getSalaryStatisticsForContractors();
    res.send(data);
  });

  app.get("/statistics/by-dept", async (req: Request, res: Response) => {
    const data = await repo.getSalaryStatisticsPerDepartment();
    res.send(data);
  });

  app.get(
    "/statistics/by-dept-and-sub-dept",
    async (req: Request, res: Response) => {
      const data =
        await repo.getSalaryStatisticsPerDepartmentAndSubDepartment();
      res.send(data);
    }
  );
  return app;
};
