import { Employee } from "../model/employee";
import { SummaryStatistic } from "../model/salary-statistic";

export type StatisticByDepartment = {
  department: string;
  statistics: SummaryStatistic;
};
export type StatisticBySubDepartment = {
  sub_department: string;
  statistics: SummaryStatistic;
};

export type StatisticByDepartmentAndSubDepartment = {
  department: string;
  subDepartments: StatisticBySubDepartment[];
};

export type EmployeeRepo = {
  addRecord(record: Employee): Promise<Employee>;
  deleteRecord(name: string): Promise<Employee>;
  getOverallSalaryStatics(): Promise<SummaryStatistic>;
  getSalaryStatisticsForContractors(): Promise<SummaryStatistic>;
  getSalaryStatisticsPerDepartment(): Promise<StatisticByDepartment[]>;
  getSalaryStatisticsPerDepartmentAndSubDepartment(): Promise<
    StatisticByDepartmentAndSubDepartment[]
  >;
};
