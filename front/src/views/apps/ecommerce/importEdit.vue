<template>
    <div class="scrollable page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
        <div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" class="mb-10">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
                    <el-breadcrumb-item :to="{ path: '/imports' }">Орлогын жагсаалт</el-breadcrumb-item>
					<el-breadcrumb-item>Орлого үүсгэх</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
		</div>
        <div class="cart-box">
            <div>
                <el-select v-model="options.brand" filterable placeholder="Брэнд" size="mini" class="mobile-filter">
                    <el-option
                        v-for="(item, index) in brands"
                        :key="index"
                        :label="item.brandname"
                        :value="item.id">
                    </el-option>
                </el-select>
                <el-input-number placeholder="Хоног" class="ml-10 mobile-filter" @change="updateFilter" size="mini" v-model="options.day"></el-input-number>
                <el-input-number placeholder="Зарагдсан тоо" class="ml-10 mobile-filter" @change="updateFilter" size="mini" v-model="options.sold"></el-input-number>
                <el-input-number placeholder="Үлдэгдэл" class="ml-10 mobile-filter"  @change="updateFilter" size="mini" v-model="options.qty"></el-input-number>
                <el-button type="danger" class="ml-10 mobile-filter" @click="getProducts" size="mini" icon="el-icon-search" plain></el-button>
                <el-input placeholder="Модель эсвэл нэр ..." v-model="search" @keydown.enter.native="searchProduct" style="width: 200px;" suffix-icon="el-icon-search" size="mini" class="ml-10 mobile-filter"></el-input>
                <el-select class="ml-10 mobile-filter" @change="exchangeChanged" v-model="symbolSelect.selected" filterable placeholder="Брэнд" size="mini" style="float: right;">
                    <el-option
                        v-for="(item, index) in symbolSelect.list"
                        :key="index"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
                </el-select>
            </div>
            <el-row :gutter="20">
                <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10" class="item mt-20 flex b-rad-4">
                    <div class="page-ecommerce-dashboard card-shadow--small" style="width: 100%;" :style="{'border-radius': '10px'}">
                        <div class="table-box card-base card-outline" style="overflow: auto;">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th style="width: 40%;">Бүтээгдэхүүн</th>
                                        <th style="width: 20%;">Үнэ</th>
                                        <th style="width: 10%;">Үлд</th>
                                        <th style="width: 30%;"></th>
                                    </tr>
                                </thead>
                                <tbody v-if="product.length > 0">
                                    <tr v-for="item in filterProduct()" :key="item.id" :style="{'cursor': 'pointer'}">
                                        <td >
                                            <div class="item-box item-product flex">
                                                <div class="product-image">
                                                    <!-- <img :src="$imgUrl + i.image" :style="{'width': '60px', 'height': 'auto'}"> -->
                                                    <el-avatar :size="40" :src="$imgUrl + item.image">
                                                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                                                    </el-avatar>
                                                </div>
                                                <div style="width: 100px;">
                                                    <h4 class="m-0" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">{{item.name}}</h4>
                                                    <p class="m-0" style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%;">{{item.model}}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {{symbol[order.exchange]}}{{Number(item[order.exchange]).toLocaleString()}}
                                        </td>
                                        <td>
                                            {{Number(item.totalQty).toLocaleString()}}
                                        </td>
                                        <td class="flex">
                                            <el-button size="mini" icon="el-icon-close" @click="hideProduct(item)" circle></el-button>
                                            <el-button type="info" @click="addToImport(item)" size="mini" icon="el-icon-right" circle></el-button>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td colspan="4" align="center">Уучлаарай бүтээгдэхүүн олдсонгүй</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14" class="item mt-20 b-rad-4 card-shadow--small" style="background: #fff; padding-top: 5px;">
                    <span style="float: right;">Захиалгын дугаар: <strong>{{order.ordernumber}}</strong></span><br>
                    <div class="page-ecommerce-dashboard mt-10" style="width: 100%;" :style="{'border-radius': '10px'}">
                        <div class="table-box card-base card-outline" style="overflow: auto; width: 100%;">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th style="width: 80%;">Бүтээгдэхүүн</th>
                                        <th>Үнэ</th>
                                        <th>Тоо</th>
                                        <th>Нийт</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody v-if="order.product.length > 0">
                                    <tr v-for="(item, index) in order.product" :key="index" :style="{'cursor': 'pointer'}">
                                        <td>{{index + 1}}</td>
                                        <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <div class="item-box item-product">
                                                <div class="product-image">
                                                    <!-- <img :src="$imgUrl + i.image" :style="{'width': '60px', 'height': 'auto'}"> -->
                                                    <el-avatar :size="40" :src="$imgUrl + item.image">
                                                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                                                    </el-avatar>
                                                </div>
                                                <div>
                                                    <h4 class="m-0">{{item.name}}</h4>
                                                    <p class="m-0">{{item.model}}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <!-- {{symbol[order.exchange]}} -->
                                            <el-input placeholder="үнэ" size="mini" v-model="item[order.exchange]" style="width: 80px;"></el-input>
                                        </td>
                                        <td>
                                            <el-input-number placeholder="Тоо ширхэг" size="mini" v-model="item.qty"></el-input-number>
                                        </td>
                                        <td align="right">
                                            {{symbol[order.exchange]}}{{Number(item.qty * item[order.exchange]).toLocaleString()}}
                                        </td>
                                        <td>
                                            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeProduct(item)" circle></el-button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Нийт</strong></td>
                                        <td colspan="3" align="right">
                                            <strong>{{Number(totalQuantity).toLocaleString()}}</strong>
                                        </td>
                                        <td colspan="2" align="right">
                                            {{symbol[order.exchange]}}<strong>{{Number(totalAmount).toLocaleString()}}</strong>
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td colspan="4" align="center">
                                            Уучлаарай бүтээгдэхүүн нэмээгүй байна
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div style="padding: 10px; float: right;" class="flex">
                        <!-- <el-button type="primary" plain size="mini">Хадгалах</el-button> -->
                        <download-excel :data="excelData" :fields="excelField" worksheet="My Worksheet" :name="order.ordernumber + '.xlsx'">
                            <el-tooltip class="item" effect="dark" content="Татах" placement="top">
                                <el-button type="info" size="mini" icon="el-icon-download" circle></el-button>
                            </el-tooltip>
                        </download-excel>
                        <el-button type="danger" plain size="mini" class="ml-10" @click="doneOrder">Хадгалах</el-button>
                    </div>
                </el-col>
            </el-row>
        </div>
        <el-dialog title="Хайлтын илэрц" :visible.sync="modals.result">
            <el-table :data="filteredProduct">
                <el-table-column property="name" label="Нэр" width="300"></el-table-column>
                <el-table-column property="model" label="Модель" width="200"></el-table-column>
                <el-table-column property="sale_price" label="Үнэ"></el-table-column>
                <el-table-column align="right">
                    <template slot-scope="scope">
                        <el-button @click="addToImport(scope.row)" type="danger" size="mini" icon="el-icon-sell" circle></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            modals: {
                result: false
            },
            loading: false,
            options: [],
            brands: [],
            product: [],
            order: {
                name: '',
                ordernumber: '',
                exchange: 'cny',
                product: []
            },
            symbol: {
                cny: '₮',
                usd: '$'
            },
            symbolSelect: {
                list: [{
                    label: 'MNT',
                    value: 'cny'
                },{
                    label: 'USD',
                    value: 'usd'
                }],
                selected: ''
            },
            end: false,
            excelField: {
                "#": "id",
                "Description": "description",
                "Quantity": "quantity",
                "Unit price": "unitprice",
                "Total Amount": "totalamount"
            },
            excelData: [{
                id: 1,
                description: 'hello',
                quantity: 2,
                unitprice: 1700,
                totalamount: 3400
            }],
            allproduct: [],
            filteredProduct: [],
            search: '',
            hiddenProduct: []
        }
    },
    computed:{
		totalQuantity() {
            this.addProductToExcelData();
            return _.reduce(this.order.product, (sum, obj) => sum + obj.qty, 0)
		},
		totalAmount() {
            this.addProductToExcelData();
			return _.reduce(this.order.product, (sum, obj) => sum + (obj[this.order.exchange] * obj.qty), 0)
		}
	},
    beforeRouteLeave (to, from , next) {
      	if (this.end === false) {
              if(this.order.product.length > 0) {
                    this.saveOrder();
                    next();
              } else {
                  next();
              }
		} else {
			next();
		}
    },
    mounted() {
        var options = localStorage.filterOption;
        if(options !== undefined) {
            options = JSON.parse(options);
            this.options = options;
        } else {
            options = { brand: 1, day: 90, qty: 3, sold: 10 }
            this.options = options;
            localStorage.filterOption = JSON.stringify(options);
        }

        var hiddenProduct = localStorage.hiddenProduct;
        if(hiddenProduct != undefined) {
            var product = JSON.parse(hiddenProduct); var p = [];
            var dt = new Date();
            dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
            product.forEach(el => {
                if(el.date > dt) {
                    p.push(el);
                }
            });
            this.c = p;
            localStorage.hiddenProduct = JSON.stringify(p);
        }
        this.getProducts();
    },
    methods: {
        filterProduct() {
            var product = [];
            this.product.forEach(el => {
                let ex = this.hiddenProduct.some(function(field) {
                    return field.id == el.id
                });
                if(!ex) {
                    product.push(el);
                }
            });

            return product;
        },
        hideProduct(item) {
            Date.prototype.addDays = function(days) {
                var date = new Date(this.valueOf());
                date.setDate(date.getDate() + days);
                return date;
            }
            var dt = new Date().addDays(30);
            dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
            this.hiddenProduct.push({id: item.id, date: dt});
            localStorage.hiddenProduct = JSON.stringify(this.hiddenProduct);
        },
        searchProduct() {
            if(this.search !== '') {
                this.filteredProduct = [];
                this.allproduct.forEach(el => {
                    if(el.model.toUpperCase().includes(this.search.toUpperCase())) {
                        this.filteredProduct.push(el);
                    }
                });
                this.modals.result = true;
            }
        },
        searchProduct() {
            if(this.search !== '') {
                this.filteredProduct = [];
                this.allproduct.forEach(el => {
                    if(el.model.toUpperCase().includes(this.search.toUpperCase())) {
                        this.filteredProduct.push(el);
                    }
                });
                this.modals.result = true;
            }
        },
        updateFilter() {
            localStorage.filterOption = JSON.stringify(this.options);
        },
        doneOrder() {
            this.$prompt(`Захиалгын утга оруулна уу`, 'Санамж', {
                confirmButtonText: 'Хадгалах',
                cancelButtonText: 'Болих',
                inputErrorMessage: 'Буруу утга'
            }).then(({ value }) => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/end-import-order`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            product: this.order.product,
                            ordernumber: this.order.ordernumber,
                            exhange: this.order.exchange,
                            name: value,
                            done: 1
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        rts.end = true;
                        rts.$notify({
                            title: 'Амжилттай',
                            dangerouslyUseHTMLString: true,
                            message: `Хадгалагдлаа`,
                            type: 'success'
                        });
                        rts.$router.push('/imports');
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            });
        },
        saveOrder() {
            var rts = this;
            this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/update-import-order`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						product: this.order.product,
                        ordernumber: this.order.ordernumber,
                        exhange: this.order.exchange,
                        name: '',
                        done: 0
					}
				})
				.then(function(data){
                    rts.loading = false;
				}).catch(error => {
                    rts.loading = false;
                    console.log(error);
				});
			}
        },
        addToImport(item) {
            var i = {qty: 1, sale_price: item.sale_price, id: item.id, cny: item.cny, usd: item.usd, image: item.image, name: item.name, model: item.model};
            var rts = this;
            this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/add-product-to-import`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						product: i,
                        ordernumber: this.order.ordernumber
					}
				})
				.then(function(data){
                    rts.loading = false;
                    if (data.data.result == 'success') {
                        rts.order.product.push(i);
                        rts.product.forEach((el, index) => {
                            if(el.model == item.model) {
                                rts.product.splice(index, 1);
                            }
                        });
                    }
				}).catch(error => {
                    rts.loading = false;
                    console.log(error);
				});
			}
        },
        removeProduct(item) {
            var rts = this;
            this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/remove-product-from-import`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						id: item.id,
                        ordernumber: this.order.ordernumber
					}
				})
				.then(function(data){
                    rts.loading = false;
                    rts.order.product.forEach((el, index) => {
                        if(el.id == item.id) {
                            rts.order.product.splice(index, 1);
                        }
                    });
				}).catch(error => {
                    rts.loading = false;
                    console.log(error);
				});
			}
        },
        exchangeChanged() {
            this.order.exchange = this.symbolSelect.selected;
        },
        addProductToExcelData() {
            var product = [];
            var total = 0, totalAmount = 0;
            this.order.product.forEach((el, index) => {
                total += el.qty;
                totalAmount += el.qty * el[this.order.exchange];
                var e = { id: index + 1, description: el.model + ' ' + el.name, quantity: el.qty, unitprice: el[this.order.exchange], totalamount: el.qty * el[this.order.exchange] } 
                product.push(e);
            });
            product.push({id: '', description: '', quantity: total, unitprice: 'Total Amount: ', totalamount: totalAmount});
            this.excelData = [];
            this.excelData = product;
        },
        getProducts() {
            var rts = this;
            this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-import-edit`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						brand: this.options.brand,
                        day: this.options.day,
                        qty: this.options.qty,
                        sold: this.options.sold
					}
				})
				.then(function(data){
                    rts.loading = false;
                    rts.order.exchange = data.data.exchange;
                    rts.symbolSelect.selected = data.data.exchange;
					rts.brands = data.data.brands;
                    rts.product = data.data.product;
                    rts.order.ordernumber = data.data.ordernumber;
                    rts.order.product = data.data.orderProduct; 
                    rts.allproduct = data.data.allproduct;
                    rts.addProductToExcelData();
				}).catch(error => {
                    rts.loading = false;
					console.log(error);
				});
			}
        }
    }
}
</script>
<style lang="scss">
@import '../../../assets/scss/_variables';

.page-ecommerce-cart {
	.cart-box {
		.widget {
			background: white;
			margin-bottom: 20px;

			.title {
				padding: 15px;
				border-bottom: 1px solid transparentize($text-color, .9);
				font-weight: bold;
			}
			.content {
				padding: 20px;

				button {
					margin-top: 10px;
					border: 1px solid $text-color-accent;
					color: $text-color-accent;
					background-color: transparentize($text-color-accent, .9);
					padding: 10px;
					width: 100%;
					text-align: center;
					font-family: inherit;
					font-size: 20px;
					cursor: pointer;
					border-radius: 4px;

					&:hover {
						background-color: transparentize($text-color-accent, .7);
					}
				}

				.items {
					.item {
						background: transparentize($text-color, .97);
						box-sizing: border-box;

						.photo {
							width: 58px;
							position: relative;
							padding: 10px;
							background: white;

							.add-btn {
								position: absolute;
								background: transparentize($text-color-accent, .3);
								color: white;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								width: 100%;
								height: 100%;
								text-align: center;
								line-height: 78px;
								font-size: 40px;
								opacity: 0;
								transition: all .25s;
							}

							img {
								width: 100%;
								display: block;
							}
						}

						.box {
							padding-left: 10px;

							.product-name {
								font-size: 12px;
							}
							.price {
								font-size: 12px;
								margin-top: 2px;
								color: $text-color-accent;
							}
						}

						&:hover {
							.photo {
								.add-btn {
									opacity: 1;
								}
							}
						}

					}
				}
			}
			
		}

		.item-list {
			.item {
				background: white;
				padding: 25px;
				box-sizing: border-box;
				margin-bottom: 10px;

				.photo {
					width: 100px;
					padding: 10px;
					background: white;

					img {
						width: 100%;
						display: block;
					}
				}

				.box {
					padding-left: 30px;

					.product-name {
						font-weight: bold;
						font-size: 20px;
					}
					.price {
						margin-top: 10px;
						color: $text-color-accent;
					}

					.el-input-number {
						width: 90px;

						& > span {
							border-radius: 0;
							background-color: $text-color-accent; 
							color: white;
							border-color: transparentize($background-color, .9);
						}
				
						.el-input__inner {
							color: $text-color-accent;
							background-color: transparentize($text-color-accent, .9);
							border-color: $text-color-accent; 
							border-radius: 0;
							font-family: inherit;
							font-weight: bold;
							padding-left: 5px;
							padding-right: 45px;
						}
					}

					.del-btn {
						margin-top: 10px;
						color: $text-color-danger;
						padding: 10px;
						text-align: center;
						font-family: inherit;
						font-size: 20px;
						cursor: pointer;
						opacity: .5;
						border: none;
						background: transparent;
						outline: none;
						visibility: hidden; 

						&:hover {
							opacity: 1;
						}
					}

				}
				
				&:hover {
					.del-btn {
						visibility: visible;
					}
				}
			}
		}
	}
}

@media (max-width: 900px) {
	.page-ecommerce-cart {

		.cart-box {
			.item-list {
				.item {
					.photo {
						display: none;
					}
					& > .box {
						padding: 0;
					}
				}
			}
		}
	}
}

@media (max-width: 600px) {
    .mobile-filter {
        width: 100%;
        margin-left: 0;
        margin-top: 5px;
    }
	.page-ecommerce-cart {

		.cart-box {
			.item-list {
				.item {
					display: block;
					padding: 20px;

					.photo, & > .box {
						margin-bottom: 10px;
						width: 100%;
						display: block;
						clear: both;
						padding: 0;
					}
				}
			}
		}
	}
}

</style>