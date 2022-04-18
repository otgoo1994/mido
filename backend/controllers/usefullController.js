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
//     host: 'localhost',
//     database: 'admin_mido',
//     user: 'mido2021',
//     port: 3306,
//     password: 'Password1010@'
//   });
const sha256 = require("js-sha256");
const jwt = require('jwt-then');
const { userInfo } = require("os");
const { ESRCH, DH_UNABLE_TO_CHECK_GENERATOR } = require("constants");

exports.addCompany = async (req, res) => {
    const { company } = req.body;
    var pst = {name: company.name, email: company.email, register: company.register, phone: company.phone, nickname: company.nickname};
    var l = `INSERT INTO companies SET ?`;
    db.query(`SELECT id from companies WHERE email = '${company.email}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'failed'
            });
        } else {
            db.query(l, pst, async err => {
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

exports.EditBrand = async (req, res) => {
    const { brand } = req.body;
    db.query(`UPDATE brands SET brandname = '${brand.brandname}' WHERE id = ${brand.id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.editCategory = async (req, res) => {
    const { category } = req.body;
    db.query(`UPDATE category SET category_name = '${category.category_name}' WHERE id = ${category.id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.editSubCategory = async (req, res) => {
    const { category } = req.body;
    db.query(`UPDATE category_sub SET sub_category_name = '${category.sub_category_name}' WHERE id = ${category.id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}


exports.deleteCategory = async (req, res) => {
    const { id } = req.body;
    db.query(`SELECT ID from product WHERE type = ${id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'failed',
                p: check.length
            });
        } else {
            db.query(`DELETE from category WHERE id = ${id}`, async (err) => {
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

exports.deleteSubCategory = async (req, res) => {
    const { id } = req.body;
    db.query(`SELECT ID from product WHERE category_sub_id = ${id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'failed',
                p: check.length
            });
        } else {
            db.query(`DELETE from category_sub WHERE id = ${id}`, async (err) => {
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

exports.deleteBrand = async (req, res) => {
    const { id } = req.body;
    db.query(`SELECT ID from product WHERE brand = ${id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'failed',
                p: check.length
            });
        } else {
            db.query(`DELETE from brands WHERE id = ${id}`, async (err) => {
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

exports.getBrandAndCategory = async (req, res) => {
    db.query(`SELECT id, brandname from brands`, async (err, brands) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT category_name, id, category_code from category`, async (err, category) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT id, categoryID, sub_category_name, sub_category_code from category_sub`, async (err, sub) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    brands,
                    category,
                    sub
                });
            });
        });
    });
}

exports.companies = async (req, res) => {
    db.query(`SELECT * from companies`, async (err, companies) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success',
            companies
        });
    });
}

exports.deleteCompany = async (req, res) => {
    const { id } = req.body;
    db.query(`DELETE FROM companies WHERE id = ${id}`, async (err) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.editCompany = async (req, res) => {
    const { company } = req.body;
    db.query(`UPDATE companies SET name = '${company.name}', nickname = '${company.nickname}', email = '${company.email}', phone = '${company.phone}', register = '${company.register}' WHERE id = ${company.id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.getCategories = async (req, res) => {
    db.query(`SELECT id, category_name, category_code from category`, async (err, result) => {
        if(err) {
            throw err;
        }
        res.json(result);
    });
}

exports.getAllProducts = async (req, res) => {
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
        db.query(`SELECT name, model, brand, type as category, category_sub_id as sub, sale_price, description, color_name, (${uld}) as total from product`, async (err, result) => {
            if(err) {
                throw err;
            }
            res.json(result);
        });
    });
}

exports.getSubCategories = async (req, res) => {
    db.query(`SELECT id, sub_category_name, categoryID, sub_category_code from category_sub`, async (err, result) => {
        if(err) {
            throw err;
        }
        res.json(result);
    });
}

exports.getBrands = async (req, res) => {
    db.query(`SELECT id, brandname from brands`, async (err, result) => {
        if(err) {
            throw err;
        }
        res.json(result);
    });
}

exports.calendar = async (req, res) => {
    const { shop } = req.body;
    db.query(`SELECT code, name from store_location`, async (err, shops) => {
        if(err) {
            throw err;
        }
        Date.prototype.addDays = function(days) {
            var date = new Date(this.valueOf());
            date.setDate(date.getDate() + days);
            return date;
        }
        var normal = new Date().addDays(-60);
        normal = normal.getFullYear() + '-' + ((normal.getMonth() > 8) ? (normal.getMonth() + 1) : ('0' + (normal.getMonth() + 1))) + '-' + ((normal.getDate() > 9) ? normal.getDate() : ('0' + normal.getDate()));
        db.query(`SELECT w.date, u.name, u.id from work_plan as w inner join users as u on w.user_id = u.id WHERE w.shop = '${shop}' AND w.date > '${normal}'`, async (err, plan) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT id, name from users`, async (err, user) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    shops, 
                    plan,
                    user
                });
            });
        });
    });
}

exports.shops = async (req, res) => {
    db.query(`SELECT * from store_location`, async (err, shops) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success',
            shops
        });
    });
}

exports.addFontTime = async (req, res) => {
    const { date, fonttime } = req.body;
    var dt = new Date(date);
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1)));
    let u = `UPDATE timer_register SET default_hour = '${fonttime}' WHERE date LIKE '${dt}%'`;
    db.query(u, async (err) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.getMealMoney = async (req, res) => {
    const { datetime } = req.body;    
    var sdt = new Date(datetime[0]);
    sdt = sdt.getFullYear() + '-' + ((sdt.getMonth() > 8) ? (sdt.getMonth() + 1) : ('0' + (sdt.getMonth() + 1)))  + '-' + ((sdt.getDate() > 9) ? sdt.getDate() : ('0' + sdt.getDate()));
    var edt = new Date(datetime[1]);
    edt = edt.getFullYear() + '-' + ((edt.getMonth() > 8) ? (edt.getMonth() + 1) : ('0' + (edt.getMonth() + 1)))  + '-' + ((edt.getDate() > 9) ? edt.getDate() : ('0' + edt.getDate()));
    let q = `SELECT COUNT(*) as day, name, acc_number from (SELECT u.name, t.date, u.acc_number from timer_register as t inner join users as u on t.user_id = u.id WHERE t.date >= '${sdt}' AND t.date <= '${edt}' GROUP BY date, name, u.acc_number) t GROUP BY name, acc_number`;
    db.query(q, async (err, meal) => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success',
            meal
        });
    });
}

exports.getTotalTime = async (req, res) => {
    const { date } = req.body;
    var dt = new Date(date);
    dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1)));
    
    let q = `SELECT u.name, u.id, t.default_hour, SEC_TO_TIME(SUM(TIME_TO_SEC(TIMEDIFF(endtime,ADDTIME(starttime, \'01:00:00\'))))) as total_time, SEC_TO_TIME(SUM(TIME_TO_SEC(lost))) as total_lost_time from timer_register as t inner join users as u on t.user_id = u.id WHERE t.date LIKE '${dt}%' GROUP BY u.id, u.name`;
    db.query(q, async (err, total) => {
        if(err) {
            throw err;
        }
        let b = `SELECT user_id, SUM(c.total - s.sale_plan_day) * 0.07 as total_bonus from store_location as s inner join cash_report as c on s.code = c.store_id WHERE c.date LIKE '${dt}%' GROUP BY user_id`;
        db.query(b, async (err, bonus) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT user_id, starttime, endtime, date, lost from timer_register WHERE date LIKE '${dt}%'`, async (err, MoreTime) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT name, id from users`, async (err, users) => {
                    if(err) {
                        throw err;
                    }
                    res.json( {
                        result: 'success',
                        total,
                        bonus,
                        users,
                        MoreTime
                    });
                });
            });
        });
    });
}

exports.editShops = async (req, res) => {
    const { shop } = req.body;
    db.query(`UPDATE store_location SET start = '${shop.start}', end = '${shop.end}', weekend = '${shop.weekend}', second_part = '${shop.second_part}', rest = '${shop.rest}', sale_plan = '${shop.sale_plan}', sale_plan_day = '${shop.sale_plan_day}' WHERE id = ${shop.id}`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.deleteEvent = async (req, res) => {
    const { id, date, shop } = req.body;
    db.query(`DELETE from work_plan WHERE user_id = ${id} AND date = '${date}' AND shop = '${shop}'`, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.addEvent = async (req, res) => {
    const { date, id, shop } = req.body;
    var n = `INSERT INTO work_plan SET ?`
    var pst = {user_id: id, date, shop};
    db.query(n, pst, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });

}