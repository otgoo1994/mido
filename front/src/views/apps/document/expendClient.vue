<template>
	<div class="page-invoice scrollable" v-loading.fullscreen.lock="loading">
        <vue-html2pdf
			:show-layout="false"
			:float-layout="true"
			:enable-download="true"
			:preview-modal="false"
			:filename="invoiceNumber"
			:pdf-quality="3"
			:manual-pagination="true"
			:paginate-elements-by-height="1"
			pdf-format="a4"
			pdf-orientation="portrait"
			pdf-content-width="794px"
			ref="html2Pdf"
		>
			<section slot="pdf-content">
            	<section class="pdf-content">
					<div class="page-invoice">
                        <div class="invoice bg-white black-text" style="padding-left: 1.5cm; padding-top: 1cm; padding-right: 1cm;">	
							<div style="position: relative;" class="mb-30">
								<p style="font-size: 12px;" class="page-header"><strong>НХМаягт БМ-3</strong></p>
								<p style="font-size: 12px; line-height: normal; right: 0;" class="page-header">Сангийн сайдын 2017 оны 12 дугаар сарын 5<br>өдрийн 347 тоот тушаалын хавсралт</p>
							</div>	
							<div class="invoice-top">
								<div class="logo">
									<img src="@/assets/images/icbc.png" alt="logo">
								</div>
								<!-- <div class="info">
									<h2>John Wick</h2>
									<p>jwick@email.com<br>777-777-7777</p>
								</div> -->
								<div class="title" align="right">
									<p style="font-size: 2.2em; font-weight: 500;">ЗАРЛАГЫН БАРИМТ</p>
									<!-- <p><strong>Ай Си Би Си ХХК</strong></p> -->
									<table style="line-height: normal; margin-top: 7px; font-size: 14px;">
										<tr>
											<td><strong>Баримтын дугаар: </strong></td>
											<td>{{params.invoice}}</td>
										</tr>
										<tr>
											<td><strong>Гаргасан огноо: </strong></td>
											<td v-if="expend.detail.date !== undefined">{{expend.detail.date.split('T')[0]}}</td>
										</tr>
									</table>  
									<!-- <p class="address" style="margin-top: 10px;">Утас: <strong>7511 7733</strong></p> -->
								</div>
							</div>

							<hr>			

							<div class="invoice-middle">
								<!-- <div class="clientlogo">
									<img src="@/assets/images/avatar.jpg" alt="client logo">
								</div> -->
								<div class="info">
									<!-- <p style="font-size: 16px;"><strong>Байгууллага</strong></p> -->
									<table style="line-height: normal; margin-top: 10px;">
										<tr>
											<td style="color: grey;"><strong>Байгууллага</strong></td>
											<td></td>
										</tr>
										<tr>
											<td><strong>Байгууллагын нэр: </strong></td>
											<td>Ай Си Би Си ХХК</td>
										</tr>
										<tr>
											<td><strong>Регистрийн дугаар: </strong></td>
											<td>5489288</td>
										</tr>
									</table> 
								</div>
								<div class="project" align="right">
									<table style="line-height: normal; margin-top: 10px; margin-right: 40px;">
										<tr>
											<td colspan="2" align="right" style="color: grey;"><strong>Төлөгч байгууллага / Хувь хүн</strong></td>
										</tr>
										<tr>
											<td><strong>Байгууллагын нэр: </strong></td>
											<td align="right">{{expend.detail.company}}</td>
										</tr>
										<tr>
											<td><strong>Регистрийн дугаар: </strong></td>
											<td align="right">{{expend.detail.register}}</td>
										</tr>
									</table> 
								</div> 
							</div><!--End Invoice Mid-->

							<div class="invoice-bottom">
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
										<tr v-for="(i,index) in expend.product" :key="index">
											<td style="font-size: 14px;"><strong>{{i.product_name}}</strong><br><span style="font-size: 12px;">{{i.product_model}}</span></td>
											<td style="font-size: 14px;">{{Number(i.remain).toLocaleString()}}</td>
											<td style="font-size: 14px;">₮{{Number(i.price).toLocaleString()}}</td>
											<td style="font-size: 14px;">₮{{Number(i.price * i.remain).toLocaleString()}}</td>
										</tr>
									</tbody>
									<tfoot>
										<tr>
											<td :style="{'padding-top': '5px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Нийт үнэ</strong></td>
											<td :style="{'padding-top': '5px'}"><strong>₮{{Number(amount_text.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</strong></td>
										</tr>
									</tfoot>
								</table>
								
								<div class="legalcopy mt-10">
									<p class="legal box grow mr-20 mt-0">
										<strong>Биднийг сонгосонд баярлалаа. </strong>  
										Танд амжилт хүсье!
									</p>
								</div>				
							</div><!--End Invoice-->
							<div align="center" class="mt-20">
								<div style="height: 50px;"></div>
								<img src="@/assets/images/astamp.png" alt="stamp" style="width: 180px; height: auto; vertical-align: middle;" :hidden="!expend.stamp">
								<div style="height: 70px;" :hidden="expend.stamp"></div>
								<table style="margin-top: -100px; font-size: 14px;">
									<tr>
										<td> Хүлээлгэн өгсөн эд хариуцагч</td>
										<td style="width: 70px;"></td>
										<td> / Т. Баярцэцэг</td>
										<td>/</td>
									</tr>
									<tr>
										<td> Хүлээн авагч</td>
										<td style="width: 70px;"></td>
										<td> /</td>
										<td>/</td>
									</tr>
									<tr>
										<td> Шалгасан нягтлан бодогч</td>
										<td style="width: 70px;"></td>
										<td> / П. Лхагвацэцэг</td>
										<td>/</td>
									</tr>
								</table>
							</div>
						</div>
					</div>
				</section>
			</section>
		</vue-html2pdf>
		<div class="toolbar">
			<el-button class="animated fadeInRight" type="primary" plain size="small" @click="toPdf"><i class="mdi mdi-download"></i> Татах</el-button>			
			<el-button class="animated fadeInRight" plain size="small" @click="print"><i class="mdi mdi-printer"></i> Хэвлэх</el-button>	
			<el-button icon="el-icon-setting" size="small" circle @click="modals.setting = true"></el-button>	
		</div>

		<div class="invoice bg-white black-text" style="padding-left: 1.5cm; padding-top: 1cm; padding-right: 1cm;">	
            <div style="position: relative;" class="mb-30">
				<p style="font-size: 12px;" class="page-header"><strong>НХМаягт БМ-3</strong></p>
				<p style="font-size: 12px; line-height: normal; right: 0;" class="page-header">Сангийн сайдын 2017 оны 12 дугаар сарын 5<br>өдрийн 347 тоот тушаалын хавсралт</p>
            </div>	
			<div class="invoice-top">
				<div class="logo">
					<img src="@/assets/images/icbc.png" alt="logo">
				</div>
				<!-- <div class="info">
					<h2>John Wick</h2>
					<p>jwick@email.com<br>777-777-7777</p>
				</div> -->
				<div class="title" align="right">
                    <p style="font-size: 2.2em; font-weight: 500;">ЗАРЛАГЫН БАРИМТ</p>
                    <!-- <p><strong>Ай Си Би Си ХХК</strong></p> -->
                    <table style="line-height: normal; margin-top: 7px; font-size: 14px;">
                        <tr>
                            <td><strong>Баримтын дугаар: </strong></td>
                            <td>{{params.invoice}}</td>
                        </tr>
                        <tr>
                            <td><strong>Гаргасан огноо: </strong></td>
                            <td v-if="expend.detail.date !== undefined">{{expend.detail.date.split('T')[0]}}</td>
                        </tr>
                    </table>  
                    <!-- <p class="address" style="margin-top: 10px;">Утас: <strong>7511 7733</strong></p> -->
                </div>
			</div>

			<hr>			

			<div class="invoice-middle">
				<!-- <div class="clientlogo">
					<img src="@/assets/images/avatar.jpg" alt="client logo">
				</div> -->
				<div class="info">
                    <!-- <p style="font-size: 16px;"><strong>Байгууллага</strong></p> -->
                    <table style="line-height: normal; margin-top: 10px;">
                        <tr>
                            <td style="color: grey;"><strong>Байгууллага</strong></td>
                            <td></td>
                        </tr>
                        <tr>
                            <td><strong>Байгууллагын нэр: </strong></td>
                            <td>Ай Си Би Си ХХК</td>
                        </tr>
                        <tr>
                            <td><strong>Регистрийн дугаар: </strong></td>
                            <td>5489288</td>
                        </tr>
                    </table> 
                </div>
				<div class="project" align="right">
                    <table style="line-height: normal; margin-top: 10px; margin-right: 40px;">
                        <tr>
                            <td colspan="2" align="right" style="color: grey;"><strong>Төлөгч байгууллага / Хувь хүн</strong></td>
                        </tr>
                        <tr>
                            <td><strong>Байгууллагын нэр: </strong></td>
                            <td align="right">{{expend.detail.company}}</td>
                        </tr>
                        <tr>
                            <td><strong>Регистрийн дугаар: </strong></td>
                            <td align="right">{{expend.detail.register}}</td>
                        </tr>
                    </table> 
                </div> 
			</div><!--End Invoice Mid-->

			<div class="invoice-bottom">
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
						<tr v-for="(i,index) in expend.product" :key="index">
							<td style="font-size: 14px;"><strong>{{i.product_name}}</strong><br><span style="font-size: 12px;">{{i.product_model}}</span></td>
							<td style="font-size: 14px;">{{Number(i.remain).toLocaleString()}}</td>
							<td style="font-size: 14px;">₮{{Number(i.price).toLocaleString()}}</td>
							<td style="font-size: 14px;">₮{{Number(i.price * i.remain).toLocaleString()}}</td>
						</tr>
					</tbody>
					<tfoot>
                        <tr>
							<td :style="{'padding-top': '5px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Нийт үнэ</strong></td>
							<td :style="{'padding-top': '5px'}"><strong>₮{{Number(amount_text.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</strong></td>
						</tr>
					</tfoot>
				</table>
				
				<div class="legalcopy mt-10">
					<p class="legal box grow mr-20 mt-0">
						<strong>Биднийг сонгосонд баярлалаа. </strong>  
                        Танд амжилт хүсье!
					</p>
				</div>				
			</div><!--End Invoice-->
			<div align="center" class="mt-20">
                <div style="height: 50px;"></div>
				<img src="@/assets/images/astamp.png" alt="stamp" style="width: 180px; height: auto; vertical-align: middle;" :hidden="!expend.stamp">
				<div style="height: 70px;" :hidden="expend.stamp"></div>
                <table style="margin-top: -100px; font-size: 14px;">
                    <tr>
                        <td> Хүлээлгэн өгсөн эд хариуцагч</td>
                        <td style="width: 70px;"></td>
                        <td> / Т. Баярцэцэг</td>
                        <td>/</td>
                    </tr>
                    <tr>
                        <td> Хүлээн авагч</td>
                        <td style="width: 70px;"></td>
                        <td> /</td>
                        <td>/</td>
                    </tr>
                    <tr>
                        <td> Шалгасан нягтлан бодогч</td>
                        <td style="width: 70px;"></td>
                        <td> / П. Лхагвацэцэг</td>
                        <td>/</td>
                    </tr>
                </table>
			</div>
		</div>

		<el-dialog title="Тохиргоо" :visible.sync="modals.setting" width="30%">
			<div align="left" style="padding-left: 20%;">
				<el-switch v-model="expend.stamp" inactive-text="Тамга харуулах"> </el-switch><br>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import VueHtml2pdf from 'vue-html2pdf'
import jwt_decode from "jwt-decode";
export default {
	name: 'Invoice',
	components: {
		VueHtml2pdf
	},
  
    data() {
        return {
            params: {
                email: '',
                invoice: ''
            },
            expend: {
                stamp: true,
                detail: '',
                product: ''
            },
			modals: {
				setting: false
			},
			loading: false,
            totalAmount: 0
        }
    },
    computed:{
		amount() {
			return _.reduce(this.expend.product, (sum, obj) => sum + (obj.price * obj.remain), 0)
		},
		amount_text() {
			this.totalAmount = this.amount;
            return this.amount;
		}
	},
    mounted() {
        var token = this.$route.query.token;
        var decoded = jwt_decode(token);
        this.params.email = decoded.email;
        this.params.invoice = decoded.invoiceNumber;
        this.getInvoice();
    },
	methods: {
		toPdf() {
			this.$refs.html2Pdf.generatePdf();
		},
		print() {
			window.print()
		},
        getInvoice() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/expend/get-client-expend`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        invoice: this.params.invoice,
                        email: this.params.email
                    }
				})
				.then(function(data){
					if (data.data.result == 'success') {
                        rts.expend.detail = data.data.invoice;
                        rts.expend.product = data.data.product;
					}
				}).catch(error => {
					console.log(error);
				});
			}
        }
	}
}
</script>

<style lang="scss" scoped>
@import '../../../assets/scss/_variables';
.page-header {
	position: absolute; 
	top: -30px;
}
.page-invoice {
	.toolbar {
		max-width: 794px;
		margin: 0 auto;
		text-align: right;
		margin-bottom: 20px;
	}

	.invoice {
		background: white;
		width: 100%;
		max-width: 794px;
		min-height: 1123px;
		margin: 0 auto;
		padding: 2em;
		box-sizing: border-box;
		box-shadow: 0px 8px 8px -8px rgba(0, 0, 0, 0.3);

		hr {
			border: 1px solid rgba(0, 0, 0, 0.05);
		}

		.invoice-top {
			overflow: hidden;
			margin-bottom: 15px;

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

				p {
					text-align: right;
				}
			}
		}

		.invoice-middle { 
			overflow: hidden;
			margin-top: 15px;
			margin-bottom: 15px;
			font-size: 14px;
			.clientlogo {
				float: left;
				height: auto;
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
				margin-left: 10px;
				margin-top: 5px;
				& > * {
					margin: 0;
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
			padding-right: 20px;
			table {
				width: 100%;
				border-collapse: collapse;
				font-size: 14px;
				th {
					text-align: right;
					padding: 10px;
					padding-bottom: 5px;
					opacity: .7;
					
					&:first-child {
						text-align: left;
						padding-left: 0px;
						width: 70%;
					}
					&:last-child {
						padding-right: 0px;
					}
				}

				td {
					text-align: right;
					padding: 10px;
					padding-bottom: 5px;
					border-bottom: 1px solid #EEE;
					font-size: 14px;
					&:first-child {
						text-align: left;
						padding-left: 0px;
						width: 70%;
					}
					&:last-child {
						padding-right: 0px;
					}
				}

				tfoot td {
					padding: 0;
					padding-top: 10px;
					// padding-bottom: 5px;
					border: none;
				}
			}
			.note {
				td {
					
					text-align: right;
					padding: 5px;
					padding-bottom: 1px;
					border-bottom: 1px solid #EEE;

					&:first-child {
						border: none;
						text-align: left;
						padding-left: 0px;
						width: 4%;
						height: 5px;
					}
					&:last-child {
						border: none;
						// padding-right: 0px;
						text-align: left;
						width: 20%;
						height: 10px;
					}
				}
			}
		}

		h1 { font-size: 1.5em; color: #222; }
		h2 { font-size: .9em; }
		h3 { font-size: 1.2em; font-weight: 300; line-height: 2em; }
		p  { font-size: .7em; color: #666; line-height: 1.2em; }
	}

}


@media print {
	.page-header {
		top: -45px;
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
