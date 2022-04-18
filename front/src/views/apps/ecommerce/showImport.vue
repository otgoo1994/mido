<template>
	<div class="page-ecommerce-checkout scrollable">
		
		<el-breadcrumb separator="/" class="mb-20">
			<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/imports' }">Ирж байгаа захиалга</el-breadcrumb-item>
			<el-breadcrumb-item>{{order.ordernumber}}</el-breadcrumb-item>
		</el-breadcrumb>

        <el-row class="cart-box" :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="17" :xl="17">
                <div class="widget review card-shadow--small b-rad-4">
                    <div class="title">
                        Бүтээгдэхүүн ({{order.product.length}})
                    </div>
                    <div class="content">
                        <!-- <el-row class="items mt-40" :gutter="20">
                            <el-col v-for="i in order.product" :key="i.id" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                                <div class="item mb-20 flex">
                                    <div class="photo">
                                        <img :src="$imgUrl+i.image">
                                    </div>
                                    <div class="box grow flex column justify-center">
                                        <div class="product-name">{{i.name}} <strong>{{i.model}}</strong></div>
                                        <div class="price">
                                            <el-input-number v-if="(order.detail.to_where == LoggedUserCurrentShop || order.detail.from_where == LoggedUserCurrentShop) && order.detail.stat == 'send'" v-model="i.quantity" :style="{'width': '100px'}" controls-position="right" :min="1" :max="i[order.detail.from_where]" class="mr-5"></el-input-number>
                                            <span v-else>{{Number(i.quantity).toLocaleString()}}</span>
                                            x ₮ {{Number(i.sale_price).toLocaleString()}} = <strong>₮ {{Number(i.sale_price * i.quantity).toLocaleString()}}</strong></div>
                                    </div>
                                </div> 
                            </el-col>
                        </el-row> -->
                        <div class="page-ecommerce-dashboard mt-10" style="width: 100%;" :style="{'border-radius': '10px'}">
                        <div class="table-box card-base card-outline" style="overflow: auto;">
                            <table class="styled striped hover">
                                <thead>
                                    <tr style="font-size: 14px;">
                                        <th>#</th>
                                        <th style="width: 80%;">Бүтээгдэхүүн</th>
                                        <th>Үнэ</th>
                                        <th>Ө.Үнэ</th>
                                        <th>Б.Үнэ</th>
                                        <th>Х.Үнэ</th>
                                        <th>Үлдэгдэл</th>
                                        <th>Нийт</th>
                                        <th v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4"></th>
                                    </tr>
                                </thead>
                                <tbody v-if="order.product.length > 0">
                                    <tr v-for="(item, index) in order.product" :key="index" :style="{'cursor': 'pointer'}">
                                        <td>{{index + 1}}</td>
                                        <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <div class="item-box item-product">
                                                <div class="product-image">
                                                    
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
                                            <el-input v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4" placeholder="үнэ" size="mini" v-model="item[order.detail.exchange]" style="width: 80px;"></el-input>
                                            <span v-else>{{Number(item.sale_price).toLocaleString()}}</span>
                                        </td>
                                        <td>
                                            <el-input v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2" placeholder="үнэ" size="mini" v-model="item.cost_price" style="width: 80px;"></el-input>
                                        </td>
                                        <td>
                                            <el-input v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2" placeholder="үнэ" size="mini" v-model="item.wholesale_price" style="width: 80px;"></el-input>
                                        </td>
                                        <td>
                                            <el-input v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2" placeholder="үнэ" size="mini" v-model="item.sale_price" style="width: 80px;"></el-input>
                                        </td>
                                        <td align="right">
                                            <!-- <el-input-number v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4" placeholder="Тоо ширхэг" size="mini" v-model="item.qty"></el-input-number> -->
                                            <span>{{Number(item.qty).toLocaleString()}}</span>
                                        </td>
                                        <td align="right">
                                            <span v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">{{symbol[order.detail.exchange]}}{{Number(item.qty * item[order.detail.exchange]).toLocaleString()}}</span>
                                            <span v-else>₮{{Number(item.qty * item.sale_price).toLocaleString()}}</span>
                                        </td>
                                        <td v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
                                            <el-button type="danger" size="mini" icon="el-icon-delete" @click="removeProduct(item)" circle></el-button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td><strong>Нийт</strong></td>
                                        <td colspan="6" align="right">
                                            <strong>{{Number(totalQuantity).toLocaleString()}}</strong>
                                        </td>
                                        <td colspan="2" align="right">
                                            <span v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">{{symbol[order.detail.exchange]}}<strong>{{Number(totalAmount).toLocaleString()}}</strong></span>
                                            <span v-else>₮<strong>{{Number(totalAmount).toLocaleString()}}</strong></span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="7" :xl="7">
                <div class="widget payment card-shadow--small b-rad-4">
                    <div class="title">
                        Нэмэлт мэдээлэл
                    </div>
                    <div class="content">
                        <div class="flex justify-space-between">
                            <div class="box grow mt-10 total">
                                <div class="t-row">
                                    <table align="center">
                                        <tr>
                                            <td class="label" width="50%">Төлөв</td>
                                            <td class="value" width="50%" v-if="order.detail.stat == 1">Ирсэн</td>
                                            <td class="value" width="50%" v-else>Хүлээгдэж байгаа</td>
                                        </tr>
                                        <tr>
                                            <td class="label" width="50%">Захиалга</td>
                                            <td class="value" width="50%">{{order.detail.name}}</td>
                                        </tr>
                                        <tr>
                                            <td class="label" width="50%">Захиалгын дугаар</td>
                                            <td class="value" width="50%">{{order.ordernumber}}</td>
                                        </tr>
                                        <tr>
                                            <td class="label" width="50%">Захиалсан огноо</td>
                                            <td class="value" width="50%" v-if="order.detail.created_at !== undefined">{{order.detail.created_at.split('T')[0]}}</td>
                                        </tr>
                                        <tr v-if="order.detail.stat == 1">
                                            <td class="label" width="50%">Ирсэн огноо</td>
                                            <td class="value" width="50%" v-if="order.detail.updated_at !== undefined">{{order.detail.updated_at.split('T')[0]}}</td>
                                        </tr>
                                    </table>
                                </div>
                                <div align="center">
                                    <download-excel :data="excelData" :fields="excelField" worksheet="My Worksheet" :name="order.ordernumber + '.xls'" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
                                        <el-tooltip class="item" effect="dark" content="Татах" placement="top">
                                            <el-button type="info" size="mini" icon="el-icon-download" plain></el-button>
                                        </el-tooltip>
                                    </download-excel>
                                    <el-button type="primary" @click="saveImportChanged" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4" :disabled="saveBtn" size="small" plain>Өөрчлөлтийг хадгалах</el-button>
                                </div>
                                <!-- <el-button type="primary" @click="wroteMovement" v-if="order.detail.stat == 'received' && (LoggedUser.posID == 1 || LoggedUser.posID == 2)" size="small" plain>Шивсэн гэж тэмдэглэх</el-button><br>
                                <el-button type="primary" @click="confirmMovement" v-if="order.detail.from_where == LoggedUserCurrentShop && order.detail.stat == 'send'" size="small" plain>Зөвшөөрөх</el-button><br>
                                <el-button type="danger" @click="disableMovement"  v-if="(order.detail.from_where == LoggedUserCurrentShop || order.detail.to_where == LoggedUserCurrentShop) && order.detail.stat == 'send'" size="small" plain>Цуцлах</el-button>
                                <el-button type="danger" @click="receiveMovement" v-if="order.detail.to_where == LoggedUserCurrentShop && order.detail.stat == 'confirmed'" size="confirmed" plain>Хүлээж авсан гэж тэмдэглэх</el-button> -->
                            </div>
                        </div>
                    </div>
                </div>
                <el-input placeholder="Модель эсвэл нэр ..." v-model="search" @keydown.enter.native="searchProduct" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
					<template slot="append">
						<a href="javascript:;" @click="searchProduct">
							<i class="mdi mdi-database-search"></i>
						</a>
					</template>
                </el-input>
            </el-col>
        </el-row>
        <el-dialog title="Хайлтын илэрц" :visible.sync="modals.result">
            <el-table :data="filteredProduct">
                <el-table-column property="name" label="Нэр" width="300"></el-table-column>
                <el-table-column property="model" label="Модель" width="200"></el-table-column>
                <el-table-column property="sale_price" label="Үнэ"></el-table-column>
                <el-table-column align="right">
                    <template slot-scope="scope">
                        <el-button @click="addToImport(scope.row)" type="danger" icon="el-icon-sell" circle></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>
	</div>
</template>

<script>
import moment from 'moment'
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'EcommerceCheckout',
	data () {
		return {
			items: [],
			LoggedUser: [],
			card: '',
			date: '',
			cvv: '',
			name: '',
            order: {
                ordernumber: '',
                detail: [],
                product: [],
                original: [],
                confirmed: [],
                received: []
            },
            location: [],
            LoggedUserCurrentShop: '',
            symbol: {
                cny: '₮',
                usd: '$'
            },
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
            saveBtn: true,
            allproduct: [],
            modals: {
                result: false
            },
            filteredProduct: [],
            search: ''
		}
	},
    beforeRouteLeave (to, from , next) {
      	if (this.saveBtn === false) {
            this.$confirm('Өөрчлөлтийг хадгалах уу?', 'Санамж', {
            confirmButtonText: 'Тийм',
            cancelButtonText: 'Үгүй',
            type: 'warning'
            }).then(() => {
                this.saveImportChanged();
                next();
            }).catch(() => {
                next();         
            });
		} else {
			next();
		}
    },
    computed:{
		totalQuantity() {   
            this.saveBtn = true;         
            this.order.original.forEach(o => {
                this.order.product.forEach(p => {
                    if(p.id === o.id) {
                        if(p.qty !== o.qty) {
                            this.saveBtn = false;
                        } else if(p[this.order.detail.exchange] != o[this.order.detail.exchange]) {
                            this.saveBtn = false;
                        } else if(p.sale_price != o.sale_price) {
                            this.saveBtn = false;
                        } else if(p.cost_price != o.cost_price) {
                            this.saveBtn = false;
                        } else if(p.wholesale_price != o.wholesale_price) {
                            this.saveBtn = false;
                        }
                    }
                });
            });
            return _.reduce(this.order.product, (sum, obj) => sum + obj.qty, 0)
		},
		totalAmount() {
            if(this.LoggedUser.posID == 1 || this.LoggedUser.posID == 2 || this.LoggedUser.posID == 4)
			    return _.reduce(this.order.product, (sum, obj) => sum + (obj[this.order.detail.exchange] * obj.qty), 0)
            else
                return _.reduce(this.order.product, (sum, obj) => sum + (obj.sale_price * obj.qty), 0)
		}
	},
    mounted() {
        this.order.ordernumber = this.$route.params.id;
        this.LoggedUser = JSON.parse(localStorage.getItem('user'));
        this.getOrder();
    },
	methods: {
        addToImport(item) {
            var i = {qty: 1, sale_price: item.sale_price, id: item.id, cny: item.cny, usd: item.usd, image: item.image, name: item.name, model: item.model};
            var o = {qty: 1, sale_price: item.sale_price, id: item.id, cny: item.cny, usd: item.usd, image: item.image, name: item.name, model: item.model};
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
                    if(data.data.result == 'success') {
                        rts.order.product.push(i);
                        rts.order.original.push(o);
                        rts.addProductToExcelData();
                    } else if (data.data.result == 'alreadyExist') {
                        rts.$notify({
                            title: 'Амжилтгүй',
                            dangerouslyUseHTMLString: true,
                            message: `Аль хэдийн нэмэгдсэн байна`,
                            type: 'error'
                        });
                    }
				}).catch(error => {
                    rts.loading = false;
                    console.log(error);
				});
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
        removeProduct(item) {
            this.$confirm(`<strong>${item.model}</strong> -г устгах уу?`, 'Санамж', {
            confirmButtonText: 'Тийм',
            cancelButtonText: 'Үгүй',
            dangerouslyUseHTMLString: true,
            type: 'warning'
            }).then(() => {
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
                        rts.order.original.forEach((el, index) => {
                            if(el.id == item.id) {
                                rts.order.product.splice(index, 1);
                            }
                        });
                        rts.addProductToExcelData();
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            });
        },
        saveImportChanged() {
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
                        exhange: this.order.detail.exchange,
                        name: this.order.detail.name,
                        done: 1
					}
				})
				.then(function(data){
                    rts.loading = false;
                    rts.saveBtn = true;
                    rts.order.original.forEach(o => {
                        rts.order.product.forEach(p => {
                            if(p.id === o.id) {
                                o.qty = p.qty;
                                o[rts.order.detail.exchange] = p[rts.order.detail.exchange];
                                rts.addProductToExcelData();
                            }
                        });
                    });
                    rts.$notify({
						title: 'Амжилттай',
						dangerouslyUseHTMLString: true,
						message: `Хадгалагдлаа`,
						type: 'success'
					});
				}).catch(error => {
                    rts.loading = false;
                    console.log(error);
				});
			}
        },
        addProductToExcelData() {
            var product = [];
            var total = 0, totalAmount = 0;
            this.order.product.forEach((el, index) => {
                total += el.qty;
                totalAmount += el.qty * el[this.order.detail.exchange];
                var e = { id: index + 1, description: el.model + ' ' + el.name, quantity: el.qty, unitprice: el[this.order.detail.exchange], totalamount: el.qty * el[this.order.detail.exchange] } 
                product.push(e);
            });
            product.push({id: '', description: '', quantity: total, unitprice: 'Total Amount: ', totalamount: totalAmount});
            this.excelData = [];
            this.excelData = product;
        },
        getOrder() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-current-import`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						ordernumber: this.order.ordernumber
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
                        console.log(data);
						rts.order.detail = data.data.order;
                        rts.order.original = data.data.original;
                        rts.order.product = data.data.product;
                        rts.allproduct = data.data.allproduct;
                        rts.addProductToExcelData();
					} else if(data.data.result == 'failed'){
                        rts.$router.push({name:'not-found'});
                    }
				}).catch(error => {
					console.log(error);
				});
			}
        }
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.page-ecommerce-checkout {
	.page-header {
		margin-bottom: 20px;
	}

	.widget {
		position: relative;
		border: 1px solid $text-color-accent;
		box-sizing: border-box;
		padding: 20px;
		margin-bottom: 20px;
		background: white;

		.title {
			background: $text-color-accent;
			color: $background-color;
			position: absolute;
			top: 0;
			left: 0;
			padding: 2px 12px 6px 8px;
			font-size: 10px;
			font-weight: bold;
			text-transform: uppercase;
		}

		&.shipping {
			.info {
				background: $background-color;
				padding: 30px;
				margin-right: 10px;
				box-sizing: border-box;
			}
			.type {
				background: $background-color;
				margin-left: 10px;
				padding: 30px;
				box-sizing: border-box;

				.type-btn {
					background: transparentize($text-color-accent, .9);
					border: 0px solid $text-color-accent;
					color: $text-color-accent;
					padding: 20px;
					text-align: center;

					&.active {
						background: $text-color-accent;
						color: white;
					}
				}
                .type-btn-success {
					background: transparentize(#2dc20c, .9);
					border: 0px solid #2dc20c;
					color: #2dc20c;
					padding: 20px;
					text-align: center;

					&.active {
						background: $text-color-accent;
						color: white;
					}
				}
                .type-btn-error {
					background: transparentize(#e64239, .9);
					border: 0px solid #e64239;
					color: #e64239;
					padding: 20px;
					text-align: center;

					&.active {
						background: $text-color-accent;
						color: white;
					}
				}
			}
		}

		&.review {
			.items {
				.item {
					background: transparentize($text-color, .97);
					box-sizing: border-box;

					.photo {
						width: 65px;
						padding: 10px;
						background: white;

						img {
							width: 100%;
							display: block;
						}
					}

					.box {
						padding-left: 20px;
						padding-right: 20px;

						.product-name {
							font-size: 16px;
						}
						.price {
							font-size: 14px;
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

		&.payment {
			.card {
				max-width: 400px;
			}

			.el-input {
				.el-input__inner {
					background: transparentize($text-color-accent, .9);
					border: 1px solid $text-color-accent;
					border-radius: 0;
					color: $text-color;
					font-family: inherit;
				}
				.el-input__prefix {
					color: $text-color;
					left: 10px;
				}
			}

			.total {
				text-align: right;
				font-size: 16px;

				.t-row {
					& > div {
						display: inline-block;
					}
					.label {
						padding: 5px 10px;
						opacity: .6;
					}
					.value {
						padding: 5px 10px;
						min-width: 100px;
						text-align: left;
					}

					&.tot {
						& > div {
							font-size: 20px;
							opacity: 1;
							font-weight: bold;
							border-top: 1px solid $text-color;
						}
					}
				}

				button {
                    margin-top: 5px;
					width: 100%;
					max-width: 300px;
				}
			}

			.small-info {
				display: none;
			}
		}
	}
}

@media (max-width: 1100px) {
	.page-ecommerce-checkout {

		.widget {
			&.payment {
				.info {
					display: none;
				}
				.small-info {
					display: block;
				}
			}
		}
	}
}
@media (max-width: 850px) {
	.page-ecommerce-checkout {

		.widget {
			&.shipping {
				.content {
					& > .flex {
						display: block;
						clear: both;
						width: 100%;
					}
				}

				.info {
					display: block;
					clear: both;
					width: 100%;
					margin: 0;
					margin-top: 40px;
				}
				.type {
					display: block;
					clear: both;
					width: 100%;
					margin: 0;
				}
			}

			&.payment {
				.content {
					& > .flex {
						display: block;
						clear: both;
						width: 100%;
					}
				}

				.card {
					display: block;
					clear: both;
					width: 100%;
					margin: 0 auto;
					margin-top: 40px;
				}
				.total {
					display: block;
					clear: both;
					width: 100%;
					margin: 0 auto;
					margin-top: 20px;
				}
			}
		}
	}
}

@media (max-width: 450px) {
	.page-ecommerce-checkout {

		.widget {

			&.payment {
				.total {
					font-size: 12px;

					.t-row {
						.value {
							min-width: inherit;
						}
						&.tot {
							& > div {
								font-size: 14px;
							}
						}
					}
				}
			}
		}
	}
}


</style>