<template>
	<div class="page-ecommerce-new-product scrollable">
		<div class="page-header">
			<el-breadcrumb separator="/" class="mb-10">
				<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
				<el-breadcrumb-item :to="{ path: '/products' }">Бүтээгдэхүүний жагсаалт</el-breadcrumb-item>
				<el-breadcrumb-item>Шинэ бүтээгдэхүүн</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

		<el-row>
			<el-col>
				<div class="item-box card-shadow--small b-rad-4">
					<el-row>
						<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
							<div class="detail-box">
								<el-row :gutter="20">
									<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-input placeholder="Бүтээгдэхүүний нэр" style="width: 100%;" v-model="product.name" clearable> </el-input>
									</el-col>
									<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-input placeholder="Бүтээгдэхүүний модель" style="width: 100%;" v-model="product.model" clearable> </el-input>
									</el-col>
								</el-row>
								<el-row :gutter="20">
								    <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8" align="center">
										<div class="number-input">
											<label>Тасгийн үнэ (₮)</label>
											<el-input-number v-model="product.sale_price" controls-position="right" :min="0" class="themed mr-10 mb-10" style="width: 100%;"></el-input-number>
										</div>
									</el-col>
                                    <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8" align="center">
										<div class="number-input">
											<label>Бөөний үнэ (₮)</label>
											<el-input-number v-model="product.wholesale_price" controls-position="right" :min="0" class="themed mr-10 mb-10" style="width: 100%;"></el-input-number>
										</div>
									</el-col>
                                    <el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8" align="center">
										<div class="select-box">
											<el-select v-model="product.brand" filterable placeholder="Брэнд" class="themed mr-10 mb-10 mt-29">
												<el-option
												v-for="item in brands"
												:key="item.id"
												:label="item.brandname"
												:value="item.id">
												</el-option>
											</el-select>
										</div>
									</el-col>
								</el-row>
								<el-row :gutter="20">
									<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
										<div class="select-box mb-10">
											<el-select v-model="product.category" filterable placeholder="Категори" @change="changeCategory">
												<el-option
												v-for="item in category"
												:key="item.id"
												:label="item.category_name"
												:value="item.id">
												
												</el-option>
											</el-select>
										</div>
									</el-col>
									<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
										<div class="select-box mb-10">
											<el-select v-model="product.sub_category" filterable placeholder="Дэд категори">
												<el-option
												v-for="(item, index) in filterSub"
												:key="index"
												:label="item.sub_category_name"
												:value="item.id">
												</el-option>
											</el-select>
										</div>
									</el-col>
									<el-col :xs="24" :sm="8" :md="8" :lg="8" :xl="8">
										<div class="select-box mb-10">
											<el-select
												v-model="product.color_name"
												multiple
												filterable
												allow-create
												default-first-option
												placeholder="Өнгө"
												class="themed" 
												:popper-class="'themed color-accent-'+colorAccent"
											>
													<el-option
														v-for="(item, index) in colors"
														:key="index"
														:label="item.color_name"
														:value="item.color_name"
													></el-option>
											</el-select>
										</div>
									</el-col>
								</el-row>
                                <!-- <el-row>
                                    <el-col>
                                        <el-upload
                                            action="#"
                                            ref="el-upload"
                                            :limit="1"
                                            list-type="picture-card"
                                            :auto-upload="false">
                                                <i slot="default" class="el-icon-plus"></i>
                                                <div slot="file" slot-scope="{file}">
                                                    <img
                                                        class="el-upload-list__item-thumbnail"
                                                        :src="file.url" alt=""
                                                    >
                                                    <span class="el-upload-list__item-actions">
                                                        <span
                                                        class="el-upload-list__item-preview"
                                                        @click="handlePictureCardPreview(file)"
                                                        >
                                                        <i class="el-icon-zoom-in"></i>
                                                        </span>
                                                        <span
                                                        v-if="!disabled"
                                                        class="el-upload-list__item-delete"
                                                        @click="handleRemove"
                                                        >
                                                        <i class="el-icon-delete"></i>
                                                        </span>
                                                    </span>
                                                </div>
                                            </el-upload>
                                    </el-col>
                                </el-row> -->
								<el-row>
									<el-col>
										<div class="actions-box text-right">
											<el-button class="themed mb-10 mr-10" type="primary" @click="addProduct" plain><i class="mdi mdi-content-save"></i> ХАДГАЛАХ</el-button>
											<!-- <el-button class="themed mb-10" type="primary" plain><i class="mdi mdi-refresh"></i> Reset</el-button> -->
										</div>
									</el-col>
								</el-row>
							</div>
						</el-col>
					</el-row>
				</div>
			</el-col>
		</el-row>

        <el-dialog :visible.sync="dialogVisible">
            <img width="100%" :src="dialogImageUrl" alt="">
        </el-dialog>
	</div>
</template>

<script>
import _ from 'lodash'

export default {
	name: 'EcommerceNewProduct',
	data () {
		return {
			product: {
				name: '',
				model: '',
				color_name: '',
				sale_price: 0,
				wholesale_price: 0,
				cost_price: 0,
				description: '',
				brand: '',
				category: '',
				sub_category: '',
                qty: 0
			},
			brands: [],
			category: [],
			sub: [],
			colors: [],
			newBrand: '',
			newCategory: {
				name: '',
				code: ''
			},
			newSub: {
				categoryID: '',
				name: '',
				code: ''
			},
            dialogImageUrl: '',
            dialogVisible: false,
            disabled: false
		}
	},
	computed: {
		finalPrice() {
			return (this.price - this.discountPrice).toFixed(2)
		},
		discountPrice() {
			return (this.price / 100 * this.discount).toFixed(2)
		},
		colorAccent() {
			return this.$store.getters.colorAccent
		},
		filterSub() {
			var arr = [];
			this.sub.forEach(el => {
				if(el.categoryID == this.product.category) {
					arr.push(el);
				}
			});
			return arr;
		}
	},
	mounted() {
		this.getMethod();
	},
	methods: {
        handleRemove(file) {
            this.$refs['el-upload'].uploadFiles.splice(0,1)
        },
        handlePictureCardPreview(file) {
            this.dialogImageUrl = file.url;
            this.dialogVisible = true;
        },
        handleDownload(file) {
            console.log(file);
        },
		changeCategory() {
			this.product.sub_category = '';
		},
		getMethod() {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/product/get-methods`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					if(data.data.result == 'success') {
						rts.brands = data.data.brand;
						rts.category = data.data.category;
						rts.sub = data.data.sub;
						rts.colors = data.data.color;
					}
					
				}).catch(error => {
					console.log(error);
				});
			}
		},
		addProduct() {
			var a = this.product;
			if(a.name == '' || a.model == '' || a.brand == '' || a.category == '' || a.sub_category == '' || a.color_name == '') {
				this.$notify({
                    title: 'Амжилтгүй',
                    message: `Шаардлагатай талбаруудад утга оруулагүй байна`,
                    type: 'error'
                });
			} else {
				var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/product/add-customer-product`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							product: this.product
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.$notify({
								title: 'Амжилттай',
								message: `Бүтээгдэхүүн бүртгэгдлээ`,
								type: 'success'
							});
						} else if (data.data.result == 'colorNotFound') {
							rts.$notify({
								title: 'Амжилтгүй',
								message: `Алдаа гарлаа (Өнгө олдсонгүй)`,
								type: 'error'
							});
						} else if (data.data.result == 'already_exist') {
							rts.$notify({
								title: 'Амжилтгүй',
								dangerouslyUseHTMLString: true,
								message: `<strong>${data.data.color}</strong> өнгө бүртгэлтэй байна`,
								type: 'error'
							});
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

.page-ecommerce-new-product {
	.page-header {
		margin-bottom: 20px;
	}

	.item-box {
		background: white;

		.main-photo, .a-photo {
			position: relative;

			img {
				width: 100%;
			}

			.btn-close {
				position: absolute;
				right: 30px;
				top: 30px;
				background: rgba(0, 0, 0, .1);
				width: 20px;
				height: 20px;
				text-align: center;
				line-height: 20px;
			}
		}

		.main-photo {
			padding: 30px;
			box-sizing: border-box;
		}
		.other-photos {
			padding: 0 15px;		
			padding-bottom: 15px;	
			box-sizing: border-box;

			.a-photo {
				width: 33.3333333%;
				box-sizing: border-box;
				padding: 0 15px;
				display: inline-block;

				.btn-close {
					position: absolute;
					right: 15px;
					top: 0px;
				}

				.add-photo {
					width: 100%;
					height: 100%;
					box-sizing: border-box;
					padding-bottom: 100%;
					position: relative;

					.dashed-box {
						border: 4px dashed transparentize($text-color-accent, .5);
						position: absolute;
						top: 0;
						left: 0;
						right: 0;
						bottom: 0;
					}

					.mdi {
						position: absolute;
						top: 50%;
						left: 50%;
						font-size: 30px;
						transform: translateX(-50%) translateY(-50%);
						opacity: .7;
					}
				}
			}
		}

		.detail-box {
			padding: 30px;
			// padding-left: 0;

			.title {
				background: transparent;
				font-size: 30px;
				border: none;
				outline: none;
				border-bottom: 2px solid transparentize($text-color, .8);
				font-family: inherit;
				width: 100%;
				margin-bottom: 20px;
				color: $text-color;
				font-weight: bold;
			}

			.number-input {
				margin-bottom: 10px;

				label {
					display: block;
					clear: both;
					opacity: .5;
					margin-bottom: 10px;
					font-size: 14px;
				}
			}

			.final-price {
				color: transparentize($text-color, .3);

				strong {
					color: $text-color-accent;
				}
			}

			.description-box {
				margin-top: 20px;
				margin-bottom: 10px;

				textarea {
					border: 1px solid transparentize($text-color-accent, 0.7);
					outline: none;
					width: 100%;
					resize: vertical;
					background: white;
					font-family: inherit;
					padding: 10px;
					box-sizing: border-box;
					color: $text-color;
					font-size: 16px;
					border-radius: 4px;
				}
			}

			.el-input-number {
				width: 90px;

				.el-input__inner {
					color: $text-color-accent;
					background-color: transparent;
					border-color: transparentize($text-color-accent, 0.7);
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

			.select-box {
				box-sizing: border-box;
			}

			.el-select {
				width: 100%;

				.el-input__inner {
					border-color: transparentize($text-color-accent, 0.7);
					color: $text-color-accent;
					font-family: inherit;
				}
				
			}

			.actions-box {
				text-align: right;
				margin-top: 20px;
			}

			.el-radio-group {
				.el-radio-button__inner {
					background-color: transparentize($text-color-accent, 0.9);
					border-color: transparentize($text-color-accent, 0.7);
					color: $text-color-accent;
				}
				.el-radio-button__orig-radio:checked + .el-radio-button__inner {
					background-color: $text-color-accent;
					color: white;
				}
			}
		}

		.meta-form {
			input,button {
				border: 1px solid transparentize($text-color-accent, 0.7);
				outline: none;
				border-radius: 4px;
				color: $text-color;
				padding: 8px 13px;
				background: white;
				width: 100%;
				margin-bottom: 7px;
				box-sizing: border-box;
				font-family: inherit;
				font-size: 14px;
			}

			button {
				cursor: pointer;
				border-bottom: 1px solid $text-color-accent;
				font-family: inherit;
				text-transform: uppercase;
				line-height: 0;
				padding: 16px 2px;
				color: $text-color-accent;
				
				i {
					position: relative;
					top: 3px;
				}
			}
		}
	}
}

@media (max-width: 768px) {
	.page-ecommerce-new-product {

		.item-box {
			.detail-box {
				padding-left: 30px;
			}
		}
	}
}

</style>


