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
      from: '\'Үнийн санал\' sales@icbc.mn',
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
          <div style="margin-bottom: 10px; padding-left: 50px;">Үнийн санал илгээлээ. </div>
          <div style="margin-bottom: 50px; padding-left: 50px;">Хэрвээ та үнийн саналаа харахыг хүсвэл <a href="${url}/api/offer/show-client-offer?token=${token}">энд</a> дарна уу</div>
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

exports.getClientOffer = async (req, res) => {
    const { email, offer } = req.body;
    
    let n = `SELECT i.company, i.created_at, i.updated_at, i.available_date, i.register, i.email, i.phone, i.total_amount, i.noat, i.pre_amount from sentoffer as s inner join offer as i on s.ordernumber = i.offer_number WHERE s.email = '${email}' AND s.ordernumber = '${offer}'`;
    db.query(n, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            db.query(`SELECT * from offer_product WHERE offer_number = '${offer}'`, async (err, product) => {
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


exports.showClientOffer = async (req, res) => {
    const token  = req.query.token;
    const url = 'https://www.icbc.mn';
    if(!token) {
        return res.redirect(url + '/not-found');
    } else {
        const payload = await jwt.verify(token, 'HS256');
        let n = `SELECT * from sentoffer WHERE email = '${payload.email}' AND ordernumber = '${payload.offerNumber}'`;
        db.query(n, async (err, check) => {
            if(err) {
                throw err;
            }
            if(check.length > 0) {
                return res.redirect(url + '/client-offer?token=' + token);
            } else {
                return res.redirect(url + '/not-found');
            }
        });
    }
}

exports.sendOffer = async (req, res) => {
    const { email, offerNumber } = req.body;
    db.query(`SELECT company from offer WHERE offer_number = '${offerNumber}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            var url = `${req.protocol}://${req.get('host')}`;
            const token  = await  jwt.sign({ email, offerNumber }, 'HS256');
            await SentEmail(token, email, url);
            db.query(`SELECT id from sentoffer WHERE email = '${email}' AND ordernumber = '${offerNumber}'`, async (err, c) => {
                if(err) {
                    throw err;
                }
                if(c.length > 0) {
                    res.json({
                        result: 'success'
                    });
                } else {
                    let pst = {email, ordernumber: offerNumber, created_at: new Date(), company: check[0].company};
                    let n = `INSERT INTO sentoffer SET ?`
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

exports.checkOfficial = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT official_index from official_letter WHERE stat = 0 AND user_id = ${payload.id}`, async (err, i) => {
        if(err) {
            throw err;
        }
        if(i.length > 0) {
            res.json({
                result: 'success',
                officialIndex: i[0].official_index
            });
        } else {
            var date = new Date();
            date = ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + date.getFullYear().toString().substr(-2);
            console.log(date);
            var officialIndex = `${date}`, maxOfficialId;
            db.query(`SELECT MAX(official_id) as max_official_id from official_letter`, async (err, OfficialId) => {
                if(err) {
                    throw err;
                }
                maxOfficialId = OfficialId[0].max_official_id + 1;
                db.query(`SELECT MAX(id) as maxId from official_letter WHERE official_index LIKE '${officialIndex}%'`, async (err, max) => {
                    if(err) {
                        throw err;
                    }
                    if(max[0].maxId === null) {
                        officialIndex = `${officialIndex}001`;
                        var n = `INSERT INTO official_letter SET ?`
                        var pst = {official_index: officialIndex, user_id: payload.id, receiver: '-', about: '-', description: '-', created_at: new Date(), updated_at: new Date(), official_id: maxOfficialId, stat: 0, pin_to: 0};
                        db.query(n, pst, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                officialIndex
                            });
                        });
                    } else {
                        db.query(`SELECT official_index from official_letter WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                            if(err) {
                                throw err;
                            }
                            var index = LastOrder[0].official_index.substr(-3);
                            var first, second, third;
                            first = index[0]; second = index[1], third = index[2];
                            if(third == 9) {
                                third = 0;
                                if(second == 9) {
                                    first++;
                                    second = 0;
                                } else {
                                    second++;
                                }
                            } else {
                                third++;
                            }
                            officialIndex = `${officialIndex}${first}${second}${third}`;
                            var n = `INSERT INTO official_letter SET ?`
                            var pst = {official_index: officialIndex, user_id: payload.id, receiver: '-', about: '-', description: '-', created_at: new Date(), updated_at: new Date(), official_id: maxOfficialId, stat: 0, pin_to: 0};
                            db.query(n, pst, async err => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    result: 'success',
                                    officialIndex
                                });
                            });
                        });
                    }
                });
            });
        }
    });
}


exports.updateOfficial = async (req, res) => {
    const { done, official } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    
    var txt = `UPDATE official_letter SET receiver = ?, about = ?, description = ?, stat = ? WHERE user_id = ${payload.id} AND official_index = '${official.official_index}'`;
    db.query(txt, [official.receiver, official.about, official.description, done], async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.getOfficial = async (req, res) => {
    const { officialId } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            db.query(`SELECT * from official_letter WHERE official_index = '${officialId}' AND stat = 0`, async (err, official) => {
                if(err) {
                    throw err;
                }
                if(official.length > 0) {
                    res.json({
                        result: 'success',
                        official: official[0]
                    });
                } else {
                    res.json({
                        result: 'failed'
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


exports.checkOffer = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT offer_number from offer WHERE done = 0 AND user_id = ${payload.id}`, async (err, i) => {
        if(err) {
            throw err;
        }
        if(i.length > 0) {
            res.json({
                result: 'success',
                offerNumber: i[0].offer_number
            });
        } else {
            var date = new Date();
            date = date.getFullYear().toString().substr(-2) + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
            var ordernumber = `QT${date}`;
            db.query(`SELECT MAX(id) as maxId from offer WHERE offer_number LIKE '${ordernumber}%'`, async (err, max) => {
                if(err) {
                    throw err;
                }
                if(max[0].maxId === null) {
                    ordernumber = `${ordernumber}01`;
                    n = `INSERT INTO offer SET ?`
                    pst = {user_id: payload.id, created_at: new Date(), updated_at: new Date(), offer_number: ordernumber, done: 0, company: '-', register: '-', phone: '-', email: '-', noat: 'true', available_date: 0, pre_amount: 0, total_amount: 0};
                    db.query(n, pst, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            offerNumber: ordernumber
                        });
                    });
                } else {
                    db.query(`SELECT offer_number from offer WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                        if(err) {
                            throw err;
                        }
                        var index = LastOrder[0].offer_number.substr(-2);
                        var first, second;
                        first = index[0]; second = index[1];
                        if(second == 9) {
                            second = 0;
                            first++;
                        } else {
                            second++;
                        }
                        ordernumber = `${ordernumber}${first}${second}`;
                        n = `INSERT INTO offer SET ?`
                        pst = {user_id: payload.id, created_at: new Date(), updated_at: new Date(), offer_number: ordernumber, done: 0, company: '-', register: '-', phone: '-', email: '-', noat: 'true', available_date: 0, pre_amount: 0, total_amount: 0};
                        db.query(n, pst, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                offerNumber: ordernumber
                            });
                        });
                    });
                }
            });
        }
    });
}


exports.updateOffer = async (req, res) => {
    const { to, product, invoiceNumber, done } = req.body;
    var am = 0;
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    
    db.query(`DELETE from offer_product WHERE offer_number = '${invoiceNumber}'`, async err => {
        if(err) {
            throw err;
        }
        var n = `INSERT INTO offer_product (product_name, remain, price, offer_number, product_model, description) VALUES ?`;
        var rows = [];
        product.forEach(el => {
            var pst = [el.product_name, el.remain, el.price, invoiceNumber, el.product_model, el.description];
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
                db.query(`UPDATE offer SET created_at = '${new Date(to.created_at).addHours(8).toISOString()}', updated_at = '${new Date(to.updated_at).addHours(8).toISOString()}', company = '${to.company}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', noat = 'true', done = ${done}, pre_amount = '${to.pre_amount}', available_date = '${to.available_date}', total_amount = ${to.total_amount} WHERE offer_number = '${invoiceNumber}'`, async err => {
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
            db.query(`UPDATE offer SET created_at = '${new Date(to.created_at).addHours(8).toISOString()}', updated_at = '${new Date(to.updated_at).addHours(8).toISOString()}', company = '${to.company}', register = '${to.register}', email = '${to.email}', phone = '${to.phone}', noat = 'true', done = ${done}, pre_amount = '${to.pre_amount}', available_date = '${to.available_date}', total_amount = ${to.total_amount} WHERE offer_number = '${invoiceNumber}'`, async err => {
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


exports.getOffer = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    
    var q = `SELECT * from offer WHERE offer_number = '${invoiceNumber}' AND done = 0`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT * from companies`, async (err, companies) => {
                if(err) {
                    throw err;
                }
                var q = `SELECT product_name, remain, price, product_model, description from offer_product WHERE offer_number = '${invoiceNumber}'`;

                db.query(q , async (err, product) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT model, name, id, sale_price, description from product`, async (err, allproduct) => {
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


exports.pinToOffical = async (req, res) => {
    const { official } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            var qr = `UPDATE official_letter SET pin_to = CASE WHEN pin_to = 1 THEN 0 WHEN pin_to = 0 THEN 1 END WHERE official_index = '${official}'`
            db.query(qr, async err => {
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

exports.getOfficialDone = async (req, res) => {
    const { index } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            db.query(`SELECT * from official_letter WHERE official_index = '${index}'`, async (err, official) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    official: official[0]
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}


exports.getOfficials = async (req, res) => {
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

    
    var normal = new Date().addDays(-360);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    var qr;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            // if(datetime == null) {
            //     qr = `SELECT o.receiver, o.about, o.created_at, o.pin_to, o.official_index, u.name, u.phone, u.email, u.img from official_letter as o inner join users as u on o.user_id = u.id WHERE o.created_at >= '${normal}' AND o.stat = 1 ORDER BY o.created_at DESC`;
            // } else {
            //     var s = new Date(datetime[0]).addHours(8);
            //     var e = new Date(datetime[1]).addHours(8);
            //     s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
            //     e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
            //     qr = `SELECT o.receiver, o.about, o.created_at, o.pin_to, o.official_index, u.name, u.phone, u.email, u.img from official_letter as o inner join users as u on o.user_id = u.id WHERE o.stat = 1 AND o.created_at >= '${s}' AND o.created_at <= '${e}' ORDER BY o.created_at DESC`;
            // }
            qr = `SELECT o.receiver, o.about, o.created_at, o.pin_to, o.official_index, u.name, u.phone, u.email, u.img from official_letter as o inner join users as u on o.user_id = u.id WHERE o.stat = 1 ORDER BY o.created_at DESC`;
            db.query(qr, async (err, officials) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    officials
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.getSentOffers = async (req, res) => {
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
                qr = `SELECT i.offer_number, i.company, s.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail, s.created_at from sentoffer as s inner join offer as i on s.ordernumber = i.offer_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.offer_number, i.company, s.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail, s.created_at from sentoffer as s inner join offer as i on s.ordernumber = i.offer_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.offer_number, i.company, s.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail, s.created_at from sentoffer as s inner join offer as i on s.ordernumber = i.offer_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${normal}' ORDER BY s.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.offer_number, i.company, s.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username, s.email as sentemail, s.created_at from sentoffer as s inner join offer as i on s.ordernumber = i.offer_number inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND s.created_at >= '${s}' AND s.created_at <= '${e}' ORDER BY s.created_at DESC`;
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


exports.getOffers = async (req, res) => {
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
                qr = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.created_at >= '${normal}' ORDER BY i.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.created_at >= '${s}' AND i.created_at <= '${e}' ORDER BY i.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                qr = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND i.created_at >= '${normal}' ORDER BY i.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                qr = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.user_id = ${payload.id} AND i.created_at >= '${s}' AND i.created_at <= '${e}' ORDER BY i.created_at DESC`;
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

exports.searchOffer = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        var q;
        if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
            q = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.offer_number = '${ordernumber}'`;
        } else {
            q = `SELECT i.offer_number, i.company, i.created_at, i.updated_at, i.register, i.email, i.phone, i.total_amount, i.available_date, i.pre_amount, u.img, u.email as useremail, u.phone as userphone, u.name as username from offer as i inner join users as u on i.user_id = u.id WHERE i.done = 1 AND i.offer_number = '${ordernumber}' AND i.user_id = ${payload.id}`;
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

exports.getOfferDone = async (req, res) => {
    const { invoiceNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    var q = `SELECT * from offer WHERE offer_number = '${invoiceNumber}' AND done = 1`;
    db.query(q, async (err, invoice) => {
        if(err) {
            throw err;
        }
        if(invoice.length > 0) {
            db.query(`SELECT product_name, remain, price, product_model, description from offer_product WHERE offer_number = '${invoiceNumber}'`, async (err, product) => {
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