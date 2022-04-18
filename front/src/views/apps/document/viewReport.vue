<template>
	<div class="page-ecommerce-checkout scrollable">
		<el-breadcrumb separator="/" class="mb-20">
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item :to="{ path: '/reports' }">Кассын тайлан</el-breadcrumb-item>
					<el-breadcrumb-item>{{order.ordernumber}}</el-breadcrumb-item>
				</el-breadcrumb>

		<div class="widget shipping card-shadow--small b-rad-4">
			<div class="title">
				Нэмэлт мэдээлэл
			</div>
			<div class="content">
				<div class="flex justify-space-between">
					<div class="box grow flex column mt-40 fs-20 info" :style="{'position': 'relative'}">
						<div class="mb-5"><i class="mdi mdi-account mr-10"></i>{{order.detail.name}}</div>
						<div class="mb-5"><i class="mdi mdi-map-marker mr-10"></i>{{order.detail.storename}}</div>
						<div><i class="mdi mdi-calendar mr-10"></i>{{order.detail.date}}</div>
                        <div :style="{'position': 'absolute', 'right': '5%', 'top': '25%'}">
                            <el-avatar v-if="order.detail.img != undefined" :size="80" :src="$appUrl+'/images/local/user/'+order.detail.img">
								<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
							</el-avatar>
                        </div>
					</div>

					<div class="box grow flex mt-40 fs-20 type align-center justify-center">
						<div class="box grow type-btn text-center" v-if="order.detail.stat == 1">
							<div><i class="mdi mdi-truck mb-10 fs-30"></i></div>
							<div><span>Шивэгдсэн</span></div>
						</div>
                        <div class="box grow type-btn-error text-center" v-if="order.detail.stat == 0">
							<div><i class="mdi mdi-door-closed-lock mb-10 fs-30"></i></div>
							<div><span>Шивэгдээгүй</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="widget review card-shadow--small b-rad-4">
			<div class="title">
				Тайлан
			</div>
			<div class="content">
				<el-row class="items mt-40" :gutter="20">
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
						<div class="table-responsive">
                            <table class="table table-bordered table-centered mb-0" id="table">
                                <tbody>
                                    <tr style="background: #ed5f2b; color: #fff;">
                                        <td width="70%">Нийт борлуулалт</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.total).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.total" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Карт / ПОС</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.terminal).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.terminal" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Шилжүүлэг / Мобайл</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.mobile).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.mobile" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Qpay</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.qpay).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.qpay" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Candy</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.candy).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.candy" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Нэхэмжлэх</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.invoice).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.invoice" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Хямдралын дүн</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.sale).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.sale" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Буцаалтын дүн</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.deleted).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.deleted" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr style="background: #5985de; color: #fff;">
                                        <td><strong>Эхний үлдэгдэл</strong></td>
                                        <th scope="row">{{Number(order.detail.belen).toLocaleString()}}</th>
										
                                    </tr>

                                    <tr>
                                        <td>Харилцахад тушаасан</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.hariltsahad_tushaasan).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.hariltsahad_tushaasan" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>

                                    <tr>
                                        <td>Бэлэн тушаасан</td>
                                        <th scope="row" v-if="!edit">{{Number(order.detail.belen_tushaasan).toLocaleString()}}</th>
										<th scope="row" v-else>
											<el-input-number size="small" v-model="order.detail.belen_tushaasan" style="width: 80%;" :min="0"></el-input-number>
										</th>
                                    </tr>
                                                    
                                    <tr>
                                        <td>Кассын илүүдэл</td>
                                        <!-- <th scope="row">{{Number(order.detail.iluu).toLocaleString()}}</th> -->
										<th scope="row">{{Number(more).toLocaleString()}}</th>
                                    </tr>

                                    <tr>
                                        <td>Касын дутагдал</td>
                                        <!-- <th scope="row">{{Number(order.detail.dutuu).toLocaleString()}}</th> -->
										<th scope="row">{{Number(miss).toLocaleString()}}</th>
                                    </tr>
									<tr style="background: #5985de; color: #fff;">
                                        <td><strong>Эцсийн үлдэгдэл</strong></td>
                                        <th scope="row">{{Number(LastUld).toLocaleString()}}</th>
										
                                    </tr>
                                </tbody>
                            </table>
                        </div>
					</el-col>
				</el-row>
			</div>
		</div>
        <div align="right">
            <el-card>
				<el-button v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2" :type="editType" @click="editPlan" plain size="small">{{editText}}</el-button>
                <el-button v-if="(LoggedUser.posID == 1 || LoggedUser.posID == 2) && order.detail.stat == 0" type="warning" plain size="small" @click="setStatReport">Шивсэн гэж тэмдэглэх</el-button>
            </el-card>
        </div>
	</div>
</template>

<script>
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
                product: []
            },
			edit: false,
			editText: 'Засварлах',
			editType: 'info',
			LastUld: 0
		}
	},
    computed:{
		amount() {
			return _.reduce(this.order.product, (sum, obj) => sum + (obj.sale_price * obj.quantity), 0)
		},
		amount_text() {
			return Number(this.amount).toLocaleString();
		},
		miss() {
			var a = this.order.detail;
				var total = a.total - a.terminal - a.mobile - a.qpay - a.candy - a.invoice - a.deleted - a.sale - a.belen_tushaasan;
				var miss = total - a.hariltsahad_tushaasan;
				if(miss < 0) {
					this.order.detail.dutuu = 0;
					this.LastUld = this.order.detail.belen + this.order.detail.dutuu - this.order.detail.iluu;
					return 0;
				} else {
					this.order.detail.dutuu = miss;
					this.LastUld = this.order.detail.belen + this.order.detail.dutuu - this.order.detail.iluu;
					return miss;
				}
		},
		more() {
			var a = this.order.detail;
			var total = a.total - a.terminal - a.mobile - a.qpay - a.candy - a.invoice - a.deleted - a.sale - a.belen_tushaasan;
			var miss = total - a.hariltsahad_tushaasan;
			if(miss < 0) {
				this.order.detail.iluu = miss * -1;
				this.LastUld = this.order.detail.belen + this.order.detail.dutuu - this.order.detail.iluu;
				return miss * -1;
			} else {
				this.order.detail.iluu = 0;
				this.LastUld = this.order.detail.belen + this.order.detail.dutuu - this.order.detail.iluu;
				return 0;
			}
		},
	},
    mounted() {
        this.order.ordernumber = this.$route.params.id;
        this.LoggedUser = JSON.parse(localStorage.getItem('user'));
        this.getOrder();
    },
	methods: {
		editPlan() {
			if(this.edit) {
				var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/invoice/update-report`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            reportNumber: this.order.ordernumber,
							report: this.order.detail
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.edit = false;
							rts.editText = 'Засварлах' 
							rts.editType = 'info';
                            rts.$notify({
                                title: 'Амжилтай',
                                message: `Амжилттай хадгалагдлаа`,
                                type: 'success'
                            });
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
			} else  {
				this.edit = true;
				this.editText = 'Хадгалах';
				this.editType = 'success';
			}
		},
        setStatReport() {
			if(this.edit) {
				this.$notify({
					title: 'Ажилтгүй',
					message: `Засвараа дуусгана уу`,
					type: 'error'
				});
			} else {
				this.$confirm('Шивсэн болгохдоо итгэлтэй байна уу?', 'Санамж', {
				confirmButtonText: 'Тийм',
				cancelButtonText: 'Болих',
				type: 'warning'
				}).then(() => {
					var rts = this;
					const token = localStorage.getItem('token');
					if(token) {
						this.$axios({
							method: 'post',
							url: rts.$appUrl +`/api/invoice/update-stat-report`,
							headers: {
								"Authorization": `Bearer ${token}`
							}, 
							data: {
								id: this.order.ordernumber,

							}
						})
						.then(function(data){
							if(data.data.result == 'success') {
								rts.order.detail.stat = 1;
								rts.$notify({
									title: 'Амжилтай',
									message: `Амжилттай шинэчлэгдлээ`,
									type: 'success'
								});
							} else {
								rts.$notify({
									title: 'Ажилтгүй',
									message: `Танд энэ эрх олгогдоогүй байна`,
									type: 'success'
								});
							}
						}).catch(error => {
							console.log(error);
						});
					}
				})
			}
            
        },
        getOrder() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/invoice/get-report`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						id: this.order.ordernumber
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						rts.order.detail = data.data.report;
					} else {
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

.table-bordered {
    width: 100%;
    tr td {
        padding: 8px;
    }
}

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
			font-size: 12px;
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
					border: 1px solid $text-color-accent;
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
					border: 1px solid #2dc20c;
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
					border: 1px solid #e64239;
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


