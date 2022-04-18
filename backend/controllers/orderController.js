const mysql = require("mysql");
const nodemailer = require("nodemailer");
const fs = require('fs');
const url = require('url'); 
const jwt = require('jwt-then');
const { rejects } = require("assert");
const { UV_FS_O_FILEMAP } = require("constants");
const axios = require('axios');

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

const qpayTemplateId = "ICBC_REMAX_INVOICE";
const qpayMerchantId = "ICBC_REMAX";
const qpayClientId = "60C6A5B2-8597-8A5B-7719-8783A6B185C6";
const qpayClientSecret = "95D354F5-1C09-2BD7-108D-47286EE37A26"


async function getToken() {
    const data = {
        "client_id": qpayClientId,
        "client_secret": qpayClientSecret,
        "grant_type":"client",
        "refresh_token":""
    };

    let str = axios.post('https://api.qpay.mn/v1/auth/token', data)
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err.message);
        });

    return await str;
}


async function createBill(token, user, order, amount) {

    const datetime = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const data = {
        template_id: qpayTemplateId,
        merchant_id: qpayMerchantId,
        branch_id: "1",
        pos_id: "1",
        receiver: {
            id: user.name,
            register_no: "",
            name: user.name,
            email: user.email,
            phone_number: user.phone,
            note: user.name
        },
        bill_no: order,
        date: datetime,
        description: 'Artesoft - агуулахын систем',
        amount: amount,
        btuk_code: "",
        vat_flag: "0"
    }

    let str = axios.post('https://api.qpay.mn/v1/bill/create', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then((res) => {
            return res.data;
        }).catch((err) => {
            console.error(err);
        });
    return await str;
}

async function checkQpayReciept(invoice) {
    let token = await getToken();
    token = await token.access_token;
    
    const data = {
        "merchant_id": qpayMerchantId,
        "bill_no": invoice
    }

    let str = axios.post('https://api.qpay.mn/v1/bill/check', data, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then((res) => {
            return res.data;
        }).catch(error => {
            console.log(error);
        });
    
    return await str;
}


exports.addCustomerReport = async (req, res) => {
    const { datetime, products } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    var dt = new Date(datetime).addHours(8).toISOString().split('T')[0];
    db.query(`SELECT id from customer_report WHERE created_at LIKE '${dt}%'`, async (err, check) => {
        if(check.length > 0) {
            res.json({
                result: 'exist'
            });
        } else {
            var reportNumber = Date.now();
            var rows = [], totalAmount = 0;
            products.forEach(p => {
                rows.push([p.id, p.type, p.qty, p.sale_price, reportNumber]);
                totalAmount += p.qty * p.sale_price;
            });
            var n = `INSERT INTO customer_report SET ?`;
            var pst = {reportNumber, created_at: new Date(datetime).addHours(8), userId: payload.id, totalAmount};
            db.query(n, pst, async err => {
                if(err) {
                    throw err;
                }
                var n = `INSERT INTO customer_report_product (productId, type, qty, price, reportNumber) VALUES ?`;
                if(rows.length > 0) {
                    db.query(n, [rows], async err => {
                        if(err) {
                            throw err;
                        }
                        var update = '', id = [];
                        products.forEach(el => {
                            id.push(el.id);
                            if(update == '') {
                                update = `when productId = '${el.id}' AND type = ${el.type} then (qty - ${el.qty})`;
                            } else {
                                update += ` when productId = '${el.id}' AND type = ${el.type} then (qty - ${el.qty})`;
                            }
                        });
                        db.query(`UPDATE customerproductqty SET qty = (case ${update} end) WHERE productId in (${id}) AND userId = ${payload.id}`, async err => {
                            if(err) {
                                throw err;
                            }
                            db.query(`UPDATE users SET loyalty = (loyalty + 10) WHERE id = ${payload.id}`, async err => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    result: 'success'
                                });
                            });
                        });
                        
                    });
                }
            });
        }
    });
}

exports.getNewRevenue = async (req, res) => {
    const { revenueNumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    if(revenueNumber == null) {
        var number = Date.now();
        var n = `INSERT INTO customer_revenue SET ?`;
        var pst = {revenueNumber: number, created_at: new Date(), userId: payload.id, totalAmount: 0, stat: false};
        db.query(n, pst, async err => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                revenueNumber: number,
                product: []
            });
        });
    } else {
        db.query(`SELECT p.name, p.image, p.model, p.id, r.price, r.type, r.qty from customer_revenue_product as r inner join product as p on p.id = r.productId WHERE r.revenueNumber = '${revenueNumber}' AND r.type = 1`, async (err, product1) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT p.name, p.image, p.model, p.id, r.price, r.type, r.qty from customer_revenue_product as r inner join customerproduct as p on p.id = r.productId WHERE r.revenueNumber = '${revenueNumber}' AND r.type = 2`, async (err, product2) => {
                if(err) {
                    throw err;
                }
                var product = [];
                product1.forEach(el => {
                    product.push(el);
                });
                product2.forEach(el => {
                    product.push(el);
                });
                res.json({
                    result: 'success',
                    revenueNumber,
                    product
                });
            });
        });
    }
}


exports.addCustomerRevenue = async (req, res) => {
    const { revenueNumber, product, datetime } = req.body;
    
    var q = ``, total = 0;
    product.forEach(el => {
        total += el.price;
        q += ` WHEN productId = ${el.id} AND revenueNumber = '${revenueNumber}' AND type = ${el.type} THEN ${el.qty}`
    });

    q = `UPDATE customer_revenue_product SET qty = (CASE${q} END)`;
    
    db.query(q, async err => {
        if(err) {
            throw err;
        }
        db.query(`UPDATE customer_revenue SET totalAmount = ${total}, created_at = '${datetime}', stat = 1 WHERE revenueNumber = '${revenueNumber}'`, async (err) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success'
            });
        });
    });
}

exports.updateRevenueQty = async (req, res) => {
    const { product, revenueNumber } = req.body;
    var q = ``;
    product.forEach(el => {
        q += ` WHEN productId = ${el.id} AND revenueNumber = '${revenueNumber}' AND type = ${el.type} THEN ${el.qty}`
    });

    q = `UPDATE customer_revenue_product SET qty = (CASE${q} END)`;
    db.query(q, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.removeProductFromRevenue = async (req, res) => {
    const { revenueNumber, id } = req.body;
    db.query(`DELETE from customer_revenue_product WHERE productId = ${id} AND revenueNumber = '${revenueNumber}'`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}


exports.addProductToRevenue = async (req, res) => {
    const { revenueNumber, product } = req.body;
    var n = `INSERT INTO customer_revenue_product SET ?`;
    var pst = {productId: product.id, type: product.type, qty: 1, price: product.wholesale_price, revenueNumber};
    db.query(n, pst, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.getCustomerRevenues = async (req, res) => {
    const { datetime } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, p.wholesale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join customerproduct as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 2`, async (err, customerproduct2) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, p.wholesale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join product as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 1`, async (err, customerproduct1) => {
            if (err) {
                throw err;
            }
            db.query(`SELECT revenueNumber from customer_revenue WHERE stat = false AND userId = ${payload.id}`, async (err, newRevenue) => {
                if(err) {
                    throw err;
                }
                if(datetime == null) {
                    db.query(`SELECT * from customer_revenue WHERE stat = true AND userId = ${payload.id} ORDER BY created_at DESC LIMIT 20`, async (err, revenue) => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            revenue,
                            customerproduct2,
                            customerproduct1,
                            newRevenue
                        });
                    });
                } else {
                    var s = new Date(datetime[0]).addHours(8);
                    var e = new Date(datetime[1]).addHours(8);
                    s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                    e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                    db.query(`SELECT * from customer_revenue WHERE stat = true AND userId = ${payload.id} AND created_at <= '${e}' AND created_at >= '${s}' ORDER BY created_at DESC`, async (err, revenue) => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success',
                            revenue,
                            customerproduct2,
                            customerproduct1,
                            newRevenue
                        });
                    });
                }
            });
        });
    });

    
}

exports.getCustomerReports = async (req, res) => {
    const { datetime } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    
    db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join customerproduct as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 2`, async (err, customerproduct2) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join product as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 1`, async (err, customerproduct1) => {
            if (err) {
                throw err;
            }
            if(datetime == null) {
                var normal = new Date().addDays(-30);
                normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
                db.query(`SELECT r.reportNumber, r.created_at, u.name, u.phone, u.img from customer_report as r inner join users as u on r.userId = u.id WHERE userId = ${payload.id} AND r.created_at > '${normal}' ORDER BY r.created_at DESC`, async (err, reports) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        reports,
                        customerproduct2,
                        customerproduct1
                    });
                });
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                db.query(`SELECT r.reportNumber, r.created_at, u.name, u.phone, u.img from customer_report as r inner join users as u on r.userId = u.id WHERE userId = ${payload.id} AND r.created_at <= '${e}' AND r.created_at >= '${s}' ORDER BY r.created_at DESC`, async (err, reports) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        reports,
                        customerproduct2,
                        customerproduct1
                    });
                });
            }
        });
    });

}


exports.showCustomerReport = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT u.name, u.phone, c.created_at from customer_report as c inner join users as u on c.userId = u.id WHERE reportNumber = '${ordernumber}' AND userId = ${payload.id}`, async (err, report) => {
        if(err) {
            throw err;
        }
        if(report.length > 0) {
            db.query(`SELECT p.name, p.image, p.model, r.price, r.qty, r.type, p.color_name from customer_report_product as r inner join product as p on r.productId = p.id WHERE r.reportNumber = '${ordernumber}' AND r.type = 1`, async (err, product1) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT p.name, p.image, p.model, r.price, r.qty, r.type, p.color_name from customer_report_product as r inner join customerproduct as p on r.productId = p.id WHERE r.reportNumber = '${ordernumber}' AND r.type = 2`, async (err, product2) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        report: report[0], 
                        product1,
                        product2
                    });
                });
            });
        } else {
            res.json({
                result: 'notfound'
            });
        }
    });
}

exports.qpayWebhook = async (req, res) => {
    const { invoiceId} = req.query;
    db.query(`SELECT id from orders WHERE order_number = '${invoiceId}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            db.query(`SELECT SUM(o.quantity * p.wholesale_price) as total from order_product as o inner join product as p on o.product_id = p.id WHERE o.order_number = '${invoiceId}'`, async (err, total) => {
                if(err) {
                    throw err;
                }
                let bill = await checkQpayReciept(invoiceId);
                let isPaid = bill.payment_info.payment_status;
                let amount = bill.goods_detail[0].unit_price;
                if(isPaid == 'PAID') {
                    if(total[0].total > amount) {
                        db.query(`UPDATE orders SET paid = true WHERE order_number = '${invoiceId}'`, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                message: 'Амжилттай'
                            });
                        });
                    } else {
                        res.json({
                            result: 'failed',
                            message: 'Дутуу төлөлт'
                        });
                    }
                } else {
                    res.json({
                        result: 'failed',
                        message: 'Төлөгдөөгүй нэхэмжлэх'
                    });
                }
            });
            
        } else {
            res.json({
                result: 'failed',
                message: 'Нэхэмжлэх олдсонгүй'
            });
        }
    });
}

exports.addProductToImport = async (req, res) => {
    const { product , ordernumber } = req.body;
    var pst = { ordernumber, qty: product.qty, sale_price: product.sale_price, productId: product.id, cny: product.cny, usd: product.usd };
    db.query(`SELECT id from importproduct WHERE ordernumber = '${ordernumber}' AND productId = ${product.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'alreadyExist'
            });
        } else {
            var n = `INSERT INTO importproduct SET ?`;
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

exports.removeProductFromImport = async (req, res) => {
    const { id , ordernumber } = req.body;
    db.query(`DELETE from importproduct WHERE ordernumber = '${ordernumber}' AND productId = ${id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.deleteImport = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check[0].posID == 1 || check[0].posID == 2 || check[0].posID == 4) {
            db.query(`DELETE from import WHERE ordernumber = '${ordernumber}'`, async err => {
                if(err) {
                    throw err;
                }
                db.query(`DELETE from importproduct WHERE ordernumber = '${ordernumber}'`, async err => {
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

exports.getCurrentImport = async (req, res) => {
    const { ordernumber } = req.body;
    db.query(`SELECT * from import WHERE ordernumber = '${ordernumber}'`, async (err, order) => {
        if(err) {
            throw err;
        }
        if(order.length > 0) {
            db.query(`SELECT i.qty, i.sale_price, p.cost_price, p.wholesale_price, i.cny, i.usd, p.id, p.image, p.model, p.name, p.color_name from importproduct as i inner join product as p on i.productId = p.id WHERE i.ordernumber = '${ordernumber}'`, async (err, product) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT name, image, model, color_name, sale_price, cost_price, wholesale_price cny, usd, id from product`, async (err, allproduct) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        order: order[0],
                        product,
                        original: product,
                        allproduct
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

exports.getImports = async (req, res) => {
    const { datetime } = req.body;
    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    if(datetime == null) {
        var normal = new Date().addDays(-90);
        normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
        var qr = `SELECT * from import WHERE (done = 1 && stat = 0) OR (stat = 1 && updated_at > '${normal}')`;
        db.query(qr, async (err, imports) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                imports
            });
        });
    } else {
        var s = new Date(datetime[0]).addHours(8);
        var e = new Date(datetime[1]).addHours(8);
        s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
        e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
        db.query(`SELECT * from import WHERE done = 1 AND created_at >= '${s}' AND created_at <= '${e}'`, async (err, imports) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                imports
            });
        });
    }
        
}
exports.searchImports = async (req, res) => {
    const { search } = req.body;
    db.query(`SELECT * from import WHERE done = 1 AND ordernumber = '${search}'`, async (err, imports) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success',
            imports
        });
    });
        
}



exports.endImportOrder = async (req, res) => {
    const { exhange, name, done, product, ordernumber } = req.body;
    db.query(`UPDATE import SET name = '${name}', exchange = '${exhange}', done = ${done} WHERE ordernumber = '${ordernumber}'`, async err => {
        if(err) {
            throw err;
        }

        var id = '', qty = '', cny = '', usd = '', qty2 = '', cny2 = '', usd2 = ''
        product.forEach(el => {
            if(id == '') {
                id += `${el.id}`;
            } else {
                id += `, ${el.id}`;
            }

            qty += ` when productId = ${el.id} then ${el.qty}`;
            cny += ` when productId = ${el.id} then ${el.cny}`;
            usd += ` when productId = ${el.id} then ${el.usd}`;

            qty2 += ` when id = ${el.id} then ( remain + ${el.qty} )`;
            cny2 += ` when id = ${el.id} then ${el.cny}`;
            usd2 += ` when id = ${el.id} then ${el.usd}`;
        });

        var q = `UPDATE importproduct set qty = (CASE ${qty} END), cny = (CASE ${cny} END), usd = (CASE ${usd} END) WHERE productId in (${id}) AND ordernumber = '${ordernumber}'`;
        db.query(q, async err => {
            if(err) {
                throw err;
            }
            db.query(`UPDATE product SET cny = (CASE ${cny2} END), usd = (CASE ${usd2} END) WHERE id in (${id})`, async err => {
                if(err) {
                    throw err;
                }
                if(done == 1) {
                    db.query(`UPDATE product SET cny = (CASE ${cny2} END), usd = (CASE ${usd2} END) WHERE id in (${id})`, async err => {
                        if(err) {
                            throw err;
                        }
                        if(done == 1) {
                            db.query(`UPDATE product SET remain = (CASE ${qty2} END) WHERE id in (${id})`, async err => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    result: 'success'
                                });
                            });
                        } else {
                            res.json({
                                result: 'success'
                            });
                        }
                    });
                } else {
                    res.json({
                        result: 'success'
                    });
                }
            });
        });
    });
}


exports.updateImportOrder = async (req, res) => {
    const { exhange, name, done, product, ordernumber } = req.body;
    db.query(`UPDATE import SET name = '${name}', exchange = '${exhange}', done = ${done} WHERE ordernumber = '${ordernumber}'`, async err => {
        if(err) {
            throw err;
        }

        var id = '', qty = '', cny = '', usd = '', qty2 = '', cny2 = '', usd2 = '', sale = '', cost = '', whole = '', sale2 = '';
        product.forEach(el => {
            if(id == '') {
                id += `${el.id}`;
            } else {
                id += `, ${el.id}`;
            }

            qty += ` when productId = ${el.id} then ${el.qty}`;
            cny += ` when productId = ${el.id} then ${el.cny}`;
            sale2 += ` when productId = ${el.id} then ${el.sale_price}`;
            usd += ` when productId = ${el.id} then ${el.usd}`;

            qty2 += ` when id = ${el.id} then ${el.qty}`;
            cny2 += ` when id = ${el.id} then ${el.cny}`;
            usd2 += ` when id = ${el.id} then ${el.usd}`;
            sale += ` when id = ${el.id} then ${el.sale_price}`;
            cost += ` when id = ${el.id} then ${el.cost_price}`;
            whole += ` when id = ${el.id} then ${el.wholesale_price}`;
        });

        var q = `UPDATE importproduct set qty = (CASE ${qty} END), sale_price = (CASE ${sale2} END), cny = (CASE ${cny} END), usd = (CASE ${usd} END) WHERE productId in (${id}) AND ordernumber = '${ordernumber}'`;
        db.query(q, async err => {
            if(err) {
                throw err;
            }
            db.query(`UPDATE product SET cny = (CASE ${cny2} END), sale_price = (CASE ${sale} END), wholesale_price = (CASE ${whole} END), cost_price = (CASE ${cost} END), usd = (CASE ${usd2} END) WHERE id in (${id})`, async err => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success'
                });
            });
        });
    });
}

exports.changeImportStatus = async (req, res) => {
    const { ordernumber, status } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }

    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check[0].posID == 1 || check[0].posID == 2 || check[0].posID == 4) {
            var dt = new Date().addHours(8).toISOString();
            db.query(`UPDATE import SET stat = ${status}, updated_at = '${dt}' WHERE ordernumber = '${ordernumber}'`, async err => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    dt
                });
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.getImportEdit = async (req, res) => {
    const { brand, day, qty, sold } = req.body;
    db.query(`SELECT code from store_location`, async (err, loc) => {
        if(err) {
            throw err;
        }
        var uld = '';
        loc.forEach(el => {
            if(uld == '') {
                uld = `${el.code}`;
            } else {
                uld = `${uld} + ${el.code}`;
            }
        });
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
    
        var normal = new Date().addDays(day * -1);
        normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate()));
        db.query(`SELECT id, brandname from brands`, async (err, brands) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT ordernumber, exchange from import WHERE done = false`, async (err, order) => {
                if(err) {
                    throw err;
                }
                if(order.length > 0) {
                    db.query(`SELECT p.image, p.id, p.name, i.sale_price, i.cny, i.usd, p.model, i.qty from importproduct as i inner join product as p on i.productId = p.id WHERE ordernumber = '${order[0].ordernumber}'`, async (err, orderProduct) => {
                        if(err) {
                            throw err;
                        }
                        var id = '';
                        orderProduct.forEach(el => {
                            if (id == '') {
                                id = `${el.id}`;
                            } else {
                                id = `${id}, ${el.id}`;
                            }
                        });
                        var qr;
                        if(id == '') {
                            qr = `SELECT * FROM (SELECT SUM(o.quantity) as total, p.model, p.id, p.name, p.color_name, p.sale_price, p.cost_price, p.image, p.cny, p.usd, (${uld}) as totalQty from orders as r inner join order_product as o on r.order_number = o.order_number inner join product as p on o.product_id = p.id WHERE r.created_at > '${normal}' AND p.brand = ${brand} GROUP BY o.product_id ORDER BY total DESC) as r WHERE r.total >= ${sold} AND r.totalQty <= ${qty}`
                        } else {
                            qr = `SELECT * FROM (SELECT SUM(o.quantity) as total, p.model, p.id, p.name, p.color_name, p.sale_price, p.cost_price, p.image, p.cny, p.usd, (${uld}) as totalQty from orders as r inner join order_product as o on r.order_number = o.order_number inner join product as p on o.product_id = p.id WHERE r.created_at > '${normal}' AND p.brand = ${brand} AND p.id NOT IN(${id}) GROUP BY o.product_id ORDER BY total DESC) as r WHERE r.total >= ${sold} AND r.totalQty <= ${qty}`
                        }

                        db.query(qr, async (err, product) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT name, model, sale_price, id, color_name, cny, usd, image from product`, async (err, allproduct) => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    brands,
                                    product,
                                    ordernumber: order[0].ordernumber,
                                    exchange: order[0].exchange,
                                    orderProduct,
                                    allproduct
                                });
                            });
                        });
                    });
                } else {
                    var orderNumber = 'IO'+Date.now();
                    var pst = {ordernumber: orderNumber, name: ''}
                    var n = `INSERT INTO import SET ?`;
                    db.query(n, pst, async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT * FROM (SELECT SUM(o.quantity) as total, p.model, p.id, p.name, p.color_name, p.sale_price, p.cny, p.usd, p.image, (${uld}) as totalQty from orders as r inner join order_product as o on r.order_number = o.order_number inner join product as p on o.product_id = p.id WHERE r.created_at > '${normal}' AND p.brand = ${brand} GROUP BY o.product_id ORDER BY total DESC) as r WHERE r.total >= ${sold} AND r.totalQty <= ${qty}`, async (err, product) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT name, model, sale_price, id, color_name, cny, usd, image from product`, async (err, allproduct) => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    brands,
                                    product,
                                    ordernumber: orderNumber,
                                    orderProduct: [],
                                    exchange: 'cny',
                                    allproduct
                                });
                            });
                        });
                    });
                }
            });
        });
    });
}

exports.checkQpayBill = async (req, res) => {
    const { ordernumber } = req.body;
    db.query(`SELECT paid from orders WHERE order_number = '${ordernumber}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'success',
                paid: check[0].paid
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}



exports.getCustomerExpends = async (req, res) => {
    const { datetime } = req.body;
    if(datetime == undefined || datetime == null) {
        res.json({
            result: 'failed'
        });
    } else {
        Date.prototype.addHours = function(h) {
            this.setTime(this.getTime() + (h*60*60*1000));
            return this;
        }
        var s = new Date(datetime[0]).addHours(8);
        var e = new Date(datetime[1]).addHours(8);
        s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
        e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
        
        db.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as created_at, totalAmount, reportNumber, 'expend' as state from customer_report WHERE created_at >= '${s}' AND created_at <= '${e}' ORDER BY created_at DESC`, async (err, expend) => {
            if(err) {
                throw err;
            }
            if(expend.length > 0) {
                db.query(`SELECT p.name, c.type, p.model, p.image, c.price, p.wholesale_price, c.reportNumber, c.qty, DATE_FORMAT(cr.created_at, '%Y-%m-%d') as created_at, 'expend' as state from product as p inner join customer_report_product as c on p.id = c.productId inner join customer_report as cr on c.reportNumber = cr.reportNumber WHERE cr.created_at >= '${s}' AND cr.created_at <= '${e}' AND c.type = 1 ORDER BY c.id DESC`, async (err, product1) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT p.name, c.type, p.model, p.image, c.price, p.wholesale_price, c.reportNumber, c.qty, DATE_FORMAT(cr.created_at, '%Y-%m-%d') as created_at, 'expend' as state from product as p inner join customer_report_product as c on p.id = c.productId inner join customer_report as cr on c.reportNumber = cr.reportNumber WHERE cr.created_at >= '${s}' AND cr.created_at <= '${e}' AND c.type = 2 ORDER BY c.id DESC`, async (err, product2) => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT DATE_FORMAT(created_at, '%Y-%m-%d') as created_at, totalAmount, revenueNumber, 'revenue' as state from customer_revenue WHERE created_at >= '${s}' AND created_at <= '${e}' ORDER BY created_at DESC`, async (err, revenue) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT p.name, c.type, p.model, p.image, c.price, p.wholesale_price, c.revenueNumber, c.qty, DATE_FORMAT(cr.created_at, '%Y-%m-%d') as created_at, 'revenue' as state from customerproduct as p inner join customer_revenue_product as c on p.id = c.productId inner join customer_revenue as cr on c.revenueNumber = cr.revenueNumber WHERE cr.created_at >= '${s}' AND cr.created_at <= '${e}' AND c.type = 2 AND cr.stat = true ORDER BY c.id DESC`, async (err, revenueproduct2) => {
                                if(err) {
                                    throw err;
                                }
                                var q = `SELECT p.name, c.type, p.model, p.image, c.price, p.wholesale_price, c.revenueNumber, c.qty, DATE_FORMAT(cr.created_at, '%Y-%m-%d') as created_at, 'revenue' as state from product as p inner join customer_revenue_product as c on p.id = c.productId inner join customer_revenue as cr on c.revenueNumber = cr.revenueNumber WHERE cr.created_at >= '${s}' AND cr.created_at <= '${e}' AND c.type = 1 AND cr.stat = true ORDER BY c.id DESC`;
                                
                                db.query(q, async (err, revenueproduct1) => {
                                    if(err) {
                                        throw err;
                                    }
                                    res.json({
                                        result: 'success',
                                        expend,
                                        product1,
                                        product2,
                                        revenue,
                                        revenueproduct1,
                                        revenueproduct2
                                    });
                                });
                            });
                        });
                    });
                });
            } else {
                res.json({
                    result: 'norow'
                });
            }
        });
    }
}

exports.EndOrder = async (req, res) => {
    const { ordernumber, role } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    if(role == 6) {
        db.query(`UPDATE users SET loyalty_at = NOW() WHERE id = ${payload.id}`, async err => { 
            if(err) {
                throw err;
            }
            db.query(`SELECT product_id, quantity, wholesale_price from order_product inner join product on product.id = order_product.product_id WHERE order_number = '${ordernumber}'`, async (err, check) => {
                if(err) {
                    throw err;
                }
                var id = [], tAmount = 0;
                check.forEach(el => {
                    id.push(el.product_id);
                    tAmount += el.quantity * el.wholesale_price;
                });
                if(tAmount > 2000000) {
                    var loyalty = parseInt(tAmount / 10000);
                    db.query(`UPDATE users SET loyalty = (loyalty + ${loyalty}) WHERE id = ${payload.id}`, async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT productId from customerproductqty WHERE productId in (${id}) AND userId = ${payload.id} AND type = 1`, async (err, checkProduct) => {
                            if(err) {
                                throw err;
                            }
                            if(checkProduct.length > 0) {
                                var update = '', insert = [];
                                var id2 = [];
                                checkProduct.forEach(e => {
                                    id2.push(e.productId);
                                });
                                check.forEach(el => {
                                    if(id2.includes(el.product_id)) {
                                        if(update == '') {
                                            update = `when productId = '${el.product_id}' then (qty + ${el.quantity})`;
                                        } else {
                                            update += ` when productId = '${el.product_id}' then (qty + ${el.quantity})`;
                                        }
                                    } else {
                                        insert.push([el.product_id, el.quantity, 1, payload.id]);
                                    }
                                });
            
                                db.query(`UPDATE customerproductqty SET qty = (case ${update} end) WHERE productId in (${id2}) AND userId = ${payload.id}`, async err => {
                                    if(err) {
                                        throw err;
                                    }
                                    if(insert.length > 0) {
                                        var n = `INSERT INTO customerproductqty (productId, qty, type, userId) VALUES ?`;
                                        db.query(n, [insert], async err => { 
                                            if(err) {
                                                throw err;
                                            }
                                            db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                                                if(err) {
                                                    throw err;
                                                }
                                                res.json({
                                                    result: 'success'
                                                });
                                            });
                                        });
                                    } else {
                                        db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
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
                                var rows = [];
                                var n = `INSERT INTO customerproductqty (productId, qty, type, userId) VALUES ?`;
                                check.forEach(el => {
                                    var a = [el.product_id, el.quantity, 1, payload.id];
                                    rows.push(a);
                                });
                                db.query(n, [rows], async err => { 
                                    if(err) {
                                        throw err;
                                    }
                                    db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        res.json({
                                            result: 'success'
                                        });
                                    });
                                });
                            }
                        });
                    });
                    
                } else {
                    db.query(`SELECT productId from customerproductqty WHERE productId in (${id}) AND userId = ${payload.id} AND type = 1`, async (err, checkProduct) => {
                        if(err) {
                            throw err;
                        }
                        if(checkProduct.length > 0) {
                            var update = '', insert = [];
                            var id2 = [];
                            checkProduct.forEach(e => {
                                id2.push(e.productId);
                            });
                            check.forEach(el => {
                                if(id2.includes(el.product_id)) {
                                    if(update == '') {
                                        update = `when productId = '${el.product_id}' then (qty + ${el.quantity})`;
                                    } else {
                                        update += ` when productId = '${el.product_id}' then (qty + ${el.quantity})`;
                                    }
                                } else {
                                    insert.push([el.product_id, el.quantity, 1, payload.id]);
                                }
                            });
        
                            db.query(`UPDATE customerproductqty SET qty = (case ${update} end) WHERE productId in (${id2}) AND userId = ${payload.id}`, async err => {
                                if(err) {
                                    throw err;
                                }
                                if(insert.length > 0) {
                                    var n = `INSERT INTO customerproductqty (productId, qty, type, userId) VALUES ?`;
                                    db.query(n, [insert], async err => { 
                                        if(err) {
                                            throw err;
                                        }
                                        db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            res.json({
                                                result: 'success'
                                            });
                                        });
                                    });
                                } else {
                                    db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
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
                            var rows = [];
                            var n = `INSERT INTO customerproductqty (productId, qty, type, userId) VALUES ?`;
                            check.forEach(el => {
                                var a = [el.product_id, el.quantity, 1, payload.id];
                                rows.push(a);
                            });
                            db.query(n, [rows], async err => { 
                                if(err) {
                                    throw err;
                                }
                                db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                                    if(err) {
                                        throw err;
                                    }
                                    res.json({
                                        result: 'success'
                                    });
                                });
                            });
                        }
                    });
                }
            });
        });
    } else {
        db.query(`SELECT call_store from users as u inner join orders as o on u.id = o.user_id = WHERE o.ordernumber = '${ordernumber}'`, async (err, store) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT product_id, quantity from order_product WHERE order_number = '${ordernumber}'`, async (err, product) => {
                if(err) {
                    throw err;
                }
                var id = [], qty = '', remain = '';
                product.forEach(el => {
                    id.push(el.product_id);
                    remain += ` WHEN id = ${el.product_id} THEN remain - ${el.quantity}`;
                    qty += ` WHEN id = ${el.product_id} THEN ${store[0].call_store} + ${el.quantity}`;
                });
                db.query(`UDPATE product SET remain = (CASE ${remain} END) WHERE id in(${id})`, async err => {
                    if(err) {
                        throw err;
                    }
                    db.query(`UDPATE product SET ${store[0].call_store} = (CASE ${qty} END) WHERE id in(${id})`, async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`UPDATE orders SET read_it = 'true' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success'
                            });
                        });
                    });
                });
            });
        });
    }
}

exports.createQpayBill = async (req, res) => {
    const { ordernumber, user, total } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT qrcode, payment_id from orders WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            if (check[0].qrcode == null) {
                let tkn = await getToken();
                tkn = tkn.access_token;
                let bill = await createBill(tkn, user, ordernumber, total);
                db.query(`UPDATE orders SET payment_id = '${bill.payment_id}', qrcode = '${bill.qPay_QRcode}' WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        qr: bill.qPay_QRcode,
                        payment: bill.payment_id
                    });
                });
            } else {
                res.json({
                    result: 'success',
                    qr: check[0].qrcode,
                    payment: check[0].payment_id
                });
            }
        } else {
            res.json({
                result: 'noorder'
            });
        }
    });
}

exports.createOrder = async (req, res) => {
    const { product, ordervalue, role } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    console.log(product);
    db.query(`SELECT code from store_location`, async (err, loc) => {
        if(err) {
            throw err;
        }
        var uld = '';
        loc.forEach(el => {
            if(el.code != 'shop_08') {
                if(uld == '') {
                    uld = `${el.code}`;
                } else {
                    uld = `${uld} + ${el.code}`;
                }
            }
        });
        var c;
        if(role == 6) {
            c = `SELECT c.id from cart as c inner join product as p on c.product_id = p.id WHERE c.user_id = ${payload.id} AND c.quantity > (${uld})`;
        }
        else {
            c = `SELECT c.id from cart as c inner join product as p on c.product_id = p.id WHERE c.user_id = ${payload.id} AND c.quantity > p.remain`;
        }
        db.query(c, async (err, check) => {
            if(err) {
                throw err;
            }
    
            if(check.length > 0) {
                res.json({
                    result: 'failed',
                    msg: 'Үлдэгдэл хүрэлцэхгүй байна. Та дахин шалгана уу'
                });
            } else {
                var date = new Date();
                date = date.getFullYear().toString().substr(-2) + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
                var ordernumber = `PO${date}`;
                db.query(`SELECT MAX(id) as maxId from orders WHERE order_number LIKE '${ordernumber}%'`, async (err, max) => {
                    if(err) {
                        throw err;
                    }
                    if(max[0].maxId === null) {
                        ordernumber = `${ordernumber}01`;
                        var n = `INSERT INTO order_product (product_id, user_id, quantity, order_number) VALUES ?`;
                            var rows = [];
                            product.forEach(el => {
                                var pst = [el.id, payload.id, el.quantity, ordernumber];
                                rows.push(pst);
                            });
                            if(rows.length > 0) {
                                db.query(n, [rows], async err => {
                                    if(err) {
                                        throw err;
                                    }
                                    n = `INSERT INTO orders SET ?`
                                    pst = {user_id: payload.id, stat: 1, created_at: new Date(), updated_at: new Date(), read_it: 'false', order_value: ordervalue, order_number: ordernumber}
                                    db.query(n, pst, async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        db.query(`DELETE from cart WHERE user_id = ${payload.id}`, async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            res.json({
                                                result: 'success'
                                            });
                                        });
                                    });
                                });
                            } else {
                                res.json({
                                    result: 'Бүтээгдэхүүн олдсонгүй'
                                });
                        }
                    } else {
                        db.query(`SELECT order_number from orders WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                            if(err) {
                                throw err;
                            }
                            var index = LastOrder[0].order_number.substr(-2);
                            var first, second;
                            first = index[0]; second = index[1];
                            if(second == 9) {
                                second = 0;
                                first++;
                            } else {
                                second++;
                            }
                            ordernumber = `${ordernumber}${first}${second}`;
                            var n = `INSERT INTO order_product (product_id, user_id, quantity, order_number) VALUES ?`;
                            var rows = [];
                            product.forEach(el => {
                                var pst = [el.id, payload.id, el.quantity, ordernumber];
                                rows.push(pst);
                            });
                            if(rows.length > 0) {
                                console.log(rows);
                                db.query(n, [rows], async err => {
                                    if(err) {
                                        throw err;
                                    }
                                    n = `INSERT INTO orders SET ?`
                                    pst = {user_id: payload.id, stat: 1, created_at: new Date(), updated_at: new Date(), read_it: 'false', order_value: ordervalue, order_number: ordernumber}
                                    db.query(n, pst, async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        db.query(`DELETE from cart WHERE user_id = ${payload.id}`, async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            res.json({
                                                result: 'success'
                                            });
                                        });
                                    });
                                });
                            } else {
                                res.json({
                                    result: 'Бүтээгдэхүүн олдсонгүй'
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    
}


exports.createMovement = async (req, res) => {
    const { product, toLocation, ordervalue } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var date = new Date();
    var dt = date.getFullYear().toString().substr(-2) + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
    date = date.getFullYear() + '-' + ((date.getMonth() > 8) ? (date.getMonth() + 1) : ('0' + (date.getMonth() + 1))) + '-' + ((date.getDate() > 9) ? date.getDate() : ('0' + date.getDate()))
    let c = `SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${date}'`;
    db.query(c, async (err, check_time) => {
        if(err) {
            throw err;
        }
        if(check_time.length > 0) {

            let c = `SELECT c.id from cart as c inner join product as p on c.product_id = p.id WHERE c.user_id = ${payload.id} AND c.quantity > p.${check_time[0].address}`;
            db.query(c, async (err, check) => {
                if(err) {
                    throw err;
                }
                if(check.length > 0) {
                    res.json({
                        result: 'failed',
                        msg: 'Үлдэгдэл хүрэлцэхгүй байна. Та дахин шалгана уу'
                    });
                } else {
                    var ordernumber = `LM${dt}`;
                    db.query(`SELECT MAX(id) as maxId from movement WHERE ordernumber LIKE '${ordernumber}%'`, async (err, max) => {
                        if(err) {
                            throw err;
                        }
                        if(max[0].maxId === null) {
                            ordernumber = `${ordernumber}01`;
                            var n = `INSERT INTO movement_product (product_id, user_id, quantity, ordernumber) VALUES ?`;
                                var rows = [];
                                product.forEach(el => {
                                    var pst = [el.id, payload.id, el.quantity, ordernumber];
                                    rows.push(pst);
                                });
                                if(rows.length > 0) {
                                    db.query(n, [rows], async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        n = `INSERT INTO movement SET ?`
                                        pst = {ordernumber, from_where: toLocation, to_where: check_time[0].address, date, stat: 'send', write_it: 'false', user_id: payload.id, move_value: ordervalue}
                                        db.query(n, pst, async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            db.query(`DELETE from cart WHERE user_id = ${payload.id}`, async err => {
                                                if(err) {
                                                    throw err;
                                                }
                                                res.json({
                                                    result: 'success'
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    res.json({
                                        result: 'Бүтээгдэхүүн олдсонгүй'
                                    });
                                }
                        } else {
                            db.query(`SELECT ordernumber from movement WHERE id = ${max[0].maxId}`, async (err, LastOrder) => {
                                if(err) {
                                    throw err;
                                }
                                var index = LastOrder[0].ordernumber.substr(-2);
                                var first, second;
                                first = index[0]; second = index[1];
                                if(second == 9) {
                                    second = 0;
                                    first++;
                                } else {
                                    second++;
                                }
                                ordernumber = `${ordernumber}${first}${second}`;
                                var n = `INSERT INTO movement_product (product_id, user_id, quantity, ordernumber) VALUES ?`;
                                var rows = [];
                                product.forEach(el => {
                                    var pst = [el.id, payload.id, el.quantity, ordernumber];
                                    rows.push(pst);
                                });
                                if(rows.length > 0) {
                                    db.query(n, [rows], async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        n = `INSERT INTO movement SET ?`
                                        pst = {ordernumber, from_where: toLocation, to_where: check_time[0].address, date, stat: 'send', write_it: 'false', user_id: payload.id, move_value: ordervalue}
                                        db.query(n, pst, async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            db.query(`DELETE from cart WHERE user_id = ${payload.id}`, async err => {
                                                if(err) {
                                                    throw err;
                                                }
                                                res.json({
                                                    result: 'success'
                                                });
                                            });
                                        });
                                    });
                                } else {
                                    res.json({
                                        result: 'Бүтээгдэхүүн олдсонгүй'
                                    });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            res.json({
                result: 'failed',
                msg: 'Цагаа бүртгүүлнэ үү'
            });
        }
    });
}

exports.searchOrder = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        var orderQuery;
        if(user[0].posID == 1 || user[0].posID == 2) {
            orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.order_number LIKE '%${ordernumber}%' ORDER BY o.created_at DESC`;
        } else {
            orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.order_number LIKE '%${ordernumber}%' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
        }
        db.query(orderQuery, async (err, orders) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                orders
            });
        });
    });
}

exports.getCurrentMovement = async (req, res) => {
    const { ordernumber } = req.body;
    
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
            if(err) {
                throw err;
            }
            let m, cEmp = [], rEmp = [];
            if(user[0].posID == 1 || user[0].posID == 2) {
                m = `SELECT u.name, u.img, u.phone, u.email, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, u.name, m.c_emp, m.r_emp, m.move_value from movement as m inner join users as u on m.user_id = u.id WHERE m.ordernumber = '${ordernumber}'`;
                db.query(m, async (err, movement) => {
                    if(err) {
                        throw err;
                    }
                    if(movement.length > 0) {
                        db.query(`SELECT name, code from store_location`, async (err, location) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT p.model, p.name, p.color_name, p.image, p.sale_price, m.quantity, p.id from movement_product as m inner join product as p on p.id = m.product_id WHERE m.ordernumber = '${ordernumber}'`,async (err, product) => {
                                if(err) {
                                    throw err;
                                }
                                if(movement[0].c_emp !== null) {
                                    db.query(`SELECT name, img, phone, email from users WHERE id =${movement[0].c_emp}`, async (err, r) => {
                                        if(err) {
                                            throw err;
                                        }
                                        if(r.length > 0) {
                                            cEmp = r[0];
                                        }
                                        if(movement[0].r_emp !== null) {
                                            db.query(`SELECT name, img, phone, email from users WHERE id = ${movement[0].r_emp}`, async (err, r) => {
                                                if(err) {
                                                    throw err;
                                                }
                                                if(r.length > 0) {
                                                    rEmp = r[0];
                                                }
                                                res.json({
                                                    result: 'success',
                                                    movement: movement[0],
                                                    rEmp, 
                                                    cEmp,
                                                    product,
                                                    location,
                                                    shop: checkTime[0].address
                                                });
                                            });
                                        } else {
                                            res.json({
                                                result: 'success',
                                                movement: movement[0],
                                                rEmp, 
                                                cEmp,
                                                product,
                                                location,
                                                shop: checkTime[0].address
                                            });
                                        }
                                    });
                                } else {
                                    res.json({
                                        result: 'success',
                                        movement: movement[0],
                                        rEmp, 
                                        cEmp,
                                        product,
                                        location,
                                        shop: checkTime[0].address
                                    });
                                }
                            });
                        });
                    } else {
                        res.json({
                            result: 'notfound'
                        });
                    }
                });
            } else {
                if(checkTime.length > 0) {
                    m = `SELECT u.name, u.img, u.phone, u.email, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, u.name, m.c_emp, m.r_emp, m.move_value from movement as m inner join users as u on m.user_id = u.id WHERE m.ordernumber = '${ordernumber}' AND (m.from_where = '${checkTime[0].address}' OR m.to_where = '${checkTime[0].address}')`;
                    db.query(m, async (err, movement) => {
                        if(err) {
                            throw err;
                        }
                        if(movement.length > 0) {
                            db.query(`SELECT name, code from store_location`, async (err, location) => {
                                if(err) {
                                    throw err;
                                }
                                db.query(`SELECT p.model, p.name, p.color_name, p.image, p.${movement[0].from_where}, p.id, p.sale_price, m.quantity from movement_product as m inner join product as p on p.id = m.product_id WHERE m.ordernumber = '${ordernumber}'`,async (err, product) => {
                                    if(err) {
                                        throw err;
                                    }
                                    if(movement[0].c_emp !== null) {
                                        db.query(`SELECT name, img, phone, email from users WHERE id =${movement[0].c_emp}`, async (err, r) => {
                                            if(err) {
                                                throw err;
                                            }
                                            if(r.length > 0) {
                                                cEmp = r[0];
                                            }
                                            if(movement[0].r_emp !== null) {
                                                db.query(`SELECT name, img, phone, email from users WHERE id = ${movement[0].r_emp}`, async (err, r) => {
                                                    if(err) {
                                                        throw err;
                                                    }
                                                    if(r.length > 0) {
                                                        rEmp = r[0];
                                                    }
                                                    res.json({
                                                        result: 'success',
                                                        movement: movement[0],
                                                        rEmp, 
                                                        cEmp,
                                                        product,
                                                        location,
                                                        shop: checkTime[0].address
                                                    });
                                                });
                                            } else {
                                                res.json({
                                                    result: 'success',
                                                    movement: movement[0],
                                                    rEmp, 
                                                    cEmp,
                                                    product,
                                                    location,
                                                    shop: checkTime[0].address
                                                });
                                            }
                                        });
                                    } else {
                                        res.json({
                                            result: 'success',
                                            movement: movement[0],
                                            rEmp, 
                                            cEmp,
                                            product,
                                            location,
                                            shop: checkTime[0].address
                                        });
                                    }
                                });
                            });
                        } else {
                            res.json({
                                result: 'notfound'
                            });
                        }
                    });
                } else {
                    return res.json({
                        result: 'time'
                    })
                }
            }
        })
    });
}

exports.getCurrentOrder = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        let o;
        db.query(`SELECT u.posID, u.id from orders as o inner join users as u on o.user_id = u.id WHERE o.order_number = '${ordernumber}'`, async (err, posID) => {
            if(err) {
                throw err;
            }
            if (posID.length > 0) {
                if(posID[0].posID == 6) {
                    if(posID[0].id == payload.id || user[0].posID == 4) {
                        o = `SELECT o.order_number, o.read_it, o.paid, u.phone, o.id, o.user_id, u.posID, o.created_at, o.stat, o.order_value, u.name, u.img, c.city as shop, o.paid, o.qrcode, o.payment_id from orders as o inner join users as u on o.user_id = u.id inner join cities as c on u.city = c.id WHERE o.order_number = '${ordernumber}'`;
                    } else {
                        res.json({
                            result: 'failed'
                        });
                    }
                } else {
                    if(user[0].posID == 1 || user[0].posID == 2) {
                        o = `SELECT o.order_number, o.read_it, o.paid, u.phone, o.id, o.user_id, u.posID, o.created_at, o.stat, o.order_value, u.name, u.img, s.name as shop from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.order_number = '${ordernumber}'`;
                    } else {
                        o = `SELECT o.order_number, o.read_it, o.paid, o.created_at, o.id, o.user_id, u.posID, o.stat, o.order_value, u.phone, u.name, u.img, s.name as shop from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.order_number = '${ordernumber}' AND o.user_id = ${payload.id}`;
                    }
                }
                db.query(o, async (err, order) => {
                    if(err) {
                        throw err;
                    }
        
                    if(order.length > 0) {
                        db.query(`SELECT code from store_location`, async (err, loc) => {
                            if(err) {
                                throw err;
                            }
                            var uld = '';
                            loc.forEach(el => {
                                if(el.code != 'shop_08') {
                                    if(uld == '') {
                                        uld = `${el.code}`;
                                    } else {
                                        uld = `${uld} + ${el.code}`;
                                    }
                                }
                            });
                            let p = `SELECT p.name, p.code, p.image, p.id, o.quantity, p.sale_price, p.model, p.remain, p.wholesale_price, (${uld}) as total, u.posID from product as p inner join order_product as o on p.id = o.product_id inner join users as u on o.user_id = u.id WHERE o.order_number = '${ordernumber}'`;
                            db.query(p, async (err, products) => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    result: 'success',
                                    order: order[0],
                                    products
                                });
                            });
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
    });
}

exports.getOrders = async (req, res) => {
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
    var orderQuery;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            if(datetime == null) {
                orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.stat = 1 AND u.posID != 6 ORDER BY o.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' AND u.posID != 6 ORDER BY o.created_at DESC`;
            }
        } else if(user[0].posID == 6) {
            if(datetime == null) {
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, o.updated_at, o.paid, c.city as shop from orders as o inner join users as u on o.user_id = u.id inner join cities as c on u.city = c.id WHERE (o.read_it = 'false' AND o.user_id = ${payload.id}) OR (o.created_at > '${normal}') ORDER BY o.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, o.updated_at, o.paid, c.city as shop from orders as o inner join users as u on o.user_id = u.id inner join cities as c on u.city = c.id WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
            }
        } else if(user[0].posID == 4) {
            if(datetime == null) {
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, o.updated_at, o.paid, c.city as shop from orders as o inner join users as u on o.user_id = u.id inner join cities as c on u.city = c.id WHERE o.user_id = ${payload.id} AND o.read_it = 'false' OR (u.posID = 6 AND o.stat = 1) OR (u.posID = 6 AND o.read_it = 'false') ORDER BY o.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, o.updated_at, o.paid, c.city as shop from orders as o inner join users as u on o.user_id = u.id inner join cities as c on u.city = c.id WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' AND (o.user_id = ${payload.id} OR u.posID = 6) ORDER BY o.created_at DESC`;
            }
        } else {
            if(datetime == null) {
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.read_it = 'false' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
            } else {
                var s = new Date(datetime[0]).addHours(8);
                var e = new Date(datetime[1]).addHours(8);
                s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                orderQuery = `SELECT o.read_it, o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
            }
        }
        db.query(orderQuery, async (err, orders) => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success',
                orders
            });
        });

    });
}

exports.deleteRma = async (req, res) => {
    const { id } = req.body;
    db.query(`DELETE from rma WHERE id = ${id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.sentRma = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID, city from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 6) {
            db.query(`UPDATE rma SET sent = 1, sentUser = ${payload.id} WHERE userId = ${payload.id} AND id = ${id}`, async err => {
                if(err) {
                    throw err;
                }
                db.query(`UPDATE users SET loyalty = (CASE WHEN loyalty >= 10 THEN loyalty - 10 WHEN loyalty < 10 THEN 0 END) WHERE id = ${payload.id}`, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success'
                    });
                })
            });
        } else {
            db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND endtime = '0'`, async (err, result) => {
                if(err) {
                    throw err;
                }
                if(result.length > 0) {
                    db.query(`SELECT id from rma WHERE storeId = '${result[0].address}' AND sent = 1 AND wrote = 1 AND stat = 1`, async (err, check) => {
                        if(err) {
                            throw err;
                        }
                        if(check.length > 0) {
                            res.json({
                                result: 'notFixed'
                            });
                        } else {
                            db.query(`UPDATE rma SET sent = 1, sentUser = ${payload.id} WHERE storeId = '${result[0].address}' AND id = ${id}`, async err => {
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
                        result: 'nottime'
                    });
                }
            });
        }
    })
}

exports.getRmas = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    db.query(`SELECT code, name from store_location`, async (err, location) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
            if(err) {
                throw err;
            }
            var q;
            if(user[0].posID == 1 || user[0].posID == 2 || user[0].posID == 4) {
                db.query(`SELECT SUM(p.cost_price) as total, b.brandname, COUNT(*) as count, r.updated_at from rma as r inner join product as p on r.productId = p.id inner join brands as b on p.brand = b.id WHERE r.stat = 3 GROUP BY p.brand`, async (err, brand) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT SUM(qty) as qty, storeId from rma inner join users on rma.userId = users.id WHERE users.posID != 6 AND (wrote = 0 OR sent = 0) GROUP BY storeId`, async (err, count) => {
                        if(err) {
                            throw err;
                        }
                        var normal = new Date().addDays(-30);
                        normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
                        q = `SELECT SUM(qty) as qty, storeId, userId, u.name from rma as r inner join users as u on r.userId = u.id WHERE u.posID != 6 AND (wrote = 0 OR r.stat = 1 OR r.updated_at > '${normal}') GROUP BY storeId`;
                        db.query(q, async (err, rma) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT city, id from cities`, async (err, cities) => {
                                if(err) {
                                    throw err;
                                }
                                db.query(`SELECT SUM(qty) as qty, storeId, userId from rma inner join users on rma.userId = users.id WHERE users.posID = 6 AND (wrote = 0 OR sent = 0) GROUP BY users.id`, async (err, countWhole) => {
                                    if(err) {
                                        throw err;
                                    }
                                    q = `SELECT SUM(qty) as qty, storeId, userId, u.name from rma as r inner join users as u on r.userId = u.id WHERE u.posID = 6 AND (wrote = 0 OR r.stat = 1 OR r.updated_at > '${normal}') GROUP BY u.id`;
                                    db.query(q, async (err, rmaWhole) => {
                                        if(err) {
                                            throw err;
                                        }
                                        res.json({
                                            result: 'success',
                                            location,
                                            rma,
                                            count,
                                            cities,
                                            brand,
                                            countWhole,
                                            rmaWhole
                                        });
                                    });
                                });
                                
                            });
                        });
                    });
                });
            } else if(user[0].posID == 6) {
                q = `SELECT p.id, p.model, p.name, r.id as rmaId, p.image, r.about, r.sent, p.wholesale_price, p.color_name, p.sale_price, r.qty, r.wrote, r.stat, r.created_at from rma as r inner join product as p on r.productId = p.id WHERE userId = ${payload.id} ORDER BY r.created_at DESC`;
                db.query(q, async (err, rma) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        location,
                        rma
                    });
                });
            } else {
                db.query(`SELECT address, address_name from timer_register WHERE user_id = ${payload.id} AND endtime = '0'`, async (err, checktime) => {
                    if(err) {
                        throw err;
                    }
                    if(checktime.length > 0) {
                        q = `SELECT p.id, p.model, p.name, r.id as rmaId, u.name as username, u.phone, r.about, r.sent, p.wholesale_price, p.image, p.color_name, p.sale_price, r.qty, r.wrote, r.stat, r.created_at from users as u inner join rma as r on u.id = r.userId inner join product as p on r.productId = p.id WHERE r.storeId = '${checktime[0].address}' ORDER BY r.created_at DESC`;
                        db.query(q, async (err, rma) => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                location,
                                rma,
                                address: checktime[0].address_name
                            });
                        });
                    } else {
                        res.json({
                            result: 'nottime'
                        });
                    }
                });
                
            }
        });
    });
}

exports.getRmaProduct = async (req, res) => {
    const { store, type } = req.body;
    
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    
    var normal = new Date().addDays(-30);
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    if(type == 1) {
        db.query(`SELECT u.name as username, r.id, u.phone, r.about, r.created_at, r.updated_at, r.sent_at, r.wrote, r.stat, r.sent, p.model, p.image, p.name, p.sale_price, p.wholesale_price, p.color_name, r.qty from users as u inner join rma as r on u.id = r.userId inner join product as p on r.productId = p.id WHERE storeId = '${store}' AND (r.stat = 1 OR r.updated_at > '${normal}') ORDER BY r.stat ASC, r.sent ASC, r.sent_at DESC`, async (err, rma) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT name from store_location WHERE code = '${store}'`, async (err, shop) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    shop: shop[0],
                    rma
                });
            });
        });
    } else {
        db.query(`SELECT u.name as username, r.id, u.phone, r.about, r.created_at, r.updated_at, r.sent_at, r.wrote, r.stat, r.sent, p.model, p.image, p.name, p.sale_price, p.wholesale_price, p.color_name, r.qty from users as u inner join rma as r on u.id = r.userId inner join product as p on r.productId = p.id WHERE userId = '${store}' AND (r.stat = 1 OR r.updated_at > '${normal}') ORDER BY r.stat ASC, r.sent ASC, r.sent_at DESC`, async (err, rma) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT cities.city as name from cities inner join users on cities.id = users.city WHERE users.id = ${store}`, async (err, shop) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    shop: shop[0],
                    rma
                });
            });
        });
    }
}

exports.addRma = async (req, res) => {
    const { products } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    var models = '';
    products.forEach(el => {
        if(models == '') {
            models = `'${el.model}'`;
        } else {
            models = `${models}, '${el.model}'`;
        }
    });


    db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND endtime = '0'`, async (err, checktime) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT posID, city from users WHERE id = ${payload.id}`, async (err, user) => {
            if(err) {
                throw err;
            }
            if(user[0].posID == 6) {
                var normal = new Date();
                normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1)));
                db.query(`SELECT SUM(p.wholesale_price * op.quantity) as total from orders as o inner join order_product as op on o.order_number = op.order_number inner join product as p on op.product_id = p.id WHERE o.created_at LIKE'${normal}%' AND o.paid = 1 AND o.user_id = ${payload.id}`, async (err, checkBill) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT SUM(p.wholesale_price * r.qty) as total from rma as r inner join product as p on r.productId = p.id WHERE r.userId = ${payload.id} AND r.sent = 0`, async (err, checkRmaTotal) => {
                        if(err) {
                            throw err;
                        }
                        
                        if(checkBill[0].total == null) {
                            res.json({
                                result: 'limited'
                            });
                        } else if((checkBill[0].total / 100 * 5) < checkRmaTotal[0].total) {
                            res.json({
                                result: 'limited'
                            });
                        } else {
                            db.query(`SELECT id, model from product WHERE model in (${models})`, async (err, check) => {
                                if(err) {
                                    throw err;
                                }
                                if(check.length == products.length) {
                                    var n = `INSERT INTO rma (storeId, productId, qty, about, created_at, userId) VALUES ?`;
                                    var rows = [];
                                    check.forEach(el => {
                                        products.forEach(element => {
                                            if(el.model.toUpperCase() == element.model.toUpperCase()) {
                                                var pst = [user[0].city, el.id, element.qty, element.description, new Date(), payload.id];
                                                rows.push(pst);
                                            }
                                        });
                                    });
                                    if(rows.length > 0) {
                                        db.query(n, [rows], async err => {
                                            if(err) {
                                                throw err;
                                            }
                                            res.json({
                                                result: 'success'
                                            });
                                        })
                                    }
                                } else {
                                    models = [];
                                    check.forEach(element => {
                                        models.push(element.model.toUpperCase());
                                    });
                                    
                                    products.forEach(el => {
                                        if(!models.includes(el.model.toUpperCase())) {
                                            return res.json({
                                                result: 'failed',
                                                model: el.model
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                });
            } else {
                if(user[0].posID == 5) {
                    if(checktime.length > 0) {
                        var normal = new Date();
                        normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1)));
                        db.query(`SELECT SUM(p.wholesale_price * op.quantity) as total from orders as o inner join order_product as op on o.order_number = op.order_number inner join product as p on op.product_id = p.id WHERE o.created_at LIKE'${normal}%' AND o.paid = 1 AND o.user_id = ${payload.id}`, async (err, checkBill) => {
                            if(err) {
                                throw err;
                            }
                            db.query(`SELECT SUM(p.wholesale_price * r.qty) as total from rma as r inner join product as p on r.productId = p.id WHERE r.userId = ${payload.id} AND r.sent = 0`, async (err, checkRmaTotal) => {
                                if(err) {
                                    throw err;
                                }
                                if(checkBill[0].total == null) {
                                    res.json({
                                        result: 'limited'
                                    });
                                } else if((checkBill[0].total / 100 * 5) < checkRmaTotal[0].total) {
                                    res.json({
                                        result: 'limited'
                                    });
                                } else {
                                    db.query(`SELECT id, model from product WHERE model in (${models})`, async (err, check) => {
                                        if(err) {
                                            throw err;
                                        }
                                        if(check.length == products.length) {
                                            var n = `INSERT INTO rma (storeId, productId, qty, about, created_at, userId) VALUES ?`;
                                            var rows = [];
                                            check.forEach(el => {
                                                products.forEach(element => {
                                                    if(el.model.toUpperCase() == element.model.toUpperCase()) {
                                                        var pst = [user[0].city, el.id, element.qty, element.description, new Date(), payload.id];
                                                        rows.push(pst);
                                                    }
                                                });
                                            });
                                            if(rows.length > 0) {
                                                db.query(n, [rows], async err => {
                                                    if(err) {
                                                        throw err;
                                                    }
                                                    res.json({
                                                        result: 'success'
                                                    });
                                                })
                                            }
                                        } else {
                                            models = [];
                                            check.forEach(element => {
                                                models.push(element.model.toUpperCase());
                                            });
                                            
                                            products.forEach(el => {
                                                if(!models.includes(el.model.toUpperCase())) {
                                                    return res.json({
                                                        result: 'failed',
                                                        model: el.model
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        });
                    } else {
                        res.json({
                            result: 'nottime'
                        });
                    }
                } else {
                    if(checktime.length > 0) {
                        db.query(`SELECT id, model from product WHERE model in (${models})`, async (err, check) => {
                            if(err) {
                                throw err;
                            }
                            if(check.length == products.length) {
                                var n = `INSERT INTO rma (storeId, productId, qty, about, created_at, userId) VALUES ?`;
                                var rows = [];
                                check.forEach(el => {
                                    products.forEach(element => {
                                        if(el.model.toUpperCase() == element.model.toUpperCase()) {
                                            var pst = [checktime[0].address, el.id, element.qty, element.description, new Date(), payload.id];
                                            rows.push(pst);
                                        }
                                    });
                                });
                                if(rows.length > 0) {
                                    db.query(n, [rows], async err => {
                                        if(err) {
                                            throw err;
                                        }
                                        res.json({
                                            result: 'success'
                                        });
                                    })
                                }
                            } else {
                                models = [];
                                check.forEach(element => {
                                    models.push(element.model.toUpperCase());
                                });
                                
                                products.forEach(el => {
                                    if(!models.includes(el.model.toUpperCase())) {
                                        return res.json({
                                            result: 'failed',
                                            model: el.model
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        res.json({
                            result: 'nottime'
                        });
                    }
                }
            }
        });
        
    });
}

exports.wroteRma = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(user[0].posID == 1 || user[0].posID == 2) {
            db.query(`UPDATE rma SET wrote = 1 WHERE id = ${id}`, async err => {
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
exports.changeRmaStatus = async (req, res) => {
    const { id, stat } = req.body;

    Date.prototype.addHours = function(h) {
        this.setTime(this.getTime() + (h*60*60*1000));
        return this;
    }

    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(user[0].posID == 1 || user[0].posID == 2) {
            // var dt = new Date().addHours(8).toISOString();
            // console.log(new Date().addHours(8).toISOString());
            db.query(`UPDATE rma SET stat = ${stat}, updated_at = NOW() WHERE id = ${id}`, async err => {
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

exports.getMovements = async (req, res) => {
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
    var dt = new Date();
    normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate())) + ' 00:00:00';
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    var orderQuery;
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
            if(err) {
                throw err;
            }
            
            if(user[0].posID == 1 || user[0].posID == 2) {
                if(datetime == null) {
                    // orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${normal}' ORDER BY o.created_at DESC`;
                    orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone, u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.write_it = 'false' ORDER BY m.date DESC`;
                } else {
                    var s = new Date(datetime[0]).addHours(8);
                    var e = new Date(datetime[1]).addHours(8);
                    s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                    e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                    // orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' ORDER BY o.created_at DESC`;
                    orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone, u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.date >= '${s}' AND m.date <= '${e}' ORDER BY m.date DESC`;
                }
            } else {
                
                if(checkTime.length > 0) {
                    if(datetime == null) {
                        // orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${normal}' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
                        orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone,u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.stat != 'received' AND (m.from_where = '${checkTime[0].address}' OR m.to_where = '${checkTime[0].address}') ORDER BY m.date DESC`;
                    } else {
                        var s = new Date(datetime[0]).addHours(8);
                        var e = new Date(datetime[1]).addHours(8);
                        s = s.getFullYear() + '-' + ((s.getMonth() > 8) ? (s.getMonth() + 1) : ('0' + (s.getMonth() + 1))) + '-' + ((s.getDate() > 9) ? s.getDate() : ('0' + s.getDate())) + ' 00:00:00';
                        e = e.getFullYear() + '-' + ((e.getMonth() > 8) ? (e.getMonth() + 1) : ('0' + (e.getMonth() + 1))) + '-' + ((e.getDate() > 9) ? e.getDate() : ('0' + e.getDate())) + ' 23:59:00';
                        // orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.created_at >= '${s}' AND o.created_at <= '${e}' AND o.user_id = ${payload.id} ORDER BY o.created_at DESC`;
                        orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone, u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.date >= '${s}' AND m.date <= '${e}' AND (m.from_where = '${checkTime[0].address}' OR m.to_where = '${checkTime[0].address}') ORDER BY m.date DESC`;
                    }
                } else {
                    return res.json({
                        result: 'time'
                    });
                }
            }
            db.query(orderQuery, async (err, orders) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT name, code from store_location`, async (err, location) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        orders,
                        location
                    });
                });
            });
        });

    });
}

exports.searchMovement = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
            if(err) {
                throw err;
            }
            var orderQuery;
            if(user[0].posID == 1 || user[0].posID == 2) {
                // orderQuery = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.order_number LIKE '%${ordernumber}%' ORDER BY o.created_at DESC`;
                orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone, u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.ordernumber LIKE '%${ordernumber}%' ORDER BY m.date DESC`;
            } else {
                if(checkTime.length > 0) {
                    orderQuery = `SELECT m.id, m.ordernumber, m.from_where, m.to_where, m.date, m.stat, m.write_it, m.user_id, m.move_value, m.c_emp, m.r_emp, u.name, u.phone, u.img, u.phone, u.email from movement as m inner join users as u on m.user_id = u.id WHERE m.ordernumber LIKE '%${ordernumber}%' AND (m.from_where = '${checkTime[0].address}' OR m.to_where = '${checkTime[0].address}') ORDER BY m.date DESC`;
                } else {
                    return res.json({
                        result: 'time'
                    });
                }
            }
            db.query(orderQuery, async (err, orders) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    orders
                });
            });
        });
        
    });
}


exports.disableOrder = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            db.query(`UPDATE orders SET stat = 3, updated_at = NOW() WHERE order_number = '${ordernumber}'`, async (err) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success'
                });
            });
        } else {
            db.query(`DELETE from orders WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                if(err) {
                    throw err;
                }
                db.query(`DELETE from order_product WHERE order_number = '${ordernumber}' AND user_id = ${payload.id}`, async err => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success'
                    });
                });
            });
        }
    });
}

exports.changeQtyOrder = async (req, res) => {
    const {ordernumber, product} = req.body;
    var row = '';
    product.forEach(el => {
        row += `when product_id = ${el.id} then ${el.quantity} `;
    });
    let qr = `UPDATE order_product SET quantity = (CASE ${row} END) WHERE order_number = '${ordernumber}'`;
    
    db.query(qr, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.confirmOrder = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT u.posID from orders as o inner join users as u on o.user_id = u.id WHERE o.order_number = '${ordernumber}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
            if(err) {
                throw err;
            }
            if(check[0].posID == 6) {
                if(user[0].posID == 4) {
                    db.query(`UPDATE orders SET stat = 2 WHERE order_number = '${ordernumber}'`, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success'
                        });
                    });
                } else {
                    res.json({
                        result : 'failed'
                    });
                }
            } else {
                if(user[0].posID == 1 || user[0].posID == 2) {
                    db.query(`UPDATE orders SET stat = 2, paid = 1 WHERE order_number = '${ordernumber}'`, async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success'
                        });
                    });
                } else {
                    res.json({
                        result : 'failed'
                    });
                }
            }
        });
    });
}

exports.changeQtyMovement = async (req, res) => {
    const {ordernumber, product} = req.body;
    var row = '';
    product.forEach(el => {
        row += `when product_id = ${el.id} AND ordernumber = '${ordernumber}' then ${el.quantity} `;
    });
    let qr = `UPDATE movement_product SET quantity = (CASE ${row} END)`;
    db.query(qr, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.confirmMovement = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
        if(err) {
            throw err;
        }
        if(checkTime.length > 0) {
            db.query(`UPDATE movement SET stat = 'confirmed', c_emp = ${payload.id} WHERE ordernumber = '${ordernumber}' AND from_where = '${checkTime[0].address}'`, async err => {
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
    })
}

exports.disableMovement = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
        if(checkTime.length > 0) {
            db.query(`DELETE from movement WHERE ordernumber = '${ordernumber}' AND (from_where = '${checkTime[0].address}' OR to_where = '${checkTime[0].address}')`, async err => {
                if(err) {
                    throw err;
                }
                db.query(`DELETE from movement_product WHERE ordernumber = '${ordernumber}'`, async err => {
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
                result: "failed"
            });
        }
    });
}

exports.receivedMovement = async (req, res) => {
    const { ordernumber, detail, product } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var dt = new Date();
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
    var id = [], to = '', from = '';
    product.forEach(el => {
        id.push(el.id);
        to += ` WHEN id = ${el.id} THEN ${detail.to_where} + ${el.quantity}`;
        from += ` WHEN id = ${el.id} THEN ${detail.from_where} - ${el.quantity}`;
    });
    db.query(`UPDATE product SET ${detail.to_where} = (CASE ${to} END), ${detail.from_where} = (CASE ${from} END) WHERE id in(${id})`, async err => {
        if(err) {
            throw err;
        }
        db.query(`SELECT address from timer_register WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, checkTime) => {
            if(err) {
                throw err;
            }
            if(checkTime.length > 0) {
                db.query(`UPDATE movement SET stat = 'received', r_emp = ${payload.id} WHERE ordernumber = '${ordernumber}' AND to_where = '${checkTime[0].address}'`, async err => {
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
    });

}

exports.wroteMovement = async (req, res) => {
    const { ordernumber } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 1 || user[0].posID == 2) {
            db.query(`UPDATE movement SET write_it = 'true' WHERE ordernumber = '${ordernumber}'`, async err => {
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
    })
}