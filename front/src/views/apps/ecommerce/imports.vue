<template>
<div>
	<div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" class="mb-10">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item>Орлогын жагсаалт</el-breadcrumb-item>
				</el-breadcrumb>
				<el-button-group>
					<el-tooltip class="item" effect="dark" content="Шинэ захиалга үүсгэх" placement="top-end" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 4">
						<el-button type="danger" icon="el-icon-edit" size="mini" @click="$router.push('/import-edit');"></el-button>
					</el-tooltip>
				</el-button-group>
			</div>
		</div>
		<div class="card-base p-10 flex justify-space-between" align="center">
			<div>
				<el-date-picker @change="datePickerChanged" v-model="dataTimeRange" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
			</div>
			<el-input
				placeholder="Захиалгын дугаар ..."
				suffix-icon="el-icon-search"
				:style="{'width': '20%'}"
				@keyup.enter.native="searchOrder"
				v-model="search">
			</el-input>
		</div>
	</div>
	<div class="page-ecommerce-dashboard scrollable" :style="{'max-height': '87%'}">
		<div class="table-box card-base card-outline" :style="{'overflow': 'auto'}">
			<table class="styled striped hover">
				<thead>
					<tr>
						<th>Захиалга</th>
						<th>Үүсгэсэн огноо</th>
						<th>Захиалгын дугаар</th>
						<th>Төлөв</th>
						<th v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4"></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in orders" :key="item.id" :style="{'cursor': 'pointer'}">
						<td @click="goOrder(item.ordernumber)">
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.name}}</h4>
								<!-- <p class="m-0"><a>{{item.created_at}}</a></p> -->
							</div>
						</td>
						<td @click="goOrder(item.ordernumber)">
							<div class="item-box item-location">
								<p class="m-0 o-060">{{item.created_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</p>
							</div>
						</td>
						<td @click="goOrder(item.ordernumber)">
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.ordernumber}}</h4>
								<!-- <p class="m-0"><a>{{item.created_at}}</a></p> -->
							</div>
						</td>
						<td style="max-width: 150px;" @click="goOrder(item.ordernumber)">
							<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Pending': item.stat == 0, 'status-Complete': item.stat == 1}">
								<h4 class="m-0 mb-5" v-if="item.stat == 0">Хүлээгдэж байгаа</h4>
								<h4 class="m-0 mb-5" v-else-if="item.stat == 1">Ирсэн</h4>
								<p class="m-0 o-060" v-if="item.stat == 1">{{item.updated_at.split('T')[0]}}</p>
								<p class="m-0 o-060" v-else>-</p>
							</div>
						</td>
						<td v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
							<el-dropdown trigger="click">
								<el-button type="danger" icon="el-icon-s-tools" size="small" circle></el-button>
								<el-dropdown-menu slot="dropdown" >
									<el-dropdown-item @click.native="changeStatus(item)"><i class="el-icon-edit"></i>  Төлөв шинэчлэх</el-dropdown-item>
									<el-dropdown-item divided @click.native="deleteImport(item)"><i class="el-icon-delete"></i> Устгах</el-dropdown-item>
								</el-dropdown-menu>
							</el-dropdown>
						</td>
					</tr>
				</tbody>
			</table>
        </div>

		<el-dialog title="Төлөв өөрчлөх" :visible.sync="modals.changeStatus" width="30%">
			<el-select v-model="selectedStatus" placeholder="Төлвөө сонгоно уу" style="width: 100%;">
				<el-option
				v-for="(item, index) in status"
				:key="index"
				:label="item.label"
				:value="item.stat">
				</el-option>
			</el-select>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.changeStatus = false">Болих</el-button>
				<el-button type="primary" @click="saveChangedStatus">Хадгалах</el-button>
			</span>
		</el-dialog>
	</div>
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
			LoggedUser: [],
			status: [{
				label: 'Хүлээгдэж байгаа',
				stat: false
			},{
				label: 'Ирсэн',
				stat: true
			}],
			selectedStatus: false,
			selectedItem: [],
			modals: {
				changeStatus: false
			}
		}
	},
	methods: {
		saveChangedStatus() {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/change-import-status`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						ordernumber: this.selectedItem.ordernumber,
						status: this.selectedStatus
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.selectedItem.stat = rts.selectedStatus;
						rts.selectedItem.updated_at = data.data.dt;
						console.log(data.data.dt);
					}
						
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		changeStatus(item) {
			this.selectedItem = item;
			this.modals.changeStatus = true;
		},
		deleteImport(item) {
			this.$confirm(`<strong>${item.name}</strong> -г устгахдаа итгэлтэй байна уу?`, 'Санамж', {
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
						url: rts.$appUrl +`/api/order/delete-import`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							ordernumber: item.ordernumber
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.orders.forEach((el, index) => {
								if(el.ordernumber == item.ordernumber) {
									rts.orders.splice(index, 1);
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
		goOrder(ordernumber) {
			this.$router.push({name:'import', params: {id: ordernumber}})
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
					url: rts.$appUrl +`/api/order/get-imports`,
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
						rts.orders = data.data.imports;
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		searchOrder() {
			if(this.search !== '') {
				this.loading = true;
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/search-imports`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							search: this.search 
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.orders = data.data.imports;
						}
						
					}).catch(error => {
						rts.loading = false;
						console.log(error);
					});
				}
			}
		}
	},
	mounted() {
		this.LoggedUser = JSON.parse(localStorage.getItem('user'));
		this.getOrders(this.dataTimeRange);
	},
	components: {
		Grid
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.dialogWidth {
	width: 50%;
}
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


