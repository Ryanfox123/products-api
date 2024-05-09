import express from "express";
import postgres from "postgres";

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

app.use(express.json());

app.get("/healthcheck", (req, res) => {
  return res.send();
});

app.get("/users", async (req, res) => {
  const users = await sql`SELECT * from public.user`;
  console.log(users);
  return res.json(users);
});

app.get("/users/:id", async (req, res) => {
  let id = req.params.id;
  const user = await sql`SELECT * from public.user WHERE id = ${id}`;
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

app.get("/orders", async (req, res) => {
  const orders = await sql`SELECT * from public.order_history`;
  console.log(orders);
  return res.json(orders);
});

app.get("/orders/:id", async (req, res) => {
  let id = req.params.id;
  const order = await sql`SELECT * from public.order_history where id = ${id}`;
  return res.json(order[0]);
});

app.post("/orders", async (req, res) => {
  let body = req.body;
  const newOrder =
    await sql`INSERT INTO public.order_history (user_id, product, amount)
  VALUES (${body.user_id}, ${body.product}, ${body.amount})`;
  return res.json(newOrder);
});

app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
