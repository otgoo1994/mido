<template>
	<div class="page-ecommerce-checkout scrollable">
		
		<el-breadcrumb separator="/" class="mb-20">
			<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/movements' }">Дотоод хөдөлгөөн</el-breadcrumb-item>
			<el-breadcrumb-item>{{order.ordernumber}}</el-breadcrumb-item>
		</el-breadcrumb>
		<div class="widget shipping card-shadow--small b-rad-4">
			<div class="content">
				<div class="flex justify-space-between">
					<div class="box grow flex column mt-40 fs-20 info widget shipping card-shadow--small b-rad-4" :style="{'position': 'relative'}">
                        <div class="title"> Захиалга өгсөн </div>
						<div class="mb-5"><i class="mdi mdi-account mr-10"></i>{{order.detail.name}}</div>
						<div class="mb-5"><i class="mdi mdi-map-marker mr-10"></i>{{getLocation(order.detail.to_where)}}</div>
						<div><i class="mdi mdi-phone mr-10"></i>{{order.detail.phone}}</div>
                        <div :style="{'position': 'absolute', 'right': '5%', 'top': '35%'}">
                            <el-avatar v-if="order.detail.img != undefined" :size="50" :src="$appUrl+'/images/local/user/'+order.detail.img">
								<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
							</el-avatar>
                        </div>
					</div>

                    <div class="box grow flex column mt-40 fs-20 info widget shipping card-shadow--small b-rad-4" :style="{'position': 'relative'}">
                        <div class="title"> Зөвшөөрсөн </div>
						<div class="mb-5"><i class="mdi mdi-account mr-10"></i>{{order.confirmed.name}}</div>
						<div class="mb-5"><i class="mdi mdi-map-marker mr-10"></i>{{getLocation(order.detail.from_where)}}</div>
						<div><i class="mdi mdi-phone mr-10"></i>{{order.confirmed.phone}}</div>
                        <div :style="{'position': 'absolute', 'right': '5%', 'top': '35%'}">
                            <el-avatar v-if="order.detail.img != undefined" :size="50" :src="$appUrl+'/images/local/user/'+order.confirmed.img">
								<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
							</el-avatar>
                        </div>
					</div>

                    <div class="box grow flex column mt-40 fs-20 info widget shipping card-shadow--small b-rad-4" :style="{'position': 'relative'}">
                        <div class="title"> Хүлээж авсан </div>
						<div class="mb-5"><i class="mdi mdi-account mr-10"></i>{{order.received.name}}</div>
						<div class="mb-5"><i class="mdi mdi-map-marker mr-10"></i>{{getLocation(order.detail.to_where)}}</div>
						<div><i class="mdi mdi-phone mr-10"></i>{{order.received.phone}}</div>
                        <div :style="{'position': 'absolute', 'right': '5%', 'top': '35%'}">
                            <el-avatar v-if="order.detail.img != undefined" :size="50" :src="$appUrl+'/images/local/user/'+order.received.img">
								<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
							</el-avatar>
                        </div>
					</div>
				</div>
			</div>
		</div>

		<div class="widget review card-shadow--small b-rad-4">
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
									<el-input-number v-if="(order.detail.to_where == LoggedUserCurrentShop || order.detail.from_where == LoggedUserCurrentShop) && order.detail.stat == 'send'" v-model="i.quantity" :style="{'width': '100px'}" controls-position="right" :min="1" :max="i[order.detail.from_where]" class="mr-5"></el-input-number>
									<span v-else>{{Number(i.quantity).toLocaleString()}}</span>
									 x ₮ {{Number(i.sale_price).toLocaleString()}} = <strong>₮ {{Number(i.sale_price * i.quantity).toLocaleString()}}</strong></div>
							</div>
						</div> 
					</el-col>
				</el-row>
			</div>
		</div>
	
		<div class="widget payment card-shadow--small b-rad-4">
			<div class="title">
				Нэмэлт мэдээлэл
			</div>
			<div class="content">
				<div class="flex justify-space-between">
					<div class="box grow mt-40 pr-30 info">
						<h3 class="m-0 mb-10">Захиалгын утга</h3>
						<p>{{order.detail.move_value}}</p>
					</div>

					<div class="box grow mt-40 total">
						<div class="t-row">
							<div class="label">Захиалгын дугаар</div>
							<div class="value">{{order.ordernumber}}</div>
						</div>
                        <div class="t-row">
							<div class="label">Төлөв</div>
							<div class="value" v-if="order.detail.stat == 'send'">Захиалагдсан</div>
                            <div class="value" v-if="order.detail.stat == 'confirmed'">Зөвшөөрөгдсөн</div>
                            <div class="value" v-if="order.detail.stat == 'received'">Хүлээж авсан</div>
                            <div class="value" v-if="order.detail.stat == 'disabled'">Татгалзсан</div>
						</div>
						<div class="t-row">
							<div class="label">Нийт</div>
							<div class="value">₮ {{amount_text}}</div>
						</div>
                        
                        <el-button type="primary" @click="wroteMovement" v-if="order.detail.stat == 'received' && (LoggedUser.posID == 1 || LoggedUser.posID == 2)" size="small" plain>Шивсэн гэж тэмдэглэх</el-button><br>
						<el-button type="primary" @click="confirmMovement" v-if="order.detail.from_where == LoggedUserCurrentShop && order.detail.stat == 'send'" size="small" plain>Зөвшөөрөх</el-button><br>
                        <el-button type="danger" @click="disableMovement"  v-if="(order.detail.from_where == LoggedUserCurrentShop || order.detail.to_where == LoggedUserCurrentShop) && order.detail.stat == 'send'" size="small" plain>Цуцлах</el-button>
                        <el-button type="danger" @click="receiveMovement" v-if="order.detail.to_where == LoggedUserCurrentShop && order.detail.stat == 'confirmed'" size="confirmed" plain>Хүлээж авах</el-button>
					</div>
				</div>
			</div>

			<div class="mt-40 small-info">
				<h3 class="m-0 mb-10">Захиалгын утга</h3>
				<p>{{order.detail.order_value}}</p>
			</div>
		</div>
	
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
                confirmed: [],
                received: []
            },
            location: [],
            LoggedUserCurrentShop: ''
		}
	},
    computed:{
		amount() {
			return _.reduce(this.order.product, (sum, obj) => sum + (obj.sale_price * obj.quantity), 0)
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
      	if (this.order.product.length > 0 && this.order.detail.stat == 'send') {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/change-movement-qty`,
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
    },
	methods: {
        wroteMovement() {
            var rts = this;
			this.$confirm('Шивсэн болгохдоо итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/wrote-movement`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            ordernumber: this.order.ordernumber
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.$notify({
								title: 'Амжилттай',								
								message: `Амжилттай шивлээ`,
								type: 'success'
						    });
                            rts.$router.push('/movements');
                        } else {
                            rts.$router.push({name:'not-found'});
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
			})
        },
        disableMovement() {
            var rts = this;
			this.$confirm('Энэ захиалгыг цуцлахдаа итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/order/disable-movement`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        }, 
                        data: {
                            ordernumber: this.order.ordernumber
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.$notify({
								title: 'Амжилттай',								
								message: `Амжилттай цуцлагдлаа`,
								type: 'success'
						    });
                            rts.$router.push('/movements');
                        } else if(data.data.result == 'time'){
                            rts.$router.push('/movements');
                        } else if(data.data.result == 'notfound') {
                            rts.$router.push({name:'not-found'});
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
			})
        },
        receiveMovement() {
            var rts = this;
			this.$confirm('Хүлээж авсан болгохдоо итгэлтэй байна уу?', 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Болих',
			type: 'warning'
			}).then(() => {
				const token = localStorage.getItem('token');
				if(token) {
					rts.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/received-movement`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							ordernumber: rts.order.ordernumber,
							detail: this.order.detail,
							product: this.order.product
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',								
								message: `Амжилттай хүлээж авлаа`,
								type: 'success'
							});
						    rts.getOrder();
						}
					}).catch(error => {
						console.log(error);
					});
				}
			})
        },
        confirmMovement() {
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
						url: rts.$appUrl +`/api/order/change-movement-qty`,
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
								url: rts.$appUrl +`/api/order/confirm-movement`,
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
										message: `Амжилттай баталгаажлаа`,
										type: 'success'
									});
									rts.getOrder();
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
        getLocation(store) {
            var l; 
            this.location.forEach(e => {
                if(store == e.code) {
                    l = e.name;
                }
            });
            return l;
        },
        getOrder() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-current-movement`,
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
						rts.order.detail = data.data.movement;
                        rts.order.confirmed = data.data.cEmp;
                        rts.order.received = data.data.rEmp;
                        rts.order.product = data.data.product;
                        rts.location = data.data.location;
                        rts.LoggedUserCurrentShop = data.data.shop;
					} else if(data.data.result == 'time'){
                        rts.$router.push('/movements');
                    } else if(data.data.result == 'notfound') {
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


