const mysql = require("mysql");
const nodemailer = require("nodemailer");
const fs = require('fs');
const url = require('url'); 
const jwt = require('jwt-then');
const axios = require('axios');
const { UV_FS_O_FILEMAP } = require("constants");
const { waitForDebugger } = require("inspector");

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


exports.addFromExcel = async (req, res) => {
    const { rows } = req.body;
    var product = [];
    db.query(`SELECT category_code, id from category`, async (err, cate) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT sub_category_code, id from category_sub`, async (err, sub) => {
            if(err) {
                throw err;
            }
            rows.forEach(el => {
                var c = 0, s = 0;
                cate.forEach(ct => {
                    if(ct.category_code == el[8]) {
                        c = ct.id;
                    }
                });
                sub.forEach(ct => {
                    if(ct.sub_category_code == el[9]) {
                        s = ct.id;
                    }
                });
                var detail = [el[0], el[1], el[2], el[3], el[4], el[5], el[6], 70 + el[7], c, s, el[10], el[11],'default.jpg']
                product.push(detail);
            });
            var q = `INSERT INTO product (name, model, code, color_name, cost_price, wholesale_price, sale_price, brand, type, category_sub_id, remain, shop_01, image) VALUES ?`;
            db.query(q, [product], async err => {
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


exports.updateShops = async (req, res) => {
    var data = '"raw": "{\\"ComputerName\\":\\"SLAZAMAT\\",\\"DatabaseName\\":\\"OperaIntegration\\",\\"HardwareId\\":\\"Y8MH15RMS\\",\\"MacAddress\\":\\"7A791904E220\\",\\"OsVersion\\":\\"Microsoft Windows 10 Enterprise - 64-bit \\",\\"ServerName\\":\\"slserver\\",\\"SystemName\\":\\"OperaIntegration\\",\\"SystemVersion\\":\\"19.12.2\\",\\"UserId\\":\\"Admin\\",\\"UserName\\":\\"Administrator\\"}"';

    var config = {
    method: 'get',
    url: 'http://202.21.105.218:8081/api/inventory/stock_locations',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic aWNiYzptdUlYV2xhMXN1IXI='
    },
    data : data
    };

    axios(config)
    .then(function (response) {
        // console.log(JSON.stringify(response.data));
        // res.json({
        //     data: response.data
        // });
        // var content = JSON.stringify(response.data);
        var content = response.data;
        db.query(`SHOW COLUMNS FROM product LIKE 'shop%'`, async (err, check) => {
            if(err) {
                throw err;
            }
            var columns = [];
            check.forEach(el => {
                columns.push(el.Field);
            });
            
            db.query(`SELECT code from store_location`, async (err, checkstore) => {
                if(err) {
                    throw err;
                }
                var mainColumn = [];
                checkstore.forEach(el => {
                    mainColumn.push(el.code);
                });

                var n = `INSERT INTO store_location (code, name) VALUES ?`;
                var storeRow = [];
                var rows = '';
                content.forEach(el => {
                    if(!mainColumn.includes(`shop_${el.id}`) && el.id != '00') {
                        storeRow.push([`shop_${el.id}`, el.name]);
                    }

                    if(!columns.includes(`shop_${el.id}`) && el.id != '00') {
                        if(rows == '') {
                            rows = `ADD COLUMN shop_${el.id} int default 0`;
                        } else {
                            rows = rows + `, ADD COLUMN shop_${el.id} int default 0`;
                        }
                    }
                });

                if(storeRow.length > 0) {
                    db.query(n, [storeRow], async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`ALTER TABLE product ${rows}`, async err => {
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
                        result: 'success'
                    });
                }
            });
        });
    })
    .catch(function (error) {
        console.log(error);
    });
}

exports.updateProductQuantity = async (req, res) => {
    var data = '"raw": "{\\"ComputerName\\":\\"SLAZAMAT\\",\\"DatabaseName\\":\\"OperaIntegration\\",\\"HardwareId\\":\\"Y8MH15RMS\\",\\"MacAddress\\":\\"7A791904E220\\",\\"OsVersion\\":\\"Microsoft Windows 10 Enterprise - 64-bit \\",\\"ServerName\\":\\"slserver\\",\\"SystemName\\":\\"OperaIntegration\\",\\"SystemVersion\\":\\"19.12.2\\",\\"UserId\\":\\"Admin\\",\\"UserName\\":\\"Administrator\\"}"';

    var config = {
    method: 'get',
    url: 'http://202.21.105.218:8081/api/inventory/products',
    headers: { 
        'Content-Type': 'application/json', 
        'Authorization': 'Basic aWNiYzptdUlYV2xhMXN1IXI='
    },
    data : data
    };

    axios(config)
    .then(function (response) {
        var content = response.data;
        db.query(`SELECT code, '' as qry from store_location`, async (err, store) => {
            var shops = [], variables = [], shopName = [];
            store.forEach(el => {
                var a = new Array();
                shopName.push(el.code);
                a[el.code] = '';
                variables.push(a);
                if(el.code == 'remain') {
                    shops.push('00');
                } else {
                    shops.push(el.code.split('_')[1]);
                }
            });

            var items = '', remain = ''; 
            content.forEach(el => {
                if(items == '') {
                    items = `'${el.id}'`;
                } else {
                    items += `, '${el.id}'`;
                }
                shops.forEach(s => {
                    var isHave = false, i = 0;
                    el.stock_locations.forEach((q, index) => {
                        if(q.location_id == s) {
                            isHave = true;
                            i = index;
                        }
                    });
                    if(isHave == true) {
                        if(s == '00') {
                            variables.forEach((qr, index) => {
                                if(qr.hasOwnProperty('remain')) {
                                    if(qr['remain'] == '') {
                                        qr['remain'] = `when model = '${el.id}' then ${el.stock_locations[i].count_on_hand}`;
                                        // console.log(variables[index]['remain']);
                                    } else {
                                        qr['remain'] = `${qr['remain']} when model = '${el.id}' then ${el.stock_locations[i].count_on_hand}`;
                                    }
                                }
                            });
                        } else {
                            variables.forEach(qr => {
                                if(qr.hasOwnProperty(`shop_${s}`)) {
                                    if(qr[`shop_${s}`] == '') {
                                        qr[`shop_${s}`] = `when model = '${el.id}' then ${el.stock_locations[i].count_on_hand}`;
                                        // console.log(el.id);
                                    } else {
                                        qr[`shop_${s}`] = `${qr[`shop_${s}`]} when model = '${el.id}' then ${el.stock_locations[i].count_on_hand}`;
                                    }
                                }
                            });
                        }
                    } else {
                        if(s == '00') {
                            variables.forEach((qr, index) => {
                                if(qr.hasOwnProperty('remain')) {
                                    if(qr['remain'] == '') {
                                        qr['remain'] = `when model = '${el.id}' then 0`;
                                        // console.log(variables[index]['remain']);
                                    } else {
                                        qr['remain'] = `${qr['remain']} when model = '${el.id}' then 0`;
                                    }
                                }
                            });
                        } else {
                            variables.forEach(qr => {
                                if(qr.hasOwnProperty(`shop_${s}`)) {
                                    if(qr[`shop_${s}`] == '') {
                                        qr[`shop_${s}`] = `when model = '${el.id}' then 0`;
                                        // console.log(el.id);
                                    } else {
                                        qr[`shop_${s}`] = `${qr[`shop_${s}`]} when model = '${el.id}' then 0`;
                                    }
                                }
                            });
                        }
                    }
                });
            });
            // console.log(variables[0].shop_01);
            variables.forEach(async (v, index) => {
                var query = `UPDATE product SET `;
                query += `${Object.keys(v)[0]} = (case ${v[Object.keys(v)[0]]} end)`;
                query += ` WHERE model in (${items})`;
                await updateQty(query);
                if(index + 1 == variables.length) {
                    res.json({
                        result: 'success'
                    });
                }
            });
        });
    })
    .catch(function (error) {
        res.json({
            result: 'failed'
        });
    });
}

updateQty = (query) => {
    return new Promise((resolve, reject) => {
        db.query(query, async err => {
            if (err) {
                reject(err);
            }
            resolve(true);
        });
    })
}

exports.getCart = async (req,res) => {
    const { position } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    let pos = `SELECT code, name from store_location ORDER BY name DESC`;
        db.query(pos, async (err, pos) => {
            if(err) {
                throw err;
            }
            var uld = '';
            pos.forEach(el => {
                if(el.code != 'shop_08') {
                    if(uld == '') {
                        uld = `${el.code}`;
                    } else {
                        uld = `${uld} + ${el.code}`;
                    }
                }
            });
            let p = `SELECT p.name, p.model, p.wholesale_price, c.quantity, p.image, p.id, p.${position}, (${uld}) as total from product as p inner join cart as c on p.id = c.product_id WHERE c.user_id = ${payload.id}`;
            db.query(p, async (err, product) => {
                if(err) {
                    throw err;
                }
                console.log(product);
                res.json({
                    product,
                    position: pos
                });
            });
        });
    
}

exports.changeCartQty = async (req, res) => {
    const { product } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var row = '';
    product.forEach(el => {
        row += `when product_id = ${el.id} AND user_id = ${payload.id} then ${el.quantity} `;
    });
    let qr = `UPDATE cart SET quantity = (CASE ${row} END)`;
    db.query(qr, async err => {
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}


exports.transperSubCategory = async (req, res) => {
    const { sub, to } = req.body;
    db.query(`UPDATE product SET type = ${to} WHERE category_sub_id = ${sub.id}`, async err => {
        if(err) {
            throw err;
        }
        db.query(`UPDATE category_sub SET categoryID = ${to} WHERE id = ${sub.id}`, async err => {
            if(err) {
                throw err;
            }
            res.json({
                result: 'success'
            });
        });
    });
}


exports.transferSubCategoryProduct = async (req, res) => {
    const { sub, to } = req.body;
    var q = `UPDATE product SET type = ${to.main}, category_sub_id = ${to.sub} WHERE category_sub_id = ${sub.id}`;
    
    db.query(q, async err => { 
        if(err) {
            throw err;
        }
        res.json({
            result: 'success'
        });
    });
}

exports.editProduct = async (req, res) => {
    const { product, role } = req.body;
    if(role == 1 || role == 2 || role == 4) {
        var color_name = '';
        var colors = {BK: 'Black', WH: 'White', 'BL': 'Blue', 'RD' : 'Red', 'GY' : 'Grey', 'PK' : 'Pink', 'GR' : 'Green', 'SL' : 'Silver', 'GD' : 'Gold', 'YL' : 'Yellow', 'OR' : 'Orange', 'PU' : 'Purple', 'DG' : 'Dark grey', 'DB' : 'Dark blue', 'DB' : 'Denim blue', 'BR' : 'Brown', 'LC' : 'Light Cyan', 'LM' : 'Light Magenta', 'MN' : 'Magenta', 'CN' : 'Cyan', 'BKGR' : 'black+green', 'BKGR' : 'black+grey', 'WTGR' : 'white+green', 'TH' : 'Tarnish', 'RG' : 'Rose gold', 'BKYL' : 'black+yellow', 'CP' : 'champagne', 'MC' : 'Matte crystal', 'MB' : 'Matte carbon black', 'RR' : 'Rose red', 'TR' : 'Transparent', 'FG' : 'Forest green'};
        var k = product.model.split('-');
        k = k[k.length - 1];
        if(colors[k] !== undefined) {
            color_name = colors[k];
        }
        let q = `UPDATE product SET name = '${product.name}', model = '${product.model}', color_name = '${color_name}', code = '${product.code}', type = ${product.type}, category_sub_id = ${product.category_sub_id}, brand = ${product.brand}, cost_price = ${product.cost_price}, wholesale_price = ${product.wholesale_price}, sale_price = ${product.sale_price}, description = '${product.description}' WHERE id = ${product.id}`;
        db.query(q, async err => {
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

exports.addProductCustomer = async (req, res) => {
    const { product } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var selected = '';
    var colors = {Black: 'BK', White: 'WH', 'Blue': 'BL', 'Red' : 'RD', 'Grey' : 'GY', 'Pink' : 'PK', 'Green' : 'GR', 'Silver' : 'SL', 'Gold' : 'GD', 'Yellow' : 'YL', 'Orange' : 'OR', 'Purple' : 'PU', 'Dark grey' : 'DG', 'Dark blue' : 'DB', 'Denim blue' : 'DB', 'Brown' : 'BR', 'Light Cyan' : 'LC', 'Light Magenta' : 'LM', 'Magenta' : 'MN', 'Cyan' : 'CN', 'black+green' : 'BKGR', 'black+grey' : 'BKGR', 'white+green' : 'WTGR', 'Tarnish' : 'TH', 'Rose gold' : 'RG', 'black+yellow' : 'BKYL', 'champagne' : 'CP', 'Matte crystal' : 'MC', 'Matte carbon black' : 'MB', 'Rose red' : 'RR', 'Transparent' : 'TR', 'Forest green' : 'FG'};
    if(product.color_name.length > 0) {
        try {
            var n = `INSERT INTO customerproduct (name, model, code, sale_price, wholesale_price, image, color_name, type, category_sub_id, brand, userId) VALUES ?`;
            var rows = [], models = '';
            product.color_name.forEach(el => {
                if(colors[el] !== undefined) {
                    if(selected == '') {
                        selected = `'${product.model + '-' + colors[el]}'`;
                    } else {
                        selected += `, '${product.model + '-' + colors[el]}'`;
                    }
                    var pst = [product.name, product.model + '-' + colors[el], product.code, product.sale_price, product.wholesale_price, 'no-image.jpg', el, product.category, product.sub_category, product.brand, payload.id];
                    rows.push(pst);
                    if(models == '')
                        models += `'${product.model}-${colors[el]}'`;
                    else 
                        models += `, '${product.model}-${colors[el]}'`;  
                }
            });
            db.query(`SELECT color_name from customerproduct WHERE model in (${selected}) AND userId = ${payload.id}`, async (err, check) => {
                if(err) {
                    throw err;
                }
                if(check.length > 0) {
                    res.json({
                        result: 'already_exist',
                        color: check[0].color_name
                    });
                } else {
                    db.query(n, [rows], async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT id from customerproduct WHERE model in (${models}) AND userId = ${payload.id}`, async (err, getId) => {
                            if(err) {
                                throw err;
                            }
                            rows = [];
                            n = `INSERT INTO customerproductqty (productId, qty, type, userId) VALUES ?`;
                            getId.forEach(e => {
                                var pst = [e.id, 0, 2, payload.id];
                                rows.push(pst);
                            });
                            db.query(n, [rows], async err => {
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
        } catch (error) {
            console.log(error);
        }
    } else {
        res.json({
            result: 'colorNotFound'
        });
    }
}

exports.addProduct = async (req, res) => {
    const { product } = req.body;
    var selected = '';
    var colors = {Black: 'BK', White: 'WH', 'Blue': 'BL', 'Red' : 'RD', 'Grey' : 'GY', 'Pink' : 'PK', 'Green' : 'GR', 'Silver' : 'SL', 'Gold' : 'GD', 'Yellow' : 'YL', 'Orange' : 'OR', 'Purple' : 'PU', 'Dark grey' : 'DG', 'Dark blue' : 'DB', 'Denim blue' : 'DB', 'Brown' : 'BR', 'Light Cyan' : 'LC', 'Light Magenta' : 'LM', 'Magenta' : 'MN', 'Cyan' : 'CN', 'black+green' : 'BKGR', 'black+grey' : 'BKGR', 'white+green' : 'WTGR', 'Tarnish' : 'TH', 'Rose gold' : 'RG', 'black+yellow' : 'BKYL', 'champagne' : 'CP', 'Matte crystal' : 'MC', 'Matte carbon black' : 'MB', 'Rose red' : 'RR', 'Transparent' : 'TR', 'Forest green' : 'FG'};
    if(product.color_name.length > 0) {
        try {
            var n = `INSERT INTO product (name, model, sale_price, code, wholesale_price, cost_price, image, color_name, type, category_sub_id, brand, description, created_at, updated_at) VALUES ?`;
            var rows = [];
            product.color_name.forEach(el => {
                if(colors[el] !== undefined) {
                    if(selected == '') {
                        selected = `'${product.model + '-' + colors[el]}'`;
                    } else {
                        selected += `, '${product.model + '-' + colors[el]}'`;
                    }
                    var pst = [product.name, product.model + '-' + colors[el], product.sale_price, product.code, product.wholesale_price, product.cost_price, 'default.jpg', el, product.category, product.sub_category, product.brand, product.description, new Date(), new Date()];
                    rows.push(pst);
                }
            });
            db.query(`SELECT color_name from product WHERE model in (${selected})`, async (err, check) => {
                if(err) {
                    throw err;
                }
                if(check.length > 0) {
                    res.json({
                        result: 'already_exist',
                        color: check[0].color_name
                    });
                } else {
                    db.query(n, [rows], async err => {
                        if(err) {
                            throw err;
                        }
                        res.json({
                            result: 'success'
                        });
                    });
                }
            });
        } catch (error) {
            console.log(error);
        }
    } else {
        res.json({
            result: 'colorNotFound'
        });
    }
    // console.log(colors[product.color_name[2]]);
}

exports.getMethods = async (req, res) => {
    db.query(`SELECT id, brandname from brands`, async (err, brand) => {
        if(err) {
            throw err;
        }
        db.query(`SELECT category_name, id, category_code from category`, async (err, category) => {
            if(err) {
                throw err;
            }
            db.query(`SELECT categoryID, sub_category_name, sub_category_code, id from category_sub`, async (err, sub) => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT color_name from color`, async (err, color) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        brand,
                        category,
                        sub,
                        color
                    });
                });
            });
        });
    });
}

exports.removeFromCart = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');

    let r = `DELETE from cart WHERE product_id = ${id} AND user_id = ${payload.id}`;
    db.query(r, async err => {
        if(err) {
            throw err;
        }

        res.json({
            result: 'success'
        });
    });
}

exports.addCart = async (req, res) => {
    const { id, qty } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    let c = `SELECT id, quantity from cart WHERE user_id = ${payload.id} AND product_id = ${id}`;
    db.query(c, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            q = qty + check[0].quantity;
            db.query(`UPDATE cart SET quantity = ${q} WHERE id = ${check[0].id}`, async err => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success'
                });
            });
        } else {
            var post = {product_id : id, quantity: qty, user_id: payload.id};
            let i = `INSERT INTO cart SET ?`;
            db.query(i, post, async err => {
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

exports.productDetail = async (req, res) => {
    const { id } = req.body;
    db.query(`SELECT code, name from store_location ORDER BY name DESC`, async (err, loc) => {
        if(err) {
            throw err;
        }
        var p = '', t = '';
        loc.forEach(el => {
            if(p == '') {
                p = el.code;
                t = el.code;
            } else {
                p = `${p}, ${el.code}`;
                t = `${t} + ${el.code}`;
            }
        });
        
        db.query(`SELECT p.name, p.model, p.sale_price, p.color_name, p.code, p.cost_price, p.type, p.category_sub_id, p.brand, p.wholesale_price, p.image, p.id, b.brandname, p.description, p.discount, ${p}, (${t}) as total from product as p inner join brands as b on p.brand = b.id WHERE p.id = ${id}`, async (err, product) => {
            if(err) {
                throw err;
            }
            if(product.length > 0) {
                db.query(`SELECT SUM(qty) as total, storeId from rma WHERE productId = ${id} AND wrote = 0 GROUP BY storeId`, async (err, rma) => {
                    if(err) {
                        throw err;
                    }
                    db.query(`SELECT brandname, id from brands`, async (err, brands) => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT category_name, id from category`, async (err, category) => {
                            if(err) { 
                                throw err;
                            }
                            db.query(`SELECT categoryID, id, sub_category_name from category_sub`, async (err, sub) => {
                                if(err) {
                                    throw err;
                                }
                                res.json({
                                    result: 'success',
                                    product: product[0],
                                    loc,
                                    rma,
                                    sub,
                                    category,
                                    brands
                                });
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
    });
}

exports.productDetailCustomer = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT p.name, p.model, p.sale_price, p.color_name, p.wholesale_price, p.image, p.id, q.qty from customerproduct as p inner join customerproductqty as q on p.id = q.productId WHERE q.userId = ${payload.id} AND p.id = ${id} AND q.type = 2`, async (err, product) => { 
        if(err) {
            throw err;
        }
        if(product.length > 0) {
            res.json({
                result: 'success',
                product: product[0]
            });
        } else {
            res.json({
                result: 'failed'
            });
        }
    });
}

exports.addSubCategory = async (req, res) => {
    const {name, code, category } = req.body;
    db.query(`SELECT category_code from category WHERE id = ${category}`, async (err, mCode) => {
        if(err) {
            throw err;
        }
        
        if(mCode.length > 0) {
            db.query(`SELECT id from category_sub WHERE sub_category_name = '${name}' OR sub_category_code = '${mCode[0].category_code}${code}'`, async (err, check) => {
                if(err) {
                    throw err;
                }
                if(check.length > 0) {
                    res.json({
                        result: 'codeFaile'
                    });
                } else {
                    var post = {sub_category_name : name, created_at: new Date(), updated_at: new Date(), sub_category_code: mCode[0].category_code+code, categoryID: category};
                    let i = `INSERT INTO category_sub SET ?`;
                    db.query(i, post, async err => {
                        if(err) {
                            throw err;
                        }
                        db.query(`SELECT categoryID, sub_category_name, sub_category_code, id from category_sub`, async (err, sub) => {
                            if(err) {
                                throw err;
                            }
                            res.json({
                                result: 'success',
                                sub
                            });
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

exports.addCategory = async (req, res) => {
    const { name, code } = req.body;
    db.query(`SELECT id from category where category_name = '${name}' OR category_code = '${code}'`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            res.json({
                result: 'failed'
            });
        } else {
            var post = {category_name : name, created_at: new Date(), updated_at: new Date(), category_code: code};
            let i = `INSERT INTO category SET ?`;
            db.query(i, post, async err => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT category_name, id, category_code from category`, async (err, category) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        category
                    });
                });
            });
        }
    });
}


exports.deleteProduct = async (req, res) => {
    const { id } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    db.query(`SELECT posID from users WHERE id = ${payload.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check[0].posID == 1 || check[0].posID == 2) {
            db.query(`DELETE from product WHERE id = ${id}`, async err => {
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

exports.addBrand = async (req, res) => {
    const { name } = req.body;
    db.query(`SELECT id from brands where brandname = '${name}'`, async (err, brand) => {
        if(err) {
            throw err;
        }
        if(brand.length > 0) {
            res.json({
                result: 'failed'
            });
        } else {
            var post = {brandname : name, created_at: new Date(), updated_at: new Date(), images: 'no-image.png'};
            let i = `INSERT INTO brands SET ?`;
            db.query(i, post, async err => {
                if(err) {
                    throw err;
                }
                db.query(`SELECT id, brandname from brands`, async (err, b) => {
                    if(err) {
                        throw err;
                    }
                    res.json({
                        result: 'success',
                        brand: b
                    });
                })
            });
        }
    });
}




exports.getRecommendedProduct = async (req, res) => {
    const { page } = req.body;
    const first = (page - 1) * 40;
    const last = page * 40; 

    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    var d = new Date().addDays(-90);
    d = d.getFullYear() + '-' + ((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '-' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate()));
    db.query(`SELECT call_store, posID, allow_brand from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        if(user[0].posID == 6) {

        } else {
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
                var brands;
                    if (user[0].allow_brand == 'all') {
                        brands = `AND brand > 0`;
                    } else {
                        brands = `AND brand in (${user[0].allow_brand})`;
                    }
        
                    var q = `SELECT p.name, p.id, p.sale_price, p.wholesale_price, p.image, p.color_name, p.model, (${uld}) as qty, p.created_at from product as p inner join order_product as op on op.product_id = p.id inner join orders as o on op.order_number = o.order_number WHERE (${uld}) > 10 AND ${user[0].call_store} <= 0 AND o.created_at > '${d}' AND o.user_id = ${payload.id} ${brands}`;
                    db.query(q, async (err, product) => {
                        if(err) {
                            throw err;
                        }
                        let sc = product.length % 40;
                        let f = parseInt(product.length / 40);
                        if(sc > 0) {
                            f += 1;
                        }
                        res.json({
                            result: 'success',
                            product: product.slice(first, last),
                            pagination: f,
                        });
                    });
        
            });
        }
    });
}

exports.getAllProduct = async (req, res) => {
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var d = new Date();
    d = d.getFullYear() + '-' + ((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '-' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate()));
    db.query(`SELECT address from timer_register WHERE date = '${d}' AND user_id = ${payload.id}`, async (err, check) => {
        if(err) {
            throw err;
        }
        if(check.length > 0) {
            db.query(`SELECT id, name, image, code, model, sale_price, wholesale_price, ${check[0].address} as qty from product`, async (err, product) => {
                if(err) {
                    throw err;
                }
                res.json({
                    result: 'success',
                    product,
                    shop: check[0].address
                });
            });
        } else {
            res.json({
                result: 'nottime'
            });
        }
    });
}

exports.EndReciept = async (req, res) => {
    const { total, product, shop, card, paid } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    const ordernumber = Date.now();  
    var id = [], qty = '', rows = [];
    product.forEach(el => {
        var pst = [el.id, el.qty, el.price, ordernumber];
        rows.push(pst);
        id.push(el.id);
        qty += ` WHEN id = ${el.id} THEN ${shop} - ${el.qty}`
    });
    console.log(product);
    var q = `UPDATE product SET ${shop} = (CASE ${qty} END) WHERE id in (${id})`;  
    db.query(`INSERT INTO zarlaga SET ?`, {userId: payload.id, ordernumber, total, belen: paid, belenbus: card}, async err => {
        if(err) {
            throw err;
        }
        var n = `INSERT INTO zarlagaproduct (productId, qty, price, ordernumber) VALUES ?`;
        db.query(n, [rows], async err => {
            if(err) {
                throw err;
            }
            db.query(q, async err => {
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

exports.getNewProducts = async (req, res) => {
    const { page } = req.body;
    const first = (page - 1) * 40;
    const last = page * 40; 

    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    Date.prototype.addDays = function(days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    }
    var d = new Date().addDays(-40);
    d = d.getFullYear() + '-' + ((d.getMonth() > 8) ? (d.getMonth() + 1) : ('0' + (d.getMonth() + 1))) + '-' + ((d.getDate() > 9) ? d.getDate() : ('0' + d.getDate()));
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
        db.query(`SELECT allow_brand from users WHERE id = ${payload.id}`, async (err, user) => {
            if(err) {
                throw err;
            }
            var brands;
            if (user[0].allow_brand == 'all') {
                brands = `AND brand > 0`;
            } else {
                brands = `AND brand in (${user[0].allow_brand})`;
            }
            var q = `SELECT name, id, sale_price, wholesale_price, image, color_name, model, (${uld}) as qty, created_at from product WHERE created_at > '${d}' ${brands}`;
            db.query(q, async (err, product) => {
                if(err) {
                    throw err;
                }
                let sc = product.length % 40;
                let f = parseInt(product.length / 40);
                if(sc > 0) {
                    f += 1;
                }

                res.json({
                    result: 'success',
                    product: product.slice(first, last),
                    pagination: f,
                });
            });
        })

    });
}

exports.products = async (req, res) => {
    const { page, brand, color, price, category, search } = req.body;
    const first = (page - 1) * 40;
    const last = page * 40;  
    const token = req.headers.authorization.split(" ")[1];
    const payload = await jwt.verify(token, 'HS256');
    var col = '', brands = '', cate = '', amount;
    if(price[1] > 0) {
        amount = `AND p.sale_price >= ${price[0]} AND p.sale_price <= ${price[1]}`;
    } else {
        amount = `AND p.sale_price >= ${price[0]}`;
    }
    if(color.length > 0) {
        color.forEach(element => {
            if(col == '') {
                col = `'${element}'`;
            } else {
                col = col + `, '${element}'`;
            }
        });
        col = `AND p.color_name in (${col})`;
    }

    if(category.length > 0) {
        cate = `AND p.category_sub_id in (${category})`
    }
    
    db.query(`SELECT allow_brand, posID from users WHERE id = ${payload.id}`, async (err, user) => {
        if(err) {
            throw err;
        }
        var b, c, s, p, colors, maxamount;
        if(user[0].allow_brand == 'all') {
            b = `SELECT brandname, id from brands`;
            s = `SELECT s.sub_category_name, s.id, s.categoryID, COUNT(*) as total from category_sub as s inner join product as p on p.category_sub_id = s.id WHERE s.id in (SELECT category_sub_id from product) GROUP BY p.category_sub_id`;
            c = `SELECT category_name, id from category WHERE id in (SELECT type from product)`;
            colors = `SELECT color_name, COUNT(*) as total from product WHERE color_name != '' GROUP BY color_name`;
            maxamount = `SELECT MAX(sale_price) as max from product`;  
        } else {
            b = `SELECT brandname, id from brands WHERE id in (${user[0].allow_brand})`;
            s = `SELECT s.sub_category_name, s.id, s.categoryID, COUNT(*) as total from category_sub as s inner join product as p on p.category_sub_id = s.id WHERE s.id in (SELECT category_sub_id from product WHERE brand in (${user[0].allow_brand})) GROUP BY p.category_sub_id`;
            c = `SELECT category_name, id from category WHERE id in (SELECT type from product WHERE brand in (${user[0].allow_brand}))`;
            colors = `SELECT color_name, COUNT(*) as total from product WHERE brand in (${user[0].allow_brand}) AND color_name != '' GROUP BY color_name`;
            maxamount = `SELECT MAX(sale_price) as max from product WHERE brand in (${user[0].allow_brand})`;  
        }

        if(brand.length > 0) {
            brands = `AND p.brand in (${brand})`;
        } else {
            if (user[0].allow_brand == 'all') {
                brands = `AND p.brand > 0`;
            } else {
                brands = `AND p.brand in (${user[0].allow_brand})`;
            }
        }

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
            p = `SELECT name, id, sale_price, wholesale_price, image, color_name, model, (${uld}) as qty, p.created_at from product as p WHERE (p.name LIKE '%${search}%' OR p.model LIKE '%${search}%' ) ${amount} ${cate} ${brands} ${col}`;

            db.query(p, async (err, product) => {
                if(err) {
                    throw err;
                }
                db.query(b, async (err, br) => {
                    if(err) {
                        throw err;
                    }
                    db.query(s, async (err, sub) => {
                        if(err) {
                            throw err;
                        }
                        db.query(c, async (err, cat) => {
                            if(err) {
                                throw err;
                            }
                            var arr = []; var arr2 = [];
                            cat.forEach(c => {
                                arr2 = [];
                                sub.forEach(sb => {
                                    if(c.id == sb.categoryID) {
                                        arr2.push({id: sb.id, label: sb.sub_category_name + ` (${sb.total})`});
                                    }
                                });
                                arr.push({label: c.category_name, children: arr2});
                            });

                            db.query(colors, async (err, cols) => {
                                if(err) {
                                    throw err;
                                }
                                db.query(maxamount, async (err, maxAmount) => {
                                    if(err) {
                                        throw err;
                                    }
                                    let sc = product.length % 40;
                                    let f = parseInt(product.length / 40);
                                    if(sc > 0) {
                                        f += 1;
                                    }
                                    cols.forEach(el => {
                                        el.total = el.color_name + ` (${el.total})`;
                                    });
                                    if(user[0].posID == 6) {
                                        db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join customerproduct as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 2 ${cate} ${brands} ${col}`, async (err, customerproduct2) => {
                                            if(err) {
                                                throw err;
                                            }
                                            db.query(`SELECT p.name, p.id, p.model, p.image, p.sale_price, cpq.qty, cpq.type from customerproductqty as cpq inner join product as p on p.id = cpq.productId WHERE cpq.userId = ${payload.id} AND cpq.type = 1 ${cate} ${brands} ${col}`, async (err, customerproduct1) => {
                                                if (err) {
                                                    throw err;
                                                }
                                                res.json({
                                                    result: 'success',
                                                    product: product.slice(first, last),
                                                    pagination: f,
                                                    brand: br,
                                                    sub: arr,
                                                    color: cols,
                                                    maxAmount,
                                                    customerproduct2,
                                                    customerproduct1
                                                });
                                            });
                                        });
                                    } else {
                                        res.json({
                                            result: 'success',
                                            product: product.slice(first, last),
                                            pagination: f,
                                            brand: br,
                                            sub: arr,
                                            color: cols,
                                            maxAmount
                                        });
                                    }
                                });
                            });
                        });
                    });
                })
            });
        });        
    });
    
    
}