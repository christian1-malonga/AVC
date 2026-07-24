import { api } from "../client";

export interface DebtDetail {
  id: string;
  amount: number;
  reason: string;
  date: string;
  created_at: string;
}

export interface Debt {
  id: string;
  user?: number;
  user_name: string;
  total_absence_debt: number;
  total_late_debt: number;
  total_paid: number;
  total_debt: number;
  updated_at: string;
  details: DebtDetail[];
}

export const debtService = {
  my: async () => {
    try {
      return await api.get<Debt>("/debts/my/");
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return { data: null as unknown as Debt, status: 404, statusText: "Not Found", headers: error.response?.headers, config: error.config };
      }
      throw error;
    }
  },
  list: async () => {
    return await api.get<Debt[]>("/debts/list/");
  },
  update: async (userId: number | string, data: { total_absence_debt?: number; total_late_debt?: number; total_paid?: number; total_debt?: number }) => {
    return await api.post<Debt>(`/debts/user/${userId}/`, data);
  },
};

