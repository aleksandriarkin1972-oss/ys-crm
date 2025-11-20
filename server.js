import express from "express";
import sqlite3 from "sqlite3";
import { readFileSync } from "fs";
import { open } from "sqlite";

const app = express();
app.use(express.json());
app.use(express.static("public"));

async function initDb() {
  const db = await open({
    filename: "./database.db",
    driver: sqlite3.Database,
  });

  const initSql = readFileSync("./init.sql", "utf8");
  await db.exec(initSql);

  return db;
}

app.get("/api/orders", async (req, res) => {
  const db = await initDb();
  const orders = await db.all("SELECT * FROM orders");
  res.json(orders);
});

app.post("/api/orders", async (req, res) => {
  const db = await initDb();
  const data = req.body;
  const stmt = await db.run(
    "INSERT INTO orders(datetime, name, tel, address, status, service, units, comment, employee, price, geo, order_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      data.datetime,
      data.name,
      data.tel,
      data.address,
      data.status,
      data.service,
      data.units,
      data.comment,
      data.employee,
      data.price,
      data.geo,
      data.order_time,
    ]
  );

  res.json({ success: true, id: stmt.lastID });
});

app.listen(3000, () =>
  console.log("CRM backend running on port 3000")
);
