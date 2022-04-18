<template>
	<div class="page-ecommerce-product-detail scrollable only-y" v-loading.fullscreen.lock="loading">
		
		<el-breadcrumb separator="/" class="themed">
			<el-breadcrumb-item :to="'/products'">Бүтээгдэхүүний жагсаалт</el-breadcrumb-item>
			<el-breadcrumb-item>{{product.detail.model}}</el-breadcrumb-item>
		</el-breadcrumb>

		<el-row class="mt-30">
			<el-col>
				<div class="item-box card-shadow--medium">
					<el-row>
						<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
							<div class="gallery-box">
								<div class="main-photo">
									<img 
										:src="$imgUrl+product.detail.image"
										:data-zoom="$imgUrl+product.detail.image"
									>
								</div>
							</div>
						</el-col>
						<el-col :xs="24" :sm="12" :md="12" :lg="16" :xl="16">
							<div class="detail-box">
								<h1 class="title">{{product.detail.name}}</h1>
								<h4 class="title">{{product.detail.model}}<span class="o-080"> {{product.detail.color_name}}</span></h4>
								<div class="rate">
									<el-rate v-model="rate" style="width: 120px; display: inline-block;" disabled></el-rate>
									<span class="review fs-12 o-070">(0 customer review)</span>
								</div>
								<div class="price-box">
									<span class="discounted-price">₮ {{Number(product.detail.sale_price).toLocaleString()}}</span> 
									<span class="discounted-price o-060" :style="{'color': 'black', 'font-size': '15px', 'margin-left': '-10px'}">₮ {{Number(product.detail.wholesale_price).toLocaleString()}}</span> 
									<span class="discount" v-if="product.detail.discount > 0">{{product.detail.discount}}% off</span>
								</div>
								<div class="price-box" :style="{'margin-top': '-20px'}">
									Нийт үлдэгдэл: 
									<strong v-if="product.detail.total > 200">200+</strong>
									<strong v-else>{{Number(product.detail.total).toLocaleString()}}</strong>
								</div>
								<div class="description">
									{{product.detail.description}}
								</div>
								<div class="actions-box">
									<el-input-number v-model="qnt" controls-position="right" :min="1" :max="product.detail.total" class="themed mr-10"></el-input-number>
									<!-- <el-button class="themed mb-10 ml-0" type="primary" plain><i class="mdi mdi-heart-outline"></i> Хадгалах</el-button> -->
									<el-button-group v-if="loggedUser.posID == 1 || loggedUser.posID == 2">
										<el-button @click="addToCart(product.detail.id, product.detail.model)" class="mb-2 themed mr-10 " type="primary" plain><i class="mdi mdi-cart-outline"></i> Сагсанд нэмэх</el-button>
										<el-button icon="el-icon-setting" v-if="loggedUser.posID == 1 || loggedUser.posID == 2 || loggedUser.posID == 4" @click="modals.drawer = true" circle></el-button>
										<el-button icon="el-icon-delete" v-if="loggedUser.posID == 1 || loggedUser.posID == 2 || loggedUser.posID == 4" @click="deleteProduct" circle></el-button>
									</el-button-group>
									<el-button v-else @click="addToCart(product.detail.id, product.detail.model)" class="mb-2 themed mr-10 " type="primary" plain><i class="mdi mdi-cart-outline"></i> Сагсанд нэмэх</el-button>
								</div>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-col>
		</el-row>

		<el-row class="mt-20" v-if="loggedUser.posID < 6">
			<el-col>
				<div class="item-box p-30">
					<el-tabs v-model="activeTab" class="themed">
						<el-tab-pane label="Салбарын үлдэгдэлүүд" name="description">
							<div class="table-box card-base card-shadow--medium scrollable only-x">
								<table class="styled striped">
									<thead>
										<tr :style="{'font-size': '14px'}">
											<th>Салбарын нэр</th>
											<th>Үлдэгдэл</th>
											<th>Гэмтэлтэй</th>
											<th>Нийт үлдэгдлээс эзлэх хувь</th>
										</tr>
									</thead>
									<tbody>
										<tr v-for="item in location" :key="item.code">
											<td>{{item.name}}</td>
											<td>{{Number(product.detail[item.code]).toLocaleString()}}</td>
											<td>{{getRma(item)}}</td>
											<td>
												<!-- {{Number((product.detail[item.code]) * 100 / product.detail.total).toLocaleString()}} -->
												<el-progress v-if="product.detail.total > 0" :percentage="(product.detail[item.code]) * 100 / product.detail.total" :show-text="false" :color="customColors"></el-progress>
												<el-progress v-else :percentage="0" :show-text="false" :color="customColors"></el-progress>
											</td>
										</tr>
									</tbody>
								</table>
							</div>
						</el-tab-pane>
						<el-tab-pane label="Reviews (0)" name="reviews">
							Leave a review
						</el-tab-pane>
					</el-tabs> 
				</div>
			</el-col>
		</el-row>

		<el-drawer
		title="Бүтээгдэхүүн засварлах"
		:visible.sync="modals.drawer"
		:size="drawerWidth+'%'">
			<div class="ml-20 mr-20">
				<el-row :gutter="10">
					<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
						<el-input placeholder="Бүтээгдэхүүний нэр" v-model="product.detail.name" clearable> </el-input>
					</el-col>
					<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
						<el-input placeholder="Бүтээгдэхүүний модель" v-model="product.detail.model" clearable> </el-input>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
						<el-input placeholder="Бар код" v-model="product.detail.code" clearable> </el-input>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
						<el-input placeholder="Тайлбар" type="textarea" :rows="5" v-model="product.detail.description" clearable> </el-input>
					</el-col>
					<el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" class="mt-10">
						<el-input placeholder="Өртөг үнэ" v-model="product.detail.cost_price" clearable> </el-input>
					</el-col>
					<el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" class="mt-10">
						<el-input placeholder="Бөөний үнэ" v-model="product.detail.wholesale_price" clearable> </el-input>
					</el-col>
					<el-col :xs="8" :sm="8" :md="8" :lg="8" :xl="8" class="mt-10">
						<el-input placeholder="Худалдах үнэ" v-model="product.detail.sale_price" clearable> </el-input>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
						<el-select v-model="product.detail.brand" filterable placeholder="Брэнд" style="width: 100%">
							<el-option
							v-for="(item, index) in brands"
							:key="index"
							:label="item.brandname"
							:value="item.id">
							</el-option>
						</el-select>
					</el-col>
					<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
						<el-select v-model="product.detail.type" filterable placeholder="Үндсэн категори" style="width: 100%">
							<el-option
							v-for="(item, index) in category"
							:key="index"
							:label="item.category_name"
							:value="item.id">
							</el-option>
						</el-select>
					</el-col>
					<el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
						<el-select v-model="product.detail.category_sub_id" filterable placeholder="Дэд категори" style="width: 100%">
							<el-option
							v-for="(item, index) in filterSub"
							:key="index"
							:label="item.sub_category_name"
							:value="item.id">
							</el-option>
						</el-select>
					</el-col>
					<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10" align="center">
						<el-button type="info" plain style="width: 100%;" @click="editProduct">Хадгалах</el-button>
					</el-col>
				</el-row>
			</div>
		</el-drawer>
	</div>
</template>

<script>
import Drift from 'drift-zoom'

export default {
	name: 'EcommerceProductDetail',
	data () {
		return {
			rate: 4,
			drawerWidth: 30,
			loading: false,
			qnt: 1,
			activeTab: 'description',
			product: {
				id: 0,
				detail: []
			},
			location: [],
			modals: {
				drawer: false
			},
			customColors: [
				{color: '#f56c6c', percentage: 20},
				{color: '#e6a23c', percentage: 40},
				{color: '#5cb87a', percentage: 60},
				{color: '#1989fa', percentage: 80},
				{color: '#6f7ad3', percentage: 100}
			],
			loggedUser: [],
			rma: [],
			brands: [],
			category: [],
			sub: []
		}
	},
	mounted() {
		const mainPhoto = document.querySelector('.main-photo img')
		const paneContainer = document.querySelector('.main-photo')
		this.loggedUser = JSON.parse(localStorage.getItem('user'));
		new Drift(mainPhoto, {
			paneContainer: paneContainer,
			inlinePane: false,
			zoomFactor: 2
		});

		this.product.id = this.$route.params.id;
		this.getInfo();
		this.resizePopoverWidth();
		window.addEventListener('resize', this.resizePopoverWidth);
	},
	beforeDestroy() {
		window.removeEventListener('resize', this.resizePopoverWidth);
	},
	computed: {
		filterSub() {
			var arr = [];
			this.sub.forEach(el => {
				if(el.categoryID == this.product.detail.type) {
					arr.push(el);
				}
			});
			return arr;
		}
	},
	methods: {
		editProduct() {
			this.$confirm(`Хадгалахдаа итгэлтэй байна уу?`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                dangerouslyUseHTMLString: true,
                type: 'warning'
            }).then(() => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/product/edit-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            product: this.product.detail,
							role: this.loggedUser.posID
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${rts.product.detail.model}</strong> шинэчлэгдлээ`,
                                type: 'success'
                            });
							rts.modals.drawer = false;
                        }
                            
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
		},
		resizePopoverWidth() {
			if(window.innerWidth <= 768) {
				this.drawerWidth = 100	
			} else {
				this.drawerWidth = 30	
			}
		},
		getRma(item) {
			var qty = 0;
			this.rma.forEach(el => {
				if(el.storeId == item.code) {
					qty = el.total;
				}
			});
			return qty;
		},
		deleteProduct() {
			this.$confirm(`Утсгахдаа итгэлтэй байна уу?`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                dangerouslyUseHTMLString: true,
                type: 'warning'
            }).then(() => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/product/delete-product`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            id: this.product.id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${rts.product.detail.model}</strong> устгагдлаа`,
                                type: 'success'
                            });
							rts.$router.push('/products');
                        }
                            
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
		},
		addToCart(id, model) {
			if(this.qnt > this.product.detail.total) {
				this.$notify({
					title: 'Амжилтгүй',
					dangerouslyUseHTMLString: true,
					message: `Үлдэгдэл хүрэлцэхгүй байна`,
					type: 'error'
				});
			} else {
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
							id,
							qty: this.qnt
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								dangerouslyUseHTMLString: true,
								message: `<strong>${model}</strong> бүтээгдэхүүн нэмэгдлээ`,
								type: 'success'
							});
						}
					}).catch(error => {
						console.log(error);
					});
				}
			}
		},
		getInfo() {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/product-detail`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						id: this.product.id
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						document.querySelector('head title').textContent = data.data.product.model + ' ' +data.data.product.name;
						rts.product.detail = data.data.product;
						rts.location = data.data.loc;
						rts.rma = data.data.rma;
						rts.brands = data.data.brands;
						rts.category = data.data.category;
						rts.sub = data.data.sub;
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

.page-ecommerce-product-detail {
	.item-box {
		border-radius: 4px;
		overflow: hidden;

		.main-photo {
			position: relative; 
			overflow: hidden;
			background: white;
			padding: 30px;

			img {
				width: 100%;
			}
		}
		.detail-box {
			padding: 30px;
			position: relative; 

			.title {
				margin: 0;
			}

			.price-box {
				margin-top: 20px;
				margin-bottom: 30px;

				.discounted-price {
					color: $text-color-accent;
					font-weight: bold;
					font-size: 25px;
					margin-right: 20px;
					display: inline-block;
				}
				.normal-price {
					opacity: .5;
					text-decoration: line-through;
					text-decoration-color: $text-color-accent;
					margin-right: 10px;
					display: inline-block;
				}
				.discount {
					color: $text-color-accent;
					display: inline-block;
				}
			}

			.actions-box {
				margin-top: 30px;

				.el-input-number {
					width: 100px;
			
					.el-input__inner {
						color: $text-color-accent;
						background-color: transparent;
						border-color: $text-color-accent;
						font-family: inherit;
						font-weight: bold;
						padding-left: 5px;
						padding-right: 45px;
					}
				}

				.el-button {
					font-family: inherit;
					margin-left: 0;
				}
			}
		}
	}
}

</style>


