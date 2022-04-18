<template>
	<div class="page-contacts flex column" id="page-contacts">
		<resize-observer @notify="__resizeHanlder" />
		
		<div class="contacts-root box grow flex gaps justify-center" :class="contactsClass">
			<div class="card-base card-shadow--small search-card scrollable only-y">
				<h3 class="mt-0">Хэрэглэгчид</h3>
				
				<el-input
					prefix-icon="el-icon-search"
					placeholder="Хэрэглэгч хайх"
					clearable
					v-model="search">
				</el-input>

				<div class="o-050 text-right mt-10 mb-30">Нийт <strong>{{contactsFiltered.length}}</strong> хэрэглэгч</div>

				<el-button icon="mdi mdi-account-plus" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4" @click="$router.push('/new-contact')"> Хэрэглэгч бүртгэх</el-button>

				<div class="p-20">
					<p>Хадгалсан хэрэглэгчид</p>
					<ul class="contacts-favourites">
						<li v-for="c in favorite" :key="c.id" @click="openDialog(c)">
							<img :src="$appUrl+'/images/local/user/'+c.img"  alt="user favourite avatar">
							<span>{{c.name}}</span>
						</li>
					</ul>
				</div>

			</div>
			<div class="contacts-list box grow scrollable only-y">
				<el-tabs v-model="activeTagName">
					<el-tab-pane label="Админ" name="admin">
						<div v-for="c in contactsFiltered" :key="c.id">
							<div v-if="c.posID == 1" class="flex contact" @click="openDialog(c)">
								<div class="avatar align-vertical ml-10">
									<img :src="$appUrl+'/images/local/user/'+c.img" class="align-vertical-middle" alt="user avatar">
								</div>
								<div class="info box grow flex">
									<div class="name box grow flex column justify-center p-10">
										<div class="fullname fs-18"><strong>{{c.name}}</strong></div>
										<div class="phone fs-14 secondary-text">{{c.phone}}</div>
										<div class="email fs-14 secondary-text">{{c.email}}</div>
									</div>
									<div class="phone align-vertical p-10"><span class="align-vertical-middle">{{c.phone}}</span></div>
									<div class="align-vertical p-10 mr-10" v-if="LoggedUser.posID == 1">
										<el-dropdown>
											<el-button icon="el-icon-s-tools" circle></el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item @click.native="changeBrand(c.id, c)">Брэнд өөрлчөх</el-dropdown-item>
												<el-dropdown-item @click.native="deleteUser(c.name, c.id)">Устгах</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</div>
								</div>
							</div>
						</div>
					</el-tab-pane>
					<el-tab-pane label="Санхүү" name="Accountant">
						<div v-for="c in contactsFiltered" :key="c.id">
							<div v-if="c.posID == 2" class="flex contact" @click="openDialog(c)">
								<div class="avatar align-vertical">
									<img :src="$appUrl+'/images/local/user/'+c.img" class="align-vertical-middle" alt="user avatar">
								</div>
								<div class="info box grow flex">
									<div class="name box grow flex column justify-center p-10">
										<div class="fullname fs-18"><strong>{{c.name}}</strong></div>
										<div class="phone fs-14 secondary-text">{{c.phone}}</div>
										<div class="email fs-14 secondary-text">{{c.email}}</div>
									</div>
									<div class="phone align-vertical p-10">
										<span class="align-vertical-middle">{{c.phone}}</span>
									</div>
									<div class="align-vertical p-10 mr-10" v-if="LoggedUser.posID == 1">
										<el-dropdown>
											<el-button icon="el-icon-s-tools" circle></el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item @click.native="changeBrand(c.id, c)">Брэнд өөрлчөх</el-dropdown-item>
												<el-dropdown-item @click.native="deleteUser(c.name, c.id)">Устгах</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</div>
								</div>
							</div>
						</div>
					</el-tab-pane>
					<el-tab-pane label="Менежер" name="sales">
						<div v-for="c in contactsFiltered" :key="c.id">
							<div v-if="c.posID == 4" class="flex contact" @click="openDialog(c)">
								<div class="avatar align-vertical">
									<img :src="$appUrl+'/images/local/user/'+c.img" class="align-vertical-middle" alt="user avatar">
								</div>
								<div class="info box grow flex">
									<div class="name box grow flex column justify-center p-10">
										<div class="fullname fs-18"><strong>{{c.name}}</strong></div>
										<div class="phone fs-14 secondary-text">{{c.phone}}</div>
										<div class="email fs-14 secondary-text">{{c.email}}</div>
									</div>
									<div class="phone align-vertical p-10"><span class="align-vertical-middle">{{c.phone}}</span></div>
									<div class="align-vertical p-10 mr-10" v-if="LoggedUser.posID == 1">
										<el-dropdown>
											<el-button icon="el-icon-s-tools" circle></el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item @click.native="changeBrand(c.id, c)">Брэнд өөрлчөх</el-dropdown-item>
												<el-dropdown-item @click.native="deleteUser(c.name, c.id)">Устгах</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</div>
								</div>
							</div>
						</div>
					</el-tab-pane>
					<el-tab-pane label="Худалдааны зөвлөх" name="advisor">
						<div v-for="c in contactsFiltered" :key="c.id">
							<div v-if="c.posID == 3" class="flex contact" @click="openDialog(c)">
								<div class="avatar align-vertical">
									<img :src="$appUrl+'/images/local/user/'+c.img" class="align-vertical-middle" alt="user avatar">
								</div>
								<div class="info box grow flex">
									<div class="name box grow flex column justify-center p-10">
										<div class="fullname fs-18"><strong>{{c.name}}</strong></div>
										<div class="phone fs-14 secondary-text">{{c.phone}}</div>
										<div class="email fs-14 secondary-text">{{c.email}}</div>
									</div>
									<div class="phone align-vertical p-10"><span class="align-vertical-middle">{{c.phone}}</span></div>
									<div class="align-vertical p-10 mr-10" v-if="LoggedUser.posID == 1">
										<el-dropdown>
											<el-button icon="el-icon-s-tools" circle></el-button>
											<el-dropdown-menu slot="dropdown">
												<el-dropdown-item @click.native="changeBrand(c.id, c)">Брэнд өөрлчөх</el-dropdown-item>
												<el-dropdown-item @click.native="deleteUser(c.name, c.id)">Устгах</el-dropdown-item>
											</el-dropdown-menu>
										</el-dropdown>
									</div>
								</div>
							</div>
						</div>
					</el-tab-pane>
				</el-tabs>
			</div>
		</div>
		<el-dialog :show-close="true" :custom-class="'user-dialog'" :visible.sync="dialogvisible" width="30%">
			<div class="avatar-box">
				<img :src="$appUrl+'/images/local/user/'+userdata.img" alt="user avatar">
				<div class="star" @click="addFavoriteUsers(userdata)">
					<i class="mdi mdi-star align-vertical-middle" v-if="checkFavorite(userdata.id)"></i>
					<i class="mdi mdi-star-outline align-vertical-middle" v-if="!checkFavorite(userdata.id)"></i>
				</div>
			</div>
			<div class="form-box">
				<el-input placeholder="Нэр" v-model="userdata.name" disabled></el-input>
				<el-input placeholder="ИМэйл" v-model="userdata.email" disabled></el-input>
				<el-input placeholder="Утас" v-model="userdata.phone" disabled></el-input>
				<el-select v-model="userdata.call_store" filterable placeholder="Салбарын байршил" style="width: 100%;" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
					<el-option
					v-for="(i, index) in store"
					:key="index"
					:label="i.name"
					:value="i.code">
					</el-option>
				</el-select>
			</div>
			<span slot="footer" class="dialog-footer" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
				<el-button @click="dialogFormVisible = false">Болих</el-button>
				<el-button type="primary" @click="updateUserStore">Хадгалах</el-button>
			</span>
		</el-dialog>

		<el-dialog :show-close="true" :custom-class="'user-dialog'" :visible.sync="changeBrandsModal" width="30%">
			<el-checkbox :indeterminate="check.isIndeterminate" v-model="check.checkAll" @change="handleCheckAllChange">Check all</el-checkbox>
			<div style="margin: 15px 0;"></div>
			<el-checkbox-group v-model="check.checkedBrand" @change="handleCheckedCitiesChange">
				<div v-for="(b, index) in brands" :key="index">
					<el-checkbox :label="b.id">{{b.brandname}}</el-checkbox>
				</div>
			</el-checkbox-group>
			<span slot="footer" class="dialog-footer">
				<el-button @click="changeBrandsModal = false">Болих</el-button>
				<el-button type="primary" @click="updateUserBrand">Хадгалах</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import Contacts from '@/assets/data/CONTACTS_MOCK_DATA.json'

export default {
	name: 'Contacts',
	data() {
		return {
			brands: [],
			search: '',
			dialogvisible: false,
			changeBrandsModal: false,
			pageWidth: 0,
			userdata: {},
			contacts: [],
			favorite: [],
			LoggedUser: [],
			store: [],
			selectedStore: '',
			activeTagName: 'admin',
			check: {
				checkAll: false,
				checkedBrand: [],
				isIndeterminate: true
			},
			selectedUser: []
		}
	},
	computed: {
		contactsFiltered() {
			return this.contacts.filter(({name, email, phone}) =>  (name+email+phone).toString().toLowerCase().indexOf(this.search.toString().toLowerCase()) !== -1)
		},
		contactsClass() {
			return this.pageWidth >= 870 ? 'large' : this.pageWidth >= 760 ? 'medium' : 'small'
		},
		contactsFavourite() {
			return this.contacts.filter(({starred})=>starred)
		}
	},
	methods: {
		updateUserBrand() {
			var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/user/update-user-brand`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							user: this.selectedUser,
							role: this.LoggedUser.posID
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: `Шинэчлэгдлээ`,
								type: 'success'
							});
						}
						
					}).catch(error => {
						console.log(error);
					});
				}
		},
		changeBrand(id, user) {
			this.selectedUser = user;
			if(user.allow_brand == 'all') {
				this.brands.forEach(el => {
					this.check.checkedBrand.push(el.id);
				});
			} else {
				this.check.checkedBrand = user.allow_brand.split(',');
			}
			this.changeBrandsModal = true;
		},
		handleCheckAllChange(val) {
			this.check.checkAll = val;
			if(val) {
				this.check.checkedBrand = [];
				this.brands.forEach(el => {
					this.check.checkedBrand.push(el.id);
				});
				this.check.isIndeterminate = true;
				this.selectedUser.allow_brand = 'all';
			} else {
				this.check.checkedBrand = [];
				this.check.isIndeterminate = false;
				this.selectedUser.allow_brand = '';
			}
		},
		handleCheckedCitiesChange(value) {
			let checkedCount = value.length;
			if(checkedCount === this.brands.length) {
				this.check.checkAll = true;
				this.check.isIndeterminate = true;
				this.selectedUser.allow_brand = 'all';
			} else {
				this.check.checkAll = false;
				this.check.isIndeterminate = false;
				this.selectedUser.allow_brand = String(value);
			}
		},
		deleteUser(name, id) {
			this.$confirm(`<strong>${name}</strong> хэрэглэгчийг устгах уу?`, 'Санамж', {
			confirmButtonText: 'Тийм',
			cancelButtonText: 'Үгүй',
			dangerouslyUseHTMLString: true,
			type: 'warning'
			}).then(() => {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/user/delete-user`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							id,
							role: this.LoggedUser.posID
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.contacts.forEach((el, index) => {
								if(el.id == id) {
									rts.contacts.splice(index, 1);
								}
							});
							rts.$notify({
								title: 'Амжилттай',
								message: `Хэрэглэгч устгагдлаа`,
								type: 'success'
							});
						}
						
					}).catch(error => {
						console.log(error);
					});
				}
			});
		},
		checkFavorite(id) {
			let ex = this.favorite.some(function(field) {
                return field.id == id
            });
			return ex;
		},
		getFavoriteUsers() {
			let u = JSON.parse(localStorage.getItem('favoriteUsers'));
			if(u != null && u.length > 0) {
				this.favorite = u;
			}
		},
		addFavoriteUsers(user) {
			let u = JSON.parse(localStorage.getItem('favoriteUsers'));
			if(u != null && u.length > 0) {
				let ex = this.favorite.some(function(field) {
                        return field.id == user.id
                });
				if(ex) {
					this.favorite.forEach((el, index) => {
						if(el.id == user.id) {
							this.favorite.splice(index, 1);
						}
					});
					localStorage.favoriteUsers = JSON.stringify(this.favorite);
				} else {
					this.favorite.push(user);
					localStorage.favoriteUsers = JSON.stringify(this.favorite);
				}
			} else {
				this.favorite.push(user);
				localStorage.favoriteUsers = JSON.stringify(this.favorite);
			}
		},
		updateUserStore() {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/update-user-store`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
					data: {
						user: this.userdata
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						rts.contacts.forEach((el, index) => {
							if(el.id == rts.userdata.id) {
								rts.contacts[index].call_store = rts.userdata.call_store;
							}
						});
						rts.$notify({
							title: 'Амжилттай',
							message: `Амжилттай шинэчлэгдлээ`,
							type: 'success'
						});
					}
					
				}).catch(error => {
					console.log(error);
				});
			}
		},
		getUsers() {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/get-all-users`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						rts.contacts = data.data.users;
						rts.store = data.data.store;
						rts.brands = data.data.brands;
					}
					
				}).catch(error => {
					console.log(error);
				});
			}
		},
		openDialog(data) {
			this.userdata = data
			this.dialogvisible = true
		},
		setPageWidth() {
			this.pageWidth = document.getElementById('page-contacts').offsetWidth
		},
		__resizeHanlder: _.throttle(function (e) {
			this.setPageWidth()
		}, 700)
	},
	mounted() {
		this.LoggedUser = JSON.parse(localStorage.user);
		this.getUsers();
		this.getFavoriteUsers();
		this.setPageWidth()
	}
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/_variables';

.el-dialog.user-dialog {
	max-width: 200px;

	.el-dialog__header {
		padding: 0;

		.el-dialog__headerbtn {
			z-index: 1;
			background: rgba(0, 0, 0, 0.05);
			min-width: 18px;
			min-height: 18px;
			border-radius: 4px;
			
			.el-dialog__close {
				color: $background-color;
			}
		}
	}
	.el-dialog__body {
		padding: 0;
	}

	.avatar-box {
		background: $text-color-accent;
		margin-bottom: 50px;
		position: relative;

		img {
			width: 100px;
			height: 100px;
			border-radius: 50%;
			position: relative;
			bottom: -50px;
			display: block;
			margin: 0 auto;
			background: white;
			border: 2px solid $text-color-accent;
			box-sizing: border-box;
		}

		.star {
			position: absolute;
			top: 50%;
			left: 50%;
			z-index: 1;
			background: white;
			box-sizing: border-box;
			width: 30px;
			height: 30px;
			text-align: center;
			line-height: 28px;
			font-size: 20px;
			border-radius: 50%;
			border: 2px solid $text-color-accent;
			cursor: pointer;
			margin-top: 35px;
			margin-left: 35px;

			.mdi-star {
				color: #ffd730;
			}
			.mdi-star-outline {
				opacity: .5;
			}
		}
	}

	.form-box {
		padding: 20px;
		box-sizing: border-box;

		& > * {
			margin: 10px 0;
		}
	}
}

.page-contacts {
	height: 100%;
	margin: 0 !important;
	padding: 20px;
	padding-bottom: 10px;
	box-sizing: border-box;

	.search-card {
		padding: 50px;
		max-width: 350px;
		//max-height: 320px;
		box-sizing: border-box;
		margin-bottom: 15px; 

		.el-input, .el-button {
			width: 100%;
		}

		.contacts-favourites {
			margin: 0;
			padding: 0;
			list-style: none;
			overflow: auto;

			li {
				list-style: none;
				padding: 0;
				margin: 0;
				margin-right: 10px;
				margin-bottom: 10px;
				float: left;
				cursor: pointer;
				background: $background-color;
				color: $text-color;
				border-radius: 4px;
				overflow: hidden;

				&:hover {
					color: $text-color-accent;	
				}

				img {
					width: 30px;
					height: 30px;
					float: left;
				}

				span {
					line-height: 30px;
					padding: 0 10px;
				}
			}
		}
	}

	.search-wrap {
		margin: 0 auto;
		margin-bottom: 10px;
		padding: 0px 30px;
		box-sizing: border-box;
		width: 100%;
		max-width: 600px;

		i {
			display: inline-block;
			width: 22px;
		}

		input {
			outline: none;
			background: transparent;
			border: none;
			font-size: 15px;
			position: relative;
			top: -2px;
			width: 100%;
			padding: 0;
			color: $text-color;
		}

		.contacts-tot {
			margin-right: 20px;
			margin-left: 10px;
		}

		a {
			border-bottom: 1px solid;
			text-decoration: none;
			color: $text-color;

			&:hover {
				opacity: .6;
			}
		}
	}

	.contacts-root {
		max-height: 100%;
	}

	.contacts-list {
		//margin: 0 auto;
		width: 100%;
		max-width: 965px;
		padding: 0px 30px;
		box-sizing: border-box;

		.contact {
			margin: 10px 0;
			padding: 5px;
			box-sizing: border-box;
			cursor: pointer;
			transition: all .1s;

			.star {
				.mdi-star {
					color: #ffd730;
				}
				.mdi-star-outline {
					opacity: .5;
				}
			}

			.avatar {
				width: 60px;
				transition: all .1s;

				img {
					border: 1px solid transparentize($text-color, .9);
					box-sizing: border-box;
					width: 50px;
					height: 50px;
					border-radius: 50%;
					transition: all .1s;
				}
			}

			.info {
				word-break: break-word;

				.name {
					
					//.fullname {}

					.email {
						opacity: 0;
						line-height: 0;
						transition: all .1s;
					}

					.phone {
						display: none;
					}
				}

				//.phone {}
			}

			&:hover {
				margin: 15px -20px;
				padding: 10px;
				background-color: lighten($background-color, 20%);
				border-radius: 5px;
				box-shadow: 0 8px 16px 0 rgba(40,40,90,.09),0 3px 6px 0 rgba(0,0,0,.065);

				.avatar {
					width: 90px;

					img {
						width: 90px;
						height: 90px;
					}
				}
				
				.info {
					.name {
						.email {
							opacity: 1;
							line-height: 1.4;
						}
					}
				}
			}
		}
	}

	.contacts-root {
		&.medium {
			.search-card {
				padding: 20px;
				max-width: 260px;
				//max-height: 260px;
			}
		}
		&.small {
			overflow-y: auto;
			display: block;
			-webkit-box-orient: vertical;
			-webkit-box-direction: normal;
			-ms-flex-direction: column;
			flex-direction: column;
			padding: 5px;

			.search-card {
				padding: 20px;
				max-width: 100%;
				width: 100%;
				//max-height: 240px;
				flex: none;
				-webkit-box-flex: none;
				-ms-flex: none;
				display: block;
				overflow: hidden !important;
			}
			
			.contacts-list {
				flex: none;
				-webkit-box-flex: none;
				-ms-flex: none;
				display: block;
				overflow: hidden !important;
			}
		}
	}
}

@media (max-width: 768px) {
	.page-contacts {
		.search-wrap {
			padding: 0;
		}
		.contacts-list {
			padding: 0px;

			.contact { 
				.avatar {
					width: 40px;

					img {
						width: 40px;
						height: 40px;
					}
				}

				.info {
					.phone {
						display: none;
					}

					.name {
						.phone {
							display: block;
						}
					}
				}

				&:hover {
					margin: 15px 0px;
					.avatar {
						width: 60px;
						img {
							width: 60px;
							height: 60px;
						}
					}
				}
			}
		}

		.contacts-root {
			&.medium {
				.contacts-list {
					padding: 0 30px;
				}
			}
			&.small {
				.contacts-list {
					padding: 8px;
				}
			}
		}
	}
}
</style>

