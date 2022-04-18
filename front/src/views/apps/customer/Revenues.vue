<template>
	<div class="scrollable" v-loading.fullscreen.lock="loading">
		<div class="page-ecommerce-orders flex column">
			<div class="page-header">
				<div class="flex justify-space-between">
					<el-breadcrumb separator="/" class="mb-10">
						<el-breadcrumb-item :to="{ path: '/products' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
						<el-breadcrumb-item>Орлогын жагсаалт</el-breadcrumb-item>
					</el-breadcrumb>
				</div>
			</div>
			<div class="card-base p-10 flex justify-space-between" align="center">
				<div>
					<el-date-picker @change="datePickerChanged" v-model="dataTimeRange" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
				</div>
				<el-button type="primary" @click="addReport" icon="el-icon-edit" circle class="mr-10"></el-button>
			</div>
		</div>
		<div class="page-ecommerce-dashboard">
			<div class="table-box card-base card-outline">
				<table class="styled striped hover">
					<thead>
						<tr>
							<th>Орлогын дугаар</th>
							<th>Үүсгэсэн огноо</th>
							<th>Нийт дүн</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in orders" :key="item.id" :style="{'cursor': 'pointer'}" @click="goOrder(item.revenueNumber)">
							<td>
								<h4 class="m-0 o-080">{{item.revenueNumber}}</h4>
							</td>
							<td>
								<div class="item-box item-customer">
									<h4 class="m-0 o-080">{{item.created_at.split('T')[0]}}</h4>
								</div>
							</td>
							<td>
								<div class="item-box item-location">
									<p class="m-0 o-060">₮{{Number(item.totalAmount).toLocaleString()}}</p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
        <el-dialog title="Бараа орлогод авах" :visible.sync="modals.newReport" :before-close="handleClose">
            <el-date-picker style="width: 100%;" v-model="newReportDate" type="date" placeholder="Орлого авах өдрөө сонгоно уу"> </el-date-picker>
            <div class="table-box card-base card-outline">
				<table class="styled striped hover">
					<thead>
						<tr>
							<th style="width: 40%;">Бүтээгдэхүүн</th>
							<th>Үнэ</th>
							<th>Тоо ширхэг</th>
                            <th>Нийт</th>
                            <th></th>
						</tr>
					</thead>
					<tbody>
                        <tr v-for="(item, index) in addProducts" :key="index">
                            <td style="width: 40%;">
								<div class="item-box item-product flex">
									<div class="product-image">
										<el-avatar v-if="item.type == 1" :size="40" :src="$imgUrl+item.image">
											<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
										</el-avatar>
                                        <el-avatar v-else :size="40" :src="$appUrl+'/images/local/product/'+item.image">
											<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
										</el-avatar>
									</div>
									<div class="ml-10">
										<h4 class="m-0">{{item.model}}</h4>
										<p class="m-0">{{item.name}}</p>
									</div>
								</div>
							</td>
                            <td>
                                ₮{{Number(item.price).toLocaleString()}}
                            </td>
                            <td>
                                <!-- {{Number(item.qty).toLocaleString()}} -->
                                <el-input-number v-model="item.qty" :min="1" size="mini"></el-input-number>
                            </td>
                            <td>
                                ₮{{Number(item.price * item.qty).toLocaleString()}}
                            </td>
                            <td>
                                <el-button type="danger" circle="" size="mini" icon="el-icon-delete" @click="removeRow(index, item.id)"></el-button>
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Нийт</strong></td>
                            <td></td>
                            <td>{{Number(totalCount).toLocaleString()}}</td>
                            <td>₮{{Number(totalCash).toLocaleString()}}</td>
                            <td></td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div class="mt-10">
                <el-button type="primary" icon="el-icon-plus" @click="addRow" plain size="mini"></el-button>
            </div>
            <span slot="footer" class="dialog-footer">
                <el-button @click="handleClose">Болих</el-button>
                <el-button @click="SendToReport" type="primary">Хадгалах</el-button>
            </span>
        </el-dialog>
        <el-dialog title="Бүтээгдэхүүн хайх" :visible.sync="modals.search">
                <el-input placeholder="Модель" prefix-icon="el-icon-search" v-model="search"> </el-input>
                <div class="table-box card-base card-outline scrollable">
                    <table class="styled striped hover">
                        <thead>
                            <tr>
                                <th>Модель</th>
                                <th>Нэр</th>
                                <th>Үнэ</th>
                                <th>Үлдэгдэл</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(item, index) in filterProduct" :key="index">
                                <td>{{item.model}}</td>
                                <td>{{item.name}}</td>
                                <td>{{Number(item.sale_price).toLocaleString()}}</td>
                                <td>{{Number(item.qty).toLocaleString()}}</td>
                                <td>
                                    <el-button circle="" size="mini" icon="el-icon-sold-out" @click="addRowToProduct(item)"></el-button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
        </el-dialog>
	</div>
</template>

<script>
import 'tui-grid/dist/tui-grid.css';
import { Grid } from '@toast-ui/vue-grid';
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'Order',
	data() {
		return {
			dataTimeRange: null,
			search: '',
			gridData: [],
			orders: [],
			loading: false,
			store: [],
			modals: {
				newReport: false,
                search: false
			},
            newRevenueNumber: null,
            addProducts: [],
            newReportDate: null,
            allproducts: []
		}
	},
	computed: {
        filterProduct() {
            var p = [];
            this.allproducts.forEach(el => {
                if(el.model.includes(this.search)) {
                    p.push(el);
                }
            });
            return p;
        },
		totalCash() {
			var total = 0;
            this.addProducts.forEach(element => {
                total += element.qty * element.price;
            });
            return total;
		},
        totalCount () {
            var total = 0;
            this.addProducts.forEach(element => {
                total += element.qty;
            });
            return total;
        }
	},
	methods: {
        addRowToProduct(item) {
            var c = false;
            this.addProducts.forEach(el => {
                if(el.model == item.model && item.type == el.type) {
                    el.qty++;
                    c = true;
                }
            });
            if(!c) {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/add-customer-revenue-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            revenueNumber: rts.newRevenueNumber,
                            product: item
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            var a = {id: item.id, model: item.model, name: item.name, qty: 1, price: item.wholesale_price, image: item.image, type: item.type};
                            rts.addProducts.push(a);
                        }
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
                
            }   
        },
        addRow() {
            // this.addProducts.push({model: '', qty: 1 });
            this.modals.search = true;
        },
        removeRow(index, id) {
            var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/remove-customer-revenue-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            revenueNumber: rts.newRevenueNumber,
                            id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.addProducts.splice(index, 1);
                        }
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
        },
        handleClose() {
            this.$confirm('Өөрчлөлтийг хадгалах уу?', 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй, Баярлалаа',
                type: 'info'
            })
            .then(_ => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/update-customer-revenue-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            revenueNumber: rts.newRevenueNumber,
                            product: this.addProducts
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        rts.modals.newReport = false;
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
            .catch(_ => {
                this.modals.newReport = false;
            });
        },
		SendToReport() {
			if(this.newReportDate == null || this.addProducts.length == 0) {
                this.$notify({
					title: 'Амжилтгүй',
					message: 'Огноо эсвэл бүтээгдэхүүн сонгогдоогүй байна',
					type: 'error'
				});
            } else {
                var rts = this;
                    this.loading = true;
                    const token = localStorage.getItem('token');
                    if(token) {
                        this.$axios({
                            method: 'post',
                            url: rts.$appUrl +`/api/order/add-new-customer-revenue`,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            }, 
                            data: {
                                datetime: this.newReportDate, 
                                product: this.addProducts,
                                revenueNumber: this.newRevenueNumber
                            }
                        })
                        .then(function(data){
                            rts.loading = false;
                            if(data.data.result == 'success') {
                                rts.$notify({
                                    title: 'Амжилттай',
                                    dangerouslyUseHTMLString: true,
                                    message: `Тайлан бүртгэгдлээ`,
                                    type: 'success'
                                });
                                rts.addProducts = [];
                                rts.newRevenueNumber = null;
                                rts.modals.newReport = false;
                                rts.getOrders();
                            }
                        }).catch(error => {
                            rts.loading = false;
                            console.log(error);
                        });
                    }
            }
		},
		showDetailForm() {
			if(this.newReport.store !== '') {
				this.modals.newReport = false;
				this.modals.newReportDetail = true;
			}
		},
        getAddProducts() {
            var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-customer-new-revenue`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						revenueNumber: rts.newRevenueNumber
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.newRevenueNumber = data.data.revenueNumber;
                        rts.addProducts = data.data.product;
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
        },
		addReport() {
            if(this.newRevenueNumber == null) {
                this.getAddProducts();
                this.modals.newReport = true;
            } else {
                this.modals.newReport = true;
            }
		},
		goOrder(id) {
            alert(id);
			// this.$router.push({name:'show-customer-reports', params: {id: id}})
		},
		datePickerChanged(value) {
			this.getOrders(value);	
		},
		getOrders(datetime) {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-customer-revenue`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						datetime
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.orders = data.data.revenue;
                        rts.allproducts = [];
						data.data.customerproduct2.forEach(el => {
							rts.allproducts.push(el);
						});
						data.data.customerproduct1.forEach(el => {
							rts.allproducts.push(el);
						});
                        if(data.data.newRevenue.length > 0) {
                            rts.newRevenueNumber = data.data.newRevenue[0].revenueNumber;
                        }
                        if(rts.newRevenueNumber != null) {
                            rts.getAddProducts();
                        }
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		}
	},
	mounted() {
			this.getOrders(this.dataTimeRange);
	},
	components: {
		Grid
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.page-ecommerce-dashboard {
	.widget {
		.icon-box {
			font-size: 30px;
		}
	}

	.table-box {
		.item-box {
			&.item-product {
				.product-image {
					width: 50px;
					margin-right: 15px;
					float: left;

					img {
						width: 100%;
					}
				}
			}

			&.item-status {
				padding: 5px 10px;

				&.status- {
					&Complete { background: rgba(44, 196, 120, 0.25); }
					&Pending { background: rgba(247, 186, 42, 0.25); }
					&Returned { background: rgba(243, 24, 71, 0.25); }
					&Paid { background: rgba(45, 109, 211, 0.25); }
				}
			}
		}
	}
}

.page-ecommerce-orders {
	.page-header {
		margin-bottom: 8px;

		h1 {
			button {
				float: right;
				padding: 5px 10px;
				background: rgba(255, 255, 255, .2);
				text-transform: uppercase;
				border: none;
				outline: none;
				cursor: pointer;
				color: white;
				opacity: .8;
				font-family: inherit;

				i {
					position: relative;
					top: 3px;
				}

				&:hover {
					opacity: 1;
				}
			}
		}

		input {
			background: rgba(255, 255, 255, .2);
			border: none;
			outline: none;
			height: 20px;
			margin-top: 5px;
			padding: 4px 8px;
			min-width: 200px;
			font-family: inherit;
			color: white;
			font-size: 16px;
		}
	}

	#table-box {
		overflow: hidden;
	}

	#grid {
		.tui-grid-cell[data-column-name="photo"] ,
		.tui-grid-cell[data-column-name="avatar"] {
			.tui-grid-cell-content {
				padding: 0; 
			}
		}

		.tui-grid-cell[data-column-name="photo"] ,
		.tui-grid-cell[data-column-name="product"] {
			background: white;
		}

		.tui-grid-border-line-top {
			background-color: transparent;
			border-color: white;
		}
		.tui-grid-cell-head {
			border-top-color: transparent;
		}
	
		.tui-grid-cell-head[data-column-name="mergeColumn1"] ,
		.tui-grid-cell-head[data-column-name="mergeColumn2"] ,
		.tui-grid-cell-head[data-column-name="mergeColumn3"] ,
		.tui-grid-cell-head[data-column-name="mergeColumn4"] ,
		.tui-grid-cell-head[data-column-name="mergeColumn5"] ,
		.tui-grid-cell-head[data-column-name="mergeColumn6"] {
			background: #f4f4f4;
			color: #8e8e8e;
		}

		.tui-grid-cell-content {
			.pending {
				color: #f7ba2a;
				font-weight: bold;
			}
			.returned {
				color: #ff005c;
				font-weight: bold;
			}
			.complete {
				color: #1ac367;
				font-weight: bold;
			}
			.paid {
				color: #2d6dd3;
				font-weight: bold;
			}
		}
	}
}


@media (max-width: 900px) {
	.mobile-datetimepicker {
		width: 100%;
	}
	.page-ecommerce-orders {

		.page-header {
			.el-breadcrumb {
				display: none;
			}
		}
	}
}


@media (max-width: 480px) {
	.page-ecommerce-orders {

		.page-header {
			h1 {
				display: none;
			}
		}
	}
}
</style>


