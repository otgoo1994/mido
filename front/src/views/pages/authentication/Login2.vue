<template>
	<div class="login-page flex">
		<!-- <div class="box grow scrollable align-vertical side-box box-left">
			<div class="align-vertical-middle wrapper text-center">
			</div>
		</div> -->
		<div class="box grow scrollable align-vertical side-box box-right" align="center">
			<!-- <img src="@/assets/images/bg.jpg" alt="background" class="bg-full-right" /> -->
			<div class="align-vertical-middle wrapper">
				
				<form class="form-box" @submit.prevent="login">
					<!-- <h2 class="mb-30">Нэвтрэх цонх</h2> -->
					<div class="flex ml-15" align="left">
						<img src="@/assets/images/header-black.png" style="width: 80px; height: auto;" alt="logo" class="mb-30"/>
						<span class="ml-10"><strong>УДИРДЛАГЫН НЭГДСЭН<br>СИСТЕМ</strong></span>
					</div>
					<!-- <p class="mb-40">Хэрэглэгчийн нэр болон нууц үгээ ашиглаж нэвтэрнэ үү</p> -->
					
					<float-label class="styled" align="left">
						<!-- <input type="username" name="username" placeholder="Username" v-model="username"> -->
						<el-input placeholder="Имэйл" v-model="username" clearable> </el-input>
					</float-label>
					<float-label class="styled" align="left">
						<!-- <input type="password" name="password" placeholder="Password" v-model="password"> -->
						<el-input placeholder="Нууц үг" v-model="password" clearable show-password> </el-input>
					</float-label>
					
					<div class="flex mb-10">
						<div class="box grow text-right"><el-link type="warning" @click="forgotPassword">Нууц үгээ мартсан уу?</el-link></div>
					</div>

					<div class="flex text-center center pb-10">			
						<!-- <el-button plain size="small" native-type="submit" class="login-btn pulse animated themed">
							Login
						</el-button> -->
						<el-button native-type="submit" type="info" class="loginBtn" :loading="buttonLoading" :style="{'width': '100%'}">Нэвтрэх</el-button>
					</div>
				</form>
			</div>
		</div>

	</div>
</template>

<script>
export default {
	name: 'Login2',
	data() {
		return {
			username: '',
			password: '',
			buttonLoading: false
		}
	},
	methods: {
		forgotPassword() {
			this.$prompt('Бүртгэлтэй имэйл хаягаа оруулна уу', 'Нууц үг сэргээх', {
				confirmButtonText: 'Илгээх',
				cancelButtonText: 'Болих',
				inputPattern: /[\w!#$%&'*+/=?^_`{|}~-]+(?:\.[\w!#$%&'*+/=?^_`{|}~-]+)*@(?:[\w](?:[\w-]*[\w])?\.)+[\w](?:[\w-]*[\w])?/,
				inputErrorMessage: 'Буруу бичиглэл'
			}).then(({ value }) => {
				let rts = this;
				rts.$axios({
					method: 'POST',
					url: rts.$appUrl + '/api/user/forgot-password',
					headers: {},
					data: {
						email: value
					}
				}).then(data => {
					if(data.data.result === 'success') {
						this.$notify({
							title: 'Амжилттай',
							dangerouslyUseHTMLString: true,
							message: 'Нууц үг шинэчлэгдлээ<br>Имэйл хаягаа шалгана уу',
							type: 'success'
						});
					} else {
						this.$notify({
							title: 'Амжилтгүй',
							message: 'Имэйл хаяг бүртгэлгүй',
							type: 'error'
						});
					}
				});
			});
		},
		login() {
			if(this.username == '' || this.password == '') {
				this.$notify({
					title: 'Алдаа',
					message: 'Талбараа бүрэн оруулна уу',
					type: 'warning'
				});
			} else {
				// this.$router.push('/dashboard');
				let rts = this;
				rts.$axios({
					method: 'POST',
					url: rts.$appUrl + '/api/user/login',
					headers: {},
					data: {
						email: this.username,
						password: this.password
					}
				}).then(data => {
					if(data.data.result === 'success') {
						localStorage.token = data.data.token;
						localStorage.user = JSON.stringify(data.data.user);
						this.$notify({
							title: 'Амжилттай',
							message: 'Симтемд	 нэвтэрлээ',
							type: 'success'
						});
						if (data.data.user.posID == 6) {
							rts.$router.push('/products');
						} else {
							rts.$router.push('/ecommerce-dashboard');
						}
					} else {
						this.$notify({
							title: 'Амжилтгүй',
							message: 'Хэрэглэгчийн нэр эсвэл нууц үг буруу',
							type: 'error'
						});
					}
				});
			}
		}
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';
.loginBtn {
	background-color: #393D3E;
}
.loginBtn:hover {
	background-color: #505557;
}

.bg-full-right {
	opacity: 0.2;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: auto;
	z-index: -3;
}

.login-page {
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	padding: 0 !important;

	.side-box {
		.wrapper {
			width: 100%;
			box-sizing: border-box;
			padding: 20px;
		}
	}

	.box-left {
		// background-image: url('../../../assets/images/bg3.jpg');
		background-size: cover;
		background-position: 50% 50%;

		.wrapper {
			.image-logo {
				width: 90%;
				max-width: 100px;
				margin-top: 20px;
			}

		}
	}
	.box-right {
		// background-image: url('../../../assets/images/bg3.jpg');
		position: relative;
	}
	
	.form-box {
		width: 100%;
		max-width: 340px;
		padding: 30px;
		box-sizing: border-box;
		margin: 20px auto;
		//background: transparent;

		a {
			font-size: 14px;
			color: var(--color-accent);
			text-decoration: none;
			font-weight: 500;
		}

		.image-logo {
			width: 80px;
			margin: 0px auto;
			margin-bottom: 70px;
			display: block;
		}

		.login-btn {
			background: rgba(var(--color-accent-rgb), .2);
			color: var( --text-color);
			border-color: var(--text-color);
			border-width: 2px;
			font-weight: bold;
			border-radius: 0;

			&:hover {
				background: rgba(var(--color-accent-rgb), 1);
				border-color: var(--text-color);
				color: var( --text-color);
			}
		}
	}
}

@media (max-width: 1200px) {
.login-page {
	.box-left {
		.wrapper {
			.h-big {
				font-size: 50px;
			}
		}
	}
}
}
@media (max-width: 900px) {
.login-page {
	.box-left {
		.wrapper {
			.h-big {
				font-size: 30px;
			}
		}
	}
}
}
@media (max-width: 768px) {
.login-page {
	display: block;
	overflow: auto;
	
	.side-box {
		display: block;
	}
}
}
</style>
