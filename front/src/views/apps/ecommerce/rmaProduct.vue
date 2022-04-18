<template>
	<div class="page-ecommerce-checkout scrollable">
		
		<el-breadcrumb separator="/" class="mb-20">
			<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/rma' }">RMA</el-breadcrumb-item>
			<el-breadcrumb-item>{{shop.name}}</el-breadcrumb-item>
		</el-breadcrumb>

        <el-row class="cart-box" :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <div class="widget review card-shadow--small b-rad-4">
                    <div class="title">
                        Бүтээгдэхүүн
                    </div>
                    <div class="content">
                        <div class="page-ecommerce-dashboard mt-10" style="width: 100%;" :style="{'border-radius': '10px'}">
                        <div class="table-box card-base card-outline" style="overflow: auto;">
                            <table class="styled striped hover">
                                <thead>
                                    <tr style="font-size: 14px;">
                                        <th width="1%">#</th>
                                        <th>Бүтээгдэхүүн</th>
                                        <!-- <th>Үнэ</th> -->
										<th>Шалтгаан</th>
                                        <th>Ажилтан</th>
										<th>Хүлээж авсан</th>
                                        <th>Төлөв</th>
										<th v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(i, index) in rma.detail" :key="index">
                                        <td>{{index + 1}}</td>
                                        <td style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                                            <div class="item-box item-product">
                                                <div class="product-image">
                                                    <el-avatar :size="40" :src="$imgUrl+i.image">
                                                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                                                    </el-avatar>
                                                </div>
                                                <div>
                                                    <h4 class="m-0">{{i.model}}</h4>
                                                    <p class="m-0">{{i.name}} <strong>{{i.color_name}}</strong></p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{{i.about}}</td>
                                        <td>{{i.username}}</td>
                                        <td>
											<span v-if="i.wrote" style="color: green;">Тийм</span>
											<span v-else style="color: red;">Үгүй</span>
										</td>
										<td>
											<!-- <div class="item-box item-status" v-bind:class="{'status-Pending': i.stat == 1, 'status-Complete': i.stat == 2, 'status-Returned': i.stat == 3 || i.stat == 4, 'status-Paid': i.stat == 5}"> -->
												<div class="item-box item-status" :style="{'border-radius': '5px'}" v-bind:class="{'status-Complete': i.stat != 1 && i.wrote == 1, 'status-Returned': i.stat == 1 && i.wrote == 0, 'status-Pending': i.stat == 1 && i.wrote == 1}">
												<h4 class="m-0 mb-5" v-if="i.stat == 1 && i.sent == 0">Илгээгдээгүй</h4>
												<h4 class="m-0 mb-5" v-else-if="i.stat == 1 && i.sent == 1">Шийдэгдээгүй</h4>
												<h4 class="m-0 mb-5" v-else-if="i.stat == 2">Актлагдсан</h4>
												<h4 class="m-0 mb-5" v-else-if="i.stat == 3">Нийлүүлэгчрүү буцаагдсан</h4>
												<h4 class="m-0 mb-5" v-else-if="i.stat == 4">Тасаг руу буцаагдсан</h4>
												<h4 class="m-0 mb-5" v-else-if="i.stat == 5">Авлага үүсгэсэн</h4>
												<p class="m-0 o-060" v-if="i.stat == 1">-</p>
												<p class="m-0 o-060" v-if="i.stat != 1">{{i.updated_at.split('T')[0]}}</p>
											</div>
										</td>
										<td v-if="i.sent == 1 && (LoggedUser.posID == 1 || LoggedUser.posID == 2)">
											<el-tooltip class="item" effect="dark" content="Хүлээж авсан болгох" v-if="i.wrote == 0" placement="top-end">
												<el-button type="primary" icon="el-icon-download" size="small" circle @click="changeWrote(i.id, i.model)"></el-button>
											</el-tooltip>
											<el-tooltip class="item" effect="dark" content="Төлөв шинэчлэх" v-else-if="i.wrote == 1" placement="top-end">
												<el-button type="warning" v-if="i.stat == 1" icon="el-icon-edit"  size="small" @click="changeMainStatus(i.id, i.stat)" circle></el-button>
												<el-button type="success" v-else icon="el-icon-check"  size="small" @click="changeMainStatus(i.id, i.stat)" circle></el-button>
											</el-tooltip>
										</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
		<el-dialog title="Тохиргоо" :visible.sync="modals.setting" width="30%">
			<div align="center" style="width: 100%">
				<el-select v-model="rma.selectedStatus" placeholder="Төлвөө сонгоно уу" style="width: 80%;" class="mt-10">
					<el-option
					v-for="(item, index) in stat.mainStat"
					:key="index"
					:label="item.label"
					:value="item.value">
					</el-option>
				</el-select>
			</div>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.setting = false">Болих</el-button>
				<el-button type="primary" @click="UpdateRmaProduct">Хадгалах</el-button>
			</span>
		</el-dialog>
	</div>
</template>

<script>
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'EcommerceCheckout',
	data () {
		return {
			LoggedUser: [],
            loading: false,
            rma: {
                store: '',
				type: 0,
                detail: [],
				selectedId: '',
				selectedStatus: ''
            },
            shop: '',
			modals: {
				setting: false
			},
			stat: {
				wrote: [{
					label: 'Хүлээж авсан',
					value: 11
				}, {
					label: 'Хүлээж аваагүй',
					value: 0
				}],
				mainStat: [{
					label: 'Шийдвэрлээгүй',
					value: 1
				}, {
					label: 'Актлагдсан',
					value: 2
				}, {
					label: 'Нийлүүлэгч рүү буцаасан',
					value: 3
				}, {
					label: 'Тасаг руу буцаасан',
					value: 4
				}, {
					label: 'Авлага үүсгэсэн',
					value: 5
				}]
			}		
		}
	},
    mounted() {
        this.rma.store = this.$route.params.id;
		this.rma.type = this.$route.params.type;
        this.LoggedUser = JSON.parse(localStorage.getItem('user'));
        this.getOrder();
    },
	methods: {
		changeMainStatus(id, status) {
			this.rma.selectedId = id;
			this.rma.selectedStatus = status;
			this.modals.setting = true;
		},
		UpdateRmaProduct() {
			this.$confirm(`Итгэлтэй байна уу?`, 'Санамж', {
				confirmButtonText: 'Тийм',
				cancelButtonText: 'Болих',
				dangerouslyUseHTMLString: true,
				type: 'warning'
			}).then(() => {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/change-rma-status`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							id: this.rma.selectedId,
							stat: this.rma.selectedStatus
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: 'Шинэчлэгдлээ',
								type: 'success'
							});
							rts.modals.setting = false;
							rts.getOrder();
						} else if(data.data.result == 'failed'){
							rts.$router.push({name:'not-found'});
						}
					}).catch(error => {
						console.log(error);
					});
				}
			});
		},
		changeWrote(id, model) {
			this.$confirm(`<strong>${model}</strong>-ыг хүлээж авах уу?`, 'Санамж', {
				confirmButtonText: 'Тийм',
				cancelButtonText: 'Болих',
				dangerouslyUseHTMLString: true,
				type: 'warning'
			}).then(() => {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/order/wrote-rma`,
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
								message: 'Шинэчлэгдлээ',
								type: 'success'
							});
							rts.getOrder();
						} else if(data.data.result == 'failed'){
							rts.$router.push({name:'not-found'});
						}
					}).catch(error => {
						console.log(error);
					});
				}
			});
		},
        getOrder() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/get-rma-current-product`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						store: this.rma.store,
						type: this.rma.type
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
                        rts.shop = data.data.shop;
						rts.rma.detail = data.data.rma;
					} else if(data.data.result == 'failed'){
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