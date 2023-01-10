import { bootstrap } from "../bootstrap";

import { InMemoryRepo } from "../lib/in-mem/in-mem.employee.repo";
import { Employee } from "../model/employee";
import st from "supertest";
import { SummaryStatistic } from "../model/salary-statistic";
import {
  StatisticByDepartment,
  StatisticByDepartmentAndSubDepartment,
} from "../lib/employee.repo";

const givenAppWithEmployees = (emp: Employee[]) =>
  bootstrap({ repo: new InMemoryRepo(emp) });

describe("api", () => {
  test("attempting to get stats on empty repo returns zeros", async () => {
    const app = givenAppWithEmployees([]);

    const res = await st(app).get("/statistics");
    expect(res.body).toEqual({
      max: 0,
      min: 0,
      mean: 0,
    } as SummaryStatistic);
  });

  test("will given 2 salaries of 1, 2 and 3 will calculate min max an mean properly ", async () => {
    const app = givenAppWithEmployees([
      { salary: 1 },
      { salary: 3 },
    ] as Employee[]);

    const res = await st(app).get("/statistics");

    expect(res.body).toEqual({
      min: 1,
      mean: 2,
      max: 3,
    } as SummaryStatistic);
  });

  test(`given 1 employee with salary of 1,
        if a 2nd one with salary of 3 is added, 
        statistics will take into account the 2nd employee data`, async () => {
    const app = givenAppWithEmployees([{ salary: 1 }] as Employee[]);

    const formData: Employee = {
      name: "test",
      currency: "EUR",
      department: "test",
      salary: 3,
      sub_department: "test",
    } as Employee;

    const createUserRes = await st(app).post("/employees").send(formData);
    expect(createUserRes.statusCode).toBe(200);

    const statistics = await st(app).get("/statistics");
    expect(statistics.body).toEqual({
      min: 1,
      mean: 2,
      max: 3,
    } as SummaryStatistic);
  });

  test(`given 2 employee with salary of 1 (on contract), and two with salary of 100 (not on contract)
        calling "/statistics/contractors" will ignore non-contractors`, async () => {
    const app = givenAppWithEmployees([
      { salary: 1, on_contract: true },
      { salary: 2, on_contract: false },
      { salary: 1, on_contract: true },
      { salary: 2, on_contract: false },
    ] as Employee[]);

    const statistics = await st(app).get("/statistics/contractors");
    expect(statistics.body).toEqual({
      min: 1,
      mean: 1,
      max: 1,
    } as SummaryStatistic);
  });

  test(`given 2 employee in dept A and 3 in dept B
        calling "/statistics/by-dept" return two groups`, async () => {
    const app = givenAppWithEmployees([
      { salary: 1, on_contract: true, department: "A" },
      { salary: 3, on_contract: false, department: "A" },

      { salary: 10, on_contract: true, department: "B" },
      { salary: 20, on_contract: false, department: "B" },
      { salary: 30, on_contract: false, department: "B" },
    ] as Employee[]);

    const statistics = await st(app).get("/statistics/by-dept");
    expect(statistics.body).toEqual([
      {
        department: "A",
        statistics: {
          min: 1,
          mean: 2,
          max: 3,
        },
      },
      {
        department: "B",
        statistics: {
          min: 10,
          mean: 20,
          max: 30,
        },
      },
    ] as StatisticByDepartment[]);
  });

  test(`given dept A with sub-dept s1 and s2 and dept B with sub-depts s2 and s3
  calling "/statistics/by-dept-and-sub-dept" return two groups with 2 groupings each
  the s2 subgroup will not be mixed in between`, async () => {
    const app = givenAppWithEmployees([
      { salary: 1, on_contract: true, department: "A", sub_department: "s1" },
      { salary: 3, on_contract: true, department: "A", sub_department: "s1" },

      { salary: 3, on_contract: false, department: "A", sub_department: "s2" },
      { salary: 10, on_contract: true, department: "B", sub_department: "s2" },

      { salary: 20, on_contract: false, department: "B", sub_department: "s3" },
      { salary: 30, on_contract: false, department: "B", sub_department: "s3" },
    ] as Employee[]);

    const statistics = await st(app).get("/statistics/by-dept-and-sub-dept");
    expect(statistics.body).toEqual([
      {
        department: "A",
        subDepartments: [
          {
            sub_department: "s1",
            statistics: {
              min: 1,
              mean: 2,
              max: 3,
            },
          },
          {
            sub_department: "s2",
            statistics: {
              min: 3,
              mean: 3,
              max: 3,
            },
          },
        ],
      },
      {
        department: "B",
        subDepartments: [
          {
            sub_department: "s2",
            statistics: {
              min: 10,
              mean: 10,
              max: 10,
            },
          },
          {
            sub_department: "s3",
            statistics: {
              min: 20,
              mean: 25,
              max: 30,
            },
          },
        ],
      },
    ] as StatisticByDepartmentAndSubDepartment[]);
  });
});
