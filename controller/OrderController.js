const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

const order = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    database: "Bookshop",
    password: "root",
    dateStrings: true,
  });

  const { items, delivery, totalQuantity, totalPrice, userId, firstBookTitle } =
    req.body;
  let deliveryId, orderId;

  // delivery 테이블 삽입
  let sql = `INSERT INTO delivery (address, receiver, contact) 
                    VALUES (?, ?, ?)`;
  let values = [delivery.address, delivery.receiver, delivery.contact];
  let [results] = await conn.query(sql, values);
  deliveryId = results.insertId;

  // orders 테이블 삽입
  sql = `INSERT INTO orders (book_title, total_quantity, total_price, user_id, delivery_id) 
                VALUES (?, ?, ?, ?, ?)`;
  values = [firstBookTitle, totalQuantity, totalPrice, userId, deliveryId];
  [results] = await conn.query(sql, values);
  orderId = results.insertId;

  // orderedBook 테이블 삽입
  sql = `INSERT INTO orderedBook (order_id, book_id, quantity) VALUES ?`;
  values = [];
  items.forEach((item) => {
    values.push([orderId, item.bookId, item.quantity]);
  });
  [results] = await conn.query(sql, [values]);

  // 응답 전송
  res.status(StatusCodes.CREATED).json(results);
};

const getOrders = async (req, res) => {
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Book Store",
    dateStrings: true,
  });

  let sql = `SELECT orders.id, created_at, address, receiver, contact,
                book_title, total_quantity, total_price
                FROM orders LEFT JOIN delivery 
                ON orders.delivery_id = delivery.id`;
  let [rows, fields] = await conn.query(sql);
  return res.status(StatusCodes.OK).json(rows);
};

const getOderDetail = async (req, res) => {
  const { id } = req.params;
  const conn = await mariadb.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "Book Store",
    dateStrings: true,
  });

  let sql = `SELECT book_id, title, author, price, quantity
                FROM orderedBook LEFT JOIN books 
                ON orderedBook.book_id = books.id
                WHERE order_id = ?`;
  let [rows, fields] = await conn.query(sql, [id]);
  return res.status(StatusCodes.OK).json(rows);
};

module.exports = { order, getOrders, getOderDetail };
