const mysql = require("mysql");
const nodemailer = require("nodemailer");
const jwt = require('jwt-then');

const db = mysql.createConnection({
  host: 'localhost',
  database: 'mido',
  user: 'root',
  password: ''
});

// const db = mysql.createConnection({
//     host: 'localhost',
//     database: 'admin_mido',
//     user: 'mido2021',
//     port: 3306,
//     password: 'Password1010@'
//   });

const transporter = nodemailer.createTransport({
    host: 'smtp.mail.mn',
    port: 465,
    secure: true,
    auth: {
      user: 'sales@icbc.mn',
      pass: 'Sales@75117733'
    }
});

async function SentEmail(token, email, url) {

    let mailOptions = {
      from: '\'Зарлагын баримт\' sales@icbc.mn',
      to: `${email}`,
      subject: 'Зарлагын баримт',
      html: `<table style="width: 100%; padding-left: 20px; padding-right: 20px;" cellspacing="0" cellpadding="0">
      <tr>
        <td colspan="3" style="height: 50px; background-color: #f1f0f6;"></td>
      </tr>
      <tr>
        <td width="25%" style="background-color: #f1f0f6;"></td>
        <td width="50%" style="background-color: #ffffff; border-radius: 30px;">
          <div style="margin-bottom: 20px; margin-top: 50px;" align="center">
            <img src="https://api.icbc.mn/images/local/logo/invoice_logo.png" style="width: 100px; height: auto;">
          </div>
          <div style="margin-bottom: 10px; padding-left: 50px;">Сайн байна уу?</div>
          <div style="margin-bottom: 10px; padding-left: 50px;">Зарлагын баримт илгээлээ. </div>
          <div style="margin-bottom: 50px; padding-left: 50px;">Хэрвээ та баримтаа харахыг хүсвэл <a href="${url}/api/expend/show-client-expend?token=${token}">энд</a> дарна уу</div>
        </td>
        <td width="25%" style="background-color: #f1f0f6;"></td>
      </tr>
      <tr>
        <td colspan="3" style="height: 50px; background-color: #f1f0f6;">
          <div align="center" style="margin-top: 10px; margin-bottom: 50px;">© <a href="javascript:;"><strong>iCBC</strong></a> - Бүх эрх хуулиар хамгаалагдсан</div>
        </td>
      </tr>
      </table>`
    }
    
  
    transporter.sendMail(mailOptions, async  function(err, info) {
      if(err) {
        console.log(err);
      } else {
        console.log('email sent', info);
      }
    });
  
}

exports.sendExpend = async (req, res) => {
    const { email, invoiceNumber } = req.body;
    db.query(`SELECT company from expend WHERE expend_number = '${invoiceNumber}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            var url = `${req.protocol}://${req.get('host')}`;
            const token  = await  jwt.sign({ email, invoiceNumber }, 'HS256');
            await SentEmail(token, email, url);
            db.query(`SELECT id from sentexpend WHERE email = '${email}' AND ordernumber = '${invoiceNumber}'`, async (err, c) => {
                if(err) {
                    throw err;
                }
                if(c.length > 0) {
                    res.json({
                        result: 'success'
                    });
                } else {
                    let pst = {email, ordernumber: invoiceNumber, created_at: new Date(), company: check[0].company};
                    let n = `INSERT INTO sentexpend SET ?`
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
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.getClientExpend = async (req, res) => {
    const { email, invoice } = req.body;
    let n = `SELECT e.expend_number, e.company, e.email, e.phone, e.register, e.date from sentexpend as s inner join expend as e on s.ordernumber = e.expend_number WHERE s.email = '${email}' AND s.ordernumber = '${invoice}'`;
    db.query(n, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            db.query(`SELECT * from expend_product WHERE expend_number = '${invoice}'`, async (err, product) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    invoice: check[0],
                    product
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.showClientExpend = async (req, res) => {
    const token  = req.query.token;
    const url = 'https://www.icbc.mn';
    if(!token) {
        return res.redirect(url + '/not-found');
    } else {
        const payload = await jwt.verify(token, 'HS256');
        let n = `SELECT * from sentexpend as s inner join expend as i on s.ordernumber = i.expend_number WHERE s.email = '${payload.email}' AND s.ordernumber = '${payload.invoiceNumber}'`;
        db.query(n, async (err, check) => {
            if(err) {
                throw err;
            }
            if(check.length > 0) {
                return res.redirect(url + '/client-expend?token=' + token);
            } else {
                return res.redirect(url + '/not-found');
            }
        });
    }
}

exports.searchExpend = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        var q;
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            q = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.expend_number = '${ordernumber}'`;
        } else {
            q = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.expend_number = '${ordernumber}' AND i.user_id = ${payload.id}`;
        }
        db.query(q, async (err, invoice) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                invoice
            });
        });        
    });
}

exports.getSentExpend = async (req, res) => {
    const { datetime } = req.body;
    
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    
    var normal = new Date().addDays(-14);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    var qr;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            if(datetime == null) {
                qr = `SELECT i.expend_number, i.company, s.created_at, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail from sentexpend as s inner join expend as i on s.ordernumber = i.expend_number inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.expend_number, i.company, s.created_at, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail from sentexpend as s inner join expend as i on s.ordernumber = i.expend_number inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.expend_number, i.company, s.created_at, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail from sentexpend as s inner join expend as i on s.ordernumber = i.expend_number inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.expend_number, i.company, s.created_at, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail from sentexpend as s inner join expend as i on s.ordernumber = i.expend_number inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
            }
        }
        db.query(qr, async (err, invoices) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                invoices
            });
        });
    });
}


exports.checkExpend = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT expend_number from expend WHERE stat = 0 AND user_id = ${payload.id}`, async (err, i) => {
        if(err) {
            throw err;
        }
        if(i.length > 0) {
            res.json({
                result: 'success',
                expendNumber: i[0].expend_number
            });
        } else {
            var date = new Date();
            date = date.getFullYear().toString().substr(-2) + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
            var ordernumber = `E${date}`;
            db.query(`SELECT MAX(id) as maxId from expend WHERE expend_number LIKE '${ordernumber}%'`, async (err, max) => {
                if(err) {
                    throw err;
                }
                if(max[0].maxId === null) {
                    ordernumber = `${ordernumber}01`;
                    var n = `INSERT INTO expend SET ?`
                    var pst = {user_id: payload.id, date: new Date(), expend_number: ordernumber, stat: 0, company: '-', register: '-', phone: '-', email: '-'};
                    db.query(n, pst, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            expendNumber: ordernumber
                        });
                    });
                } else {
                    db.query(`SELECT expend_number from expend WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                        if(err) {
                            throw err;
                        }
                        var index = LastOrder[0].expend_number.substr(-2);
                        var first, second;
                        first = index[0]; second = index[1];
                        if(second == 9) {
                            second = 0;
                            first++;
                        } else {
                            second++;
                        }
                        ordernumber = `${ordernumber}${first}${second}`;
                        var n = `INSERT INTO expend SET ?`
                        var pst = {user_id: payload.id, date: new Date(), expend_number: ordernumber, stat: 0, company: '-', register: '-', phone: '-', email: '-'};
                        db.query(n, pst, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                expendNumber: ordernumber
                            });
                        });
                    });
                }
            });
        }
    });
}

exports.getExpend = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    
    var q = `SELECT * from expend WHERE expend_number = '${invoiceNumber}' AND stat = 0`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT * from companies`, async (err, companies) => {
                if(err) {
                    throw err;
                }
                var q = `SELECT product_name, remain, price, product_model from expend_product WHERE expend_number = '${invoiceNumber}'`;

                db.query(q , async (err, product) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT model, name, id, sale_price from product`, async (err, allproduct) => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            invoice: invoice[0],
                            companies,
                            product,
                            allproduct
                        });
                    });
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.updateExpend = async (req, res) => {
    const { to, product, invoiceNumber, done } = req.body;
    var am = 0;
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    
    db.query(`DELETE from expend_product WHERE expend_number = '${invoiceNumber}'`, async err => {
        if(err) {
            throw err;
        }
        var n = `INSERT INTO expend_product (product_name, remain, price, expend_number, product_model) VALUES ?`;
        var rows = [];
        product.forEach(el => {
            var pst = [el.product_name, el.remain, el.price, invoiceNumber, el.product_model];
            rows.push(pst);
        });

        if (rows.length > 0) {
            db.query(n, [rows], async err => {
                if(err) {
                    throw err;
                }
                db.query(`UPDATE expend SET date = '${new Date(to.date).addHours(8).toISOString()}', company = '${to.company}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', stat = ${done}  WHERE expend_number = '${invoiceNumber}'`, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success'
                    });
                });
            });
        } else {
            db.query(`UPDATE expend SET date = '${new Date(to.date).addHours(8).toISOString()}', company = '${to.company}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', stat = ${done} WHERE expend_number = '${invoiceNumber}'`, async err => {
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

exports.getExpendDone = async (req, res) => {
    const { expendNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    var q = `SELECT * from expend WHERE expend_number = '${expendNumber}' AND stat = 1`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT product_name, remain, price, product_model from expend_product WHERE expend_number = '${expendNumber}'`, async (err, product) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    invoice: invoice[0],
                    product
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.getExpends = async (req, res) => {
    const { datetime } = req.body;
    
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    
    var normal = new Date().addDays(-14);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    var qr;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            if(datetime == null) {
                qr = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.date >= '${normal}' ORDER BY i.date DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.date >= '${s}' AND i.date <= '${e}' ORDER BY i.date DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.user_id = ${payload.id} AND i.date >= '${normal}' ORDER BY i.date DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.expend_number, i.company, i.date, i.register, i.email, i.phone, u.img, u.email as useremail, u.phone as userphone, u.name as username from expend as i inner join users as u on i.user_id = u.id WHERE i.stat = 1 AND i.user_id = ${payload.id} AND i.date >= '${s}' AND i.date <= '${e}' ORDER BY i.date DESC`;
            }
        }

        db.query(qr, async (err, invoices) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                invoices
            });
        });
    });
}
