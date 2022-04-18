<template>
    <div>
        <div class="scrollable" :style="{'max-height': '100%', 'overflow-x': 'hidden', 'padding-left': '10px', 'padding-right': '10px'}">
            <el-row class="items mt-4" :gutter="20">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mb-10">
                    <el-card class="box-card" align="right">
                        <el-button @click="updateInvoice(0)" type="primary" plain>Түр хадгалах</el-button>
                        <el-button type="success" @click="updateInvoice(1)" plain>Хадгалах</el-button>
                    </el-card>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <!-- <el-card class="box-card scrollable" :style="{'height': `${(windowHeight - 150)}px`}"> -->
                        <el-card class="box-card">
                        <div class="page-invoice">
                            <div class="invoice bg-white black-text">		
                                <div class="invoice-top">
                                    <div class="logo" :style="{'margin-top': '2%'}">
                                        <img src="@/assets/images/icbc.png" alt="logo">
                                    </div>
                                    
                                    <div class="title" align="right">
                                        <h1>НЭХЭМЖЛЭХ</h1>
                                        <p>Ай Си Би Си ХХК</p>
                                        <!-- <p><strong>Ай Си Би Си ХХК</strong></p> -->
                                        <p class="address">Монгол улс, Улаанбаатар хот, ЧД 4-р хороо<br>
                                            Жуулчны гудамж 4/4, Макс Цамхаг<br>
                                            3 давхар 306 тоот</p>
                                        <p class="address">Утас: <strong>7511 7733</strong></p>
                                    </div><!--End Title-->
                                </div><!--End InvoiceTop-->

                                <hr>			

                                <div class="invoice-middle">
                                    <div class="info">
                                        <h2>Төлөгч байгууллага / Хувь хүн</h2>
                                        <div class="flex" :style="{'margin-top': '10px','margin-bottom': '10px'}">
                                            <el-select v-model="selected" @change="changeCompany" filterable placeholder="Төлөгч байгууллага" size="mini">
                                                <el-option
                                                v-for="item in companies"
                                                :key="item.id"
                                                :label="item.name + ' (' + item.email + ')'"
                                                :value="item.id">
                                                </el-option>
                                            </el-select>
                                            <el-button type="primary" icon="el-icon-plus" @click="modals.newClient = true" class="ml-10" plain size="mini"></el-button>
                                        </div>
                                        <p><strong>{{invoiceTo.company}}</strong> (РД: {{invoiceTo.register}})</p>
                                        <p class="email">{{invoiceTo.email}}</p>
                                        <p>{{invoiceTo.phone}}</p>
                                        <!-- <p>john.doe@email.com<br>555-555-5555</p> -->
                                    </div>

                                    <div class="project" align="right">
                                        <!-- <h2>Project Description</h2>
                                        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam in diam sit amet felis ultricies ultricies vitae et tortor. Proin dapibus justo felis, ut imperdiet lacus accumsan quis.</p> -->
                                        <table>
                                            <tr>
                                                <td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжлэхийн дугаар :</strong></td>
                                                <td align="left" style="width: 40%;">{{detail.invoiceNumber}}</td>
                                            </tr>
                                            <tr>
                                                <td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжилсэн огноо :</strong></td>
                                                <td style="width: 40%;">
                                                    <el-date-picker size="mini"
                                                    v-model="invoiceTo.created_at"
                                                    style="width: 100%;"
                                                    type="date"
                                                    placeholder="Pick a day">
                                                    </el-date-picker>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="right" style="width: 60%; padding-right: 10px;"><strong>Хүчинтэй огноо :</strong></td>
                                                <td style="width: 40%;">
                                                    <el-date-picker
                                                    v-model="invoiceTo.updated_at" size="mini"
                                                    style="width: 100%;"
                                                    type="date"
                                                    placeholder="Pick a day">
                                                    </el-date-picker>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td align="right" style="width: 60%; padding-right: 10px;"><strong>Төлөв :</strong></td>
                                                <td style="width: 40%;">
                                                    <el-select v-model="invoiceTo.stat" filterable placeholder="Төлөв" style="width: 100%;" size="mini">
                                                        <el-option
                                                        v-for="(item, index) in status"
                                                        :key="index"
                                                        :label="item.label"
                                                        :value="item.value">
                                                        </el-option>
                                                    </el-select>
                                                </td>
                                            </tr>
                                        </table>
                                    </div>   
                                </div><!--End Invoice Mid-->

                                <div class="invoice-bottom" v-for="(item, index) in products" :key="index">
                                    <el-button type="danger" icon="el-icon-delete" circle :style="{'position': 'absolute', 'bottom': '10px', 'right': '10px'}" size="mini" @click="removeProduct(index)"></el-button>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Бүтээгдэхүүн</th>
                                                <th>Тоо</th>
                                                <th>Үнэ</th>
                                                <th>Нийт үнэ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>
                                                    <el-input placeholder="Бүтээгдэхүүний модель" v-model="item.product_model" @keyup.enter.native="searchProduct(index)" clearable> </el-input>
                                                </td>
                                                <td>
                                                    <el-input-number v-model="item.remain" :min="1"></el-input-number>
                                                </td>
                                                <td :style="{'width': '15%'}">
                                                    <el-input placeholder="Бүтээгдэхүүний модель" v-model="item.price" clearable> </el-input>
                                                </td>
                                                <td :style="{'width': '10%'}">{{Number(item.price * item.remain).toLocaleString()}}</td>
                                            </tr>
                                            <tr>
                                                <td>
                                                    <el-input type="textarea" :rows="2" placeholder="Бүтээгдэхүүний нэр" v-model="item.product_name"> </el-input>
                                                </td>
                                                <td></td><td></td><td></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div><!--End Invoice-->
                                <div class="mt-20">
                                    <el-button type="primary" plain size="mini" @click="addProduct">Бүтээгдэхүүн нэмэх</el-button>
                                </div>
                                <div style="margin-bottom: 50px;">
                                    <table align="right">
                                        <tr>
                                            <td class="Rate"><h2>Total</h2></td>
                                            <td class="payment"><h2>₮{{amount_text}}</h2></td>
                                        </tr>
                                    </table>
                                </div>
                                <div class="legalcopy flex mt-20">
                                        <p class="legal box grow mr-20 mt-0">
                                            <strong>Биднийг сонгосонд баярлалаа	!</strong>  
                        			        Дараа дахин үйлчлүүлээрэй. Таны бизнест амжилт хүсье. 
                                        </p>
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>

        <el-dialog title="Хайлтын илэрц" :visible.sync="modals.result">
            <el-table :data="filteredProduct">
                <el-table-column property="name" label="Нэр" width="300"></el-table-column>
                <el-table-column property="model" label="Модель" width="200"></el-table-column>
                <el-table-column property="sale_price" label="Үнэ"></el-table-column>
                <el-table-column align="right">
                    <template slot-scope="scope">
                        <el-button @click="addToInvoice(scope.row)" type="danger" icon="el-icon-sell" circle></el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-dialog>

        <el-dialog title="Төлөгч байгууллага бүртгэх" :visible.sync="modals.newClient" align="center">
            <el-input placeholder="Нэр" style="width: 60%; margin-top: 10px;" v-model="newClient.name" clearable> </el-input>
            <el-input placeholder="Имэйл хаяг" style="width: 60%; margin-top: 10px;" v-model="newClient.email" clearable> </el-input>
            <el-input placeholder="Регистр" style="width: 60%; margin-top: 10px;" v-model="newClient.register" clearable> </el-input>
            <el-input placeholder="Утасны дугаар" style="width: 60%; margin-top: 10px;" v-model="newClient.phone" clearable> </el-input>
            <span slot="footer" class="dialog-footer">
            <el-button @click="modals.newClient = false">Болих</el-button>
            <el-button type="primary" @click="saveClient">Хадгалах</el-button>
        </span>
        </el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            newClient: {
                name: '',
                register: '',
                phone: '',
                email: ''
            },
            invoiceTo: {
                company: 'ICBC',
                register: '5489288',
                phone: '75117733',
                email: 'sales@icbc.mn'
            },
            selected: '',
            companies: [],
            detail: {
                invoiceNumber: ''
            },
            products: [],
            allproduct: [],
            filteredProduct: [],
            selectedIndex: 0,
            modals: {
                result: false,
                newClient: false
            },
            status: [{
                label: 'Төлөгдсөн',
                value: 'true'
            },{
                label: 'Төлөгдөөгүй',
                value: 'false'
            },{
                label: 'Дутуу төлөлт',
                value: 'half'
            }],
        }
    },
    computed:{
		amount() {
			return _.reduce(this.products, (sum, obj) => sum + (obj.price * obj.remain), 0)
		},
		amount_text() {
			this.invoiceTo.total_amount = this.amount;
            return Number(this.amount).toLocaleString();
		}
	},
    mounted() {
        this.detail.invoiceNumber = this.$route.params.id;
        this.getInvoice();
    },
    
    methods: {
        updateInvoice(done) {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/invoice/update-invoice`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        to: this.invoiceTo,
                        product: this.products,
                        invoiceNumber: this.detail.invoiceNumber,
                        done
                    }
				})
				.then(function(data){
					if(data.data.result == 'success') {
                        rts.$notify({
							title: 'Амжилтай',
							message: `Амжилттай хадгалагдлаа`,
							type: 'success'
						});
                        if (done === 1) {
                            rts.$router.push('/invoices');
                        }
                    }
				}).catch(error => {
					console.log(error);
				});
			}
        },
        saveClient() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/invoice/add-new-company`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        name: this.newClient.name,
                        email: this.newClient.email,
                        register: this.newClient.register,
                        phone: this.newClient.phone
                    }
				})
				.then(function(data){
					if (data.data.result == 'success') {
						rts.companies.push(rts.newClient);
                        rts.invoiceTo.company = rts.newClient.name;
                        rts.invoiceTo.email = rts.newClient.email;
                        rts.invoiceTo.register = rts.newClient.register;
                        rts.invoiceTo.phone = rts.newClient.phone;
                        rts.selected = data.data.email;
                        rts.$notify({
							title: 'Амжилтай',
							message: `Амжилттай бүртгэгдлээ`,
							type: 'success'
						});
                        rts.modals.newClient = false;
					} else {
                        rts.$notify({
							title: 'Амжилтгүй',
							message: `Бүртгэлтэй цахим хаяг`,
							type: 'error'
						});
                    }
				}).catch(error => {
					console.log(error);
				});
			}
        },
        addToInvoice(val) {
            let ex = this.products.some(function(field) {
                return field.product_model == val.model
            });
            if(ex) {
                this.products.forEach((el, index) => {
                    if(el.product_model == val.model) {
                        el.remain++;
                    }
                });
            } else {
                var l = this.products[this.selectedIndex];
                l.product_name = val.name;
                l.product_model = val.model;
                l.price = val.sale_price;
                l.remain = 1;
            }
        },
        searchProduct(index) {
            this.selectedIndex = index;
            var m = '';
            this.products.forEach((el,i) => {
                if(i == index) {
                    m = el.product_model;
                }
            });
            if(m !== '') {
                this.filteredProduct = [];
                this.allproduct.forEach(el => {
                    if(el.model.toUpperCase().includes(m.toUpperCase())) {
                        this.filteredProduct.push(el);
                    }
                });
                this.modals.result = true;
            }
        },
        addProduct() {
            var arr = {product_name: '', product_model: '', remain: 1, price: 0};
            this.products.push(arr);
        },
        removeProduct(index) {
            this.products.forEach((el, i) => {
                if(index == i) {
                    this.products.splice(i, 1);
                }
            });
        },
        changeCompany(e) {
            this.companies.forEach(el => {
                if(el.id == e) {
                    this.invoiceTo.company = el.name;
                    this.invoiceTo.register = el.register;
                    this.invoiceTo.phone = el.phone;
                    this.invoiceTo.email = el.email;
                }
            });
        },
        getInvoice() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/invoice/get-invoice`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        invoiceNumber: rts.detail.invoiceNumber
                    }
				})
				.then(function(data){
					if (data.data.result == 'success') {
						rts.companies = data.data.companies;
                        rts.invoiceTo = data.data.invoice;
                        rts.selected = data.data.invoice.email;
                        rts.allproduct = data.data.allproduct;
                        if(data.data.product.length <= 0) {
                            rts.addProduct();
                        } else {
                            rts.products = data.data.product;
                        }
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
// @import '../../assets/scss/_variables';
@import '../../../assets/scss/_variables';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
.page-invoice {
    font-family: 'Roboto', sans-serif;
	.toolbar {
		max-width: 794px;
		margin: 0 auto;
		text-align: right;
		margin-bottom: 20px;
	}

	.invoice {
		background: white;
		width: 100%;
		// max-width: 794px;
		// max-height: 1123px;
		margin: 0 auto;
		padding: 2em;
		box-sizing: border-box;
		// box-shadow: 0px 8px 8px -8px rgba(0, 0, 0, 0.3);

		hr {
			border: 1px solid rgba(0, 0, 0, 0.05);
		}

		.invoice-top {
			overflow: hidden;
			margin-bottom: 30px;

			.logo {
				float: left;                
				box-sizing: border-box;
				overflow: hidden;
				// background: rgba(0, 0, 0, 0.07);
				text-align: center;
				
				img {
					width: 120px;
				    height: auto;
					margin-top: 10%;
				}
			}
			.info {
				display: block;
				float:left;
				margin-left: 20px;
				margin-top: 5px;

				& > * {
					margin: 0;
				}
			}
			.title {
				float: right;

				& > * {
					margin: 0;
				}
                h1 {
                    font-size: 40px;
                }
				p {
					text-align: right;
                    font-size: 15px;
				}
                .address {
					text-align: right;
                    margin-top: 10px;
				}
			}
		}

		.invoice-middle { 
			overflow: hidden;
			margin-top: 30px;
			margin-bottom: 30px;

			.clientlogo {
				float: left;
				height: 60px;
				width: 60px;
				box-sizing: border-box;
				border-radius: 50%;
				overflow: hidden;
				background: grey;
				
				img {
					width: 100%;
				}
			}

			.info {
				display: block;
				float:left;
				margin-top: 5px;

				& > * {
					margin: 0;
				}
                h2 {
                    font-size: 18px;
                }
                p {
                    font-size: 18px;
                }
                .email {
                    margin-top: 15px;
                }
			}

			.project {
				margin-left: 52%;

				& > * {
					margin: 0;
				}
			}
		}

		.invoice-bottom {
            border: 1px solid rgb(209, 207, 207);
            margin-top: 20px;
            padding: 20px;
            position: relative;
            padding-right: 50px;
            border-radius: 10px;
            overflow-x: auto;
			table {
				width: 100%;
				border-collapse: collapse;
				
				th {
					text-align: right;
					padding: 20px;
					padding-bottom: 5px;
					opacity: .7;
					
					&:first-child {
						text-align: left;
						padding-left: 0px;
						width: 50%;
					}
					&:last-child {
						padding-right: 0px;
					}
				}
                .itemGroup {
                    border: 1px solid grey;
                    border-radius: 10%;
                }

				td {
					text-align: right;
					padding: 20px;
					padding-bottom: 5px;
					// border-bottom: 1px solid #EEE;

					&:first-child {
						text-align: left;
						padding-left: 0px;
						width: 50%;
					}
					&:last-child {
						padding-right: 0px;
					}
				}

				tfoot td {
					border: none;
					padding-top: 5px;
				}
			}
		}

		h1 { font-size: 1.5em; color: #222; }
		h2 { font-size: .9em; }
		h3 { font-size: 1.2em; font-weight: 300; line-height: 2em; }
		p  { font-size: .7em; color: #666; line-height: 1.2em; }
	}

}


@media screen and (max-width: 768px) {
	.page-invoice {
		.invoice {
			.invoice-middle { 
				.project {
					display: block;
					width: 100%;
					clear: both;
					padding: 10px 0;
					margin: 0;
				}
			}
			.invoice-bottom {
				table {
					th {
						padding: 5px;
					}

					td {
						padding: 5px;
					}
				}
			}
		}
	}
}

@media print{
	.layout-container .container .footer ,
	.layout-container .container .header ,
	.layout-container .container .horizontal-nav ,
	.layout-container .footer ,
	.layout-container .layout-picker ,
	.layout-container .vertical-nav ,
	.layout-container .header {
		display:none;
	}

	.page-invoice {
		.toolbar {
			display: none;
		}

		.invoice {
			box-shadow: none;
			max-width: 100%;
			padding: 0;
		}
	}
}
</style>