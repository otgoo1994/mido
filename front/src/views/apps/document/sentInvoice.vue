<template>
<div>
	<div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" class="mb-10">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item>Илгээсэн нэхэмжлэхийн жагсаалт</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
		</div>
		<div class="card-base p-10 flex justify-space-between" align="center">
			<div>
				<el-date-picker @change="datePickerChanged" v-model="dataTimeRange" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
			</div>
			<el-input
				placeholder="Нэхэмжлэхийн дугаар ..."
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
						<th>Ажилтан</th>
						<th>Илгээсэн</th>
						<th>Захиалгын дугаар</th>
                        <th>Төлөгч байгууллага</th>
                        <th>Нийт дүн</th>
						<th>Төлөв</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in invoices" :key="item.id" :style="{'cursor': 'pointer'}">
						<td @click="goOrder(item.invoice_number)">
							<div class="item-box item-product">
								<div class="product-image">
									<el-avatar :size="40" :src="$appUrl+'/images/local/user/'+item.img">
										<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
									</el-avatar>
								</div>
								<div>
									<h4 class="m-0">{{item.username}}</h4>
									<p class="m-0">{{item.userphone}}</p>
								</div>
							</div>
						</td>
						<td @click="goOrder(item.invoice_number)">
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.created_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</h4>
								<p class="m-0"><a>{{item.sentemail}}</a></p>
							</div>
						</td>
						<td @click="goOrder(item.invoice_number)">
							<div class="item-box item-location">
								<!-- <p class="m-0 o-060">{{item.invoice_number}}</p> -->
                                <h4 class="m-0 mb-5">{{item.invoice_number}}</h4>
							</div>
						</td>
                        <td @click="goOrder(item.invoice_number)">
							<div class="item-box item-location">
								<h4 class="m-0 mb-5">{{item.company}}</h4>
								<p class="m-0 o-060">{{item.phone}}</p>
							</div>
						</td>
                        <td @click="goOrder(item.invoice_number)">
							<div class="item-box item-location">
								<h4 class="m-0 mb-5">{{Number(item.total_amount).toLocaleString()}}</h4>
								<!-- <p class="m-0 o-060">{{item.phone}}</p> -->
							</div>
						</td>
						<td style="max-width: 150px;" @click="goOrder(item.invoice_number)">
							<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Pending': item.stat == 'false', 'status-Complete': item.stat == 'true', 'status-Returned': item.stat == 'half'}">
								<h4 class="m-0 mb-5" v-if="item.stat == 'false'">Хүлээгдэж байгаа</h4>
								<h4 class="m-0 mb-5" v-else-if="item.stat == 'true'">Төлөгдсөн</h4>
								<h4 class="m-0 mb-5" v-else-if="item.stat == 'half'">Дутуу төлөлт</h4>
								<p class="m-0 o-060">{{item.updated_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</p>
								<!-- <p class="m-0 o-060" v-else>-</p> -->
							</div>
						</td>
						<td>
							<el-dropdown trigger="click">
								<el-button type="danger" icon="el-icon-s-tools" size="small" circle></el-button>
								<el-dropdown-menu slot="dropdown" >
									<el-dropdown-item v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2" @click.native="writePrice(item.invoice_number)"><i class="el-icon-edit"></i> Дүн шивэх</el-dropdown-item>
									<el-dropdown-item divided @click.native="deleteInvoice(item.invoice_number)"><i class="el-icon-delete"></i> Устгах</el-dropdown-item>
								</el-dropdown-menu>
							</el-dropdown>
						</td>
					</tr>
				</tbody>
			</table>
        </div>
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
			invoices: [],
			loading: false,
			LoggedUser: ''
		}
	},
	methods: {
		deleteInvoice(invoiceNumber) {
			this.$confirm('Энэ нэхэмжлэхийг утсгахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/invoice/delete-invoice`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            invoiceNumber
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.invoices.forEach((el, index) => {
								if(el.invoice_number == invoiceNumber) {
									rts.invoices.splice(index, 1);
								}
							});
                            rts.$notify({
                                title: 'Амжилтай',
                                message: `Амжилттай устгагдлаа`,
                                type: 'success'
                            });
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
			})
		},
		writePrice(invoiceNumber) {
			this.$prompt('Шивэх үнийн дүнгээ оруулна уу', 'Нэхэмжлэхийн төлбөр', {
				confirmButtonText: 'Хадгалах',
				cancelButtonText: 'Болих',
				inputPattern: /[0-9]/,
				inputErrorMessage: 'Зөвхөн тоо оруулна уу'
			}).then(({ value }) => {
				var rts = this;
				this.loading = true;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/invoice/update-invoice-amount`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							invoiceNumber,
							amount: value
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.invoices.forEach((el, index) => {
								if(el.invoice_number == invoiceNumber) {
									rts.invoices[index].stat = data.data.stat;
								}
							});
							rts.$notify({
                                title: 'Амжилтай',
                                message: `Амжилттай шинэчлэгдлээ`,
                                type: 'success'
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
			this.$router.push({name:'invoice', params: {id: ordernumber}})
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
					url: rts.$appUrl +`/api/invoice/get-sent-invoice`,
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
						url: rts.$appUrl +`/api/invoice/search-invoice`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							ordernumber: this.search 
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.invoices = data.data.invoice;
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


