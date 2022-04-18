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
                                    <div class="logo" :style="{'width': '400px'}">
                                        <img src="@/assets/images/icbc.png" alt="logo" :style="{'margin-top': '0'}">
										<p class="font-invoice" style="font-size: 13px; line-height: normal; color: #0bacfa;">Монгол улс, Улаанбаатар хот, Чингэлтэй дүүрэг,<br> 4-р хороо, Жуулчны гудамж 4/4 Макс Цамхаг,<br> 3 давхарт 306 тоот, Вэб: www.icbc.mn, Цахим шуудан: info@icbc.mn, Утас: (976)-75117733<br></p>
                                        <!-- <p class="font-invoice" style="font-size: 13px; line-height: normal; color: #0bacfa;">Монгол улс, Улаанбаатар хот, Сүхбаатар дүүрэг,<br> 9-р хороо, 7-р хороолол, Алтайн гудамж-34,<br> Шинэ дэлхий оффис, 8 давхарт 805 тоот<br>Вэб: www.icbc.mn, Цахим шуудан: info@icbc.mn,<br>Утас: (976)-75117733<br></p> -->
                                        <p class="font-invoice" style="font-size: 16px; margin-top: 10px; text-align: center; line-height: normal;"><span style="display: inline-block; width: 165px; border-bottom: 1px solid #0bacfa;">{{official.created_at.split('T')[0]}}</span><span style="color: #0bacfa;">№</span><span style="display: inline-block; width: 165px; border-bottom: 1px solid #0bacfa;">{{official.official_id}}</span></p>
                                        <p class="font-invoice" style="font-size: 16px; margin-top: 10px; text-align: center; line-height: normal; color: #0bacfa;">танай<span style="display: inline-block; width: 120px; border-bottom: 1px solid;"></span>-ны № <span style="display: inline-block; width: 120px; border-bottom: 1px solid;"></span>-т</p>
                                        <div align="center" :style="{'width': '340px', 'position': 'relative', 'margin-left': '30px', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                                            <span :style="{'position': 'absolute', 'left': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                                            <el-input type="textarea" id="textabout" :style="{'text-align': 'center'}" :rows="2" placeholder="Албан бичгийн толгой" v-model="official.about"> </el-input>
                                            <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                                        </div>
                                    </div>
                                    
                                    <div class="title" align="right">
                                        <div align="center" :style="{'width': '400px', 'position': 'relative', 'padding-left': '10px', 'padding-right': '10px', 'padding-top': '5px'}">
                                            <!-- <p style="position: absolute; left: 0; color: #0bacfa; top: 0; font-size: 20px;" class="font-invoice">┍</p> -->
                                            <span :style="{'position': 'absolute', 'left': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┍</span>
                                                <el-input type="textarea" :rows="2" id="textabout" placeholder="Албан бичиг явуулах компани" v-model="official.receiver"> </el-input>
                                            <span :style="{'position': 'absolute', 'right': '-10px', 'top': '-15px', 'font-size': '20px', 'color': '#0bacfa'}">┑</span>
                                        </div>
                                    </div>
                                </div>

                                <div class="invoice-middle">
                                    <el-input type="textarea" :rows="10" maxlength="4000" @keydown.tab.prevent.native="checkTab($event)" placeholder="Тодорхойлолт" v-model="official.description"> </el-input>
                                    <!-- <textarea required maxlength="4000" class="form-control" id="description" name="description" rows="10" placeholder="Тайлбар" v-model="official.description"></textarea> -->
                                </div>
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>
        </div>
    </div>
</template>
<script>
export default {
    data() {
        return {
            official: {
                receiver: '',
                about: '',
                description: '',
                official_id: 0,
                created_at: ''
            },
            officialIndex: ''
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
        this.officialIndex = this.$route.params.id;
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
                        rts.$router.push('/officials');    
                    }
				}).catch(error => {
					console.log(error);
				});
			}
        }).catch(() => {
          this.$router.push('/officials');    
        });
    },
    
    methods: {
        checkTab(e) {
            e.preventDefault();
            let startText = this.official.description.slice(0, e.target.selectionStart)
            let endText = this.official.description.slice(e.target.selectionStart)
            this.official.description = `${startText}\t${endText}`
            // e.target.selectionEnd = e.target.selectionStart + 1
        },
        updateInvoice(done) {
            if(this.official.description != '' && this.official.about != '' && this.official.receiver != '') {
                var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/offer/update-official`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            official: this.official,
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
                                rts.$router.push('/officials');
                            }
                        }
                    }).catch(error => {
                        console.log(error);
                    });
                }
            } else {
                this.$notify({
                    title: 'Амжилтгүй',
                    message: `Талбараа бүрэн бөглөнө үү`,
                    type: 'error'
                });
            }
        },
        getInvoice() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/offer/get-official`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        officialId: rts.officialIndex
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

<style lang="scss">
// @import '../../assets/scss/_variables';
@import '../../../assets/scss/_variables';
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@300&display=swap');
.el-textarea textarea#textabout {
    text-align: center;
}
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
				// float: left;                
				box-sizing: border-box;
				overflow: hidden;
				// background: rgba(0, 0, 0, 0.07);
				text-align: center;
				
				img {
					width: 120px;
				    height: auto;
					// margin-top: 10%;
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
            padding-left: 30px;
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