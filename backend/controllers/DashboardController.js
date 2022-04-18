const mysql = require("mysql");
const fs = require('fs');
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


const sha256 = require("js-sha256");
const jwt = require('jwt-then');
const { monthsShort } = require("moment");


exports.getImageFromItlab = async (req, res) => {
    var config = {
        method: 'post',
        url: 'https://api.itlab.mn/api/product/get-product-image',
        headers: { 
          'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MzksImlhdCI6MTYyMDI3NjUxMn0.U66CWWvUUSizBqab6YqzINX0nyU5h-sFyCPtBoFoVdM'
        }
    };
    axios(config)
    .then(function (response) {
        var models = '', img = '';
        response.data.product.forEach(el => {
            if(models == '') {
                models += `'${el.enc_model}'`;
              } else {
                models += `, '${el.enc_model}'`;
            }

            img += ` when model = '${el.enc_model}' then '${el.image}'`;
        });

        var q = `UPDATE product set image = (CASE ${img} END) WHERE model in (${models})`;
        db.query(q, async err => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success'
            })
        });
    });
}

exports.ecommerce = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }

    db.query(`SELECT posID, call_store from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        user = user[0];
        var date = new Date();
        var thisMonthAmount = [], subMonthAmount = [], defaultAmount = [], maxAmount = 0;
        var subMonths = new Date(date.setMonth(date.getMonth()-1));
        var thisMonths = new Date(date.setMonth(date.getMonth()+1));
        subMonths = subMonths.getFullYear() + '-' + ((subMonths.getMonth() > 8) ? (subMonths.getMonth() + 1) : ('0' + (subMonths.getMonth() + 1)));
        thisMonths = thisMonths.getFullYear() + '-' + ((thisMonths.getMonth() > 8) ? (thisMonths.getMonth() + 1) : ('0' + (thisMonths.getMonth() + 1)));

        db.query(`SELECT date, total, sale, deleted from cash_report WHERE date LIKE '${subMonths}%' AND store_id = '${user.call_store}'`, async (err, subMonth) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT date, total, sale, deleted from cash_report WHERE date LIKE '${thisMonths}%' AND store_id = '${user.call_store}'`, async (err, thisMonth) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT sale_plan_day from store_location WHERE code = '${user.call_store}'`, async (err, defAmount) => {
                    if(err) {
                        throw err;
                    }
                
                    for (let i = 1; i <= 31; i++) {
                        var a;
                        if(i < 10) {
                            a = `0${i}`;
                        } else {
                            a = i;
                        }
                        var c = false;
                        subMonth.forEach(el => {
                            if(el.date == `${subMonths}-${a}`) {
                                c = true;
                                subMonthAmount.push(el.total - el.sale - el.deleted);
                            }
                        });
                        if(c == false) {
                            subMonthAmount.push(0);
                        }
                        defaultAmount.push(defAmount[0].sale_plan_day);
                    }

                    for (let i = 1; i <= 31; i++) {
                        var a;
                        if(i < 10) {
                            a = `0${i}`;
                        } else {
                            a = i;
                        }
                        var c = false;
                        thisMonth.forEach(el => {
                            if(el.date == `${thisMonths}-${a}`) {
                                c = true;
                                thisMonthAmount.push(el.total - el.sale - el.deleted);
                            }
                        });
                        if(c == false) {
                            thisMonthAmount.push(0);
                        }
                    }

                    db.query(`SELECT COUNT(date) from timer_register WHERE date LIKE '${thisMonths}%' AND user_id = ${payload.id} GROUP BY date`, async (err, worked) => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT COUNT(*) count from timer_register WHERE date LIKE '${thisMonths}%' AND user_id = ${payload.id}`, async (err, defaultWorkDay) => {
                            if(err) {
                                throw err;
                            }

                            
                           db.query(`SELECT SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(endtime,starttime)))) as total_time, SEC_TO_TIME(SUM(TIME_TO_SEC(lost))) as total_lost_time, u.name, t.default_hour, u.shop_address from timer_register as t inner join users as u on t.user_id = u.id WHERE t.date LIKE '${thisMonths}%' AND t.user_id = ${payload.id} AND t.endtime != '0' GROUP BY u.id, u.name, u.shop_address, t.default_hour`, async (err, time) => {
                                if(err) {
                                    throw err;
                                }
                                var curr = new Date();
                                var first = curr.getDate() - curr.getDay();
                                // var last = first + 6;

                                var firstday = new Date(curr.setDate(first)).toISOString().split('T')[0];
                                // var lastday = new Date(curr.setDate(last)).toISOString();
                                db.query(`SELECT date from timer_register WHERE user_id = ${payload.id} AND date > '${firstday}' GROUP BY date`, async (err, meal) => {
                                    if(err) {
                                        throw err;
                                    }
                                    // db.query(`SELECT COUNT(*) as count, u.posID, p.position_name FROM orders as o inner join users as u on o.user_id = u.id inner join position as p on u.posID = p.id WHERE u.posID > 2 AND o.created_at > '${new Date().addDays(-90)}' GROUP BY u.posID`, async (err, orderStatus) => {
                                    //     if(err) {
                                    //         throw err;
                                    //     }
                                    //     db.query(`SELECT SUM(op.quantity) as qty, p.model from product as p inner join order_product as op on p.id = op.product_id inner join orders as o on op.order_number = o.order_number WHERE o.created_at > '${new Date().addDays(-90)}' GROUP BY op.product_id ORDER BY qty DESC LIMIT 10`, async (err, orderProduct) => {
                                    //         if(err) {
                                    //             throw err;
                                    //         }
                                    //         res.json({
                                    //             result: 'success',
                                    //             subMonthAmount,
                                    //             thisMonthAmount,
                                    //             defaultAmount,
                                    //             worked: worked.length,
                                    //             defaultWorkDay: defaultWorkDay[0].count,
                                    //             time,
                                    //             meal: meal.length,
                                    //             orderStatus,
                                    //             orderProduct
                                    //         });
                                    //     });
                                    // });
                                    db.query(`SELECT SUM((cash_report.total - cash_report.sale - cash_report.deleted) - store_location.sale_plan_day) * 0.07 as total_bonus FROM cash_report inner join store_location on cash_report.store_id = store_location.code WHERE cash_report.date LIKE '${thisMonths}%'  and cash_report.user_id = ${payload.id}`, async (err, bonus) => {
                                        if(err) {
                                            throw err;
                                        }
                                        if(bonus[0].total_bonus == null) {
                                            bonus= 0;
                                        } else {
                                            if(bonus[0].total_bonus > 0) {
                                                bonus = bonus[0].total_bonus;
                                            } else {
                                                bonus = 0;
                                            }
                                             
                                        }
                                        var dt = new Date(date.setMonth(date.getMonth()));
                                        dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
                                        db.query(`SELECT shop from work_plan WHERE user_id = ${payload.id} AND date = '${dt}'`, async (err, plan) => {
                                            if(err) {
                                                throw err;
                                            }
                                            var s = '';
                                            if(plan.length > 0) {
                                                plan.forEach(el => {
                                                    if(s == '') {
                                                        s += `'${el.shop}'`;
                                                    } else {
                                                        s += `, '${el.shop}'`;
                                                    }
                                                });
                                            } else {
                                                s = 0;
                                            }
                                            db.query(`SELECT code, name, lat, lng, start, end, weekend, second_part from store_location WHERE code in (${s})`, async (err, shops) => {
                                                if(err) {
                                                    throw err;
                                                }
                                                db.query(`UPDATE timer_register SET endtime = '17:00' WHERE user_id = ${payload.id} AND date != '${dt}' AND endtime = '0'`, async err => {
                                                    if(err) {
                                                        throw err;
                                                    }
                                                    db.query(`SELECT id, starttime, endtime, date, lost, address from timer_register WHERE date = '${dt}' AND user_id = ${payload.id}`, async (err, register) => {
                                                        if(err) {
                                                            throw err;
                                                        }
                                                        db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, pos) => {
                                                            if(err) {
                                                                throw err;
                                                            }
                                                            var o;
                                                            if(pos[0].posID == 1 || pos[0].posID == 2) {
                                                                o = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code ORDER BY o.created_at DESC LIMIT 5`;
                                                            } else {
                                                                o = `SELECT o.id, o.order_number, o.created_at, o.stat, u.name, u.img, s.name as shop, o.updated_at from orders as o inner join users as u on o.user_id = u.id inner join store_location as s on u.call_store = s.code WHERE o.user_id = ${payload.id} ORDER BY o.created_at DESC LIMIT 5`;
                                                            }
                                                            db.query(o, async (err, orders) => {
                                                                if(err){
                                                                    throw err;
                                                                }
                                                                res.json({
                                                                    result: 'success',
                                                                    subMonthAmount,
                                                                    thisMonthAmount,
                                                                    defaultAmount,
                                                                    worked: worked.length,
                                                                    defaultWorkDay: defaultWorkDay[0].count,
                                                                    time,
                                                                    meal: meal.length,
                                                                    bonus,
                                                                    plan,
                                                                    shops,
                                                                    register,
                                                                    orders
                                                                });
                                                            });
                                                        });
                                                        
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                           });
                        });
                    });
                });
            });
        });
    });
    
}


exports.getCustomerDashboard = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    db.query(`SELECT COUNT(*) as count, type, SUM(qty) as total from customerproductqty WHERE userId = ${payload.id} GROUP BY type`, async (err, count) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT SUM(p.sale_price * c.qty) as sale_price, SUM(p.wholesale_price * c.qty) as whole_price from customerproductqty as c inner join product as p on c.productId = p.id WHERE c.userId = ${payload.id} AND c.type = 1`, async (err, price1) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT SUM(p.sale_price * c.qty) as sale_price, SUM(p.wholesale_price * c.qty) as whole_price from customerproductqty as c inner join customerproduct as p on c.productId = p.id WHERE c.userId = ${payload.id} AND c.type = 2`, async (err, price2) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT productId, type from customerproductqty ORDER BY qty LIMIT 10`, async (err, tooMany) => {
                    if(err) {
                        throw err;
                    }
                    var id1 = [], id2 = [];
                    tooMany.forEach(element => {
                        if(element.type == 1) {
                            id1.push(element.productId);
                        } else {
                            id2.push(element.productId)
                        }
                    });
                    db.query(`SELECT name, model, c.qty from product as p inner join customerproductqty as c on p.id = c.productId WHERE p.id in (${id1}) AND c.userId = ${payload.id}`, async (err, many1) => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT name, model, c.qty from customerproduct as p inner join customerproductqty as c on p.id = c.productId WHERE p.id in (${id2}) AND c.userId = ${payload.id}`, async (err, many2) => {
                            if(err) {
                                throw err;
                            }

                            var monthName = new Array("1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12");
                            var d = new Date();
                            d.setDate(1);
                            var months = [];
                            for (i = 0; i <= 11; i++) {
                                var m = monthName[d.getMonth()];
                                if(m < 10)
                                    m = '0' + m;
                                months.push(d.getFullYear() + '-' + m);
                                d.setMonth(d.getMonth() - 1);
                            }
                            var when = '', m = [];
                            for (let i = months.length - 1; i >= 0; i--) {
                                when += ` WHEN created_at LIKE '${months[i]}%' then '${months[i]}'`;
                                m.push(months[i]);
                            }
                            var q = `SELECT (CASE${when} END) as date, SUM(totalAmount) as total from customer_report GROUP BY date`;
                            db.query(q, async (err, s) => {
                                if(err) {
                                    throw err;
                                }
                                var sales = [];
                                m.forEach(el => {
                                    var sale = 0;
                                    s.forEach(e => {
                                        if (e.date == el) {
                                            sale = e.total;
                                        }
                                    });
                                    sales.push(sale);
                                });
                                res.json({
                                    result: 'success',
                                    count,
                                    price1,
                                    price2,
                                    many1,
                                    many2,
                                    sales,
                                    months: m
                                });
                            });
                        });
                    });
                });
            });
        });
    });
}