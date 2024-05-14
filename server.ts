import express, { type RequestHandler } from "express";
import postgres from "postgres";
import { createToken } from "./utils/jwt";
import auth from "./middleware/auth";
import validate from "./middleware/validate";
import postLoginSchema from "./schemas/postLogin";
import postOrderSchema from "./schemas/postOrders";
import postRegisterSchema from "./schemas/postRegister";

const bcrypt = require('bcrypt');

const saltRounds = 10

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

app.get("/healthcheck", (req, res) => {
  return res.send();
});

app.post("/login", validate(postLoginSchema), async (req, res) => {
  const { username, password } = req.body;
  const user =
    await sql`SELECT * from public.user where username = ${username}`;
    let userHash = user[0].password
  const loginHash = bcrypt.compareSync(password, userHash)

  if (!loginHash) {
    return res.json({ message: "Incorrect password"})
  }
  
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

app.get("/users", auth, async (req, res) => {
  const users =
    await sql`SELECT id, first_name, last_name, dob, address from public.user`;

  return res.json(users);
});

app.get("/users/:id", auth, async (req, res) => {
  let id = req.params.id;
  const user =
    await sql`SELECT id, first_name, last_name, dob, address from public.user WHERE id = ${id}`;
  console.log(user);
  return res.json(user[0]);
});

app.post("/register", validate(postRegisterSchema), async (req, res) => {
  const results =
    await sql`select id from public.user where username = ${req.body.username}`;

  if (results[0]) {
    return res.status(400).json({ message: "Username already exists" });
  }
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(req.body.password, salt);

  await sql`INSERT INTO public.user (first_name, last_name, username, dob, address, password)
  VALUES (${req.body.first_name}, ${req.body.last_name}, ${req.body.username}, ${req.body.dob}, ${req.body.address}, ${hash}`;

  return res.json({ message: "User has been created" });
});

app.get("/orders", auth, async (req, res) => {
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

app.post("/orders", validate(postOrderSchema), auth, async (req, res) => {
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
