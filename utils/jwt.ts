import { sign, verify } from "jsonwebtoken";

const JWT_SECRET = "very_bad_secret_123";

type Payload = {
  username: string;
  first_name: string;
  last_name: string;
  id: string;
};

export async function createToken(payload: Payload) {
  const token = await sign(payload, JWT_SECRET, { expiresIn: "1h" });
  return token;
}

export async function verifyToken(token: string) {
  try {
    const decodedToken = await verify(token, JWT_SECRET); // true or throw an error
    console.log(decodedToken);
    return decodedToken;
  } catch (err) {
    return false;
  }
}
