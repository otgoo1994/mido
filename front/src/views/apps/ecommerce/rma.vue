<template>
<div class="scrollable">
	<div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" class="mb-10">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item>RMA</el-breadcrumb-item>
					<el-breadcrumb-item v-if="LoggedUser.posID == 3 || LoggedUser.posID == 5 || LoggedUser.posID == 6">{{shopname}}</el-breadcrumb-item>
				</el-breadcrumb>
                <el-button-group v-if="LoggedUser.posID < 5">
					<el-tooltip class="item" effect="dark" content="Гэмтэлтэй бараа бүртгэх" placement="top-end">
						<el-button icon="el-icon-plus" type="danger" circle="" @click="modals.rma = true"></el-button>
					</el-tooltip>
				</el-button-group>
			</div>
		</div>
	</div>
	<div class="page-ecommerce-dashboard">
		<div class="table-box card-base card-outline" :style="{'overflow': 'auto'}">
			<table class="styled striped hover" v-if="LoggedUser.posID == 3 || LoggedUser.posID == 5 || LoggedUser.posID == 6">
				<thead>
					<tr>
						<th>Бүтээгдэхүүн</th>
						<th>Бүртгэсэн ажилтан</th>
						<th>Өнгө</th>
						<th>Огноо</th>
                        <th>Шалтгаан</th>
						<th>Төлөв</th>
						<th></th>
					</tr>
				</thead>
				<tbody v-if="checktime == 'nottime'">
					<tr>
						<td colspan="7" align="center">
							Цагаа бүртгүүлнэ үү
						</td>
					</tr>
				</tbody>
				<tbody>
					<tr v-for="(item, index) in rma" :key="index" :style="{'cursor': 'pointer'}">
						<td>
							<div class="item-box item-product">
								<div class="product-image">
									<el-avatar :size="40" :src="$imgUrl+item.image">
										<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
									</el-avatar>
								</div>
								<div>
									<h4 class="m-0">{{item.model}}</h4>
									<p class="m-0">{{item.name}}</p>
								</div>
							</div>
						</td>
						<td>
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.username}}</h4>
								<p class="m-0 o-060">{{item.phone}}</p>
							</div>
						</td>
						<td>
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.color_name}}</h4>
							</div>
						</td>
                        <td>
							<div class="item-box item-customer">
								<!-- <h4 class="m-0 o-080" v-if="LoggedUser.posID == 3">₮{{Number(item.sale_price).toLocaleString()}}</h4>
								<h4 class="m-0 o-080" v-else>₮{{Number(item.wholesale_price).toLocaleString()}}</h4> -->
								<h4 class="m-0 o-080">{{new Date(item.created_at).toDateString()}}</h4>
							</div>
						</td>
                        <td align="left">
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.about}}</h4>
							</div>
						</td>
						<td>
							<div class="item-box item-status" style="border-radius: 5px;" v-bind:class="{'status-Complete': item.sent == true && item.stat != 1, 'status-Pending': item.sent == true && item.stat == 1, 'status-Returned': item.sent == false}">
								<h4 class="m-0 mb-5" v-if="item.sent == true">Илгээгдсэн</h4>
								<h4 class="m-0 mb-5" v-else>Илгээгдээгүй</h4>
								<p class="m-0 o-060" v-if="item.stat == 1"> Шийдэгдээгүй </p>
								<p class="m-0 o-060" v-else-if="item.stat == 2"> Актлагдсан </p>
								<p class="m-0 o-060" v-else-if="item.stat == 3"> Нийлүүлэгчрүү буцаагдсан </p>
								<p class="m-0 o-060" v-else-if="item.stat == 4"> Тасаг руу буцаагдсан </p>
								<p class="m-0 o-060" v-else-if="item.stat == 5"> Авлага үүсгэсэн </p>
							</div>
						</td>
						<td>
							<el-button-group v-if="item.sent == 0">
								<el-tooltip class="item" effect="dark" content="Илгээх" placement="top-end">
									<el-button type="warning" round icon="el-icon-s-promotion" size="mini" @click="sendToRma(item.rmaId)"></el-button>
								</el-tooltip>
								<el-tooltip class="item" effect="dark" content="Устгах" placement="top-end">
									<el-button round icon="el-icon-delete" size="mini" @click="deleteRma(item.rmaId)"></el-button>
								</el-tooltip>
							</el-button-group>
						</td>
					</tr>
				</tbody>
			</table>
			<el-tabs v-model="activeTab" v-else style="padding: 20px;">
				<el-tab-pane label="Салбарын RMA" name="shops">
					<table class="styled striped hover">
						<thead>
							<tr>
								<th style="width: 80%;">Салбар</th>
								<th align="right">Бүтээгдэхүүний тоо</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, index) in rma" :key="index" @click="goOrder(item)" :style="{'cursor': 'pointer'}">
								<td>
									<div class="item-box item-customer">
										<h4 class="m-0 o-080">{{searchStore(item.storeId)}}</h4>
										<p class="m-0 o-060" v-if="!getName(item)">{{item.name}}</p>
									</div>
								</td>
								<td>
									<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Returned': getCount(item.storeId) > 5, 'status-Complete': getCount(item.storeId) <= 5}">
										<h4 class="m-0 mb-5" v-if="getCount(item.storeId) > 5">{{getCount(item.storeId)}}</h4>
										<h4 class="m-0 mb-5" v-else>{{getCount(item.storeId)}}</h4>
										<p class="m-0 o-060" v-if="getCount(item.storeId) > 5"> Татах шаардлагатай</p>
										<p class="m-0 o-060" v-else> Хэвийн </p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</el-tab-pane>
				<el-tab-pane label="Бөөний харилцагчдын RMA" name="whole">
					<table class="styled striped hover">
						<thead>
							<tr>
								<th style="width: 80%;">Салбар</th>
								<th align="right">Бүтээгдэхүүний тоо</th>
							</tr>
						</thead>
						<tbody>
							<tr v-for="(item, index) in rmaWhole" :key="index" @click="goOrder(item)" :style="{'cursor': 'pointer'}">
								<td>
									<div class="item-box item-customer">
										<h4 class="m-0 o-080">{{searchStore(item.storeId)}}</h4>
										<p class="m-0 o-060" v-if="!getName(item)">{{item.name}}</p>
									</div>
								</td>
								<td>
									<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Returned': getCountWhole(item.userId) > 5, 'status-Complete': getCountWhole(item.userId) <= 5}">
										<h4 class="m-0 mb-5" v-if="getCountWhole(item.userId) > 5">{{getCountWhole(item.userId)}}</h4>
										<h4 class="m-0 mb-5" v-else>{{getCountWhole(item.userId)}}</h4>
										<p class="m-0 o-060" v-if="getCountWhole(item.userId) > 5"> Татах шаардлагатай</p>
										<p class="m-0 o-060" v-else> Хэвийн </p>
									</div>
								</td>
							</tr>
						</tbody>
					</table>
				</el-tab-pane>
				<el-tab-pane label="Нийлүүлэгчрүү буцаах бүтээгдэхүүн" name="brands">
					<table class="styled striped hover">
						<thead>
							<tr>
								<th>Брэнд</th>
								<th>Огноо</th>
								<th>Бүтээгдэхүүний тоо</th>
								<th>Нийт өртөг үнэ</th>
								<th>Төлөв</th>
							</tr>
						</thead>
						<tbody v-if="brand.length <= 0">
							<tr>
								<td colspan="3" align="center">
									Илэрцгүй
								</td>
							</tr>
						</tbody>
						<tbody>
							<tr v-for="(item, index) in brand" :key="index" :style="{'cursor': 'pointer'}">
								<td>
									<div class="item-box item-product">
										<div>
											<h4 class="m-0">{{item.brandname}}</h4>
										</div>
									</div>
								</td>
								<td>
									<div class="item-box item-product">
										<div>
											<h4 class="m-0">{{item.updated_at.split('T')[0]}}</h4>
										</div>
									</div>
								</td>
								<td>
									<div class="item-box item-customer">
										<h4 class="m-0 o-080">{{Number(item.count).toLocaleString()}}</h4>
									</div>
								</td>
								<td>
									<div class="item-box item-customer">
										<h4 class="m-0 o-080">₮{{Number(item.total).toLocaleString()}}</h4>
									</div>
								</td>
								<td>
									<el-button v-if="item.total > 1" type="danger" size="mini" icon="el-icon-message-solid" circle></el-button>
									<el-button v-else type="success" size="mini" icon="el-icon-check" circle></el-button>
								</td>
							</tr>
						</tbody>
					</table>
				</el-tab-pane>
			</el-tabs>
        </div>
	</div>

    <el-dialog title="RMA бараа бүртгэх" :visible.sync="modals.rma">
        <div v-for="(i, index) in addProducts" :key="index">
            <el-row :gutter="10">
			    <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
                    <el-input placeholder="Модель" v-model="i.model" class="mt-5"  clearable> </el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="6" :lg="6" :xl="6">
                    <el-input-number v-model="i.qty" style="width: 100%;" class="mt-5"  :min="1" :max="1" placeholder="Тоо ширхэг"></el-input-number>
                </el-col>
                <el-col :xs="24" :sm="24" :md="11" :lg="10" :xl="10">
                    <el-input placeholder="Тайлбар" v-model="i.description" class="mt-5"  clearable> </el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="11" :lg="2" :xl="2">
                    <el-button type="danger" style="width: 100%;" class="mt-5" icon="el-icon-delete" @click="removeRow(index)" plain></el-button>
                </el-col>
            </el-row>
        </div>
        <div class="mt-10">
            <el-button type="primary" icon="el-icon-plus" @click="addRow" plain size="mini"></el-button>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button @click="modals.rma = false">Болих</el-button>
            <el-button type="primary" @click="addRmaProduct">Хадгалах</el-button>
        </span>
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
			activeTab: 'shops',
			dataTimeRange: null,
			search: '',
			gridData: [],
			product: [],
			loading: false,
			LoggedUser: '',
            modals: {
                rma: false
            },
            addProducts: [{
                model: '',
                qty: 1,
                description: ''
            }],
            search: '',
			location: [],
			rma: [],
			rmaWhole: [],
			checktime: '',
			cities: [],
			counts: [],
			brand: [],
			shopname: 'Тодорхойгүй',
			countWhole: []
		}
	},
	methods: {
		getCount(store) {
			var name = 0;
			this.counts.forEach(element => {
				if(element.storeId == store) {
					name = element.qty;
				}
			});
			return name;
		},
		getCountWhole(store) {
			var name = 0;
			this.countWhole.forEach(element => {
				if(element.userId == store) {
					name = element.qty;
				}
			});
			return name;
		},
		deleteRma(id) {
			this.$confirm('Устгахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				var rts = this;
				this.loading = true;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/delete-rma-product`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							id
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `RMA амжилттай устлаа`,
                                type: 'success'
                            });
							// rts.getOrders();
							rts.rma.forEach((el, index) => {
								if(el.rmaId == id) {
									rts.rma.splice(index, 1);
								}
							});
						}
						
					}).catch(error => {
						rts.loading = false;
						console.log(error);
					});
				}
			});
		},
		sendToRma(id) {
			this.$confirm('Илгээхдээ итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				var rts = this;
				this.loading = true;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/sent-rma-product`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							id
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `RMA амжилттай илгээгдлээ`,
                                type: 'success'
                            });
							// rts.getOrders();
							rts.rma.forEach((el, index) => {
								if(el.rmaId == id) {
									rts.rma[index].sent = 1;
								}
							});
						} else if(data.data.result == 'nottime') {
							rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `Цагаа бүртгүүлнэ үү`,
                                type: 'error'
                            });
						} else if(data.data.result == 'notFixed'){
							rts.$confirm('Уучлаарай танай тасгийн <strong>өмнө илгээсэн</strong> буцаалтын бараа шийдэгдээгүй байна. Няравтай холбогдоно уу!', 'Амжилтгүй', {
								confirmButtonText: 'Ойлголоо',
								cancelButtonText: 'Болих',
								dangerouslyUseHTMLString: true,
								type: 'warning',
								center: true
							});
						}
						
					}).catch(error => {
						rts.loading = false;
						console.log(error);
					});
				}
			});
		},
		getName(item) {
			var check = false;
			this.location.forEach(element => {
				if(element.code == item.storeId) {
					check = true;
				}
			});
			return check;
		},
		filterRma(item) {
			var s;
			item.forEach(element => {
				s = '';
				this.location.forEach(el => {
					if(el.code == element.storeId) {
						s = element.name;
					}
				});
				if(s == '') {
					this.rmaWhole.push(element);
				} else {
					this.rma.push(element);
				}
			});
		},
        searchStore(code) {
            var s = '';
            this.location.forEach(element => {
				if(element.code == code) {
					s = element.name;
				}
			});
			if(s == '') {
				this.cities.forEach(element => {
					if(element.id == code) {
						s = element.city;
					}
				});
				return s;
			} else {
				return s;
			}
        },
        addRmaProduct() {
            if(this.addProducts.length > 0) {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/add-rma-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            products: this.addProducts
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `Бүтээгдэхүүн бүртгэгдлээ`,
                                type: 'info'
                            });
                            rts.getOrders();
                        } else if(data.data.result == 'failed') {
                            rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${data.data.model}</strong> бүтээгдэхүүн олдсонгүй`,
                                type: 'error'
                            });
                        } else if(data.data.result == 'nottime') {
                            rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `Цагаа бүртгүүлнэ үү`,
                                type: 'error'
                            });
                        } else if(data.data.result == 'limited') {
							rts.$confirm('Уучлаарай бүртгэгдсэн rma-ны <strong>нийт дүн</strong> энэ сарын борлуулалтын 5%-аас хэтэрсэн байна.', 'Амжилтгүй', {
								confirmButtonText: 'Ойлголоо',
								cancelButtonText: 'Болих',
								dangerouslyUseHTMLString: true,
								type: 'warning',
								center: true
							}).catch(() => {
								rts.modals.rma = false;
							});
                        }
                        
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            }
        },
        addRow() {
            this.addProducts.push({model: '',qty: 1,description: ''});
        },
        removeRow(index) {
            this.addProducts.splice(index, 1);
        },
		goOrder(item) {
			var s = false;
            this.location.forEach(element => {
				if(element.code == item.storeId) {
					s = true;
				}
			});
			console.log(item);
			if(s) {
				this.$router.push({name:'rma-product', params: {id: item.storeId, type: 1}})
			} else {
				this.$router.push({name:'rma-product', params: {id: item.userId, type: 2}})
			}
		},
		getOrders() {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-rma-product`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.location = data.data.location;

						rts.rma = data.data.rma;
						rts.rmaWhole = data.data.rmaWhole;
						rts.cities = data.data.cities;
						rts.counts = data.data.count;
						rts.countWhole = data.data.countWhole;
						rts.brand = data.data.brand;
						rts.shopname = data.data.address;
					} else if(data.data.result == 'nottime') {
						rts.checktime = data.data.result;
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		}
	},
	mounted() {
		this.LoggedUser = JSON.parse(localStorage.getItem('user'));
		this.getOrders();
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


