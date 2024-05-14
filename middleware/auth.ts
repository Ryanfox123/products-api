import { RequestHandler } from "express";
import { verifyToken } from "../utils/jwt";

const auth: RequestHandler = async (req, res, next) => {
  let token = req.headers.token;
  if (!token) {
    return res.status(401).send();
  }

  // token is gonna be a string
  token = Array.isArray(token) ? token[0] : token;

  const decodedToken = await verifyToken(token);
  if (!decodedToken) {
    return res.status(401).send();
  }

  res.locals.token = decodedToken;

  return next();
};

export default auth;
