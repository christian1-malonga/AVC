import { api } from "../client";

export interface Song {
  id: string;
  title: string;
  composer?: string;
  category: string;
  pdf_file?: string;
  docx_file?: string;
  audio_file?: string | null;
  upload_date: string;
}

export const musicService = {
  list: (params?: { q?: string; category?: string }) => api.get<Song[]>("/music/", { params }),
  get: (id: string) => api.get<Song>(`/music/${id}/`),
  upload: (formData: FormData) =>
    api.post<Song>("/music/", formData, { headers: { "Content-Type": "multipart/form-data" } }),
  remove: (id: string) => api.delete(`/music/${id}/`),
};
