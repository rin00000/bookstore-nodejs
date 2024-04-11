const express = require("express");
const router = express.Router();
const conn = require("../mariadb");

router.use(express.json());

const validate = (req, res, next) => {
  const err = validationResult(req);

  if (err.isEmpty()) {
    return next();
  } else {
    return res.status(400).json(err.array());
  }
};

// 회원가입
router.post(
  "/join",
  [
    body("email").notEmpty().isString().withMessage("이메일 확인 필요"),
    body("password").notEmpty().isString().withMessage("비밀번호 확인 필요"),
    validate,
  ],
  (req, res) => {
    const { email, password } = req.body;

    let sql = `INSERT INTO users (emailpassword, contact) VALUES(?,?,?,?)`;
    let values = [email, password];
    conn.query(sql, values, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(400).end(); // Bad Request
      } else {
        res.status(201).json(results);
      }
    });
  }
);

// 로그인
router.post("/login", (req, res) => {
  res.json("로그인");
});

// 비밀번호 초기화 요청
router.post("/reset", (req, res) => {
  res.json("비밀번호 초기화 요청");
});

// 비밀번호 초기화
router.put("/reset", (req, res) => {
  res.json("비밀번호 초기화");
});

module.exports = router;