<template>
<div>
	<div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" class="mb-10">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item>Албан бичгийн жагсаалт</el-breadcrumb-item>
				</el-breadcrumb>
			</div>
		</div>
		<div class="card-base p-10 flex justify-space-between" align="center">
			<div>
				<el-date-picker @change="datePickerChanged" v-model="dataTimeRange" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
			</div>
			<el-input
				placeholder="Албан бичгийн дугаар ..."
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
						<th>Үүсгэсэн огноо</th>
						<th>Албан бичгийн дугаар</th>
                        <th>Хэнд/Тухай</th>
                        <th></th>
					</tr>
				</thead>
				<tbody>
					<tr v-for="item in Sorted" :key="item.id" :style="{'cursor': 'pointer'}">
						<td @click="goOrder(item.official_index)" width="20%">
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
						<td @click="goOrder(item.official_index)">
							<div class="item-box item-customer">
								<h4 class="m-0 o-080">{{item.created_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</h4>
								<!-- <p class="m-0"><a>{{item.created_at}}</a></p> -->
							</div>
						</td>
						<td @click="goOrder(item.official_index)">
							<div class="item-box item-location">
								<!-- <h4 class="m-0 mb-5">{{item.address}}</h4> -->
								<p class="m-0 o-060">{{item.official_index}}</p>
							</div>
						</td>
                        <td @click="goOrder(item.official_index)">
							<div class="item-box item-location">
								<h4 class="m-0 mb-5">{{item.receiver}}</h4>
								<p class="m-0 o-060">{{item.about}}</p>
							</div>
						</td>
                        <td>
							<div class="item-box item-location">
								<!-- <h4 class="m-0 mb-5">{{Number(item.total_amount).toLocaleString()}}</h4>
								<p class="m-0 o-060">{{item.phone}}</p> -->
                                <el-button @click="pin(item.official_index, item.pin_to)" icon="el-icon-star-on" v-if="item.pin_to == 1" circle></el-button>
                                <el-button @click="pin(item.official_index, item.pin_to)" icon="el-icon-star-off" v-else circle></el-button>
							</div>
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
            filtered: [],
			loading: false
		}
	},
    computed: {
        Sorted() {
			return _.orderBy(this.filtered, 'pin_to', 'desc');
		},
    },
	methods: {
        pin(index, pin) {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/offer/pin-to-official`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						official: index
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
                        
						if(pin == 1) {
							pin = 0;
						} else {
							pin = 1;
						}
                        rts.filtered.forEach((el, i) => {
                            if(el.official_index == index) {
                                el.pin_to = pin;
                            }
                        });

                        rts.invoices.forEach((el, i) => {
                            if(el.official_index == index) {
                                el.pin_to = pin;
                            }
                        });

						rts.$notify({
                            title: 'Амжилтай',
                            message: `Амжилттай шинэчлэгдлээ`,
                            type: 'success'
                        });

					} else {
                        rts.$notify({
                            title: 'Амжилтгүй',
                            message: `Уучлаарай танд энэ үйлдлийг хийх эрх байхгүй байна`,
                            type: 'error'
                        });
                    }
					
				}).catch(error => {
					console.log(error);
				});
			}
        },
		goOrder(ordernumber) {
			this.$router.push({name:'official', params: {id: ordernumber}})
		},
		datePickerChanged(value) {
			// this.getOrders(value);	
            if(value !== null) {
                var arr = [];
                var start = new Date(value[0]).toISOString();
                var end = new Date(value[1]).toISOString();
                this.invoices.forEach(el => {
                    if(el.created_at >= start && el.created_at <= end) {
                        arr.push(el);
                    }
                });
                this.filtered = [];
                this.filtered = arr;
            } else {
                this.filtered = [];
                this.filtered = this.invoices;
            }
            
		},
		getOrders(datetime) {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/offer/get-officials`,
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
						rts.invoices = data.data.officials;
                        rts.filtered = data.data.officials;
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		searchOrder() {
			if(this.search !== '') {
				var arr = [];
                this.invoices.forEach(el => {
                    if(el.official_index.includes(this.search)) {
                        arr.push(el);
                    }
                });
                this.filtered = [];
                this.filtered = arr;
			} else {
                this.filtered = [];
                this.filtered = this.invoices;
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
