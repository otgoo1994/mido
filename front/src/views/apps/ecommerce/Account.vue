<template>
	<div class="page-ecommerce-account scrollable" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<el-breadcrumb separator="/">
				<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
				<el-breadcrumb-item>Хувийн мэдээлэл</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

		<div>
			<el-tabs v-model="activeTab" class="themed">
				<el-tab-pane label="Хувийн мэдээлэл" name="profile">
					<el-row class="profile-box" :gutter="20">
						<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
							<div class="user-box card-shadow--small">
								<div class="photo b-rad-8" style="position: relative;">
									<div class="profileUpload">
										<el-button icon="el-icon-plus" @click="uploadBtnClicked" circle style="margin-top: 40%;"></el-button>
									</div>
									<!-- <div class="demo-fit">
										<div class="block">
											<el-avatar shape="square" style="width: 100%; height: auto;" fit="contain" src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg"></el-avatar>
										</div>
									</div> -->
									<!-- <div class="demo-type">
										<el-avatar shape="square" style="width: 100%; height: auto; margin: auto;" :src="$appUrl+'/images/local/user/'+LoggedUser.img">
											<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
										</el-avatar>
									</div> -->
									<img :src="$appUrl+'/images/local/user/'+LoggedUser.img" alt="avatar">
									<input type="file" accept="image/*" hidden @change="onProfileImageSelected" ref="image" id="image"/>
								</div>
								<div class="rate" align="center">
									<el-rate v-model="rate" v-if="LoggedUser.loyalty <= 10000" disabled :colors="rateColor.brown"></el-rate>
									<el-rate v-model="rate" v-if="LoggedUser.loyalty > 10000 && LoggedUser.loyalty <= 25000" disabled :colors="rateColor.brown"></el-rate>
									<el-rate v-model="rate" v-if="LoggedUser.loyalty > 25000" disabled :colors="rateColor.brown"></el-rate>
								</div>
								<div class="name">
									{{LoggedUser.name}}
								</div>
								<div class="contacts">
									<div><i class="mdi mdi-email mr-10"></i> {{LoggedUser.email}}</div>
									<div class="mt-10" v-if="LoggedUser.phone !== undefined"><i class="mdi mdi-phone mr-10"></i> {{LoggedUser.phone.substr(0,4)}} {{LoggedUser.phone.substr(4,4)}}</div>
								</div>
							</div>
							<div class="flex achievements-box justify-space-around card-shadow--small">
								<div class="box">
									<el-tooltip effect="dark" content="10 Orders" placement="top">
										<i class="mdi mdi-trophy"></i>
									</el-tooltip>
								</div>
								<div class="box">
									<el-tooltip effect="dark" content="Certified User" placement="top">
										<i class="mdi mdi-check-decagram"></i>
									</el-tooltip>
								</div>
								<div class="box">
									<el-tooltip effect="dark" content="100 Orders" placement="top">
										<i class="mdi mdi-seal"></i>
									</el-tooltip>
								</div>
								<div class="box">
									<el-tooltip effect="dark" content="Purchase Protection" placement="top">
										<i class="mdi mdi-shield-check"></i>
									</el-tooltip>
								</div>
								<div class="box">
									<el-tooltip effect="dark" content="Premium User" placement="top">
										<i class="mdi mdi-star"></i>
									</el-tooltip>
								</div>
							</div>
						</el-col>
						<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
							<div class="billing-box card-shadow--small">
								<div class="title">
									<span>Үндсэн мэдээлэл</span>
									<el-button style="float: right;" @click="startEdit" v-if="edit == false" icon="el-icon-s-tools" size="mini" circle></el-button>
									<div v-else style="float: right;">
										<el-button size="mini" @click="edit = false" plain>Болих</el-button>
										<el-button type="primary" size="mini" @click="saveChangedInfo" plain>Хадгалах</el-button>
									</div>
								</div>

								<el-row :gutter="10">
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Нэр</div>
											<div class="value" v-if="edit == false">{{LoggedUser.name}}</div>
											<el-input placeholder="Нэр" v-else size="small" v-model="editOption.name" clearable> </el-input>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Утас</div>
											<div class="value" v-if="edit == false">{{LoggedUser.phone}}</div>
											<el-input placeholder="Утасны дугаар" v-else size="small" v-model="editOption.phone" clearable> </el-input>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Утас 2</div>
											<div class="value" v-if="edit == false">{{LoggedUser.phone2}}</div>
											<el-input placeholder="Утасны дугаар 2" v-else size="small" v-model="editOption.phone2" clearable> </el-input>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Цахим хаяг</div>
											<div class="value">{{LoggedUser.email}}</div>
										</div>
									</el-col>
									<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
										<div class="box">
											<div class="key">Дансны дугаар</div>
											<div class="value" v-if="edit == false">{{LoggedUser.acc_number}}</div>
											<el-input placeholder="Дансны дугаар" size="small" v-else v-model="editOption.accNumber" clearable> </el-input>
										</div>
									</el-col>
								</el-row>
							</div>
							<div class="shipping-box card-shadow--small">
								<div class="title">Бусад мэдээлэл</div>
								<el-row :gutter="10">
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Хэрэглэгчийн эрх</div>
											<div class="value">{{permission}}</div>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Аймаг / Хот</div>
											<div class="value">{{getCity()}}</div>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Үндсэн салбар</div>
											<div class="value">{{getShop()}}</div>
										</div>
									</el-col>
									<el-col :xs="24" :sm="12" :md="12" :lg="12" :xl="12">
										<div class="box">
											<div class="key">Зөвшөөрөгдсөн брэнд</div>
											<div class="value" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;">{{getBrands()}}</div>
										</div>
									</el-col>
									<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
										<div class="box">
											<div class="key">Ажлын чиглэл</div>
											<div class="value">{{title}}</div>
										</div>
									</el-col>
								</el-row>
							</div>
						</el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="Сүүлийн захиалгууд" name="orders">
					<el-row class="items mt-40" :gutter="20">
						<el-col v-for="i in orders" :key="i.id" :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
							<div class="item mb-20 flex">
								<div class="photo">
									<img :src="$imgUrl+i.image">
								</div>
								<div class="box grow flex column justify-center">
									<div class="product-name">{{i.name}} <strong>{{i.model}}</strong></div>
									<div class="price">
										<!-- <el-input-number class="mr-5" v-if="order.detail.stat == 1" v-model="i.quantity" :style="{'width': '100px'}" controls-position="right" :min="1" :max="i.remain"></el-input-number> -->
										<span>{{Number(i.quantity).toLocaleString()}}</span>
										x ₮ {{Number(i.wholesale_price).toLocaleString()}} = <strong>₮ {{Number(i.wholesale_price * i.quantity).toLocaleString()}}</strong>
									</div>
								</div>
								<div class="box grow flex column justify-center">
									<div class="product-name"><strong>{{i.order_number}}</strong></div>
									<div class="price">
										{{new Date(i.created_at).toDateString()}}
									</div>
								</div>
								<div class="box grow flex column justify-center">
									<div class="item-box item-status" :style="{'border-radius': '5px', 'max-width': '200px'}" v-bind:class="{'status-Pending': i.paid == 0, 'status-Complete': i.paid == 1}">
										<h4 class="m-0 mb-5" v-if="i.paid == 0">Хүлээгдэж байгаа</h4>
										<h4 class="m-0 mb-5" v-else-if="i.paid == 1">Төлөгдсөн</h4>
										<p class="m-0 o-0">-</p>
									</div>
								</div>
							</div> 
						</el-col>
					</el-row>
				</el-tab-pane>
				<el-tab-pane label="Ажлын төлөвлөгөө" name="wishlist">
					<el-calendar>
					<template
						slot="dateCell"
						slot-scope="{data}">
						<div> 
							<!-- {{ data.day.split('-').slice(1).join('-') }}  -->
							{{ data.day.split('-')[2] }} 
							<div class="block">
								<el-carousel trigger="click" height="50px" indicator-position="none" arrow="never">
								<el-carousel-item v-for="(item, index) in checkPlan(data.day)" :key="index">
									<!-- <h3 class="small">{{ item.name }}</h3> -->
									<div class="item-box item-status-calendar" align="center" :style="{'border-radius': '5px', 'margin-top': '3px'}" v-bind:class="{'status-Paid': 1 == 1}">
										{{item.name}}
									</div>
								</el-carousel-item>
								</el-carousel>
							</div>
						</div>
					</template>
					</el-calendar>
				</el-tab-pane>
				<el-tab-pane label="Нууц үг шинэчлэх" name="password">
					<div align="center" class="mt-50">
						<i class="el-icon-unlock" style="font-size: 300%;"></i><br>
						<el-input placeholder="Хуучин нууц үг" class="mt-10 passwordInput" v-model="password.old" show-password clearable=""></el-input><br>
						<el-input placeholder="Шинэ нууц үг" class="mt-10 passwordInput" v-model="password.new" show-password clearable=""></el-input><br>
						<el-input placeholder="Шинэ нууц үг давтан" class="mt-10 passwordInput" v-model="password.repeat" show-password clearable=""></el-input><br>
						<el-button type="primary" class="mt-10 passwordInput" @click="changePassword" plain>Хадгалах</el-button>
					</div>
				</el-tab-pane>
			</el-tabs> 
		</div>

	
	</div>
</template>

<script>
import moment from 'moment'
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'EcommerceAccount',
	data () {
		return {
			activeTab: 'profile',
			deliveryDate: moment().format('DD MMM'),
			orders: [],
			wishlist: [],
			LoggedUser: [],
			cities: [],
			permission: '',
			brands: [],
			location: [],
			title: '',
			edit: false,
			loading: false,
			editOption: {
				phone: '',
				phone2: '',
				accNumber: '',
				name: '',
				id: ''
			},
			selectedFile: '',
			plan: [],
			password: {
				old: '',
				new: '',
				repeat: ''
			},
			rate: 0.2,
			rateColor: {
				brown: ['#cc6633', '#cc6633', '#cc6633'],
				silver: ['#A9A9A9', '#A9A9A9', '#A9A9A9'],
				gold: ['#FFD700', '#FFD700', '#FFD700']
			}
		}
	},
	methods: {
		changePassword() {
			if(this.password.old != '' && this.password.new != '' && this.password.repeat != '') {
				if(this.password.new == this.password.repeat) {
					this.loading = true;
					var rts = this;
					const token = localStorage.getItem('token');
					if(token) {
						this.$axios({
							method: 'post',
							url: rts.$appUrl +`/api/user/update-password`,
							headers: {
								"Authorization": `Bearer ${token}`
							},
							data: {
								password: this.password.new,
								old: this.password.old
							}
						})
						.then(function(data){
							rts.loading = false;
							if(data.data.result == 'success') {
								rts.$notify({
									title: 'Амжилттай',				
									dangerouslyUseHTMLString: true,				
									message: `Нууц үг шинэчлэгдлээ`,
									type: 'success'
								});
							} else {
								rts.$notify({
									title: 'Амжилтгүй',				
									dangerouslyUseHTMLString: true,				
									message: `Хуучин нууц үг буруу`,
									type: 'error'
								});
							}
						}).catch(error => {
							rts.loading = false;
							console.log(error);
						});
					}
				} else {
					this.$notify({
						title: 'Амжилтгүй',				
						dangerouslyUseHTMLString: true,				
						message: `Давтан нууц үг тохирсонгүй`,
						type: 'error'
					});
				}
			} else {
				this.$notify({
					title: 'Амжилтгүй',				
					dangerouslyUseHTMLString: true,				
					message: `Талбараа бүрэн бөглөнө үү`,
					type: 'error'
				});
			}
		},
		checkPlan(date) {
			var shop = [];
			this.plan.forEach(el => {
				if(date == el.date) {
					shop.push({name: el.name});
				}
			});
			return shop;
		},
		uploadBtnClicked() {
			this.$refs.image.click()
		},
		onProfileImageSelected(event) {
			const file = event.target.files[0];
			this.selectedFile = file;
			this.$confirm('Нүүр зургаа шинэчлэхдээ итгэлтэй байна уу?', 'Санамж', {
				confirmButtonText: 'Тийм',
				cancelButtonText: 'Болих',
				type: 'warning'
			}).then(() => {
				this.updateProfile();
			}).catch(() => {
				this.selectedFile = '';
				this.$refs.image.value = '';
			});
		},
		updateProfile() {
			this.loading = true;
			var rts = this;
			const token = localStorage.getItem('token');
			if(this.selectedFile) {
				const fd = new FormData();
				fd.append('photo', this.selectedFile, this.selectedFile.name);
				this.$axios.post(this.$appUrl+'/api/user/update-profile-image', 
				fd,
				{
					headers: {
					'Authorization': `Bearer ${token}`
					}
				}
				)
				.then(function(data) {
					rts.loading = false;
					rts.LoggedUser.img = data.data.image;
					localStorage.user = JSON.stringify(rts.LoggedUser);
					rts.$notify({
						title: 'Амжилттай',				
						dangerouslyUseHTMLString: true,				
						message: `Амжилттай шинэчлэгдлээ.<br><strong>Түр хүлээнэ үү</strong>`,
						type: 'success'
					});
					setTimeout(() => {
						location.reload();
					}, 1000);

				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		startEdit() {
			this.editOption.phone = this.LoggedUser.phone;
			this.editOption.phone2 = this.LoggedUser.phone2;
			this.editOption.accNumber = this.LoggedUser.acc_number;
			this.editOption.name = this.LoggedUser.name;
			this.edit = true;
		},
		saveChangedInfo() {
			this.loading = true;
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/update-user-info`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
					data: {
						info: this.editOption
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.LoggedUser.phone = rts.editOption.phone;
						rts.LoggedUser.phone2 = rts.editOption.phone2;
						rts.LoggedUser.name = rts.editOption.name;
						rts.LoggedUser.acc_number = rts.editOption.accNumber;
						localStorage.user = JSON.stringify(rts.LoggedUser);
						rts.edit = false;
						rts.$notify({
							title: 'Амжилттай',				
							dangerouslyUseHTMLString: true,				
							message: `Амжилттай шинэчлэгдлээ.<br><strong>Түр хүлээнэ үү</strong>`,
							type: 'success'
						});
						setTimeout(() => {
							location.reload();
						}, 1000);
					}	
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		getBrands() {
			if(this.LoggedUser.allow_brand !== undefined) {
				if(this.LoggedUser.allow_brand == 'all') {
					return 'Бүгд'
				} else {
					var name = '';
					var id = this.LoggedUser.allow_brand.split(',');
					id.forEach(el => {
						this.brands.forEach(b => {
							if(b.id == el) {
								if(name == '') {
									name = `${b.brandname}`;
								} else {
									name = `${name}, ${b.brandname}`;
								}
							}
						});
					});
					return name;
				}
			}
		},
		getShop() {
			var shop = '';
			this.location.forEach(el => {
				if(el.code == this.LoggedUser.call_store) {
					shop = el.name;
				}
			});
			return shop;
		},
		getCity() {
			var city = '';
			this.cities.forEach(el => {
				if(el.id == this.LoggedUser.city) {
					city = el.city;
				}
			});
			return city;
		},
		initWishlistData() {
			_.times(50, (number) => {
				let price = chance.floating({ min: 30, max: 100, fixed: 2 })

				this.wishlist.push({
					id: number,
					photo: '/static/images/shop/'+chance.integer({ min: 0, max: 19 })+'.jpg',
					product: chance.sentence({ words: 3 }),
					price: _.replace(price.toFixed(2).toString(), '.', ',')
				})
			})
		},
		gotoProducts() {
			this.$router.push({name:'ecommerce-products'})
		},
		getInfo() {
			this.loading = true;
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/profile`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					rts.loading = false;
					rts.cities = data.data.cities;
					rts.orders = data.data.orders;
					rts.brands = data.data.brands;
					rts.location = data.data.location;
					rts.permission = data.data.permission;
					rts.title = data.data.profession;
					rts.plan = data.data.plan;
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
	},
	created() {
		this.initWishlistData()
	},
	mounted() {
		var u = JSON.parse(localStorage.user);
		this.LoggedUser = u; var per = 0;
		if (u.loyalty <= 10000) {
			per = 10000;
		} else if(u.loyalty > 10000 && u.loyalty <= 25000) {
			per = 25000;
		} else if(u.loyalty > 25000) {
			per = 50000;
		}

		this.rate = Number((u.loyalty * 5 / per).toFixed(1));
		this.getInfo();
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.profileUpload {
	width: 100%;
	height: 100%;
	position: absolute;
	background: black;
	opacity: 0;
	text-align: center;
}
.profileUpload:hover {
	opacity: 0.5;
}

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
.item-status-calendar {
	padding: 2px 4px;
	&.status- {
		&Complete { background: rgba(44, 196, 120, 0.25); }
		&Pending { background: rgba(247, 186, 42, 0.25); }
		&Returned { background: rgba(243, 24, 71, 0.25); }
		&Paid { background: rgba(45, 109, 211, 0.25); }
	}
}
.page-ecommerce-account {
	.page-header {
		margin-bottom: 20px;
	}

	.account-tab {

		.card-outline {
			min-height: 130px;
			border: 2px solid $text-color-accent;

			.title {
				font-size: 16px;
				margin-bottom: 10px;
				font-weight: bold;
				color: $background-color;
				background: $text-color-accent;
				display: inline-block;
				display: inline-block;
				position: relative;
				top: -22px;
				margin-left: -20px;
				padding: 4px 10px;
				text-transform: uppercase;
			}
		}

		.widget-profile {
			.avatar {
				width: 70px;

				img {
					width: 100%;
				}
			}

			.box.grow {
				background: transparentize($text-color, .97);
				height: 70px;
				padding: 0 20px;
				box-sizing: border-box;
				cursor: pointer;

				.since {
					font-size: 12px;
					opacity: .5;
				}
				
				&:hover {
					background: transparentize($text-color, .8);
				}
			}
		}
		.widget-order {
			.photo {
				width: 70px;

				img {
					width: 100%;
				}
			}

			.box.grow {
				background: transparentize($text-color, .97);
				height: 70px;
				padding: 0 20px;
				box-sizing: border-box;
				cursor: pointer;

				.date {
					font-size: 12px;
					opacity: .5;
				}
				
				&:hover {
					background: transparentize($text-color, .8);
				}
			}
		}
		.widget-achievements {
			.box.grow {
				background: transparentize($text-color, .97);
				height: 70px;
				line-height: 70px;
				font-size: 30px;
				box-sizing: border-box;
				text-align: center;
			}
		}
		.widget-address {
			.box.grow {
				background: transparentize($text-color, .97);
				height: 70px;
				padding: 0px 20px;
				box-sizing: border-box;
				cursor: pointer;

				.street {
					font-size: 12px;
					opacity: .5;
				}

				&:hover {
					background: transparentize($text-color, .8);
				}
			}
		}
	}

	.orders-tab {
		margin-left: -10px;
		margin-right: -10px;

		.order-wrapper {
			width: 25%;
			float: left;
			padding: 0 10px;
			box-sizing: border-box;

			.order {
				background: white;
				//color: $background-color;
				border-top-left-radius: 40px;
				border-bottom-left-radius: 40px;
				border-top-right-radius: 40px;
				border-bottom-right-radius: 40px;
				margin-bottom: 20px;
				width: 100%;
				height: 80px;
				overflow: hidden;
				cursor: pointer;
				transition: all .25s;

				.el-progress {
					display: block;

					.el-progress-circle__track {
						stroke: transparentize($text-color, .9);
					}

					.el-progress__text {
						//color: $background-color;
						font-weight: bold !important;
						font-size: 16px !important;
					}

					&.is-success .el-progress__text {
						//color: $color-success;
					}
				}

				.info {
					padding: 0 20px;
					
					.date {
						font-weight: bold;
					}

					.number {
						opacity: .5;
						font-size: 14px;
					}

					.amount {
						margin-top: 5px;
						color: $text-color-accent;
					}
				}

				.detail {
					padding: 17px 20px;
					box-sizing: border-box;

					.photo {
						width: 60px;

						img {
							width: 100%;
						}
					}

					.product-name {
						box-sizing: border-box;
						padding-left: 20px;
						font-weight: bold;
					}
					.price {
						box-sizing: border-box;
						padding-left: 20px;
						margin-top: 5px;
						font-size: 14px;

						.qnt {
							opacity: .5;
						}
					}
				}

				&.open {
					height: 180px;
					border-bottom-left-radius: 20px;
					border-bottom-right-radius: 20px;
					border-top-right-radius: 20px;
				}

			}
		}
	}

	.wishlist-box {
		.sidebar {
			background: white;
			border-radius: 4px;
			margin-bottom: 20px;

			.title {
				padding: 20px;
				border-bottom: 1px solid transparentize($text-color, .9);
				font-weight: bold;

				button {
					background: transparentize($text-color, .9);
					color: var(--text-color);
					border: none;
					border-radius: 4px;
					outline: none;
					width: 30px;
					height: 30px;
					line-height: 30px;
					padding: 0;
					margin: 0;
					text-align: center;
					font-size: 20px;
					cursor: pointer;

					i:before {
						transition: all .25s;
					}

					&:hover {
						background: transparentize($text-color, .8);

						i:before {
							transform: rotate(180deg);
						}
					}
				}
			}
			.lists {
				padding: 20px;

				ul, li {
					padding: 0;
					margin: 0;
					list-style: none;
				}

				li {
					margin-bottom: 10px;

					&.active a {
						color: $text-color;
					}
				}
			}
			
		}
		.item-list {
			.item {
				background: white;
				border-radius: 4px;
				overflow: hidden;
				cursor: pointer;

				.photo {
					width: 70px;
					padding: 10px;

					img {
						width: 100%;
						display: block;
					}
				}

				.box {
					padding: 0 10px;

					.product-name {
						font-weight: bold;
					}
					.price {
						color: $text-color-accent;
					}
				}

				&:hover {
					background: transparentize($text-color, .8);
				}
			}
		}
	}

	.profile-box {
		.user-box {
			background: white;
			border-radius: 4px;
			padding: 20px;
			box-sizing: border-box;
			margin-bottom: 20px;
			
			.photo {
				width: 200px;
				display: block;
				margin: 10px auto;
				border: 5px solid $text-color;

				img {
					width: 100%;
					display: block;
				}
			}
			.name {
				text-align: center;
				font-size: 20px;
				margin: 10px 0;
			}

			.contacts {
				background: transparentize($text-color, .97);
				padding: 20px;
			}
		}

		.achievements-box {
			background: white;
			border-radius: 4px;
			padding: 20px;
			box-sizing: border-box;
			margin-bottom: 20px;

			.box {
				padding: 10px;
				//background: transparentize($text-color, .9);
				font-size: 20px;
				min-width: 26px;
				text-align: center;
			}
		}

		.billing-box, .shipping-box {
			background: white;
			border-radius: 4px;
			margin-bottom: 20px;
			padding: 20px;		

			.title {
				font-weight: bold;
				margin-bottom: 20px;
			}			

			.box {
				background: transparentize($text-color, .97);	
				padding: 20px;
				margin-bottom: 10px;

				.key {
					font-size: 14px;
					opacity: .7;
				}
			}
		}
	}
}

.passwordInput {
	width: 30%;
}

@media (max-width: 1330px) {
	.page-ecommerce-account {

		.orders-tab {
			.order-wrapper {
				width: 33.33333%;
			}
		}
	}
}
@media (max-width: 1000px) {
	.page-ecommerce-account {

		.orders-tab {
			.order-wrapper {
				width: 50%;
			}
		}
	}
}
@media (max-width: 700px) {
	.passwordInput {
		width: 90%;
	}
	.page-ecommerce-account {

		.orders-tab {
			.order-wrapper {
				width: 100%;
			}
		}
	}
}

</style>


