const conn = require("../mariadb");
const { StatusCodes } = require("http-status-codes");

// (카테고리 별, 신간 여부) 전체 도서 목록 조회
const allBooks = (req, res) => {
  let { category_id, news, limit, currentPage } = req.query; // limit는 page 당 도서 수
  let offset = limit * (currentPage - 1);

  let sql = `SELECT * FROM books `;
  let values = [];

  if (category_id && news) {
    // 카테고리별 신간 조회
    sql += `WHERE category_id = ? AND pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 10 MONTH) AND NOW()`;
    values = [parseInt(category_id)];
  } else if (category_id) {
    // 카테고리별 조회
    sql += `WHERE category_id = ?`;
    values = [parseInt(category_id)];
  } else if (news) {
    // 신간 조회
    sql = `WHERE pub_date BETWEEN DATE_SUB(NOW(), INTERVAL 10 MONTH) AND NOW()`;
  }

  sql += ` LIMIT ? OFFSET ?`;
  values.push(parseInt(limit), offset);
  conn.query(sql, values, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

// 개별 도서 조회
const bookDetail = (req, res) => {
  let id = parseInt(req.params.id);

  const sql = `SELECT * FROM books
                    LEFT JOIN category
                    ON books.category_id = category.id
                    WHERE books.id = ?`;
  conn.query(sql, id, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(StatusCodes.BAD_REQUEST).end();
    }

    if (results.length) {
      return res.status(StatusCodes.OK).json(results[0]);
    } else {
      return res.status(StatusCodes.NOT_FOUND).end();
    }
  });
};

module.exports = {
  allBooks,
  bookDetail,
};
