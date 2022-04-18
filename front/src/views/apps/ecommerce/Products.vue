<template>
	<div class="page-ecommerce-products flex" v-loading.fullscreen.lock="loading">
		<div :class="{'sidebar':true, 'open':sidebarOpen}">
			<vue-scroll class="scroller">
				<div class="widget close-filter-box">
					<button @click="sidebarOpen = false">
						Шүүлтүүр
					</button>
				</div>
				<el-button type="primary" plain size="small" style="width: 100%" class="mb-10" @click="filter">Шүүх</el-button>
				<div class="widget">
					<div class="title"><strong>Ангилал</strong></div>
					<div class="content">
						<el-tree @check="handleCurrentChange" :data="category" show-checkbox :props="treeProps" node-key="id" :default-expanded-keys="[1]" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"></el-tree>
					</div>
				</div>

				<div class="widget">
					<div class="title"><strong>Брэнд</strong></div>
					<div class="content scrollable" :style="{'max-height': '400px', 'overflow': 'auto'}">
						<el-tree @check="handleCheckChangeBrand" :data="brand" show-checkbox :props="brandProps" node-key="id" :default-expanded-keys="[1]" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"></el-tree>
					</div>
				</div>

				<div class="widget">
					<div class="title">Үнэ</div>
					<div class="content">
						<el-slider
							v-model="range"
							range
							:max="maxAmount"
							class="themed"
						></el-slider>
						<div class="flex justify-space-between o-060">
							<span>₮ {{range[0]}}</span>
							<span>₮ {{range[1]}}</span>
						</div>
					</div>
				</div>
				<div class="widget select-color">
					<div class="title">Өнгө</div>
					<div class="content scrollable" :style="{'max-height': '400px', 'overflow': 'auto'}">
						<el-tree @check-change="handleCheckChangeColor" :data="color" show-checkbox :props="colorProps" node-key="id" :default-expanded-keys="[1]" style="text-overflow: ellipsis; white-space: nowrap; overflow: hidden;"></el-tree>
					</div>
				</div>
			</vue-scroll>
		</div>

		<el-tabs v-model="activetag" class="scrollable" style="width: 100%;">
			<el-tab-pane label="Бүтээгдэхүүнүүд" name="products" ref="products">
				<div class="list-container box grow flex column">
					<div align="right" class="mb-10" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
						<!-- <el-button-group>
							<el-button type="info" @click="addExcel" icon="el-icon-document-add" size="mini"></el-button>
							<input type="file" id="excelInput" ref="excelInput" hidden @change="onChange">
							<el-button @click="goNewProduct()" type="warning" size="mini" icon="el-icon-news" class="mr-10" plain>Шинэ бүтээгдэхүүн</el-button>
						</el-button-group> -->
						<div align="right" class="mb-10 flex" style="flex-direction: row-reverse;" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2 || LoggedUser.posID == 4">
						<download-excel :data="excelData" :fields="excelField" worksheet="My Worksheet" :name="'Барааны үлдэгдэл.xls'" v-if="LoggedUser.posID == 1 || LoggedUser.posID == 2">
                            <el-tooltip class="item mr-10" effect="dark" content="Татах" placement="top">
                                <el-button type="info" size="mini" icon="el-icon-download" plain></el-button>
                            </el-tooltip>
                        </download-excel>
						<el-button @click="goNewProduct()" type="warning" size="mini" icon="el-icon-news" class="mr-10" plain>Шинэ бүтээгдэхүүн</el-button>
					</div>
					</div>
					<div class="toggle-filter-box">
						<button @click="sidebarOpen = !sidebarOpen">
							<span v-if="!sidebarOpen">Шүүлтүүр</span>
							<span v-if="sidebarOpen">Хаах</span>
						</button>
					</div>
					
					<div class="list only-y box grow">
						<div v-for="(i, index) in product" :key="index" class="item">
							<div class="wrapper card-shadow--medium">
								<div class="image p-20" style="position: relative;">
									<router-link :to="'/product-detail/'+i.id">
										<div class="bg" :style="`background-image: url(${$imgUrl+i.image})`"></div>
									</router-link>
									<img src="@/assets/images/newtitle.png" v-if="checkNewProduct(i.created_at)" alt="" style="position: absolute; top: 0; left: 0; width: 40px; height: auto;">
								</div>
								<div class="detail p-20">
									<div class="rate">
										<el-rate v-model="rate" disabled></el-rate>
									</div>
									<div class="name">
										{{i.model}}
									</div>
									<div class="desc">
										{{i.name}}
									</div>
									<div class="price">
										₮ {{Number(i.sale_price).toLocaleString()}}
									</div>
									<div class="buttons flex justify-space-between">
										<div>
											<button v-if="i.qty > 199">Үлдэгдэл: 100+</button>
											<button v-else>Үлдэгдэл: {{i.qty}}</button>
											<!-- <button class="ml-5"><i class="mdi mdi-magnify"></i></button> -->
										</div>
										<button @click="addToCart(i.id, i.model)" :style="{'cursor': 'pointer'}"><i class="mdi mdi-cart-outline ml-5"></i> Сагслах</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<el-pagination :style="{'margin-top': '20px'}" :current-page.sync="page.current" background layout="prev, pager, next" :page-size="40" :page-count="page.total" @current-change="changePagination"> </el-pagination>
				</div>
			</el-tab-pane>
			<el-tab-pane name="recommended" ref="recommendedTag">
				<span slot="label">
					Санал болгох
					<el-badge type="warning" :value="recommended.list.length" :max="99" class="item" style="position: absolute; top: 0;">
					</el-badge>
				</span>
				<div class="list-container box grow flex column">
					<div class="list only-y box grow">
						<div v-for="(i, index) in recommended.list" :key="index" class="item">
							<div class="wrapper card-shadow--medium">
								<div class="image p-20" style="position: relative;">
									<router-link :to="'/product-detail/'+i.id">
										<div class="bg" :style="`background-image: url(${$imgUrl+i.image})`"></div>
									</router-link>
									<img src="@/assets/images/newtitle.png" v-if="checkNewProduct(i.created_at)" alt="" style="position: absolute; top: 0; left: 0; width: 40px; height: auto;">
								</div>
								<div class="detail p-20">
									<div class="rate">
										<el-rate v-model="rate" disabled></el-rate>
									</div>
									<div class="name">
										{{i.model}}
									</div>
									<div class="desc">
										{{i.name}}
									</div>
									<div class="price">
										₮ {{Number(i.sale_price).toLocaleString()}}
									</div>
									<div class="buttons flex justify-space-between">
										<div>
											<button v-if="i.qty > 199">Үлдэгдэл: 100+</button>
											<button v-else>Үлдэгдэл: {{i.qty}}</button>
										</div>
										<button @click="addToCart(i.id, i.model)" :style="{'cursor': 'pointer'}"><i class="mdi mdi-cart-outline ml-5"></i> Сагслах</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<el-pagination :style="{'margin-top': '20px'}" :current-page.sync="recommended.page" background layout="prev, pager, next" :page-size="40" :page-count="recommended.total" @current-change="changePaginationRecommended"> </el-pagination>
				</div>
			</el-tab-pane>
			<el-tab-pane name="newArrival">
				<span slot="label">
					Шинэ бараа
					<el-badge type="warning" :value="newProducts.list.length" :max="99" class="item" style="position: absolute; top: 0;">
					</el-badge>
				</span>
				<div class="list-container box grow flex column">
					<div class="list only-y box grow">
						<div v-for="(i, index) in newProducts.list" :key="index" class="item">
							<div class="wrapper card-shadow--medium">
								<div class="image p-20" style="position: relative;">
									<router-link :to="'/product-detail/'+i.id">
										<div class="bg" :style="`background-image: url(${$imgUrl+i.image})`"></div>
									</router-link>
									<img src="@/assets/images/newtitle.png" v-if="checkNewProduct(i.created_at)" alt="" style="position: absolute; top: 0; left: 0; width: 40px; height: auto;">
								</div>
								<div class="detail p-20">
									<div class="rate">
										<el-rate v-model="rate" disabled></el-rate>
									</div>
									<div class="name">
										{{i.model}}
									</div>
									<div class="desc">
										{{i.name}}
									</div>
									<div class="price">
										₮ {{Number(i.sale_price).toLocaleString()}}
									</div>
									<div class="buttons flex justify-space-between">
										<div>
											<button v-if="i.qty > 199">Үлдэгдэл: 100+</button>
											<button v-else>Үлдэгдэл: {{i.qty}}</button>
										</div>
										<button @click="addToCart(i.id, i.model)" :style="{'cursor': 'pointer'}"><i class="mdi mdi-cart-outline ml-5"></i> Сагслах</button>
									</div>
								</div>
							</div>
						</div>
					</div>
					<el-pagination :style="{'margin-top': '20px'}" :current-page.sync="newProducts.page" background layout="prev, pager, next" :page-size="40" :page-count="newProducts.total" @current-change="changePaginationNew"> </el-pagination>
				</div>
			</el-tab-pane>
			<el-tab-pane label="Миний бүтээгдэхүүн" name="MyProduct" v-if="LoggedUser.posID == 6">
				<div class="list-container box grow flex column">
					<div align="right" class="mb-10" v-if="LoggedUser.posID == 6">
						<el-button @click="$router.push('/customer-new-product');" type="warning" size="mini" icon="el-icon-news" class="mr-10" plain>Шинэ бүтээгдэхүүн</el-button>
					</div>
					<div class="toggle-filter-box">
						<button @click="sidebarOpen = !sidebarOpen">
							<span v-if="!sidebarOpen">Шүүлтүүр</span>
							<span v-if="sidebarOpen">Хаах</span>
						</button>
					</div>
					
					<div class="list only-y box grow">
						<div v-for="(i, index) in customerproduct" :key="index" class="item">
							<div class="wrapper card-shadow--medium">
								<div class="image p-20" style="position: relative;">
									<router-link :to="'/product-detail/'+i.id" v-if="i.type == 1">
										<div class="bg" :style="`background-image: url(${$imgUrl+i.image})`"></div>
									</router-link>

									<router-link :to="'/product-detail-customer/' + i.id" v-else>
										<div class="bg" :style="`background-image: url(${$appUrl+'/images/local/product/'+i.image})`"></div>
									</router-link>
									<!-- <img src="@/assets/images/newtitle.png" v-if="checkNewProduct(i.created_at)" alt="" style="position: absolute; top: 0; left: 0; width: 40px; height: auto;"> -->
								</div>
								<div class="detail p-20">
									<div class="rate">
										<el-rate v-model="rate" disabled></el-rate>
									</div>
									<div class="name">
										{{i.model}}
									</div>
									<div class="desc">
										{{i.name}}
									</div>
									<div class="price">
										₮ {{Number(i.sale_price).toLocaleString()}}
									</div>
									<div class="buttons flex justify-space-between">
										<div>
											<button v-if="i.qty > 199">Үлдэгдэл: 100+</button>
											<button v-else>Үлдэгдэл: {{i.qty}}</button>
											<!-- <button class="ml-5"><i class="mdi mdi-magnify"></i></button> -->
										</div>
										<button v-if="i.type == 1" @click="addToCart(i.id, i.model)" :style="{'cursor': 'pointer'}"><i class="mdi mdi-cart-outline ml-5"></i> Сагслах</button>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</el-tab-pane>
		</el-tabs>
	</div>
</template>

<script>
import readXlsxFile from 'read-excel-file';
export default {
	name: 'Products',
	data () {
		return {
			excelField: {
                "#": "id",
                "Name": "name",
                "Model": "model",
                "Unit price": "unitprice"
            },
            excelData: [],
			all: {
				store: [],
				product: []
			},
			loading: false,
			rate: 5,
			page: {
				current: 1,
				total: 0
			},
			brand: [],
			color: [],
			newProducts: {
				list: [],
				page: 1,
				total: 0
			},
			search: '',
			isSearch: false,
			category: [],
			product: [],
			recommended: {
				list: [],
				page: 1,
				total: 0
			},
			productSource: [],
			selected: {
				brand: [],
				color: [],
				category: []
			},
			gridData: [],
			maxAmount: 0,
			sidebarOpen: false,
			range: [0, 0],
			treeProps: {
				children: 'children',
				label: 'label'
			},
			brandProps: {
				label: 'brandname'
			},
			colorProps: {
				label: 'total'
			},
			LoggedUser: [],
			activetag: 'products',
			windowWidth: 0,
			customerproduct: []
		}
	},
	beforeRouteUpdate (to, from, next) {
        this.page.current = 1;
		if(to.query.search !== undefined) {
			this.search = to.query.search;
		}
        this.selected.brand = [];
        this.selected.color = [];
		this.selected.category = [];
        this.range = [0,0]
        this.getProduct();
        next();
    },
	computed: {},
	methods: {
		addExcel() {
			this.$refs.excelInput.click();
		},
		onChange(e) {
			var file = e.target.files ? e.target.files[0] : null;
			var product = [];
			var rts = this;
			readXlsxFile(file).then((rows) => {
				// rows.forEach(el => {
				// 	var detail = {name: el[0], model: el[1], code: el[2], color_name: el[3], cost_price: el[4], wholesale_price: el[5], sale_price: el[6], brand: el[7], type: el[8], category_sub_id: el[9], remain: el[10], shop_01: el[11]}
				// 	product.push(detail);
				// });
				rts.loading = true;
				const token = localStorage.getItem('token');
				if(file) {
					rts.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/product/add-from-sheet`,
						headers: {
							"Authorization": `Bearer ${token}`
						}, 
						data: {
							rows
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								dangerouslyUseHTMLString: true,
								message: `Бүтээгдэхүүн нэмэгдлээ`,
								type: 'success'
							});
						}
					}).catch(error => {
						rts.loading = false;
						console.log(error);
					});
				}
			})
		},
		sortedArray: function() {
			function compare(a, b) {
				if (a.name < b.name)
					return -1;
				if (a.name > b.name)
					return 1;
				return 0;
			}
			this.customerproduct =  this.customerproduct.sort(compare);
		},
		checkNewProduct(date) {
			Date.prototype.addDays = function(days) {
				var date = new Date(this.valueOf());
				date.setDate(date.getDate() + days);
				return date;
			}
			var min = new Date().addDays(-40);
			var current = new Date(date);
			if(current > min) {
				return true;
			}
			return false;
		},
		goNewProduct() {
			this.$router.push('/new-product');
		},
		addToCart(id, model) {
			var rts = this;
			rts.loading = true;
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
						qty: 1
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.$notify({
							title: 'Амжилттай',
							dangerouslyUseHTMLString: true,
							message: `<strong>${model}</strong> бүтээгдэхүүн нэмэгдлээ`,
							type: 'success'
						});
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		changePagination(val) {
			this.page.current = val;
			this.getProduct();
		},
		changePaginationNew(val) {
			this.newProducts.page = val;
			this.getNewProduct();
		},
		changePaginationRecommended(val) {
			this.recommended.page = val;
			this.getRecommendedProduct();
		},
		handleCurrentChange(data, checked) {
			this.selected.category = [];
			checked.checkedKeys.forEach(el => {
				if (el !== undefined) {
					this.selected.category.push(el);
				}
			});
		},
		handleCheckChangeBrand(data, checked) {
			this.selected.brand = [];
			checked.checkedKeys.forEach(el => {
				if (el !== undefined) {
					this.selected.brand.push(el);
				}
			});
		},
		handleCheckChangeColor(data) {
			if(data.color_name !== undefined) {
				let ex = this.selected.color.some(function(field) {
					return field == data.color_name
				});
				if(ex) {
					this.selected.color.forEach((element, index) => {
						if(element == data.color_name) {
							this.selected.color.splice(index, 1);
						}
					});
				} else {
					this.selected.color.push(data.color_name);
				}
			}
		},
		initGridData() {
			_.times(50, (number) => {
				let price = chance.floating({ min: 1, max: 100, fixed: 2 })

				this.gridData.push({
					photo: '/static/images/shop/'+chance.integer({ min: 0, max: 19 })+'.jpg',
					product: chance.sentence({ words: 3 }),
					price: _.replace(price.toFixed(2).toString(), '.', ','),
					rate: chance.integer({ min: 3, max: 5 }),
					id: number,
				})
			})
		},
		gotoDetail() {
			this.$router.push({name:'ecommerce-product-detail'})
		},
		filter() {
			this.page.current = 1;
			this.isSearch = true;
			this.getProduct();
		},
		buildExcelData() {
			var field = this.excelField, data, txt = '';
			this.all.store.forEach((s) => {
				field[s.name] = s.code;
			});
			
			this.all.product.forEach((p, index) => {
				data = {id: index + 1, name: p.name, model: p.model, unitprice: p.sale_price}; 
				this.all.store.forEach(e => {
					data[e.code] = p[e.code];
				});
				this.excelData.push(data);
			});
		},
		getAllProduct() {
			var rts = this;
			rts.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/get-all-products`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					rts.loading = false;
					rts.all.store = data.data.store;
					rts.all.product = data.data.product;
					rts.buildExcelData();		
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		getProduct() {
			var rts = this;
			rts.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/products`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
						brand: this.selected.brand,
						page: this.page.current,
						color: this.selected.color,
						price: this.range,
						category: this.selected.category,
						search: this.search 
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						// rts.productSource = data.data.product
						rts.product = data.data.product;
						rts.page.total = data.data.pagination;
						if(rts.LoggedUser.posID == 6) {
							rts.customerproduct = [];
							data.data.customerproduct2.forEach(el => {
								rts.customerproduct.push(el);
							});
							data.data.customerproduct1.forEach(el => {
								rts.customerproduct.push(el);
							});
							rts.sortedArray();
						}
						if(rts.isSearch == false) {
							rts.maxAmount = data.data.maxAmount[0].max;
							rts.range = [rts.range[0], data.data.maxAmount[0].max];
							rts.category = data.data.sub;
							rts.brand = data.data.brand;
							rts.color = data.data.color;
						}
						rts.getAllProduct();
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		getNewProduct() {
			var rts = this;
			rts.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/get-new-products`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
					data: {
						page: this.newProducts.page
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.newProducts.list = data.data.product;
						rts.newProducts.total = data.data.pagination;
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		getRecommendedProduct() {
			var rts = this;
			rts.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/get-recommended-products`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
					data: {
						page: this.recommended.page
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.recommended.list = data.data.product;
						rts.recommended.total = data.data.pagination;
					}
					
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
	},
	created() {
		this.initGridData()
	},
	mounted() {
		this.LoggedUser = JSON.parse(localStorage.user);
		var search = this.$route.query.search;
		if(search !== undefined) {
			this.search = search;
		}
		this.getProduct();
		this.getNewProduct();
		this.getRecommendedProduct();
	}
}
</script>

<style lang="scss" scoped>
// .item {
//   margin-top: 10px;
//   margin-right: 40px;
//   margin-bottom: 10px;
// }
@import '../../../assets/scss/_variables';
.page-ecommerce-products {
	.sidebar {
		width: 300px;
		margin-right: 20px;
		margin-right: 10px;
		margin-left: -10px;

		.scroller {
			padding: 10px;
			padding-top: 0px;
			width: 100%;
			height: 100%;
			box-sizing: border-box;
		}

		.widget {
			background: white;
			border-radius: 4px;
			margin-bottom: 20px;
			box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.07), 0 3px 6px 0 rgba(0, 0, 0, 0.065);
			overflow: hidden;

			&.close-filter-box {
				display: none;
				text-align: center;

				button {
					width: 100%;
					border: none;
					text-transform: uppercase;
					outline: none;
					font-family: inherit;
					font-weight: bold;
					padding: 5px 0px;
					border-bottom: 2px solid;
					background: white;
					color: $text-color-accent;
					cursor: pointer;
				}
			}

			&.select-color {
				ul, li {
					padding: 0;
					list-style: none;
					margin: 0;
				}

				li {
					margin-bottom: 10px;
				}

				.color-box {
					background: transparent;
					width: 12px;
					height: 12px;
					display: inline-block;
					margin-right: 10px;
				}
			}

			.title {
				border-bottom: 1px solid rgba(0, 0, 0, 0.1);
				padding: 15px 20px;
			}
			.content {
				padding: 15px 20px;
			}
		}
	}

	.toggle-filter-box {
		padding: 10px;
		padding-top: 0px;
		text-align: right;
		display: none;

		button {
			border: none;
			text-transform: uppercase;
			outline: none;
			font-family: inherit;
			font-weight: bold;
			padding: 1px 2px;
			border-bottom: 2px solid;
			color: $text-color-accent;
			background: transparent;
			cursor: pointer;
		}
	}

	.list {
		.item {
			display: block;
			width: 25%;
			height: 400px;
			padding: 0 10px;
			padding-bottom: 20px;
			box-sizing: border-box;
			float: left;

			.wrapper {
				box-sizing: border-box;
				height: 100%;
				position: relative;
				cursor: pointer;
				transition: all .25s;

				.image {
					box-sizing: border-box;
					height: 150px;
					width: 100%;
					background-color: white;	
					padding-bottom: 10px;		

					.bg {
						background-color: white;			
						background-size: contain;
						background-repeat: no-repeat;
						background-position: center center;
						width: 100%;
						height: 100%;
					}
				}

				.detail {
					padding-top: 10px;

					.rate {
						margin-top: 10px; 

						& > div {
							margin: 0 auto;
							display: block;
							width: 120px;
						}
					}

					.name {
						text-transform: uppercase;
						font-weight: bold;
						text-align: center;
						padding: 10px;
						padding-bottom: 5px;
					}

					.desc {
						text-align: center;
						font-size: 14px;
						opacity: .5;
					}

					.price {
						text-align: center;
						font-weight: bold;
						font-size: 22px;
						padding: 10px;
						color: $text-color-accent;
					}
				}

				.buttons {
					position: absolute;
					left: 20px;
					bottom: 20px;
					right: 20px; 

					button {
						background: white;
						color: $text-color;
						border: none;
						text-transform: uppercase;
						outline: none;
						font-family: inherit;
						font-weight: bold;
						padding: 3px 7px;
					}
				}

				&:hover {
					box-shadow: 0 8px 16px 0 rgba(40, 40, 90, 0.09), 0 3px 6px 0 rgba(0, 0, 0, 0.065), 0px 10px 0px 0px $text-color-accent;
				}
			}
		}
	}
}

@media (max-width: 1400px) {
	.page-ecommerce-products {

		.list {
			.item {
				width: 33.33%;
			}
		}
	}
}


@media (max-width: 1100px) {
	.page-ecommerce-products {

		.list {
			.item {
				width: 50%;
			}
		}
	}
}



@media (max-width: 900px) {
	.page-ecommerce-products {

		.sidebar {
			width: 200px;
		}

	}
}

@media (max-width: 768px) {
	.page-ecommerce-products {

		.sidebar {
			width: 230px;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			margin: 0;
			z-index: 999;
			transform: translateX(-100%);
			transition: all .25s;
			background: white;

			.scroller {				
				padding: 15px;
				padding-top: 20px;
			}

			.widget {
				&.close-filter-box {
					display: block;
				}
			}

			&.open {
				transform: translateX(0%);
				box-shadow: 3px 0px 10px -3px rgba(0, 0, 0, 0.4);
				border-top-left-radius: 4px;
				border-top-right-radius: 4px;
			}
		}

		.toggle-filter-box {
			display: block;
		}

	}
}

@media (max-width: 480px) {
	.page-ecommerce-products {

		.list {
			.item {
				width: 100%;
			}
		}
	}
}

</style>


