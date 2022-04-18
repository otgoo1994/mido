const mysql = require('mysql');
let timer = null;

const db = mysql.createConnection({
  host: 'localhost',
  database: 'mido',
  user: 'root',
  password: ''
});

// const db = mysql.createConnection({
//   host: 'localhost',
//   database: 'admin_mido',
//   user: 'mido2021',
//   port: 3306,
//   password: 'Password1010@'
// });

var timerStart = function() {
  clearInterval(timer);
  timer = setInterval(updateTimer, 21600000);
}

var updateTimer =  function () {
  let check = `UPDATE users SET loyalty = (CASE WHEN loyalty >= 10 THEN loyalty - 10 WHEN loyalty < 10 THEN 0 END), loyalty_at = NOW() WHERE id in (SELECT id from users WHERE loyalty_at <= DATE_ADD(loyalty_at, INTERVAL 30 DAY) AND DATEDIFF(NOW(), loyalty_at) >= 30 AND posID = 6)`;
  db.query(check, err => {
    if(err) {
      throw err;
    }
  });
}

db.connect(err => {
  if(err) {
    throw err
  }
  console.log('My sql connected');
});

const app = require('./app');
const port = 8005;
const server = app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
    timerStart();
});

const io = require("socket.io")(server);
const jwt = require("jwt-then");

io.use(async (socket, next) => {
  try {
    const token = socket.handshake.query.token;
    const payload = await jwt.verify(token, 'HS256');
    socket.userId = payload.id;
    next();
  } catch (err) {}
});


io.on("connection", (socket) => {

  console.log("Connected: " + socket.userId);

  socket.on("disconnect", () => {
    console.log("Disconnected: " + socket.userId);
  });

});