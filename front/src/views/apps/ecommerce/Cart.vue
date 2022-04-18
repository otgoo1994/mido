<template>
	<div class="page-ecommerce-cart scrollable">
		
		<el-row class="cart-box" :gutter="20">
			
			<el-col :xs="24" :sm="16" :md="18" :lg="18" :xl="18">
				<el-row class="item-list">
					<el-col class="mb-20">
						<el-breadcrumb separator="/" class="mt-10 themed">
							<el-breadcrumb-item to="/products">Бүтээгдэхүүний жагсаалт</el-breadcrumb-item>
							<el-breadcrumb-item>Сагс</el-breadcrumb-item>
						</el-breadcrumb> 
					</el-col>
					<div v-if="product.length > 0">
						<el-col v-for="i in product" :key="i.id">
							<div class="item mb-20 flex card-shadow--small b-rad-4" :style="{'border-radius': '10px'}">
								<div class="photo">
									<router-link :to="'/product-detail/'+i.id">
										<img :src="$imgUrl + i.image" class="product-image">
									</router-link>
								</div>
								<div class="box grow flex column justify-center">
									<div class="product-name" style="font-size: 15px;">
											{{i.model}} <span class="o-080"><br>{{i.name}}</span>
										</div>
									<div class="price">₮ {{Number(i.wholesale_price).toLocaleString()}}</div>
								</div>
								<div class="box grow flex center text-center">
									<div>
										<span class="ics">X</span> 
										<el-input-number v-if="LoggedUser.posID < 6" v-model="i.quantity" controls-position="right" :min="1" :max="i[position]" class="themed ml-10"></el-input-number>
										<el-input-number v-else v-model="i.quantity" controls-position="right" :min="1" :max="i.total" class="themed ml-10"></el-input-number>
									</div>
								</div>
								<div class="box grow flex center text-center">
									<div v-if="LoggedUser.posID < 6">
										{{i[position]}}
									</div>
									<div v-else>
										{{i.total}}
									</div>
								</div>
								<div class="box grow flex align-center">
									<div class="text-right box grow">
										<button @click="removeProduct(i.id)" class="del-btn"><i class="mdi mdi-delete"></i></button>
									</div>
								</div>
							</div> 
						</el-col>
						<el-col>
							<div class="item mb-20 flex card-shadow--small b-rad-4" :style="{'border-radius': '10px'}">
								<el-input type="textarea" :rows="2" placeholder="Захиалгын утга (заавал биш)" v-model="orderValue"> </el-input>
							</div>
						</el-col>
					</div>
					<div v-else>
						<el-col>
							<div class="widget card-shadow--small b-rad-4 pt-100 pb-100" align="center" :style="{'border-radius': '10px'}">
								<img src="@/assets/images/cart.png" alt="">
								<div align="center" class="mt-10">
									ТАНЫ САГС ХООСОН БАЙНА
								</div>
							</div>
						</el-col>
					</div>
				</el-row>
			</el-col>

			<el-col :xs="24" :sm="8" :md="6" :lg="6" :xl="6">
				<div class="widget card-shadow--small b-rad-4 mt-43" :style="{'border-radius': '10px'}">
					<div class="title flex justify-space-between align-center">
						НИЙТ ДҮН
					</div>
					<div class="content">
						<div class="fs-30">₮ {{amount_text}}</div>
						<el-select v-model="selectedDirection" placeholder="Захиалгын төрөл" style="width: 100%;" class="mt-10" v-if="LoggedUser.posID !== 6">
							<el-option
							v-for="item in directions"
							:key="item.value"
							:label="item.label"
							:value="item.value">
							</el-option>
						</el-select>
						<el-select v-if="selectedDirection == 1 && LoggedUser.posID !== 6" v-model="currentPosition" @change="changePosition" filterable  placeholder="Салбар" style="width: 100%;" class="mt-10">
							<el-option
							v-for="item in positions"
							:key="item.code"
							:label="item.name"
							:value="item.code">
							</el-option>
						</el-select>
						<button @click="gotoCheckout" :disabled="product.length <= 0 || orderBtn == true">Захиалах</button>
					</div>
				</div>
				<div class="widget card-shadow--small b-rad-4" :style="{'border-radius': '10px'}">
					<div class="title flex justify-space-between align-center">
						Бүтээгдэхүүн нэмэх
					</div>
					<div class="content">
						<el-row class="items">
							<div>
								<el-input placeholder="Модель эсвэл нэр ..." v-model="search" @keydown.enter.native="searchProduct">
									<template slot="append">
										<a href="javascript:;" @click="searchProduct">
											<i class="mdi mdi-database-search"></i>
										</a>
									</template>
								</el-input>
							</div>
						</el-row>
					</div>
				</div>
				<div class="widget card-shadow--small b-rad-4" :style="{'border-radius': '10px'}">
					<div class="title flex justify-space-between align-center">
						Холбоо барих
					</div>
					<div class="content">
						<div>
							<div><i class="mdi mdi-email mr-10"></i> info@icbc.mn</div>
							<div class="mt-10"><i class="mdi mdi-phone mr-10"></i> 7511-7733</div>
						</div>
					</div>
				</div>
			</el-col>
		</el-row>
		<el-dialog title="Хайлтын илэрц" :visible.sync="modals.resultSearchModal" width="80%">
			<div class="table-box card-base card-shadow--medium" style="overflow: auto;">
				<table class="styled striped">
					<thead>
						<tr :style="{'font-size': '14px'}">
							<th>Зураг</th>
							<th>Нэр</th>
							<th>Модель</th>
							<th>Өнгө</th>
							<th></th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in gridData" :key="item.code">
							<td><img :src="$imgUrl+item.image" alt="" :style="{'width': '50px', 'height': 'auto'}"></td>
							<td>{{item.name}}</td>
							<td>{{item.model}}</td>
							<td>{{item.color_name}}</td>
							<td>
								<el-button @click="addToCart(item)" icon="el-icon-sell" size="mini" type="primary" circle></el-button>
							</td>
						</tr>
					</tbody>
					</table>
				</div>
		</el-dialog>
	</div>
</template>

<script>
import moment from 'moment'
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'EcommerceCart',
	data () {
		return {
			orderBtn : false,
			items: [],
			cart: [],
			product: [],
			search: '',
			modals: {
				resultSearchModal: false
			},
			selectedDirection: 1,
			orderValue: '',
			directions: [
				{
					value: 1,
					label: 'Дотоод захиалга'
				}
			],
			gridData: [],
			position: 'remain',
			currentPosition: 'remain',
			positions: [],
			LoggedUser: []
		}
	},
	computed:{
		amount() {
			return _.reduce(this.product, (sum, obj) => sum + (obj.wholesale_price * obj.quantity), 0)
		},
		amount_text() {
			return Number(this.amount).toLocaleString();
		}
	},
	mounted() {
		this.LoggedUser = JSON.parse(localStorage.user);
		this.getProduct(this.position);
	},
	methods: {
		changePosition() {
			this.getProduct(this.currentPosition);
		},
		addToCart(product) {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/add-cart`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						id: product.id,
						qty: 1
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {

						let ex = rts.product.some(function(field) {
							return field.id == product.id
						});

						if(ex) {
							rts.product.forEach((el, index) => {
								if(el.id === product.id) {
									rts.product[index].quantity++;
								}
							});
						} else {
							var p = {id: product.id, image: product.image, model: product.model, name: product.name, quantity: 1, remain: product[rts.position], wholesale_price: product.wholesale_price};
							rts.product.push(p);
						}
						
						rts.$notify({
							title: 'Амжилттай',
							dangerouslyUseHTMLString: true,
							message: `<strong>${product.model}</strong> бүтээгдэхүүн нэмэгдлээ`,
							type: 'success'
						});
					}
				}).catch(error => {
					console.log(error);
				});
			}
		},
		searchProduct() {
			if(this.search !== '') {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/product/products`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							brand: [],
							page: 1,
							color: [],
							price: [0,0],
							category: [],
							search: this.search 
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.gridData = data.data.product;
							rts.modals.resultSearchModal = true;
						}
						
					}).catch(error => {
						console.log(error);
					});
				}
			} else {
				this.$notify({
					title: 'Алдаа',
					message: `Хайлтын утгаа оруулна уу`,
					type: 'error'
				});
			}
		},
		removeProduct(id) {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/remove-cart`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						id
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						rts.$notify({
							title: 'Амжилттай',
							message: `Бүтээгдэхүүн хасагдлаа`,
							type: 'success'
						});
						let ex = rts.product.some(function(field) {
							return field.id == id
						});
						if(ex) {
							rts.product.forEach((element, index) => {
								if(element.id == id) {
									rts.product.splice(index, 1);
								}
							});
						}
					}
				}).catch(error => {
					console.log(error);
				});
			}
		},
		getProduct(position) {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/cart`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						position
					}
				})
				.then(function(data){
					console.log(data);
					rts.product = data.data.product;
					rts.positions = data.data.position;
					rts.position = rts.currentPosition;
				}).catch(error => {
					console.log(error);
				});
			}
		},
		gotoCheckout() {
			var rts = this;
			const token = localStorage.getItem('token');

			if(this.selectedDirection === 1) {
				//Дотоод захиалга
				if(this.currentPosition === 'remain') {
					//Агуулах захиалга
					this.orderBtn = true;
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/create-order`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							product: this.product,
							ordervalue: this.orderValue,
							role: this.LoggedUser.posID
						}
					})
					.then(function(data){
						rts.orderBtn = false;
						if(data.data.result === 'failed') {
							rts.$notify({
								title: 'Амжилтгүй',
								message: data.data.msg,
								type: 'error'
							});
						} else if(data.data.result === 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: 'Захиалга илгээгдлээ',
								type: 'success'
							});
							rts.product = [];
							rts.$router.push('/orders');
						}
					}).catch(error => {
						rts.orderBtn = false;
						console.log(error);
					});
				} else {
					//Дотоод хөдөлгөөн
					this.orderBtn = true;
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/create-movement`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							product: this.product,
							ordervalue: this.orderValue,
							toLocation: this.currentPosition
						}
					})
					.then(function(data){
						rts.orderBtn = false;
						if(data.data.result === 'failed') {
							rts.$notify({
								title: 'Амжилтгүй',
								message: data.data.msg,
								type: 'error'
							});
						} else if(data.data.result === 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: 'Захиалга илгээгдлээ',
								type: 'success'
							});
							rts.product = [];
						}
					}).catch(error => {
						rts.orderBtn = false;
						console.log(error);
					});
				}
			}
		},
		initCartData() {
			_.times(5, (number) => {
				let price = chance.floating({ min: 30, max: 100, fixed: 2 })
				let qnt = chance.integer({ min: 1, max: 5 })

				this.cart.push({
					id: number,
					photo: '/static/images/shop/'+chance.integer({ min: 0, max: 19 })+'.jpg',
					product: chance.sentence({ words: 3 }),
					price,
					price_text: _.replace(price.toFixed(2).toString(), '.', ','),
					qnt
				})
			})
		},
		initItemsData() {
			_.times(5, (number) => {
				let price = chance.floating({ min: 30, max: 100, fixed: 2 })

				this.items.push({
					id: number,
					photo: '/static/images/shop/'+chance.integer({ min: 0, max: 19 })+'.jpg',
					product: chance.sentence({ words: 3 }),
					price: _.replace(price.toFixed(2).toString(), '.', ',')
				})
			})
		}
	},
	created() {
		this.initCartData()
		this.initItemsData()
	},
	beforeRouteLeave (to, from , next) {
      	if (this.product.length > 0) {
			  
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/change-cart-qty`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						product: this.product
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
    }
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';
.product-image {
	width: 60px;
	height: auto;
}
.page-ecommerce-cart {
	.cart-box {
		.widget {
			background: white;
			margin-bottom: 20px;

			.title {
				padding: 15px;
				border-bottom: 1px solid transparentize($text-color, .9);
				font-weight: bold;
			}
			.content {
				padding: 20px;

				button {
					margin-top: 10px;
					border: 1px solid $text-color-accent;
					color: $text-color-accent;
					background-color: transparentize($text-color-accent, .9);
					padding: 10px;
					width: 100%;
					text-align: center;
					font-family: inherit;
					font-size: 20px;
					cursor: pointer;
					border-radius: 4px;

					&:hover {
						background-color: transparentize($text-color-accent, .7);
					}
				}

				.items {
					.item {
						background: transparentize($text-color, .97);
						box-sizing: border-box;

						.photo {
							width: 58px;
							position: relative;
							padding: 10px;
							background: white;

							.add-btn {
								position: absolute;
								background: transparentize($text-color-accent, .3);
								color: white;
								top: 0;
								left: 0;
								right: 0;
								bottom: 0;
								width: 100%;
								height: 100%;
								text-align: center;
								line-height: 78px;
								font-size: 40px;
								opacity: 0;
								transition: all .25s;
							}

							img {
								width: 100%;
								display: block;
							}
						}

						.box {
							padding-left: 10px;

							.product-name {
								font-size: 12px;
							}
							.price {
								font-size: 12px;
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
			
		}

		.item-list {
			.item {
				background: white;
				padding: 25px;
				box-sizing: border-box;
				margin-bottom: 10px;

				.photo {
					width: 100px;
					padding: 10px;
					background: white;

					img {
						width: 100%;
						display: block;
					}
				}

				.box {
					padding-left: 30px;

					.product-name {
						font-weight: bold;
						font-size: 20px;
					}
					.price {
						margin-top: 10px;
						color: $text-color-accent;
					}

					.el-input-number {
						width: 90px;

						& > span {
							border-radius: 0;
							background-color: $text-color-accent; 
							color: white;
							border-color: transparentize($background-color, .9);
						}
				
						.el-input__inner {
							color: $text-color-accent;
							background-color: transparentize($text-color-accent, .9);
							border-color: $text-color-accent; 
							border-radius: 0;
							font-family: inherit;
							font-weight: bold;
							padding-left: 5px;
							padding-right: 45px;
						}
					}

					.del-btn {
						margin-top: 10px;
						color: $text-color-danger;
						padding: 10px;
						text-align: center;
						font-family: inherit;
						font-size: 20px;
						cursor: pointer;
						opacity: .5;
						border: none;
						background: transparent;
						outline: none;
						visibility: hidden; 

						&:hover {
							opacity: 1;
						}
					}

				}
				
				&:hover {
					.del-btn {
						visibility: visible;
					}
				}
			}
		}
	}
}

@media (max-width: 900px) {
	.page-ecommerce-cart {

		.cart-box {
			.item-list {
				.item {
					.photo {
						display: none;
					}
					& > .box {
						padding: 0;
					}
				}
			}
		}
	}
}

@media (max-width: 600px) {
	.product-image {
		width: 100%; 
		height: auto;
	}
	.page-ecommerce-cart {

		.cart-box {
			.item-list {
				.item {
					display: block;
					padding: 20px;

					.photo, & > .box {
						margin-bottom: 10px;
						width: 100%;
						display: block;
						clear: both;
						padding: 0;
					}
				}
			}
		}
	}
}

</style>


