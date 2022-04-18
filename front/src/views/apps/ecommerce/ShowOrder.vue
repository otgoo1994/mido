<template>
	<div class="page-ecommerce-checkout scrollable" v-loading.fullscreen.lock="loading">
		<el-breadcrumb separator="/" class="mb-20 hide-on-print">
			<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/orders' }">Агуулахын захиалга</el-breadcrumb-item>
			<el-breadcrumb-item>{{order.ordernumber}}</el-breadcrumb-item>
		</el-breadcrumb>

		<div class="widget shipping card-shadow--small b-rad-4 hide-on-print">
			<div class="title">
				Захиалгын дэлгэрэнгүй
			</div>
			<div class="content">
				<div class="flex justify-space-between">
					<div class="box grow flex column mt-40 fs-20 info" :style="{'position': 'relative'}">
						<div class="mb-5"><i class="mdi mdi-account mr-10"></i>{{order.detail.name}}</div>
						<div class="mb-5"><i class="mdi mdi-map-marker mr-10"></i>{{order.detail.shop}}</div>
						<div><i class="mdi mdi-phone mr-10"></i>{{order.detail.phone}}</div>
                        <div :style="{'position': 'absolute', 'right': '5%', 'top': '25%'}">
                            <el-avatar v-if="order.detail.img != undefined" :size="80" :src="$appUrl+'/images/local/user/'+order.detail.img">
								<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
							</el-avatar>
                        </div>
					</div>

					<div class="box grow flex mt-40 fs-20 type align-center justify-center">
						<div class="box grow type-btn text-center ml-10 mt-5" v-if="order.detail.stat == 1">
							<div><i class="mdi mdi-truck mb-10 fs-30"></i></div>
							<div><span>Захиалгагдсан</span></div>
						</div>
                        <div class="box grow type-btn-success text-center ml-10 mt-5" v-if="order.detail.stat == 2">
							<div><i class="mdi mdi-briefcase-check mb-10 fs-30"></i></div>
							<div><span>Зөвшөөрөгдсөн</span></div>
						</div>
                        <div class="box grow type-btn-error text-center ml-10 mt-5" v-if="order.detail.stat == 3">
							<div><i class="mdi mdi-door-closed-lock mb-10 fs-30"></i></div>
							<div><span>Цуцлагдсан</span></div>
						</div>
						<div class="box grow type-btn-error text-center ml-10 mt-5" v-if="(LoggedUser.posID == 6 || LoggedUser.posID == 4) && order.detail.paid == false">
							<div><i class="mdi mdi-credit-card-minus mb-10 fs-30"></i></div>
							<div><span>UNPAID</span></div>
						</div>
						<div class="box grow type-btn-success text-center ml-10 mt-5" v-else-if="(LoggedUser.posID == 6 || LoggedUser.posID == 4) && order.detail.paid == true">
							<div><i class="mdi mdi-credit-card-check-outline mb-10 fs-30"></i></div>
							<div><span>PAID</span></div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<div class="widget review card-shadow--small b-rad-4 hide-on-print">
			<div class="title">
				Бүтээгдэхүүн ({{order.product.length}})
			</div>
			<div class="content">
				<el-row class="items mt-40" :gutter="20">
					<el-col v-for="i in order.product" :key="i.id" :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
						<div class="item mb-20 flex">
							<div class="photo">
								<img :src="$imgUrl+i.image">
							</div>
							<div class="box grow flex column justify-center">
								<div class="product-name">{{i.name}} <strong>{{i.model}}</strong></div>
								<div class="price">
									<el-input-number class="mr-5" v-if="order.detail.stat == 1 && i.posID < 6" v-model="i.quantity" :style="{'width': '100px'}" controls-position="right" :min="1" :max="i.remain"></el-input-number>
									<el-input-number class="mr-5" v-if="order.detail.stat == 1 && i.posID == 6" v-model="i.quantity" :style="{'width': '100px'}" controls-position="right" :min="1" :max="i.total"></el-input-number>
									<span v-else>{{Number(i.quantity).toLocaleString()}}</span>
									 x ₮ {{Number(i.wholesale_price).toLocaleString()}} = <strong>₮ {{Number(i.wholesale_price * i.quantity).toLocaleString()}}</strong></div>
							</div>
						</div> 
					</el-col>
				</el-row>
			</div>
		</div>
	
		<div class="widget payment card-shadow--small b-rad-4 hide-on-print">
			<div class="title">
				Нэмэлт мэдээлэл
			</div>
			<div class="content">
				<div class="flex justify-space-between">
					<div class="box grow mt-40 pr-30 info">
						<h3 class="m-0 mb-10">Захиалгын утга</h3>
						<p>{{order.detail.order_value}}</p>
					</div>

					<div class="box grow mt-40 total">
						<div class="t-row">
							<div class="label">Захиалгын дугаар</div>
							<div class="value">{{order.ordernumber}}</div>
						</div>
						<div class="t-row">
							<div class="label">Нийт</div>
							<div class="value">₮ {{amount_text}}</div>
						</div>
						<el-button type="primary" @click="confirmOrder" v-if="order.detail.stat == 1 && (LoggedUser.posID == 1 || LoggedUser.posID == 2) && order.detail.posID != 6" size="small" plain>Баталгаажуулах</el-button>
						<el-button type="primary" @click="confirmOrder" v-else-if="order.detail.stat == 1 && order.detail.posID == 6 && LoggedUser.posID == 4" size="small" plain>Баталгаажуулах</el-button><br>
                        <el-button type="danger" @click="disableOrder" v-if="order.detail.stat == 1 && (LoggedUser.posID == 1 || LoggedUser.posID == 2 || order.detail.user_id == LoggedUser.id)" size="small" plain>Цуцлах</el-button>
						<el-button type="danger" @click="disableOrder" v-else-if="order.detail.stat == 1 && ((order.detail.posID == 6 && LoggedUser.posID == 4) || order.detail.user_id == LoggedUser.id)" size="small" plain>Цуцлах</el-button>
						<el-button type="info" @click="showQpay" v-else-if="order.detail.stat == 2 && LoggedUser.posID == 6 && order.detail.paid == false" size="small" plain>Төлбөр төлөх</el-button>
						<el-button type="info" @click="endOrder" v-if="order.detail.stat == 2 && order.detail.user_id == LoggedUser.id && order.detail.paid == true && order.detail.read_it == 'false'" size="small" plain>Хүлээж авах</el-button>
						<el-button type="danger" @click="disableOrder" v-if="order.detail.stat == 3 && order.detail.user_id == LoggedUser.id && order.detail.read_it == 'false'" size="small" plain>Устгах</el-button>
						<el-button type="primary" @click="print" v-if="order.detail.stat == 2 && (LoggedUser.posID == 1 || LoggedUser.posID == 2) && order.detail.posID != 6" size="small" plain>Хэвлэх</el-button>
					</div>
				</div>
			</div>

			<div class="mt-40 small-info hide-on-print">
				<h3 class="m-0 mb-10">Захиалгын утга</h3>
				<p>{{order.detail.order_value}}</p>
			</div>
		</div>
	<el-dialog title="Төлбөрийн мэдээлэл" :visible.sync="modals.pay" width="30%" align="center">
		<p style="font-size: 16px;">Та ухаалаг банкны аппликэйшн хэрэглэж<br> <strong>QPAY</strong> -ээр төлнө үү</p>
		<qrcode :text="order.detail.qrcode" align="center"></qrcode>
		<div class="mt-20">
            <div align="center" :style="{'font-size': '18px'}">Шилжүүлгийн мэдээлэл</div>
            <div align="center" style="padding-bottom: 30px;">
				<table>
					<tr>
						<td align="right" style="padding-right: 15px;">ГОЛОМТ БАНК: </td>
						<td><strong>1410002791</strong></td>
					</tr>
					<tr>
						<td align="right" style="padding-right: 15px;">ГҮЙЛГЭЭНИЙ УТГА: </td>
						<td><strong>{{order.ordernumber}}</strong></td>
					</tr>
					<tr>
						<td align="right" style="padding-right: 15px;">ХҮЛЭЭН АВАГЧ: </td>
						<td><strong>АЙ СИ БИ СИ ХХК</strong></td>
					</tr>
				</table>
                 <div class="mt-5"><span :style="{'font-weight': '700'}">АНХААРУУЛГА</span> Төлбөрийг дансанд шилжүүлсэн тохиолдолд <span :style="{'font-weight': '700'}">ажлын цагийн <br> 30-60 минутанд</span> шалгагдаж баталгаажих болно.</div>
            </div>
        </div>
	</el-dialog>

	<div class="show-on-print" style="padding-left: 2cm; padding-top: 1.5cm; padding-right: 1.5cm;">
		<div style="border: 2px solid grey; border-radius: 5px; padding: 5px; padding-bottom: 40px;">
			<table class="styled hover">
				<thead>
					<tr>
						<th>Бүтээгдэхүүн</th>
						<th>Т.ширхэг</th>
						<th>Үнэ</th>
						<th>Нийт</th>
					</tr>
				</thead>
				<tbody>
						<tr v-for="i in order.product" :key="i.id">
							<td width="100%">
								<div class="item-box item-product">
									<div>
										<p class="m-0"><strong>{{i.model}}</strong> {{i.name}}</p>
									</div>
								</div>
							</td>
							<td>
								<div class="item-box item-product">
									<div>
										<p class="m-0">{{Number(i.quantity).toLocaleString()}}</p>
									</div>
								</div>
							</td>
							<td>
								<div class="item-box item-product">
									<div>
										<p class="m-0">₮{{Number(i.wholesale_price).toLocaleString()}}</p>
									</div>
								</div>
							</td>
							<td>
								<div class="item-box item-product">
									<div>
										<p class="m-0">₮{{Number(i.quantity * i.wholesale_price).toLocaleString()}}</p>
									</div>
								</div>
							</td>
						</tr>	
						<tr>
							<td colspan="3"><strong>Нийт</strong></td>
							<td>₮{{amount_text}}</td>
						</tr>
						<tr>
							<td colspan="2" align="right"><strong>Захиалагч</strong></td>
							<td colspan="2">{{order.detail.name}}</td>
						</tr>
						<tr>
							<td colspan="2" align="right"><strong>Салбар</strong></td>
							<td colspan="2">{{order.detail.shop}}</td>
						</tr>
						<tr>
							<td colspan="2" align="right"><strong>Захиалгын дугаар</strong></td>
							<td colspan="2">{{order.ordernumber}}</td>
						</tr>
				</tbody>
			</table>
			<div class="col-md-12" style="margin-top: 50px; text-align: center;">
                Хүлээлгэн өгсөн: _______________<span style="margin-left: 20px;">Хүлээн авсан: _________________</span>
            </div>
		</div>
	</div>
	</div>
</template>

<script>
import moment from 'moment'
import Chance from 'chance'
const chance = new Chance()
import qrcode from 'vue-qrcode-component'
let checker = null;
export default {
	name: 'EcommerceCheckout',
	components: {
		qrcode
	},
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
			modals: {
				pay: false
			},
			loading: false
		}
	},
	beforeRouteUpdate (to, from, next) {
		clearInterval(checker);
		this.order.ordernumber = to.params.id;
		this.getOrder();
		next();
    },
    computed:{
		amount() {
			return _.reduce(this.order.product, (sum, obj) => sum + (obj.wholesale_price * obj.quantity), 0)
		},
		amount_text() {
			return Number(this.amount).toLocaleString();
		}
	},
    mounted() {
        this.order.ordernumber = this.$route.params.id;
        this.LoggedUser = JSON.parse(localStorage.getItem('user'));
        this.getOrder();
    },
	beforeRouteLeave (to, from , next) {
		clearInterval(checker);
		const token = localStorage.getItem('token');
		if(token) { 
			if (this.order.product.length > 0 && this.order.detail.stat == 1) {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/change-order-qty`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							product: this.order.product,
							ordernumber: this.order.ordernumber
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							next();
						}	
					}).catch(error => {
						console.log(error);
					});
				}
			} else {
				next();
			}
		} else {
			next();
		}
    },
	methods: {
		endOrder() {
			this.$confirm('Хүлээж авахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				var rts = this;
					const token = localStorage.getItem('token');
					if(token) {
						rts.$axios({
							method: 'post',
							url: rts.$appUrl +`/api/order/end-order`,
							headers: {
								"Authorization": `Bearer ${token}`
							}, 
							data: {
								ordernumber: rts.order.ordernumber,
								role: rts.LoggedUser.posID
							}
						})
						.then(function(data){
							if(data.data.result == 'success') {
								rts.order.detail.read_it = 'true';
								rts.$notify({
									title: 'Амжилттай',								
									message: `Хүлээж авлаа`,
									type: 'success'
								});
							}
						}).catch(error => {
							console.log(error);
						});
					}
			})
			
		},
		print() {
			window.print()
		},
		showQpay() {
			if(this.LoggedUser.posID == 6) {
				if(this.order.detail.qrcode == null) {
					var total = this.amount;
					var rts = this;
					const token = localStorage.getItem('token');
					if(token) {
						rts.$axios({
							method: 'post',
							url: rts.$appUrl +`/api/order/create-qpay-bill`,
							headers: {
								"Authorization": `Bearer ${token}`
							}, 
							data: {
								ordernumber: rts.order.ordernumber,
								user: rts.LoggedUser,
								total
							}
						})
						.then(function(data){
							console.log(data);
							if(data.data.result == 'success') {
								rts.order.detail.qrcode = data.data.qr;
								rts.order.detail.payment_id = data.data.payment;
								rts.modals.pay = true;
							}
						}).catch(error => {
							console.log(error);
						});
					}
				} else {
					this.modals.pay = true;
				}
			}
		},
		confirmOrder() {
			var rts = this;
			this.$confirm('Баталгаажуулахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				
				const token = localStorage.getItem('token');
				if(token) {
					rts.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/change-order-qty`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							product: rts.order.product,
							ordernumber: rts.order.ordernumber
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$axios({
								method: 'post',
								url: rts.$appUrl +`/api/order/confirm-order`,
								headers: {
									"Authorization": `Bearer ${token}`
								}, 
								data: {
									ordernumber: rts.order.ordernumber
								}
							})
							.then(function(data){
								if(data.data.result == 'success') {
									rts.order.detail.stat = 2;
									rts.$notify({
										title: 'Амжилттай',								
										message: `Амжилттай баталгаажлаа`,
										type: 'success'
									});
								}
							}).catch(error => {
								console.log(error);
							});
						}
					}).catch(error => {
						console.log(error);
					});
				}
			})
		},
		disableOrder() {
			var rts = this;
			this.$confirm('Энэ захиалгыг цуцлахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				
				const token = localStorage.getItem('token');
				if(token) {
					rts.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/disable-order`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							ordernumber: rts.order.ordernumber
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',								
								message: `Захиалга ажилттай цуцлагдлаа`,
								type: 'success'
							});
							rts.$router.push('/orders');
						}
					}).catch(error => {
						console.log(error);
					});
				}
			})
		},
        getOrder() {
            var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-current-order`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						ordernumber: this.order.ordernumber
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.order.detail = data.data.order;
                        rts.order.product = data.data.products;
						
						if(data.data.order.paid == false && rts.LoggedUser.posID > 4) {
							checker = setInterval(rts.usingChecker, 5000);
						}
					} else {
                        rts.$router.push({name:'not-found'});
                    }
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
        },
		usingChecker() {
			if(this.order.qrcode !== null) {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/check-qpay-bill`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							ordernumber: this.order.ordernumber
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							if(data.data.paid == true) {
								rts.$notify({
									title: 'Амжилттай',
									message: 'Төлбөр амжилттай төлөгдлөө',
									type: 'success',
									duration: 0
								});
								rts.order.detail.paid = true;
								clearInterval(checker);
							}
						}
					}).catch(error => {
						console.log(error);
					});
				}
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.show-on-print {
	display: none;
}
.hide-on-print {
	display: block;
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

@media print {
	.show-on-print {
		display: block;
	}

	.hide-on-print {
		display: none;
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


