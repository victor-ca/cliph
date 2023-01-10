export const allowedCurrencies = ["USD", "EUR", "INR"] as const;
export type Employee = {
  name: string;
  salary: number;
  currency: typeof allowedCurrencies[number];
  department: string;
  on_contract?: boolean;
  sub_department: string;
};
