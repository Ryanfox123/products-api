import express, { type RequestHandler } from "express";
import postgres from "postgres";
import { createToken, verifyToken } from "./utils/jwt";

const sql = postgres({
  user: "postgres",
  database: "postgres",
  password: "bad_password_123",
  host: "ryan-testing.cfppyeac1zs9.eu-west-2.rds.amazonaws.com",
  port: 5432,
  ssl: false,
});

const app = express();
const PORT = 3030;

// request -> api -> middleware(s) -> handler(get/post/delete...)

// middleware
app.use(express.json());

// middleware
app.use((req, res, next) => {
  console.log(`Endpoint hit: ${req.path}`);
  next();
});

// api -> express.json -> console middleware -> verifyUser -> get handler
const verifyUser: RequestHandler = async (req, res, next) => {
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

app.get("/healthcheck", (req, res) => {
  return res.send();
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  const user =
    await sql`SELECT * from public.user where username = ${username} and password = ${password}`;

  if (user[0]) {
    const token = await createToken({
      id: user[0].id,
      first_name: user[0].first_name,
      last_name: user[0].last_name,
      username,
    });
    return res.json({ message: "Logged in (token)", token });
  }

  res.status(401).json({ message: "Unable to unauthorise" });
});

app.get("/users", verifyUser, async (req, res) => {
  const users =
    await sql`SELECT id, first_name, last_name, dob, address from public.user`;

  return res.json(users);
});

app.get("/users/:id", verifyUser, async (req, res) => {
  let id = req.params.id;
  const user =
    await sql`SELECT id, first_name, last_name, dob, address from public.user WHERE id = ${id}`;
  console.log(user);
  return res.json(user[0]);
});

app.post("/users", async (req, res) => {
  let body = req.body;
  const user =
    await sql`INSERT INTO public.user (first_name, last_name, dob, address)
  VALUES (${body.first_name}, ${body.last_name}, ${body.dob}, ${body.address})`;
  console.log(user);
  return res.json(user);
});

app.get("/orders", verifyUser, async (req, res) => {
  const id = res.locals.token.id as string;
  const orders =
    await sql`SELECT * from public.order_history where user_id = ${id}`;
  console.log(orders);
  return res.json(orders);
});

app.get("/orders/:id", async (req, res) => {
  let id = req.params.id;
  const order = await sql`SELECT * from public.order_history where id = ${id}`;
  return res.json(order[0]);
});

const orderBodyValidation: RequestHandler = (req, res, next) => {
  const valid = req.body.product && req.body.amount;

  if (!valid) {
    return res
      .status(400)
      .json({ message: "Body must contain a product and amount" });
  }

  return next();
};

app.post("/orders", orderBodyValidation, verifyUser, async (req, res) => {
  const id = res.locals.token.id as string;
  let body = req.body;
  const newOrder =
    await sql`INSERT INTO public.order_history (user_id, product, amount)
  VALUES (${id}, ${body.product}, ${body.amount})`;
  return res.json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
