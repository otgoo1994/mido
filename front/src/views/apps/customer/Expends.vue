<template>
	<div class="scrollable" v-loading.fullscreen.lock="loading">
		<div class="page-ecommerce-orders flex column">
			<div class="page-header">
				<div class="flex justify-space-between">
					<el-breadcrumb separator="/" class="mb-10">
						<el-breadcrumb-item :to="{ path: '/products' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
						<el-breadcrumb-item>Зарлагын хуулга</el-breadcrumb-item>
					</el-breadcrumb>
				</div>
			</div>
			<div class="card-base p-10 flex justify-space-between" align="center">
				<div>
					<el-date-picker @change="datePickerChanged" v-model="dataTimeRange" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
				</div>
			</div>
		</div>
        <div class="page-ecommerce-dashboard">
            <div class="card-base cart-oultine" v-if="dataTimeRange != null">
                <div v-if="expends.length > 0">
					<div v-for="(item, index) in expends" :key="index" style="padding: 30px;">
						<div style="background: rgba(45, 109, 211, 0.25); padding: 5px; color: black;">{{item.date}}</div>
						<el-row class="items mt-10">
							<el-col v-for="(i, index) in filter(item.number)" :key="index" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
									<div class="item mb-10 flex" v-bind:class="{'expend': i.state == 'expend', 'revenue': i.state == 'revenue'}">
										<div class="photo">
											<img v-if="i.type == 1" :src="$imgUrl+i.image">
											<img v-else :src="$appUrl+'/images/local/product/'+i.image">
										</div>
										<div class="box grow flex column justify-center">
											<div class="product-name">{{i.name}}</div>
											<div class="price">
												<strong>{{i.model}}</strong>
												<!-- <span>{{Number(i.qty).toLocaleString()}}</span>
												x ₮ {{Number(i.price).toLocaleString()}} = <strong>₮ {{Number(i.price * i.qty).toLocaleString()}}</strong> -->
											</div>
										</div>
										<div class="box grow flex column justify-center">
											<!-- <div class="product-name"><strong>{{i.order_number}}</strong></div> -->
											<div>
												<strong>₮{{Number(i.price).toLocaleString()}}</strong>
											</div>
										</div>
										<div class="box grow flex column justify-center">
											<!-- <div class="product-name"><strong>{{i.order_number}}</strong></div> -->
											<div>
												<strong>{{Number(i.qty).toLocaleString()}}</strong>
											</div>
										</div>
										<div class="box grow flex column justify-center">
											<!-- <div class="product-name"><strong>{{i.order_number}}</strong></div> -->
											<div>
												<strong>₮{{Number(i.qty * i.price).toLocaleString()}}</strong>
											</div>
										</div>
									</div> 
							</el-col>
						</el-row>
					</div>
				</div>
				<div v-else align="center" style="padding: 20px;">
					Сонгосон хугацаанд хуулга олдсонгүй
				</div>
            </div>
			<div class="card-base cart-oultine" v-else align="center" style="padding: 20px;">
				Огноо сонгоно уу...
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
			expends: [],
            products: [],
			revenueProducts: [],
			loading: false,
		}
	},
	computed: {
	},
	methods: {
		datePickerChanged(value) {
            this.expends = [];
            this.products = [];
			if(value != null) {
                this.getOrders(value);	
            }
		},
        filter(number) {
            var p = [];
            this.products.forEach(el => {
                if(el.reportNumber == number) {
                    p.push(el);
                }
            });
			this.revenueProducts.forEach(el => {
                if(el.revenueNumber == number) {
                    p.push(el);
                }
            });
            return p;
        },
		getOrders(datetime) {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-customer-expend`,
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
						rts.expends = [];
						var ex = [];
						data.data.expend.forEach(el => {
							var pst = {date: el.created_at, number: el.reportNumber, state: el.state, totalAmount: el.totalAmount, realDate: new Date(el.created_at)}
							ex.push(pst);
						});
                        data.data.revenue.forEach(el => {
							var pst = {date: el.created_at, number: el.revenueNumber, state: el.state, totalAmount: el.totalAmount, realDate: new Date(el.created_at)}
							ex.push(pst);
						});

						rts.expends = ex.sort((a, b) => b.realDate - a.realDate);
                        rts.products = [];
                        data.data.product1.forEach(element => {
                            rts.products.push(element);
                        });
                        data.data.product2.forEach(element => {
                            rts.products.push(element);
                        });
						rts.revenueProducts = [];
                        data.data.revenueproduct1.forEach(element => {
                            rts.revenueProducts.push(element);
                        });
                        data.data.revenueproduct2.forEach(element => {
                            rts.revenueProducts.push(element);
                        });
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		}
	},
	components: {
		Grid
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';


.items {
    .expend {
        background: transparentize(red, .92);
    }

    .revenue {
        background: transparentize(green, .92);
    }
	.item {
		box-sizing: border-box;

		.photo {
			width: 65px;
			padding: 5px;
			background: white;
			img {
				width: 70%;
				display: block;
			}
		}

		.box {
			padding-left: 10px;
			padding-right: 10px;

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

		.item-status {
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


