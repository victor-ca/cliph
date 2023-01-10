import { Employee } from "../../model/employee";
import { SummaryStatistic } from "../../model/salary-statistic";
import {
  EmployeeRepo,
  StatisticByDepartment,
  StatisticByDepartmentAndSubDepartment,
} from "../employee.repo";
import { groupBy } from "lodash";
const defaultDataSet = (require("./dataset.json") as Employee[]).map((x) => ({
  ...x,
  salary: +x.salary,
  on_contract: !!x.on_contract,
}));
export class InMemoryRepo implements EmployeeRepo {
  #data: Employee[];
  constructor(initialData: Employee[] = defaultDataSet) {
    this.#data = initialData;
  }
  getSalaryStatisticsPerDepartment(): Promise<StatisticByDepartment[]> {
    const asArray = groupToArrayAndGetStatisticsSummary(
      this.#data,
      "department"
    );

    return Promise.resolve(asArray);
  }

  getSalaryStatisticsPerDepartmentAndSubDepartment(): Promise<
    StatisticByDepartmentAndSubDepartment[]
  > {
    const groupedByDept = groupBy(this.#data, (x) => x.department);
    const asArray = Object.entries(groupedByDept).map(
      ([department, data]): StatisticByDepartmentAndSubDepartment => ({
        department,
        subDepartments: groupToArrayAndGetStatisticsSummary(
          data,
          "sub_department"
        ),
      })
    );

    return Promise.resolve(asArray);
  }

  private _getIndex(name: string): number {
    return this.#data.findIndex((x) => x.name === name);
  }
  addRecord(employee: Employee): Promise<Employee> {
    this.#data.push(employee);
    return Promise.resolve(employee);
  }
  deleteRecord(name: string): Promise<Employee> {
    const index = this._getIndex(name);
    if (index < 0) {
      Promise.reject(new Error(`An employee named ${name} was not found`));
    }

    const employee = this.#data[index];
    this.#data.splice(index, 1);
    return Promise.resolve(employee);
  }

  getOverallSalaryStatics(): Promise<SummaryStatistic> {
    return Promise.resolve(getStatistics(this.#data));
  }

  getSalaryStatisticsForContractors(): Promise<SummaryStatistic> {
    return Promise.resolve(
      getStatistics(this.#data.filter((x) => x.on_contract === true))
    );
  }
}

const getStatistics = (data: Employee[]): SummaryStatistic => {
  if (!data.length) {
    return { max: 0, min: 0, mean: 0 };
  }

  const firstRecord = data[0];
  let min = firstRecord.salary;
  let max = firstRecord.salary;
  let acc = firstRecord.salary;
  for (let { salary } of data.slice(1)) {
    if (min > salary) {
      min = salary;
    }
    if (max < salary) {
      max = salary;
    }
    acc += salary;
  }

  return {
    min,
    max,
    mean: +(acc / data.length).toFixed(2),
  };
};

type GroupedStatistic<K extends string> = Array<
  { [key in K]: string } & {
    statistic: SummaryStatistic;
  }
>;

const groupToArrayAndGetStatisticsSummary = <K extends keyof Employee>(
  data: Employee[],
  key: K
): GroupedStatistic<K> => {
  const grouped = groupBy(data, (x) => x[key]);
  const asArray = Object.entries(grouped).map(([group, data]) => ({
    [key]: group,
    statistic: getStatistics(data),
  }));

  return asArray as GroupedStatistic<K>;
};
