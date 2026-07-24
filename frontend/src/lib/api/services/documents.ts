import { api } from "../client";

export interface DocItem {
  id: string;
  title: string;
  category: "debt" | "minutes" | "general" | "announcement";
  file: string;
  uploaded_by_name: string;
  uploaded_at: string;
  size?: number;
}

export const documentsService = {
  listMeeting: () => api.get<DocItem[]>("/documents/meetings/"),
  listGeneral: () => api.get<DocItem[]>("/documents/general/"),
  listAll: async () => {
    const [meetings, general] = await Promise.all([documentsService.listMeeting(), documentsService.listGeneral()]);
    return {
      data: [...meetings.data.map((item) => ({ ...item, category: "minutes" as const })), ...general.data],
    };
  },
  uploadMeeting: (formData: FormData) =>
    api.post<DocItem>("/documents/meetings/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  uploadGeneral: (formData: FormData) =>
    api.post<DocItem>("/documents/general/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id: string) => api.delete(`/documents/${id}/`),
};
