import { z } from "zod";

const create = z.object({
  body: z.object({
    password: z.string(),
    role: z.string().optional(),
    email: z.string(),
    admin: z
      .object({
        name: z.string(),
        contactNumber: z.string(),
        photoURL: z.string().optional(),
      })
      .optional(),
    patient: z
      .object({
        name: z.string(),
        contactNumber: z.string(),
        address: z.string(),
        photoURL: z.string().optional(),
      })
      .optional(),
    doctor: z
      .object({
        name: z.string(),
        photoURL: z.string().optional(),
        contactNumber: z.string(),
        address: z.string(),
        registrationNumber: z.string(),
        experience: z.number(),
        gender: z.string(),
        appointmentFee: z.number(),
        qualification: z.string(),
        currentWorkingPlace: z.string(),
        designation: z.string(),
        averageRating: z.number(),
      })
      .optional(),
  }),
});

export const userValidation = {
  create,
};
