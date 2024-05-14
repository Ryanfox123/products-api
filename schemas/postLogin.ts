import { z } from "zod";

const postLoginSchema = z
  .object({
    username: z.string(),
    password: z.string(),
  })
  .strict();

export default postLoginSchema;
