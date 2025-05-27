import { http, HttpResponse } from "msw";

export const handlers = [
  // List resumes endpoint
  http.get("/api/resumes", () => {
    return HttpResponse.json({
      resumes: [
        { filename: "resume1", path: "/resumes/resume1" },
        { filename: "resume2", path: "/resumes/resume2" },
      ],
    });
  }),

  // Get specific resume content
  http.get("/api/resumes/:filename", () => {
    return HttpResponse.text("# Fetched Content");
  }),

  // Save resume
  http.put("/api/resumes/:filename", () => {
    return HttpResponse.json({ success: true });
  }),

  // Create new resume
  http.post("/api/resumes/:filename", () => {
    return HttpResponse.json({ success: true });
  }),

  // Delete resume
  http.delete("/api/resumes/:filename", () => {
    return HttpResponse.json({ success: true });
  }),
];
