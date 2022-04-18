<template>
	<div class="page-invoice scrollable" v-loading.fullscreen.lock="loading">
		<vue-html2pdf
			:show-layout="false"
			:float-layout="true"
			:enable-download="true"
			:preview-modal="false"
			:filename="params.invoice"
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
                        <div class="invoice bg-white black-text" style="padding-left: 1.5cm; padding-right: 1cm; padding-top: 1cm;">			
							<div class="invoice-top">
								<div class="logo">
									<img src="@/assets/images/icbc.png" alt="logo">
								</div>
								<!-- <div class="info">
									<h2>John Wick</h2>
									<p>jwick@email.com<br>777-777-7777</p>
								</div> -->
								<div class="title" align="right">
									<!-- <h1>НЭХЭМЖЛЭХ</h1> -->
									<p style="font-size: 2.2em; font-weight: 500;">НЭХЭМЖЛЭХ</p>
									<!-- <p>Ай Си Би Си ХХК</p> -->
									<!-- <p><strong>Ай Си Би Си ХХК</strong></p> -->
									<p class="address" style="margin-top: 7px; font-size: 12px;">Монгол улс, Улаанбаатар хот, ЧД 4-р хороо<br>
										Жуулчны гудамж 4/4, Макс Цамхаг<br>
										3 давхар 306 тоот</p>
									<p class="address" style="margin-top: 7px; font-size: 12px;">Утас: <strong>7511 7733</strong></p>
								</div>
							</div><!--End InvoiceTop-->

							<hr>			

							<div class="invoice-middle">
								<!-- <div class="clientlogo">
									<img src="@/assets/images/avatar.jpg" alt="client logo">
								</div> -->
								<div class="info">
									<span style="font-size: 16px;"><strong>Төлөгч байгууллага / Хувь хүн</strong></span>
									<p style="font-size: 16px;"><strong>{{invoice.detail.company}}</strong> (РД: {{invoice.detail.register}})</p>
									<p class="email" style="margin-top: 15px; font-size: 16px;">{{invoice.detail.email}}</p>
									<p style="font-size: 16px;">{{invoice.detail.phone}}</p>
								</div>
								<div class="project" align="right">
									<table>
										<tr>
											<td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжлэхийн дугаар :</strong></td>
											<td align="left" >{{params.invoice}}</td>
										</tr>
										<tr>
											<td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжилсэн огноо :</strong></td>
											<td style="width: 40%;">
												<span v-if="invoice.detail.created_at !== undefined">{{invoice.detail.created_at.split('T')[0]}}</span>
											</td>
										</tr>
										<tr>
											<td align="right" style="width: 60%; padding-right: 10px;"><strong>Хүчинтэй огноо :</strong></td>
											<td style="width: 40%;">
												<span v-if="invoice.detail.updated_at !== undefined">{{invoice.detail.updated_at.split('T')[0]}}</span>
											</td>
										</tr>
										<tr>
											<td align="right" style="width: 60%; padding-right: 10px;"><strong>Төлөв :</strong></td>
											<td style="width: 40%;">
												<span v-if="invoice.detail.stat == 'true'">Төлөгдсөн</span>
												<span v-if="invoice.detail.stat == 'false'">Төлөгдөөгүй</span>
												<span v-if="invoice.detail.stat == 'half'">Дутуу төлөгдсөн</span>
											</td>
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
										<tr v-for="(i,index) in invoice.product" :key="index">
											<td style="font-size: 14px;"><strong>{{i.product_model}}</strong><br>{{i.product_name}}</td>
											<td style="font-size: 14px;">{{Number(i.remain).toLocaleString()}}</td>
											<td style="font-size: 14px;">₮{{Number(i.price).toLocaleString()}}</td>
											<td style="font-size: 14px;">₮{{Number(i.price * i.remain).toLocaleString()}}</td>
										</tr>
									</tbody>
									<tfoot>
										<tr :hidden="invoice.detail.noat == 'false'">
											<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Үнэ</strong></td>
											<td :style="{'border-bottom': 'none'}" v-if="invoice.detail.total_amount !== undefined">{{Number(((invoice.detail.total_amount / 1.1)).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
										</tr>
										<tr :hidden="invoice.detail.noat == 'false'">
											<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>НӨАТ</strong></td>
											<td :style="{'border-bottom': 'none', 'padding-top': '5px'}" v-if="invoice.detail.total_amount !== undefined">{{Number((invoice.detail.total_amount - (invoice.detail.total_amount / 1.1)).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
										</tr>
										<tr>
											<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Нийт үнэ</strong></td>
											<td :style="{'padding-top': '5px'}" v-if="invoice.detail.total_amount !== undefined"><strong>{{Number(invoice.detail.total_amount.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</strong></td>
										</tr>
									</tfoot>
								</table>
								
								<div class="legalcopy mt-10">
									<p class="legal box grow mr-20" v-bind:style="{ 'margin-top': '-'+margin + 'px' }">
										<strong>Дансны мэдээлэл!</strong>  
										<table class="note">
											<tr>
												<td>
													Хүлээн авагч
												</td>
												<td>
													Ай Си Би Си ХХК
												</td>
											</tr>
											<tr>
												<td>
													Регистрийн дугаар
												</td>
												<td>
													5489288
												</td>
											</tr>
											<tr>
												<td>
													Голомт банк
												</td>
												<td>
													3455131183
												</td>
											</tr>
											<tr>
												<td>
													Хаан банк
												</td>
												<td>
													5429245701
												</td>
											</tr>
										</table>
										<br>
										<br><br>

										<strong>Биднийг сонгосонд баярлалаа. </strong>  
										Танд амжилт хүсье!
									</p>

								</div>				
							</div><!--End Invoice-->
							<div align="center" class="mt-20">
								<img src="@/assets/images/astamp.png" alt="stamp" style="width: 180px; height: auto; vertical-align: middle;" :hidden="!invoice.stamp">
								<div style="height: 70px;" :hidden="invoice.stamp"></div>
								<div style="font-size: 14px; margin-top: -45px;" id="stamp-text"><span style="margin-right: 100px;">НЯГТЛАН БОДОГЧ</span><span>П.ЛХАГВАЦЭЦЭГ</span></div>
							</div>
						</div>
					</div>
				</section>
			</section>
		</vue-html2pdf>
		<div class="toolbar" style="margin-top: 20px;">
			<el-button class="animated fadeInRight" type="primary" plain size="small" @click="toPdf"><i class="mdi mdi-download"></i> Татах</el-button>			
			<el-button class="animated fadeInRight" plain size="small" @click="print"><i class="mdi mdi-printer"></i> Хэвлэх</el-button>	
			<el-button icon="el-icon-setting" size="small" circle @click="modals.setting = true"></el-button>	
		</div>

		<div class="invoice bg-white black-text" style="padding-left: 1.5cm; padding-right: 1cm; padding-top: 1cm;">			
			<div class="invoice-top">
				<div class="logo">
					<img src="@/assets/images/icbc.png" alt="logo">
				</div>
				<!-- <div class="info">
					<h2>John Wick</h2>
					<p>jwick@email.com<br>777-777-7777</p>
				</div> -->
				<div class="title" align="right">
					<!-- <h1>НЭХЭМЖЛЭХ</h1> -->
					<p style="font-size: 2.2em; font-weight: 500;">НЭХЭМЖЛЭХ</p>
					<!-- <p>Ай Си Би Си ХХК</p> -->
					<!-- <p><strong>Ай Си Би Си ХХК</strong></p> -->
					<p class="address" style="margin-top: 7px; font-size: 12px;">Монгол улс, Улаанбаатар хот, ЧД 4-р хороо<br>
						Жуулчны гудамж 4/4, Макс Цамхаг<br>
						3 давхар 306 тоот</p>
					<p class="address" style="margin-top: 7px; font-size: 12px;">Утас: <strong>7511 7733</strong></p>
				</div>
			</div><!--End InvoiceTop-->

			<hr>			

			<div class="invoice-middle">
				<!-- <div class="clientlogo">
					<img src="@/assets/images/avatar.jpg" alt="client logo">
				</div> -->
				<div class="info">
                    <span style="font-size: 16px;"><strong>Төлөгч байгууллага / Хувь хүн</strong></span>
                    <p style="font-size: 16px;"><strong>{{invoice.detail.company}}</strong> (РД: {{invoice.detail.register}})</p>
                    <p class="email" style="margin-top: 15px; font-size: 16px;">{{invoice.detail.email}}</p>
                    <p style="font-size: 16px;">{{invoice.detail.phone}}</p>
                </div>
				<div class="project" align="right">
                    <table>
                        <tr>
                            <td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжлэхийн дугаар :</strong></td>
                            <td align="left" >{{params.invoice}}</td>
                        </tr>
                        <tr>
                            <td align="right" style="width: 60%; padding-right: 10px;"><strong>Нэхэмжилсэн огноо :</strong></td>
                            <td style="width: 40%;">
                                <span v-if="invoice.detail.created_at !== undefined">{{invoice.detail.created_at.split('T')[0]}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td align="right" style="width: 60%; padding-right: 10px;"><strong>Хүчинтэй огноо :</strong></td>
                            <td style="width: 40%;">
                                <span v-if="invoice.detail.updated_at !== undefined">{{invoice.detail.updated_at.split('T')[0]}}</span>
                            </td>
                        </tr>
                        <tr>
                            <td align="right" style="width: 60%; padding-right: 10px;"><strong>Төлөв :</strong></td>
                            <td style="width: 40%;">
                                <span v-if="invoice.detail.stat == 'true'">Төлөгдсөн</span>
                                <span v-if="invoice.detail.stat == 'false'">Төлөгдөөгүй</span>
                                <span v-if="invoice.detail.stat == 'half'">Дутуу төлөгдсөн</span>
                            </td>
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
						<tr v-for="(i,index) in invoice.product" :key="index">
							<td style="font-size: 14px;"><strong>{{i.product_model}}</strong><br>{{i.product_name}}</td>
							<td style="font-size: 14px;">{{Number(i.remain).toLocaleString()}}</td>
							<td style="font-size: 14px;">₮{{Number(i.price).toLocaleString()}}</td>
							<td style="font-size: 14px;">₮{{Number(i.price * i.remain).toLocaleString()}}</td>
						</tr>
					</tbody>
					<tfoot>
						<tr :hidden="invoice.detail.noat == 'false'">
							<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Үнэ</strong></td>
							<td :style="{'border-bottom': 'none'}" v-if="invoice.detail.total_amount !== undefined">{{Number(((invoice.detail.total_amount / 1.1)).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
						</tr>
						<tr :hidden="invoice.detail.noat == 'false'">
							<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>НӨАТ</strong></td>
							<td :style="{'border-bottom': 'none', 'padding-top': '5px'}" v-if="invoice.detail.total_amount !== undefined">{{Number((invoice.detail.total_amount - (invoice.detail.total_amount / 1.1)).toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</td>
						</tr>
                        <tr>
							<td :style="{'padding-top': '5px', 'padding-right': '0px', 'padding-right': '20px', 'text-align': 'right'}" colspan="3"><strong>Нийт үнэ</strong></td>
							<td :style="{'padding-top': '5px'}" v-if="invoice.detail.total_amount !== undefined"><strong>{{Number(invoice.detail.total_amount.toFixed(2)).toLocaleString(undefined, {minimumFractionDigits: 2})}}</strong></td>
						</tr>
					</tfoot>
				</table>
				
				<div class="legalcopy mt-10">
					<p class="legal box grow mr-20" v-bind:style="{ 'margin-top': '-'+margin + 'px' }">
						<strong>Дансны мэдээлэл!</strong>  
						<table class="note">
							<tr>
								<td>
									Хүлээн авагч
								</td>
								<td>
									Ай Си Би Си ХХК
								</td>
							</tr>
							<tr>
								<td>
									Регистрийн дугаар
								</td>
								<td>
									5489288
								</td>
							</tr>
							<tr>
								<td>
									Голомт банк
								</td>
								<td>
									3455131183
								</td>
							</tr>
							<tr>
								<td>
									Хаан банк
								</td>
								<td>
									5429245701
								</td>
							</tr>
						</table>
						<br>
						<br><br>

						<strong>Биднийг сонгосонд баярлалаа. </strong>  
                        Танд амжилт хүсье!
					</p>

				</div>				
			</div><!--End Invoice-->
			<div align="center" class="mt-20">
				<img src="@/assets/images/astamp.png" alt="stamp" style="width: 180px; height: auto; vertical-align: middle;" :hidden="!invoice.stamp">
				<div style="height: 70px;" :hidden="invoice.stamp"></div>
				<div style="font-size: 14px; margin-top: -45px;" id="stamp-text"><span style="margin-right: 100px;">НЯГТЛАН БОДОГЧ</span><span>П.ЛХАГВАЦЭЦЭГ</span></div>
			</div>
		</div>

		<el-dialog title="Тохиргоо" :visible.sync="modals.setting" width="30%">
			<div align="left" style="padding-left: 20%;">
				<el-switch v-model="invoice.stamp" inactive-text="Тамга харуулах"> </el-switch><br>
			</div>
		</el-dialog>
	</div>
</template>
<script>
import jwt_decode from "jwt-decode";
import VueHtml2pdf from 'vue-html2pdf'
export default {
    components: {
		VueHtml2pdf
	},
    data() {
        return {
            modals: {
                setting: false
            },
            loading: false,
            params: {
                email: '',
                invoice: ''
            },
            invoice: {
                stamp: true,
                detail: '',
                product: ''
            }
        }
    },
	computed: {
		margin() {
			if(this.invoice.detail.noat == "true") {
				return 50;
			} else {
				return 20;
			}
		},
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
            this.loading = true;
            var rts = this;
            this.$axios({
				method: 'post',
				url: rts.$appUrl +`/api/invoice/get-client-invoice`,
				headers: {},
				data: {
				    invoice: this.params.invoice,
					email: this.params.email
				}
			})
			.then(function(data){
				rts.loading = false;
				if (data.data.result == 'success') {
				    rts.invoice.detail = data.data.invoice;
                    rts.invoice.product = data.data.product;
				} else {
                    rts.$router.push('/not-found');
                }
			}).catch(error => {
				rts.loading = false;
				console.log(error);
			});
        }
    }
}
</script>
<style lang="scss" scoped>
@import '../../../assets/scss/_variables';

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
				margin-left: 20px;
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
						width: 100%;
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
						width: 100%;
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
