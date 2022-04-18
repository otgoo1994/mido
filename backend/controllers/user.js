const mysql = require("mysql");
const nodemailer = require("nodemailer");
const fs = require('fs');
const url = require('url'); 
var macaddress = require('macaddress');

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


const transporter = nodemailer.createTransport({
  host: 'smtp.mail.mn',
  port: 465,
  secure: true,
  auth: {
    user: 'sales@icbc.mn',
    pass: 'Sales@75117733'
  }
});

const sha256 = require("js-sha256");
const jwt = require('jwt-then');
const { userInfo } = require("os");
const { ifError } = require("assert");



exports.updateUserBrands = async (req, res) => {
  const { user, role } = req.body;
  if(role == 1) {
    db.query(`UPDATE users SET allow_brand = '${user.allow_brand}' WHERE id = ${user.id}`, async err => {
      if(err) {
        throw err;
      }
      res.json({
        result: 'success'
      });
    });
  } else {
    res.json({
      result: 'failed'
    });
  }
}


exports.getAllUser = async (req, res) => {
  db.query(`SELECT code, name from store_location`, async (err, store) => {
    if(err) {
      throw err;
    }
    db.query(`SELECT * from users`, async (err, users) => {
      if(err) {
        throw err;
      }
      db.query(`SELECT id, brandname from brands`, async (err, brands) => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success',
          users,
          brands,
          store
        });
      })
    });
  });
}

exports.newContactInfo = async (req, res) => {
  db.query(`SELECT id, pro_name from profession`, async (err, profession) => {
    if(err) {
      throw err;
    }
    db.query(`SELECT code, name from store_location`, async (err, shop) => {
      if(err) {
        throw err;
      }
      db.query(`SELECT id, position_name from position`, async (err, position) => {
        if(err) {
          throw err;
        }
        db.query(`SELECT id, city from cities`, async (err, city) => {
          if(err) {
            throw err;
          }
          res.json({
            result: 'success',
            profession,
            shop,
            position,
            city
          });
        });
      });
    });
  });
}

exports.addContact = async (req, res) => {
  const { user, role, shop, title, city } = req.body;
  db.query(`SELECT id from users WHERE email = '${user.email}'`, async (err, check) => {
    if(err) {
      throw err;
    }
    if(check.length > 0) {
      res.json({
        result: 'failed'
      });
    } else {
      var n = `INSERT INTO users SET ?`
      var pst = {name: user.name, phone: user.phone, email: user.email, password: sha256(user.phone + process.env.SALT), posID: role, created_at: new Date(), updated_at: new Date(), img: 'default.png', allow_brand: 'all', title, call_store: shop, city};
      db.query(n, pst, async err => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success'
        });
      });
    }
  });
}

exports.updateUserStore = async (req, res) => {
  const { user } = req.body;
  db.query(`UPDATE users SET call_store = '${user.call_store}' WHERE id = ${user.id}`, async (err) => {
    if(err) {
      throw err;
    }
    res.json({
      result: 'success'
    });
  })
}

exports.endTimeRegister = async (req, res) => {
  const { endtime } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  db.query(`UPDATE timer_register SET endtime = '${endtime}' WHERE user_id = ${payload.id} AND endtime = '0'`, async err => {
    if(err) {
      throw err;
    }
    res.json({
      result: 'success'
    });
  });
}



exports.startTimeRegister = async (req, res) => {
  const {start, address, lost, address_name} = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  Date.prototype.addDays = function(days) {
      var date = new Date(this.valueOf());
      date.setDate(date.getDate() + days);
      return date;
  }
  var dt = new Date();
  dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
  var pst = {starttime: start, endtime: '0', date: dt, address, lost, default_hour: '0', address_name, user_id: payload.id};
  var n = `INSERT INTO timer_register SET ?`;
  var subdt = new Date().addDays(-5);
  subdt = subdt.getFullYear() + '-' + ((subdt.getMonth() > 8) ? (subdt.getMonth() + 1) : ('0' + (subdt.getMonth() + 1))) + '-' + ((subdt.getDate() > 9) ? subdt.getDate() : ('0' + subdt.getDate()));
  
  db.query(`SELECT date from timer_register WHERE address = '${address}' AND date >= '${subdt}' AND date < '${dt}' AND address != 'remain'`, async (err, check) => {
    if(err) {
      throw err;
    }
    db.query(`SELECT date, store_id from cash_report WHERE store_id = '${address}' AND date >= '${subdt}' AND date < '${dt}'`, async (err, check_report) => {
      if(err) {
        throw err;
      }
      var reports = [];
      check_report.forEach(el => {
        reports.push(el.date);
      });
      var available = true, lostDay = '';
      check.forEach(el => {
        if(!reports.includes(el.date)) {
          available = false;
          lostDay = el.date;
        }
      });
      if(available) {
        db.query(`SELECT ID from timer_register WHERE user_id = ${payload.id} AND endtime = '0' AND date = '${dt}'`, async (err, check) => {
          if(err) {
            throw err
          }
          if(check.length > 0) {  
            res.json({
              result: 'registered'
            });
          } else {
            var ip;
            ip = macaddress.all(function async (err, all) {
                return all;
            });
            
            db.query(n, pst, async err => {
              if (err) {
                throw err;
              }
              res.json({
                result: 'success'
              });
            });
            // if(ip.Hamachi == undefined) {
            //   res.json({
            //     result: 'Hamachi'
            //   });
            // } else {
            //   if(ip.Hamachi.ipv4 == undefined) {
            //     res.json({
            //       result: 'Hamachi'
            //     });
            //   } else {
            //     db.query(`SELECT ipv4 from store_location WHERE code = '${address}'`, async (err, checkIp) => {
            //       if(err) {
            //         throw err;
            //       }
            //       if(checkIp.length > 0) {
            //         if(checkIp[0].ipv4 == null) {
            //           res.json({
            //             result: 'noipaddress'
            //           });
            //         } else {
            //           var ips = checkIp[0].ipv4.split('#');
            //           if (ips.includes(ip.Hamachi.ipv4)) {
            //             db.query(n, pst, async err => {
            //               if (err) {
            //                 throw err;
            //               }
            //               res.json({
            //                 result: 'success'
            //               });
            //             });
            //           } else {
            //             res.json({
            //               result: 'notaddress'
            //             });
            //           }
            //         }
                    
            //       } else {
            //         res.json({
            //           result: 'noshop'
            //         });
            //       }
            //     });
            //   }
            // }
          }
        });
      } else {
        res.json({
          result: 'noreport',
          lostDay
        });
      }
    });
  });
}

exports.getBadges = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var movement = 0, order = 0;
    var dt = new Date();
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
      if(err) {
        throw err;
      }
      dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
      db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checktime) => {
        if(err) {
          throw err;
        }
        if(checktime.length > 0) {
          let m = ``;
          if(user[0].posID == 1 || user[0].posID == 2) {
            m = `SELECT id from movement WHERE write_it = 'false'`
          }  else {
            m = `SELECT id from movement WHERE stat != 'received' AND (from_where = '${checktime[0].address}' OR to_where = '${checktime[0].address}')`;
          }
          db.query(m, async (err, checkMove) => {
            if(err) {
              throw err;
            }
            movement = checkMove.length;
            res.json({
              result: 'success',
              order,
              movement
            });
          });
        } else {
          let m = ``;
          if(user[0].posID == 1 || user[0].posID == 2) {
            m = `SELECT id from movement WHERE write_it = 'false'`;
            db.query(m, async (err, checkMove) => {
              if(err) {
                throw err;
              }
              movement = checkMove.length;
              res.json({
                result: 'success',
                order,
                movement
              });
            });
          }  else {
            res.json({
              result: 'success',
              order,
              movement
            });
          }
        }
      });
    })
}

async function SentNewPassword(email, password) {
  let mailOptions = {
    from: '\'iCBC.mn\' sales@icbc.mn',
    to: `${email}`,
    subject: 'Нууц үг сэргээх хүсэлт',
    html: `<table style="width: 100%;" cellspacing="0" cellpadding="0">
    <tr><td colspan="3" style="height: 50px; background-color: #f1f0f6;"></td></tr>
    <tr>
    <td width="25%" style="background-color: #f1f0f6;"></td>
    <td width="50%" style="background-color: #ffffff; border-radius: 30px;">
    
      <div style="margin-bottom: 20px; margin-top: 50px;" align="center">
      <img src="https://api.icbc.mn/images/local/logo/invoice_logo.png" style="width: 100px; height: auto;">
      </div>
    
      <div align="center" style="margin-bottom: 20px; font-weight: 700;">
        Нууц үг сэргээх
      </div>
    
      <div style="margin-bottom: 10px; padding-left: 50px;">
        Сайн байна уу?
      </div>
    
      <div style="margin-bottom: 10px; padding-left: 50px;">
        Манай сайтыг ашигласан танд баярлалаа. 
      </div>
    
      <div style="margin-bottom: 50px; padding-left: 50px;">
        Таны шинэчлэгдсэн нууц үг: <b>${[password]}</b>
      </div>
    
    </td>
    <td width="25%" style="background-color: #f1f0f6;"></td>
    </tr>
    <tr><td colspan="3" style="height: 50px; background-color: #f1f0f6;">
    
    
    <div align="center" style="margin-top: 10px; margin-bottom: 50px;">© <a href="javascript:;"><strong>iCBC</strong></a> - Бүх эрх хуулиар хамгаалагдсан</div>
    
    </td></tr>
    </table>`
  }

  transporter.sendMail(mailOptions,  function(err, info) {
    if(err) {
      console.log(err);
    } else {
      console.log('email sent', info);
    }
  });
}


exports.checkOfficialPassword = async (req, res) => {
  const { password } = req.body;
  db.query(`SELECT id from users WHERE email = 'azamaor@gmail.com' AND password = '${sha256(password + process.env.SALT)}'`, async (err, check) => {
    if(err) {
      throw err;
    }
    if(check.length > 0) {
      res.json({
        result: 'success'
      });
    } else {
      res.json({
        result: 'failed'
      });
    }
  });
}

exports.getHomeInfo = async (req, res) => {
  db.query(`SELECT code, name, lat, lng, start, end from store_location`, async (err, store) => {
    if(err) {
      throw err;
    }
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT t.address, u.name, u.phone from timer_register as t inner join users as u on t.user_id = u.id WHERE date = '${dt}'`, async (err, time) => {
      if(err) {
        throw err;
      }
      res.json({
        store,
        time
      });
    });
  });
}

exports.getNotify = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  db.query(`SELECT posID from users WHERE id = ${payload.id}`, async ( err, user ) => {
    if(err) {
      throw err;
    }
    if(user[0].posID == 1 || user[0].posID == 2) {
      db.query(`SELECT order_number, o.stat, u.name, u.img from orders as o inner join users as u on o.user_id = u.id WHERE o.stat = 1 AND u.posID != 6`, async (err, orders) => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success',
          orders
        });
      });
    } else if(user[0].posID == 4) {
      db.query(`SELECT order_number, o.stat, u.name, u.img from orders as o inner join users as u on o.user_id = u.id WHERE o.stat != 1 AND o.user_id = ${payload.id} AND o.read_it = 'false'`, async (err, orders) => {
        if(err) {
          throw err;
        }
        db.query(`SELECT order_number, o.stat, u.name, u.img from orders as o inner join users as u on o.user_id = u.id WHERE o.stat = 1 AND u.posID = 6`, async (err, ordersOther) => {
          if(err) {
            throw err;
          }
          res.json({
            result: 'success',
            orders,
            ordersOther
          });
        });
      });
    } else {
      db.query(`SELECT order_number, u.name, o.stat, u.img from orders as o inner join users as u on o.user_id = u.id WHERE o.stat != 1 AND o.user_id = ${payload.id} AND o.read_it = 'false'`, async (err, orders) => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success',
          orders
        });
      });
    }
  });
}

exports.changePassword = async (req, res) => {
  const { old, password } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  db.query(`SELECT id from users WHERE id = ${payload.id} AND password = '${sha256(old + process.env.SALT)}'`, async (err, check) => {
    if(err) {
      throw err;
    }
    if(check.length > 0) {
      db.query(`UPDATE users SET password = '${sha256(password + process.env.SALT)}' WHERE id = ${payload.id}`, async (err) => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success'
        });
      });
    } else {
      res.json({
        result: 'failed'
      });
    }
  });
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  let qry = `SELECT id from users WHERE email = '${email}'`;
  db.query(qry, async (err, result) => {
    if(err) {
      throw err;
    }
    if(result.length === 0) {
      return res.json({
        result: 'failed'
      });
    }       
    var password = Math.random().toString(36).slice(-8);      
    let updt = `UPDATE users set password = '${sha256(password + process.env.SALT)}' WHERE email = '${email}'`;
    db.query(updt, async (err, result) => {
      if(err) {
        throw err;
      }
      await SentNewPassword(email, password);
      res.json({
        result: 'success',
      });
    });
  });
}

exports.deleteUser = async (req, res) => {
  const { id, role } = req.body;
  if(role == 1) {
    db.query(`DELETE from users WHERE id = ${id}`, async (err) => {
      if(err) {
        throw err;
      }
      res.json({
        result: "success"
      });
    });
  } else {
    res.json({
      result: 'failed'
    });
  }
}

exports.profile = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  db.query(`SELECT p.name, p.model, p.image, p.sale_price, p.wholesale_price, o.order_number, o.created_at, op.quantity, p.color_name, o.paid FROM product as p inner join order_product as op on p.id = op.product_id inner join (SELECT id, created_at, order_number, paid from orders WHERE user_id = ${payload.id} ORDER BY created_at DESC LIMIT 5) as o on op.order_number = o.order_number`, async (err, orders) => {
    if(err) {
      throw err;
    }
    db.query(`SELECT city, id from cities`, async (err, cities) => {
      if(err) {
        throw err;
      }
      db.query(`SELECT code, name from store_location`, async (err, location) => {
        if(err) {
          throw err;
        }
        db.query(`SELECT id, brandname from brands`, async (err, brands) => {
          if(err) {
            throw err;
          }
          db.query(`SELECT position_name, pro_name from position inner join users on position.id = users.posID inner join profession on users.title = profession.id WHERE users.id = ${payload.id}`, async (err, position) => {
            if(err) {
              throw err;
            }

            Date.prototype.addDays = function(days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            }
            var dt = new Date().addDays(-60);
            dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
            db.query(`SELECT w.user_id, w.date, s.name FROM work_plan as w inner join store_location as s on w.shop = s.code WHERE w.user_id = ${payload.id} and w.date > '${dt}'`, async (err, plan) => {
              if(err) {
                throw err;
              }
              res.json({
                result: 'success',
                cities,
                orders,
                profession: position[0].pro_name,
                permission: position[0].position_name,
                brands,
                location,
                plan
              });
            });
          });
        });
      });
      
    });
  });
}

exports.updateProfileImage = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');

  const image = req.files.photo;
  const type = image.mimetype.split("/")[1];
  const time = Date.now();
  const image_name = time + "." + type;
  db.query(`SELECT img from users WHERE id = ${payload.id}`, async (err, user) => {
    if(err) {
      throw err;
    }
    if(user[0].img != 'default.png'){
      if(fs.existsSync("./public/images/local/user/" + user[0].img)){
        fs.unlinkSync("./public/images/local/user/" + user[0].img); 
      }
    }

    image.mv("./public/images/local/user/" + image_name, function (err, result) {
      
      if(err) {
        throw err;
      }
      let updt = `UPDATE users SET img = '${image_name}' WHERE id = ${payload.id}`;
      db.query(updt, async (err) => {
        if(err) {
          throw err;
        }
        res.json({
          result: 'success',
          image: image_name
        });
      });
      
    });
  });
}

exports.updateUserInfo = async (req, res) => {
  const { info } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  const payload = await jwt.verify(token, 'HS256');
  db.query(`UPDATE users SET name = '${info.name}', phone = '${info.phone}', phone2 = '${info.phone2}', acc_number = '${info.accNumber}' WHERE id = ${payload.id}`, async err => {
    if(err) {
      throw err;
    }
    res.json({
      result: 'success'
    });
  });
}

exports.login = async (req, res) => {
  const {email, password} = req.body;
  // const user = await User.findOne({email, password: sha256(password + process.env.SALT)});
  let qry = `SELECT id, name, phone, email, posID, shop_address, img, allow_brand, phone2, title, call_store, acc_number, city, loyalty from users WHERE email = '${email}' AND password = '${sha256(password + process.env.SALT)}'`;
  db.query(qry, async (err, user) => {
    if(err) {
      throw err;
    }
    if(user.length > 0) {
      const token  = await  jwt.sign({
        id: user[0].id
      }, 
      'HS256');
      res.json({
        result: 'success',
        user: user[0],
        token
      });
    } else {
      res.json({
        result: 'failed'
      });
    }
  });
}