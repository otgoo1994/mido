<template>
	<div class="scrollable" v-loading.fullscreen.lock="loading">
		<div class="page-ecommerce-orders flex column">
			<div class="page-header">
				<div class="flex justify-space-between">
					<el-breadcrumb separator="/" class="mb-10">
						<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
						<el-breadcrumb-item>Тайлангийн жагсаалт</el-breadcrumb-item>
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
							<th>Ажилтан</th>
							<th>Үүсгэсэн огноо</th>
							<th>Салбар</th>
							<th>Нийт</th>
							<th>Төлөв</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in invoices" :key="item.id" :style="{'cursor': 'pointer'}" @click="goOrder(item.id)">
							<td>
								<div class="item-box item-product">
									<div class="product-image">
										<el-avatar :size="40" :src="$appUrl+'/images/local/user/'+item.img">
											<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
										</el-avatar>
									</div>
									<div>
										<h4 class="m-0">{{item.name}}</h4>
										<p class="m-0">{{item.phone}}</p>
									</div>
								</div>
							</td>
							<td>
								<div class="item-box item-customer">
									<h4 class="m-0 o-080">{{item.date}}</h4>
									<!-- <p class="m-0"><a>{{item.created_at}}</a></p> -->
								</div>
							</td>
							<td>
								<div class="item-box item-location">
									<!-- <h4 class="m-0 mb-5">{{item.address}}</h4> -->
									<p class="m-0 o-060">{{item.storename}}</p>
								</div>
							</td>
							<td>
								<div class="item-box item-location">
									<!-- <h4 class="m-0 mb-5">{{item.address}}</h4> -->
									<p class="m-0 o-060">₮{{Number(item.total).toLocaleString()}}</p>
								</div>
							</td>
							
							<td style="max-width: 150px;">
								<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Pending': item.stat == 0, 'status-Complete': item.stat == 1}">
									<h4 class="m-0 mb-5" v-if="item.stat == 0">Шивэгдээгүй</h4>
									<h4 class="m-0 mb-5" v-else-if="item.stat == 1">Шивэгдсэн</h4>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<el-dialog title="Кассын тайлан илгээх" :visible.sync="modals.newReport" width="30%">
			<el-select v-model="newReport.store" placeholder="Салбараа сонгоно уу" style="width: 100%;">
				<el-option v-for="(item, index) in store" :key="index" :label="item.address_name" :value="item.address"></el-option>
			</el-select>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.newReport = false">Болих</el-button>
				<el-button type="primary" @click="showDetailForm">Үргэлжлүүлэх</el-button>
			</span>
		</el-dialog>
		<el-dialog title="Кассын тайлан илгээх" :visible.sync="modals.newReportDetail" width="50%">
			<el-row class="items" :gutter="20">
				<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mt-20">
					<strong>Нийт борлуулалтын дүн</strong>
					<el-input-number v-model="newReport.totalAmount" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" class="mt-20">
					<strong>Тайлангийн огноо</strong>
					<el-date-picker v-model="newReport.date" type="date" placeholder="yyyy-mm-dd" style="width: 100%; margin-top: 5px;" clearable></el-date-picker>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Карт / ПОС</strong>
					<el-input-number v-model="newReport.card" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Шилжүүлэг / Мобайл</strong>
					<el-input-number v-model="newReport.mobile" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Qpay</strong>
					<el-input-number v-model="newReport.qpay" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Candy</strong>
					<el-input-number v-model="newReport.candy" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Нэхэмжлэх</strong>
					<el-input-number v-model="newReport.invoice" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Хямдралын дүн</strong>
					<el-input-number v-model="newReport.discount" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Буцаалтын дүн</strong>
					<el-input-number v-model="newReport.deleted" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Бэлэн тушаасан</strong>
					<el-input-number v-model="newReport.belenTushaasan" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Харилцахад тушаасан</strong>
					<el-input-number v-model="newReport.toCommunicate" :min="0" style="width: 100%; margin-top: 5px;"></el-input-number>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Үлдэгдэл</strong>
					<!-- <p style="width: 100%; margin-top: 5px;">{{Number(totalCash).toLocaleString()}}</p> -->
					<el-input v-model="totalCash" :disabled="true" style="width: 100%; margin-top: 5px;"> </el-input>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Кассын илүүдэл</strong>
					<el-input v-model="more" :disabled="true" style="width: 100%; margin-top: 5px;"> </el-input>
				</el-col>
				<el-col :xs="24" :sm="24" :md="12" :lg="8" :xl="6" class="mt-20">
					<strong>Кассын дутагдал</strong>
					<el-input v-model="miss" :disabled="true" style="width: 100%; margin-top: 5px;"> </el-input>
				</el-col>
			</el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.newReportDetail = false">Болих</el-button>
				<el-button type="primary" @click="SendToReport">Илгээх</el-button>
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
			dataTimeRange: null,
			search: '',
			gridData: [],
			invoices: [],
			loading: false,
			store: [],
			modals: {
				newReport: false,
				newReportDetail: false
			},
			newReport: {
				store: '',
				totalAmount: 0,
				date: null,
				card: 0,
				mobile: 0,
				qpay: 0,
				candy: 0,
				invoice: 0,
				discount: 0,
				deleted: 0,
				toCommunicate: 0,
				belenTushaasan: 0,
				uld: 0,
				more: 0,
				miss: 0
			}
		}
	},
	computed: {
		miss() {
			var a = this.newReport;
			var total = a.totalAmount - a.card - a.mobile - a.qpay - a.candy - a.invoice - a.deleted - a.discount - a.belenTushaasan;
			var miss = total - this.newReport.toCommunicate;
			if(miss < 0) {
				this.newReport.miss = 0;
				return 0;
			} else {
				this.newReport.miss = miss;
				return miss;
			}
		},
		more() {
			var a = this.newReport;
			var total = a.totalAmount - a.card - a.mobile - a.qpay - a.candy - a.invoice - a.deleted - a.discount - a.belenTushaasan;
			var miss = total - this.newReport.toCommunicate;
			if(miss < 0) {
				this.newReport.more = miss * -1;
				return miss * -1;
			} else {
				this.newReport.more = 0;
				return 0;
			}
		},
		totalCash() {
			this.store.forEach(el => {
				if(el.address == this.newReport.store) {
					this.newReport.uld = el.cash_miss;
				}
			});
			var a = this.newReport;
			var total = a.totalAmount - a.card - a.mobile - a.qpay - a.candy - a.invoice - a.deleted - a.discount - a.belenTushaasan;
			var miss = total - this.newReport.toCommunicate;
			if(miss < 0) {
				this.newReport.uld = this.newReport.uld - (miss  * -1);
				return this.newReport.uld;
			} else {
				this.newReport.uld = this.newReport.uld + miss;
				return this.newReport.uld;
			}
		},
	},
	methods: {
		SendToReport() {
			var a = this.newReport;
			if(a.totalAmount == undefined || a.card == undefined || a.mobile == undefined || a.qpay == undefined || a.candy == undefined || a.belenTushaasan == undefined || a.invoice == undefined || a.deleted == undefined || a.discount == undefined || a.toCommunicate == undefined || a.date == null) {
				this.$notify({
                    title: 'Амжилтгүй',
                    message: `Талбараа бүрэн бөглөнө үү`,
                    type: 'error'
                });
			} else {
				var old_uld = 0;
				this.store.forEach(el => {
					if(el.address == this.newReport.store) {
						old_uld = el.cash_miss;
					}
				});
				var rts = this;
				this.loading = true;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/invoice/add-cash-report`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							report: a,
							old_uld
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: `Тайлан илгээгдлээ`,
								type: 'success'
							});
							rts.modals.newReportDetail = false;
						} else if(data.data.result == 'registered') {
							rts.$notify({
								title: 'Амжилтгүй',
								message: `Тайлан илгээгдсэн байна`,
								type: 'error'
							});
						} else if(data.data.result == 'noPlan') {
							rts.$notify({
								title: 'Амжилтгүй',
								message: `Тухайн өдөр танд ажлын төлөвлөгөө байхгүй байна`,
								type: 'error'
							});
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
		addReport() {
			if(this.store.length > 0) {
				this.modals.newReport = true;
			} else {
				this.$notify({
                    title: 'Амжилтгүй',
                    message: `Сүүлийн 5 өдөр танд цаг бүртгэгдээгүй байна`,
                    type: 'error'
                });
			}
		},
		goOrder(id) {
			this.$router.push({name:'report', params: {id: id}})
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
					url: rts.$appUrl +`/api/invoice/get-reports`,
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
						rts.invoices = data.data.invoices;
						rts.store = data.data.locations;
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


