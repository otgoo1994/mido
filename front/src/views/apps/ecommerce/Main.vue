<template>
    <div class="page-ecommerce-cart scrollable">
        <el-row class="cart-box" :gutter="20">
			<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <el-row class="item-list" :gutter="20">
                    <el-col class="mb-20">
						<el-breadcrumb separator="/" class="mt-10 themed">
							<el-breadcrumb-item to="/products">Бүтээгдэхүүний жагсаалт</el-breadcrumb-item>
							<el-breadcrumb-item>Дэлгүүрийн хэсэг</el-breadcrumb-item>
						</el-breadcrumb> 
					</el-col>
                    <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
                        <div class="table-box card-base card-outline mt-10 card-shadow--small">
                            <table class="styled striped hover">
                                <thead style="font-size: 12px;">
                                    <tr>
                                        <th>Бүтээгдэхүүн</th>
                                        <th>Тоо</th>
                                        <th>Нэгж үнэ</th>
                                        <th>Үнэ</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody style="font-size: 15px;" v-if="product.length > 0">
                                    <tr v-for="(i, index) in product" :key="index">
                                        <td>{{i.name}} <strong>{{i.model}}</strong></td>
                                        <!-- <td>{{Number(i.qty).toLocaleString()}}</td> -->
                                        <td><el-input-number v-model="i.qty" size="mini" :min="1" :max="i.max"></el-input-number></td>
                                        <td>{{Number(i.price).toLocaleString()}}</td>
                                        <td>{{Number(i.price * i.qty).toLocaleString()}}</td>
                                        <td>
                                            <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeProduct(index)" circle></el-button>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" align="right"><strong>НИЙТ ТӨЛӨХ</strong></td>
                                        <td colspan="2">{{Number(total).toLocaleString()}}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" align="right"><strong>БЭЛЭН</strong></td>
                                        <td colspan="2"><el-input-number controls-position="right" v-model="cash.paid" size="mini" :min="0"></el-input-number></td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" align="right"><strong>БЭЛЭН БУС</strong></td>
                                        <td colspan="2"><el-input-number controls-position="right" v-model="cash.card" size="mini" :min="0"></el-input-number></td>
                                    </tr>
                                    <tr>
                                        <td colspan="3" align="right"><strong>ХАРИУЛТ</strong></td>
                                        <td colspan="2">{{Number(refund).toLocaleString()}}</td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr>
                                        <td colspan="5" align="center"> Бүтээгдэхүүн нэмээгүй</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </el-col>
                    <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                        <div class="mt-10">
                            <el-input placeholder="Бар код, модель, нэр" ref="maininput" @keydown.enter.native="addproduct" v-model="search" clearable> </el-input>
                        </div>
                        <div class="table-box card-base card-outline mt-10 card-shadow--small scrollable" style="max-height: 400px;">
                            <table class="styled striped hover">
                                <thead style="font-size: 12px;">
                                    <tr>
                                        <th>Бүтээгдэхүүн</th>
                                        <th>Үнэ</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody style="font-size: 15px;">
                                    <tr v-for="(i, index) in filter" :key="index">
                                        <td>{{i.name}} <strong>{{i.model}}</strong></td>
                                        <td>{{Number(i.sale_price).toLocaleString()}}</td>
                                        <td>
                                            <el-button icon="el-icon-sold-out" size="mini" @click="insertProduct(i)" circle></el-button>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="mt-10">
                            <el-button type="danger" style="width: 100%;" @click="endReciept"><strong>ТООЦОО ХИЙХ F2</strong></el-button>
                        </div>
                    </el-col>
                </el-row>
            </el-col>
        </el-row>
    </div>
</template>
<script>
export default {
    data() {
        return {
            shop: '',
            product: [],
            allproduct: [],
            search: '',
            cash: {
                total: 0,
                paid: 0,
                card: 0,
                refund: 0
            }
        }
    },
    mounted() {
        this.getProduct();
        this.$refs.maininput.focus();
        document.addEventListener('keydown', this.checkKeyDown);
    },
    beforeRouteLeave (to, from , next) {
        document.removeEventListener('keydown', this.checkKeyDown);
      	next();
    },
    computed: {
        filter() {
            var p = [];
            this.allproduct.forEach(el => {
                if(el.model.toUpperCase().includes(this.search.toUpperCase()) || el.code.includes(this.search) || el.name.toUpperCase().includes(this.search.toUpperCase())) {
                    p.push(el);
                }
            });
            return p.slice(0,50);
        },
        refund() {
            var total = 0;
            this.product.forEach(el => {
                total += (el.qty * el.price);
            });
            if (total > (this.cash.paid + this.cash.card)) {
                this.cash.refund = 0;
                return 0;
            } else {
                this.cash.refund = (this.cash.paid + this.cash.card) - total;
                return (this.cash.paid + this.cash.card) - total;
            }
        },
        total() {
            var total = 0;
            this.product.forEach(el => {
                total += (el.qty * el.price);
            });
            this.cash.total = total;
            return total;
        }
    },
    methods: {
        checkKeyDown(e) {
            if(e.keyCode == 113) {
                this.endReciept();
            }
        },
        endReciept() {
            if(this.product.length > 0 && (this.cash.paid + this.cash.card) >= this.cash.total) {
                this.$confirm('Итгэлтэй байна уу ?', 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                type: 'warning'
                }).then(() => {
                    var rts = this;
                    const token = localStorage.getItem('token');
                    if(token) {
                        this.$axios({
                            method: 'post',
                            url: rts.$appUrl +`/api/product/end-reciept`,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            data: {
                                total: this.cash.total,
                                product: this.product,
                                paid: this.cash.paid,
                                card: this.cash.card,
                                shop: this.shop
                            }
                        })
                        .then(function(data){
                            if(data.data.result == 'success') {
                                rts.$notify({
                                    title: 'Амжилттай',
                                    message: 'Баталгаажлаа',
                                    position: 'bottom-right'
                                });
                                rts.product = [];
                                rts.cash.paid = 0;
                                rts.cash.refund = 0;
                                rts.$refs.maininput.focus();
                            }
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                });
            }
        },
        removeProduct(index) {
            this.product.splice(index, 1);
        },
        insertProduct(item) {
            var c = true;
            this.product.forEach(el => {
                if(el.id == item.id) {
                    c = false;
                    el.qty++;
                }
            });
            if(c) {
                this.product.push({id: item.id, name: item.name, model: item.model, qty: 1, price: item.sale_price, code: item.code, max: item.qty});
            }
        },
        addproduct() {
            if(this.search != '') {
                var c = true;
                this.product.forEach(el => {
                    if(el.code == this.search) {
                        c = false;
                        el.qty++;
                    }
                });
                if(c) {
                    this.allproduct.forEach(el => {
                        if(el.code == this.search) {
                            this.product.push({id: el.id, name: el.name, model: el.model, qty: 1, price: el.sale_price, code: el.code, max: el.qty});
                        }
                    });
                }
                this.search = '';
            }
        },
        getProduct() {
            var rts = this;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/product/get-all-product`,
						headers: {
							"Authorization": `Bearer ${token}`
						}
					})
					.then(function(data){
						if(data.data.result == 'success') {
							rts.allproduct = data.data.product;
                            rts.shop = data.data.shop;
						} else if(data.data.result == 'nottime') {
                            rts.showConfirm();
                        }
						
					}).catch(error => {
						console.log(error);
					});
				}
        },
        showConfirm() {
            this.$confirm('<strong>Уучлаарай. </strong>Цагаа бүртгүүлэх шаардлагатай.', 'Санамж', {
                confirmButtonText: 'Цаг бүртгүүлэх',
                dangerouslyUseHTMLString: true,
                cancelButtonText: 'Үгүй',
                type: 'warning'
            }).then(() => {
                this.$router.push('/ecommerce-dashboard');
            }).catch(() => {
                    this.showConfirm();
            });
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
            padding: 25px;
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