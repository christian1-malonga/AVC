import { api } from "../client";

export interface Receipt {
  id: string;
  user_id: string;
  title: string;
  file_path: string;
  amount: number;
  uploaded_by: string;
  uploaded_at: string;
  user_name?: string;
}

export const receiptsService = {
  list: () => api.get<Receipt[]>("/receipts/"),
};
