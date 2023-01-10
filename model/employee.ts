export type Employee = {
  name: string;
  salary: number;
  currency: "USD" | "EUR" | "INR";
  department: string;
  on_contract?: boolean;
  sub_department: string;
};
