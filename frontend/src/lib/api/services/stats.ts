import { api } from "../client";

export const statsService = {
  overview: () => api.get("/analytics/stats/"),
};
