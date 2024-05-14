import { RequestHandler } from "express";
import { type Schema } from "zod";

const validate = (schema: Schema): RequestHandler => {
  return async (req, res, next) => {
    const validationResult = schema.safeParse(req.body);
    if (validationResult.success) {
      return next();
    }
    return res.status(400).send({ message: validationResult.error.toString() });
  };
};

export default validate;
