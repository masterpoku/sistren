import { z } from "zod";

export const gradeTypeSchema = z.enum([
  "knowledge",
  "skill",
  "attitude",
  "extracurricular",
]);
