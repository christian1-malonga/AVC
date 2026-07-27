import { api } from "../client";

export interface VoiceNote {
  id: string;
  title: string;
  category: string;
  file: string;
  uploaded_by_name: string;
  uploaded_at: string;
  size: number;
}

export const voiceNotesService = {
  list: () => api.get<VoiceNote[]>("/voice-notes/"),
  delete: (id: string) => api.delete(`/voice-notes/${id}/`),
};
