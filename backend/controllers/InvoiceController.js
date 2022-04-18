const mysql = require("mysql");
const nodemailer = require("nodemailer");
const fs = require('fs');
const url = require('url'); 
const jwt = require('jwt-then');
const { rejects } = require("assert");
const { UV_FS_O_FILEMAP } = require("constants");
const e = require("cors");

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
      from: '\'Нэхэмжлэх\' sales@icbc.mn',
      to: `${email}`,
      subject: 'Нэхэмжлэх',
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
          <div style="margin-bottom: 10px; padding-left: 50px;">Нэхэмжлэх илгээлээ. </div>
          <div style="margin-bottom: 50px; padding-left: 50px;">Хэрвээ та нэхэмжлэхээ харахыг хүсвэл <a href="${url}/api/invoice/show-client-invoice?token=${token}">энд</a> дарна уу</div>
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

exports.updateReport = async (req, res) => {
    const { reportNumber, report } = req.body;
    var uld = report.belen + report.dutuu - report.iluu;
    console.log(uld);
    db.query(`SELECT store_id from cash_report WHERE id = ${report.id}`, async (err, store) => {
        if(err) {
            throw err;
        }
        if(store.length > 0) {
            db.query(`UPDATE store_location SET cash_miss = '${uld}' WHERE code = '${store[0].store_id}'`, async err => {
                if(err) {
                    throw err;
                }
                let q = `UPDATE cash_report SET ? WHERE id = ${reportNumber}`;
                let val = {terminal: report.terminal, mobile: report.mobile, qpay: report.qpay, stat: report.stat, candy: report.candy, invoice: report.invoice, sale: report.sale, deleted: report.deleted, total: report.total, belen: report.belen, hariltsahad_tushaasan: report.hariltsahad_tushaasan, belen_tushaasan: report.belen_tushaasan, iluu: report.iluu, dutuu: report.dutuu}
                db.query(q, val, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success'
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

exports.showClientInvoice = async (req, res) => {
    const token  = req.query.token;
    const url = 'https://www.icbc.mn';
    if(!token) {
        return res.redirect(url + '/not-found');
    } else {
        const payload = await jwt.verify(token, 'HS256');
        let n = `SELECT * from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number WHERE s.email = '${payload.email}' AND s.ordernumber = '${payload.invoiceNumber}'`;
        db.query(n, async (err, check) => {
            if(err) {
                throw err;
            }
            if(check.length > 0) {
                return res.redirect(url + '/client-invoice?token=' + token);
            } else {
                return res.redirect(url + '/not-found');
            }
        });
    }
}

exports.getClientInvoice = async (req, res) => {
    const { email, invoice } = req.body;
    let n = `SELECT i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.noat from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number WHERE s.email = '${email}' AND s.ordernumber = '${invoice}'`;
    db.query(n, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            db.query(`SELECT * from invoice_product WHERE invoice_number = '${invoice}'`, async (err, product) => {
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

exports.sendInvoice = async (req, res) => {
    const { email, invoiceNumber } = req.body;
    db.query(`SELECT company from invoice WHERE invoice_number = '${invoiceNumber}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            var url = `${req.protocol}://${req.get('host')}`;
            const token  = await  jwt.sign({ email, invoiceNumber }, 'HS256');
            await SentEmail(token, email, url);
            db.query(`SELECT id from sentinvoice WHERE email = '${email}' AND ordernumber = '${invoiceNumber}'`, async (err, c) => {
                if(err) {
                    throw err;
                }
                if(c.length > 0) {
                    res.json({
                        result: 'success'
                    });
                } else {
                    let pst = {email, ordernumber: invoiceNumber, created_at: new Date(), company: check[0].company};
                    let n = `INSERT INTO sentinvoice SET ?`
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


exports.updateInvoice = async (req, res) => {
    const { to, product, invoiceNumber, done } = req.body;
    var am = 0;
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    // console.log(new Date(to.updated_at).addHours(8).toISOString());
    
    db.query(`DELETE from invoice_product WHERE invoice_number = '${invoiceNumber}'`, async err => {
        if(err) {
            throw err;
        }
        var n = `INSERT INTO invoice_product (product_name, remain, price, invoice_number, product_model) VALUES ?`;
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
                if(to.stat == 'true') {
                    am = to.total_amount;
                }
                db.query(`UPDATE invoice SET created_at = '${new Date(to.created_at).addHours(8).toISOString()}', updated_at = '${new Date(to.updated_at).addHours(8).toISOString()}', company = '${to.company}', stat = '${to.stat}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', total_amount = ${to.total_amount}, paid_amount = ${am}, noat = 'true', done = ${done} WHERE invoice_number = '${invoiceNumber}'`, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success'
                    });
                });
            });
        } else {
            if(to.stat == 'true') {
                am = to.total_amount;
            }
            db.query(`UPDATE invoice SET created_at = '${new Date(to.created_at).addHours(8).toISOString()}', updated_at = '${new Date(to.updated_at).addHours(8).toISOString()}', company = '${to.company}', stat = '${to.stat}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', total_amount = ${to.total_amount}, paid_amount = ${am}, noat = 'true', done = ${done} WHERE invoice_number = '${invoiceNumber}'`, async err => {
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

exports.checkInvoice = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT invoice_number from invoice WHERE done = 0 AND user_id = ${payload.id}`, async (err, i) => {
        if(err) {
            throw err;
        }
        if(i.length > 0) {
            res.json({
                result: 'success',
                invoiceNumber: i[0].invoice_number
            });
        } else {
            var date = new Date();
            date = date.getFullYear().toString().substr(-2) + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
            
            var ordernumber = `PIICBC${date}`;
            db.query(`SELECT MAX(id) as maxId from invoice WHERE invoice_number LIKE '${ordernumber}%'`, async (err, max) => {
                if(err) {
                    throw err;
                }
                if(max[0].maxId === null) {
                    ordernumber = `${ordernumber}01`;
                    n = `INSERT INTO invoice SET ?`
                    pst = {user_id: payload.id, stat: 'false', created_at: new Date(), updated_at: new Date(), invoice_number: ordernumber, done: 0, company: '-', register: '-', phone: '-', email: '-', noat: 'true'};
                    db.query(n, pst, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            invoiceNumber: ordernumber
                        });
                    });
                } else {
                    db.query(`SELECT invoice_number from invoice WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                        if(err) {
                            throw err;
                        }
                        
                        var index = LastOrder[0].invoice_number.substr(-2);
                        console.log(index);
                        var first, second;
                        first = index[0]; second = index[1];
                        if(second == 9) {
                            second = 0;
                            first++;
                        } else {
                            second++;
                        }
                        ordernumber = `${ordernumber}${first}${second}`;
                        n = `INSERT INTO invoice SET ?`
                        pst = {user_id: payload.id, stat: 'false', created_at: new Date(), updated_at: new Date(), invoice_number: ordernumber, done: 0, company: '-', register: '-', phone: '-', email: '-', noat: 'true'};
                        db.query(n, pst, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                invoiceNumber: ordernumber
                            });
                        });
                    });
                }
            });
        }
    });
}


exports.getCashReport = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var qr;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            qr = `SELECT c.id, u.img, u.name, u.phone, u.email, s.name as storename, c.date, c.stat, c.terminal, c.mobile, c.qpay, c.candy, c.invoice, c.sale, c.deleted, c.tootsoond, c.total, c.belen, c.hariltsahad_tushaasan, c.belen_tushaasan, c.iluu, c.dutuu from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.id = ${id}`;
        } else {
            qr = `SELECT c.id, u.img, u.name, u.phone, u.email, s.name as storename, c.date, c.stat, c.terminal, c.mobile, c.qpay, c.candy, c.invoice, c.sale, c.deleted, c.tootsoond, c.total, c.belen, c.hariltsahad_tushaasan, c.belen_tushaasan, c.iluu, c.dutuu from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.id = ${id} AND c.user_id = ${payload.id}`;
        }

        db.query(qr, async (err, report) => {
            if(err) {
                throw err;
            }
            if(report.length > 0) {
                res.json({
                    result: 'success',
                    report: report[0]
                });
            } else {
                res.json({
                    result: 'failed'
                });
            }
        });
    });
}

exports.deleteInvoice = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
         var qr;
        if(user[0].posID == 1 || user[0].posID == 2) {
            qr = `DELETE from invoice WHERE invoice_number = '${invoiceNumber}'`;
        } else {
            qr = `DELETE from invoice WHERE invoice_number = '${invoiceNumber}' AND user_id = ${payload.id}`;
        }

        db.query(qr, async err => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success'
            });
        });
    });

}

exports.updateInvoiceAmount = async (req, res) => {
    const { invoiceNumber, amount } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var stat;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            db.query(`SELECT total_amount from invoice WHERE invoice_number = '${invoiceNumber}'`, async (err, check) => {
                if(err) {
                    throw err;
                }
                if(check.length > 0) {
                    if(amount >= check[0].total_amount) {
                        stat = 'true';
                    } else {
                        stat = 'half';
                    }
                    db.query(`UPDATE invoice SET stat = '${stat}', paid_amount = '${amount}' WHERE invoice_number = '${invoiceNumber}'`, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            stat
                        });
                    });
                } else {
                    res.json({
                        result: 'notfound'
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

exports.updateCashReport = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            db.query(`UPDATE cash_report SET stat = 1 WHERE id = ${id}`, async (err) => {
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

exports.getCashReports = async (req, res) => {
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

    var normal = new Date().addDays(-15);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';

    var d = new Date().addDays(-5);
    d = d.getFullYear() + '-' + ((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '-' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate()));
    db.query(`SELECT address, s.name as address_name, s.cash_miss from timer_register as t inner join store_location as s on t.address = s.code WHERE t.date >= '${d}' GROUP BY address`, async (err, locations) => {
        if(err) {
            throw err;
        }
        var qr;
        db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
            if(user[0].posID == 1 || user[0].posID == 2) {
                if(datetime == null) {
                    qr = `SELECT c.id, u.img, u.name, c.total, u.phone, u.email, s.name as storename, c.date, c.stat from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.date >= '${normal}' ORDER BY c.date DESC`;
                } else {
                    var s = new Date(datetime[0]).addHours(8);
                    var e = new Date(datetime[1]).addHours(8);
                    s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                    e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                    qr = `SELECT c.id, u.img, u.name, c.total, u.phone, u.email, s.name as storename, c.date, c.stat from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.date >= '${s}' AND c.date <= '${e}' ORDER BY c.date DESC`;
                }
            } else {
                if(datetime == null) {
                    qr = `SELECT c.id, u.img, u.name, u.phone, c.total, u.email, s.name as storename, c.date, c.stat from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.date >= '${normal}' AND u.id = ${payload.id} ORDER BY c.date DESC`;
                } else {
                    var s = new Date(datetime[0]).addHours(8);
                    var e = new Date(datetime[1]).addHours(8);
                    s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                    e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                    qr = `SELECT c.id, u.img, u.name, u.phone, c.total, u.email, s.name as storename, c.date, c.stat from store_location as s inner join cash_report as c on s.code = c.store_id inner join users as u on c.user_id = u.id WHERE c.date >= '${s}' AND c.date <= '${e}' AND u.id = ${payload.id} ORDER BY c.date DESC`;
                }
            }

            db.query(qr, async (err, invoices) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    invoices,
                    locations
                });
            });
        });
    });
}

exports.addCashReport = async (req, res) => {
    const { report, old_uld } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    var dt = new Date(report.date).addHours(8);
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT id from cash_report WHERE user_id = ${payload.id} AND store_id = '${report.store}' AND date = '${dt}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'registered'
            });
        } else {
            db.query(`SELECT id from work_plan WHERE user_id = ${payload.id} AND shop = '${report.store}' AND date = '${dt}'`, async (err, checkPlan) => {
                if(err) {
                    throw err;
                }
                if(checkPlan.length > 0) {
                    db.query(`UPDATE store_location SET cash_miss = '${report.uld}' WHERE code = '${report.store}'`, async err => {
                        if(err) {
                            throw err;
                        }
                        let pst = {store_id: report.store, terminal: report.card, mobile: report.mobile, qpay: report.qpay, candy: report.candy, invoice: report.invoice, sale: report.discount, deleted: report.deleted, tootsoond: 0, total: report.totalAmount, belen: old_uld, belen_tushaasan: report.belenTushaasan, hariltsahad_tushaasan: report.toCommunicate, iluu: report.more, dutuu: report.miss, date: dt, user_id: payload.id};
                        let n = `INSERT INTO cash_report SET ?`;
                        db.query(n, pst, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success'
                            });
                        });
                    });
                } else {
                    res.json({
                        result: 'noPlan'
                    });
                }
            });
        }
    });
}

exports.getInvoices = async (req, res) => {
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
                qr = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND ( i.stat = 'false' OR i.stat = 'half' ) ORDER BY i.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.created_at >= '${s}' AND i.created_at <= '${e}' ORDER BY i.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND  ( i.stat = 'false' OR i.stat = 'half' ) ORDER BY i.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND  i.created_at >= '${s}' AND i.created_at <= '${e}' ORDER BY i.created_at DESC`;
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


exports.searchInvoice = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        var q;
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            q = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.invoice_number = '${ordernumber}'`;
        } else {
            q = `SELECT i.invoice_number, i.company, i.stat, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from invoice as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.invoice_number = '${ordernumber}' AND i.user_id = ${payload.id}`;
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

exports.addCompany = async (req, res) => {
    const { name, email, register, phone } = req.body;
    db.query(`SELECT id from companies WHERE email = '${email}'`, async (err, ch) => {
        if(err) {
            throw err;
        }
        if(ch.length > 0) {
            res.json({
                result: 'failed'
            });
        } else {
            var pst = {name, email, register, phone};
            var n = `INSERT INTO companies SET ?`;
            db.query(n, pst, async err => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT id from companies WHERE email = '${email}'`, async (err, id) => {
                    if(err) {
                        throw err;
                    }
                    if(id.length > 0) {
                        res.json({
                            result: 'success',
                            id: id[0]
                        });
                    }
                });
            });
        }
    });
}

exports.getInvoice = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    var q = `SELECT * from invoice WHERE invoice_number = '${invoiceNumber}' AND done = 0`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT * from companies`, async (err, companies) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT product_name, remain, price, product_model from invoice_product WHERE invoice_number = '${invoiceNumber}'`, async (err, product) => {
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

exports.getSentInvoice = async (req, res) => {
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

    
    var normal = new Date().addDays(-30);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    var qr;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            if(datetime == null) {
                qr = `SELECT i.invoice_number, i.company, i.stat, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.created_at, s.email as sentemail from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.invoice_number, i.company, i.stat, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.created_at, s.email as sentemail from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.invoice_number, i.company, i.stat, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.created_at, s.email as sentemail from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.invoice_number, i.company, i.stat, i.updated_at, i.register, i.email, i.phone, i.total_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.created_at, s.email as sentemail from sentinvoice as s inner join invoice as i on s.ordernumber = i.invoice_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
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

exports.getInvoiceDone = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    var q = `SELECT * from invoice WHERE invoice_number = '${invoiceNumber}' AND done = 1`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT product_name, remain, price, product_model from invoice_product WHERE invoice_number = '${invoiceNumber}'`, async (err, product) => {
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

exports.sendToMail = async (req, res) => {
    const { invoiceNumber } = req.body;
    console.log(invoiceNumber);
}