import { z } from "zod";

const postRegisterSchema = z
  .object({
    username: z.string().min(1).max(256),
    password: z.string().min(7).max(256),
    dob: z.coerce.date(),
    address: z.string().min(1).max(256),
    first_name: z.string().min(1).max(256),
    last_name: z.string().min(1).max(256),
  })
  .strict();

export default postRegisterSchema;
