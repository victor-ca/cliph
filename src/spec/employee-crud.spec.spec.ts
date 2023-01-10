import { bootstrap } from "../bootstrap";

import { InMemoryRepo } from "../lib/in-mem/in-mem.employee.repo";
import { Employee } from "../model/employee";
import st from "supertest";

const givenAppWithEmployees = (emp: Employee[]) =>
  bootstrap({ repo: new InMemoryRepo(emp) });

type BadEmployeeRequestTestCase = {
  title: string;
  formData: Partial<Employee>;
  expectedError: string[];
};

const badEmployeeRequestTestCases: BadEmployeeRequestTestCase[] = [
  {
    title: "negative salary",
    formData: {
      name: "test",
      currency: "EUR",
      department: "test",
      salary: -3,
      sub_department: "test",
    },
    expectedError: ["invalid salary: -3"],
  },
  {
    title: "salary out of bounds",
    formData: {
      name: "test",
      currency: "EUR",
      department: "test",
      salary: 300000000,
      sub_department: "test",
    },
    expectedError: ["invalid salary: 300000000"],
  },
  {
    title: "invalid currency",
    formData: {
      name: "test",
      currency: "YEN" as any,
      department: "test",
      salary: 30,
      sub_department: "test",
    },
    expectedError: ["invalid currency: YEN"],
  },
  {
    title: "missing data",
    formData: {
      name: "",
      currency: "EUR",

      salary: 1,
    },
    expectedError: [
      "department is required",
      "name is required",
      "sub_department is required",
    ],
  },
];

describe("create employee api", () => {
  for (let { expectedError, formData, title } of badEmployeeRequestTestCases) {
    test(`attempting to create an invalid employee will fail (${title})`, async () => {
      const app = givenAppWithEmployees([]);

      const createUserRes = await st(app).post("/employees").send(formData);
      expect(createUserRes.statusCode).toBe(400);
      expect(createUserRes.body).toEqual({ errors: expectedError });
    });
  }

  test(`deleting an employee will fail if the employee does not exist`, async () => {
    const fakeEmployee = { name: "test" } as Employee;
    const app = givenAppWithEmployees([fakeEmployee]);

    const deleteEmp = await st(app)
      .delete("/employees/test")
      .set({ authorization: "dummy" });

    expect(deleteEmp.statusCode).toBe(200);
    expect(deleteEmp.body).toEqual(fakeEmployee);

    const deleteEmp2ndTime = await st(app)
      .delete("/employees/test")
      .set({ authorization: "dummy" });

    expect(deleteEmp2ndTime.statusCode).toBe(500);
    expect(deleteEmp2ndTime.body).toEqual({ error: "delete failed" });
  });

  test(`deleting an employee will fail if requestor is not authenticated`, async () => {
    const app = givenAppWithEmployees([
      { name: "test1" },
      { name: "test2" },
    ] as Employee[]);

    const deleteEmpAuth = await st(app)
      .delete("/employees/test1")
      .set({ authorization: "dummy" });

    expect(deleteEmpAuth.statusCode).toBe(200);

    const deleteEmpBadAuth = await st(app)
      .delete("/employees/test2")
      .set({ authorization: "wrong passphrase" });

    expect(deleteEmpBadAuth.statusCode).toBe(401);

    const deleteEmpNoAuth = await st(app).delete("/employees/test2");
    expect(deleteEmpNoAuth.statusCode).toBe(401);
  });
});
