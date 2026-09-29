import { z } from "zod";

export const loginSchema = z.object({
  guestName: z.string().trim().min(2, "Please enter at least 2 characters.").max(50, "Please keep your name under 50 characters."),
  accessCode: z.string().trim().toUpperCase().refine(
    (code) => code === "ATELIER26" || code === "123456",
    "That welcome code isn't recognized.",
  ),
});

export type LoginFormInput = z.input<typeof loginSchema>;
export type LoginValues = z.infer<typeof loginSchema>;