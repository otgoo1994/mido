<template>
	<div class="page-invoice scrollable">
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
					<div class="invoice bg-white black-text" style="padding-top: 76px; padding-left: 114px; padding-right: 57px;">		
                        <div class="invoice-top">
                            <div class="logo" :style="{'width': '250px'}">
                                <img src="@/assets/images/icbc.png" alt="logo" :style="{'margin-top': '0'}">
                                <p class="font-invoice" style="font-size: 11px; line-height: normal; color: #0bacfa;">Монгол улс, Улаанбаатар хот, Чингэлтэй дүүрэг,<br> 4-р хороо, Жуулчны гудамж 4/4 Макс Цамхаг,<br> 3 давхарт 306 тоот, Вэб: www.icbc.mn, Цахим шуудан: info@icbc.mn, Утас: (976)-75117733<br></p>
                                <p class="font-invoice" style="font-size: 14px; margin-top: 10px; text-align: center; line-height: normal;"><span style="display: inline-block; width: 115px; border-bottom: 1px solid #0bacfa;">{{official.created_at.split('T')[0]}}</span><span style="color: #0bacfa;">№</span><span style="display: inline-block; width: 115px; border-bottom: 1px solid #0bacfa;">{{official.official_id}}</span></p>
                                <p class="font-invoice" style="font-size: 14px; margin-top: 10px; text-align: center; line-height: normal; color: #0bacfa;">танай<span style="display: inline-block; width: 75px; border-bottom: 1px solid;"></span>-ны № <span style="display: inline-block; width: 75px; border-bottom: 1px solid;"></span>-т</p>
                                <div align="center" :style="{'width': '225px', 'position': 'relative', 'margin-left': '0px', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                                    <span :style="{'position': 'absolute', 'left': '0px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                                    <span style="font-size: 16px;">{{official.about}}</span>
                                    <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                                </div>
                            </div>
                            <div class="title" align="right">
                                <div align="center" :style="{'width': '250px', 'position': 'relative', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                                    <span :style="{'position': 'absolute', 'left': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                                    <span style="font-size: 16px;">{{official.receiver}}</span>
                                    <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                                </div>
                            </div>
                        </div><!--End InvoiceTop-->

                        <div class="invoice-middle" style="padding: 0;">
                            <pre style="text-align: justify; text-justify: inter-word; font-size: 16px; white-space: pre-wrap; border: none; background: none; color: #222;" class="font" id="description">{{official.description}}</pre>
                        </div>
                        <div align="center" class="mt-20">
                            <img src="@/assets/images/Pstamp.png" alt="stamp" style="width: 365px; height: auto; vertical-align: middle;" :hidden="!switchs.stamp">
                            <div style="height: 200px;" :hidden="switchs.stamp"></div>
                            <div style="font-size: 16px; margin-top: -140px;" id="stamp-text"><span style="margin-right: 100px;">АЙ СИ БИ СИ ХХК ЗАХИРАЛ</span><span>Л.АМАРТҮВШИН</span></div>
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

		<div class="invoice bg-white font black-text" style="padding-top: 26px; padding-left: 54px; padding-right: 17px; position: relative;">		
			<div class="invoice-top">
				<div class="logo" :style="{'width': '250px'}">
                    <img src="@/assets/images/icbc.png" alt="logo" :style="{'margin-top': '0'}">
					<!-- Монгол улс, Улаанбаатар хот, ЧД 4-р хороо Жуулчны гудамж 4/4, Макс Цамхаг 3 давхар 306 тоот -->
                    <p class="font-invoice" style="font-size: 11px; line-height: normal; color: #0bacfa;">Монгол улс, Улаанбаатар хот, Чингэлтэй дүүрэг,<br> 4-р хороо, Жуулчны гудамж 4/4 Макс Цамхаг,<br> 3 давхарт 306 тоот, Вэб: www.icbc.mn, Цахим шуудан: info@icbc.mn, Утас: (976)-75117733<br></p>
                    <p class="font-invoice" style="font-size: 14px; margin-top: 10px; text-align: center; line-height: normal;"><span style="display: inline-block; width: 115px; border-bottom: 1px solid #0bacfa;">{{official.created_at.split('T')[0]}}</span><span style="color: #0bacfa;">№</span><span style="display: inline-block; width: 115px; border-bottom: 1px solid #0bacfa;">{{official.official_id}}</span></p>
                    <p class="font-invoice" style="font-size: 14px; margin-top: 10px; text-align: center; line-height: normal; color: #0bacfa;">танай<span style="display: inline-block; width: 75px; border-bottom: 1px solid;"></span>-ны № <span style="display: inline-block; width: 75px; border-bottom: 1px solid;"></span>-т</p>
                    <div align="center" :style="{'width': '225px', 'position': 'relative', 'margin-left': '0px', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                        <span :style="{'position': 'absolute', 'left': '0px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                        <span style="font-size: 16px;">{{official.about}}</span>
                        <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                    </div>
                </div>
				<div class="title" align="right">
                    <div align="center" :style="{'width': '250px', 'position': 'relative', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                        <span :style="{'position': 'absolute', 'left': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                        <span style="font-size: 16px;">{{official.receiver}}</span>
                        <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                    </div>
                </div>
			</div><!--End InvoiceTop-->
            <img src="@/assets/images/icbc.png" alt="" width="200" style="position: absolute; margin-left: 30%; margin-top: 20%; opacity: 0.1;">
			<div class="invoice-middle" style="padding: 0;">
				<pre style="text-align: justify; text-justify: inter-word; font-size: 16px; white-space: pre-wrap; border: none; background: none; color: #222;" class="font" id="description">{{official.description}}</pre>
			</div>
            <div align="center" class="mt-20">
				<img src="@/assets/images/Pstamp.png" alt="stamp" style="width: 300px; height: auto; vertical-align: middle;" :hidden="!switchs.stamp">
				<div style="height: 200px;" :hidden="switchs.stamp"></div>
				<div style="font-size: 16px; margin-top: -120px;" id="stamp-text"><span style="margin-right: 100px;">АЙ СИ БИ СИ ХХК ЗАХИРАЛ</span><span>Л.АМАРТҮВШИН</span></div>
			</div>
		</div>

		<el-dialog title="Тохиргоо" :visible.sync="modals.setting" width="30%">
			<div align="left" style="padding-left: 20%;">
				<el-switch v-model="switchs.stamp" inactive-text="Тамга харуулах"> </el-switch><br>
			</div>
		</el-dialog>
	</div>
</template>

<script>
import VueHtml2pdf from 'vue-html2pdf'
export default {
	name: 'Invoice',
	components: {
		VueHtml2pdf
	},
    data() {
        return {
            official: {
                receiver: '',
                about: '',
                description: '',
                official_id: 0,
                created_at: ''
            },
			modals: {
				setting: false
			},
			switchs : {
				stamp: true
			},
			invoiceNumber: ''
        }
    },
    computed:{
		amount() {
			return _.reduce(this.products, (sum, obj) => sum + (obj.price * obj.remain), 0)
		},
		amount_text() {
			this.invoiceTo.total_amount = this.amount;
            return this.amount;
		}
	},
    mounted() {
		this.invoiceNumber = this.$route.params.id;
		this.$prompt('Батлах нууц үгээ оруулна уу', 'Санамж', {
          confirmButtonText: 'Батлах',
          cancelButtonText: 'Болих',
		  inputType: 'Password'
        }).then(({ value }) => {
			var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/check-official-password`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        password: value
                    }
				})
				.then(function(data){
					if (data.data.result == 'success') {
                        rts.getInvoice();
					} else {
						rts.$notify({
							title: 'Амжилтгүй',
							message: `Нууц үг буруу`,
							type: 'error'
						});
                        rts.$router.go(-1);   
                    }
				}).catch(error => {
					console.log(error);
				});
			}
        }).catch(() => {
          this.$router.go(-1);    
        });
    },
	methods: {
		toSend() {
			this.send = true;
		},
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
					url: rts.$appUrl +`/api/offer/get-official-done`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        index: rts.invoiceNumber
                    }
				})
				.then(function(data){
					if (data.data.result == 'success') {
                        rts.official = data.data.official;
					} else {
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

<style lang="scss" scoped>
@import '../../../assets/scss/_variables';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');

.font {
	font-family: 'Roboto', sans-serif;
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
			margin-bottom: 30px;

			.logo {
				float: left;                
				box-sizing: border-box;
				overflow: hidden;
				// background: rgba(0, 0, 0, 0.07);
				text-align: center;
				
				img {
					width: 100px;
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
			margin-top: 30px;
			margin-bottom: 30px;
			font-size: 16px;
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
						width: 100%;
					}
					&:last-child {
						padding-right: 0px;
					}
				}

				td {
					text-align: right;
					padding: 20px;
					padding-bottom: 5px;
					border-bottom: 1px solid #EEE;

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

