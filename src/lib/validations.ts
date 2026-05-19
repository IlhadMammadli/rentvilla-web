import { z } from "zod";

export const villaOwnerRegisterSchema = z.object({
  customerType: z.literal("villa_owner"),
  firstName: z.string().min(2, "Name is required"),
  lastName: z.string().min(2, "Surname is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(9, "Valid phone number is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const realtorRegisterSchema = z.object({
  customerType: z.literal("realtor"),
  companyName: z.string().min(2, "Company name is required"),
  phone: z.string().min(9, "Valid phone number is required"),
  email: z.string().email("Valid email is required").optional().or(z.literal("")),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerSchema = z.discriminatedUnion("customerType", [
  villaOwnerRegisterSchema,
  realtorRegisterSchema,
]);

export const loginSchema = z.object({
  loginType: z.enum(["email", "phone"]),
  email: z.string().optional(),
  phone: z.string().optional(),
  password: z.string().min(1, "Password is required"),
});
