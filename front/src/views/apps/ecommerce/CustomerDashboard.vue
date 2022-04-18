<template>
	<div class="page-ecommerce-dashboard scrollable">

		<resize-observer @notify="__resizeHanlder" />

		<div class="card-base card-alt" v-loading.fullscreen.lock="loading">
			<el-row :gutter="30">
				<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
					<div class="widget p-20">
						<div class="text-uppercase text-right flex">
							<div class="box grow">
								<h3 class="m-0">{{Number(badges.total).toLocaleString(0)}}</h3>
								<p class="m-0">Нийт бүтээгдэхүүн</p>
							</div>
							<div class="icon-box ph-15 accent-text">
								<i class="mdi mdi-archive-outline"></i>
							</div>
						</div>
						<!-- <div class="progress-box mt-10" v-if="badges.defaultWorkDay > 0">
							<el-progress :percentage="parseInt((badges.workedDay * 100) / badges.defaultWorkDay)" class="themed"></el-progress>
						</div> -->
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
					<div class="widget p-20">
						<div class="text-uppercase text-right flex">
							<div class="box grow">
								<h3 class="m-0" >{{Number(badges.totalCount).toLocaleString()}}</h3>
								<p class="m-0">Бүтээгдэхүүний үлдэгдэл</p>
							</div>
							<div class="icon-box ph-15 accent-text">
								<i class="mdi mdi-alpha-q-circle-outline"></i>
							</div>
						</div>
						<!-- <div class="progress-box mt-10" v-if="badges.defaultWorkDay > 0">
							<el-progress :percentage="parseInt((badges.workedDay * 100) / badges.defaultWorkDay)" class="themed"></el-progress>
						</div> -->
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
					<div class="widget p-20">
						<div class="text-uppercase text-right flex">
							<div class="box grow">
								<h3 class="m-0" >{{Number(badges.totalSale).toLocaleString()}} ₮</h3>
								<p class="m-0">Худалдах үнэ</p>
							</div>
							<div class="icon-box ph-15 accent-text">
								<i class="mdi mdi-cart-outline"></i>
							</div>
						</div>
						<!-- <div class="progress-box mt-10">
							<el-progress :percentage="23" class="themed"></el-progress>
						</div> -->
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="6" :xl="6">
					<div class="widget p-20">
						<div class="text-uppercase text-right flex">
							<div class="box grow">
								<h3 class="m-0">{{Number(badges.totalWhole).toLocaleString()}} ₮</h3>
								<p class="m-0">Бөөний үнэ</p>
							</div>
							<div class="icon-box ph-15 accent-text">
								<i class="mdi mdi-currency-usd"></i>
							</div>
						</div>
						<!-- <div class="progress-box mt-10">
							<el-progress :percentage="37" class="themed"></el-progress>
						</div> -->
					</div>
				</el-col>
			</el-row>
		</div>
		
		<div class="card-base card-shadow--medium bg-white black-text ph-5 p-0 pb-20 mt-20">
			<el-row>
				<el-col :xs="24" :sm="12" :md="12" :lg="16" :xl="16">
					<div>
						<div id="chart" :style="{height:'500px',width:'100%'}"></div>
					</div>
				</el-col>
				<el-col :xs="24" :sm="12" :md="12" :lg="8" :xl="8">
					<div>
						<div id="pie" :style="{height:'500px',width:'100%'}"></div>
					</div>
				</el-col>
			</el-row>
		</div>

		<vue-scroll class="mt-20">
			<el-row :gutter="30">
				<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="table-box card-base card-outline">
					<table class="styled striped hover">
					<thead>
						<tr>
							<th>Ажилтан</th>
							<th>Үүсгэсэн огноо</th>
							<th>Захиалгын дугаар</th>
							<th>Төлөв</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for="item in lastOrders" :key="item.id" :style="{'cursor': 'pointer'}" @click="goOrder(item.order_number)">
							<td>
								<div class="item-box item-product">
									<div class="product-image">
										<el-avatar :size="40" :src="$appUrl+'/images/local/user/'+item.img">
											<img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
										</el-avatar>
									</div>
									<div>
										<h4 class="m-0">{{item.name}}</h4>
										<p class="m-0">{{item.shop}}</p>
									</div>
								</div>
							</td>
							<td>
								<div class="item-box item-customer">
									<h4 class="m-0 o-080">{{item.created_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</h4>
									<!-- <p class="m-0"><a>{{item.created_at}}</a></p> -->
								</div>
							</td>
							<td>
								<div class="item-box item-location">
									<!-- <h4 class="m-0 mb-5">{{item.address}}</h4> -->
									<p class="m-0 o-060">{{item.order_number}}</p>
								</div>
							</td>
							<td style="max-width: 150px;">
								<div class="item-box item-status" v-bind:class="{'status-Pending': item.stat == 1, 'status-Complete': item.stat == 2, 'status-Returned': item.stat == 3}">
									<h4 class="m-0 mb-5" v-if="item.stat == 1">Хүлээгдэж байгаа</h4>
									<h4 class="m-0 mb-5" v-else-if="item.stat == 2">Зөвшөөрөгдсөн</h4>
									<h4 class="m-0 mb-5" v-else-if="item.stat == 3">Татгалзсан</h4>
									<p class="m-0 o-060" v-if="item.stat == 2 || item.stat == 3">{{item.updated_at.replaceAll('T', ' ').replaceAll('.000Z', ' ')}}</p>
									<p class="m-0 o-060" v-else>-</p>
								</div>
							</td>
						</tr>
					</tbody>
				</table>
				</el-col>
			</el-row>
        </vue-scroll>
	
	</div>
</template>

<script>
import echarts from 'echarts'
import Chance from 'chance'
const chance = new Chance()
var timer = null;
var working = null;
export default {
	name: 'EcommerceDashboard',
	data () {
		return {
			chart: null,
			pie: null,
			gridData: [],
			loading: false,
			sales: {
				last: [],
				this: [],
				default: []
			},
			badges: {
				total: 0,
				totalCount: 0,
				totalSale: 0,
				totalWhole: 0,
				main: 0,
				sub: 0
			},
			lastOrders: [],
			rowWidth: 24,
			showDownloadProduct: false,
			registerAvailable: true,
			many: [],
			sales: []
		}
	},
	created() {
		this.initGridData()
	},
	mounted() {
		window.addEventListener('resize', this.__resizeHanlder)
		var user = JSON.parse(localStorage.user);
		this.getDashboard();
	},
	methods: {
		goOrder(ordernumber) {
			this.$router.push({name:'ecommerce-show-order', params: {id: ordernumber}})
		},
		getDashboard() {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/dashboard/customer-dashboard`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						rts.badges.total = data.data.count[0].count + data.data.count[1].count;
						rts.badges.main = data.data.count[0].count;
						rts.badges.sub = data.data.count[1].count;
						rts.badges.totalCount = data.data.count[0].total + data.data.count[1].total;
						rts.badges.totalSale = data.data.price1[0].sale_price + data.data.price2[0].sale_price;
						rts.badges.totalWhole = data.data.price1[0].whole_price + data.data.price2[0].whole_price;
						data.data.many1.forEach(element => {
							rts.many.push(element);
						});

						data.data.many2.forEach(element => {
							rts.many.push(element);
						});

						rts.sales = data.data.sales;
						rts.initPie()
						rts.initChart(data.data.months)
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		__resizeHanlder: _.throttle(function (e) {
			if (this.chart) {
				this.chart.resize()
			}
			if (this.pie) {
				this.pie.resize()
			}
		}, 700),
		initChart(months) {
			this.chart = echarts.init(document.getElementById('chart'))
			this.chart.setOption({
				//backgroundColor: '#394056',
				title: {
					top: 20,
					text: 'Sales',
					textStyle: { fontWeight: 'normal', fontSize: 16, fontFamily:'Nunito Sans' /*color: '#F1F1F3'*/ },
					left: '1%'
				},
				tooltip: {
					trigger: 'axis',
					axisPointer: { lineStyle: { /*color: '#57617B'*/ } }
				},
				legend: {
					top: 40,
					icon: 'rect',
					itemWidth: 14,
					itemHeight: 5,
					itemGap: 13,
					data: ['Sales'],
					right: '4%',
					textStyle: { fontSize: 12, fontFamily:'Nunito Sans' /*color: '#F1F1F3'*/ }
				},
				grid: {
					top: 100,
					left: '-5px',
					right: '30px',
					bottom: '2%',
					containLabel: true
				},
				xAxis: [{
					type: 'category',
					boundaryGap: false,
					axisLine: { lineStyle: { /*color: '#57617B'*/ } },
					data: months
				}],
				yAxis: [{
					show: false,
					type: 'value',
					name: '(%)',
					axisTick: { show: false },
					axisLine: { lineStyle: { /*color: '#57617B'*/ } },
					axisLabel: {
						margin: 10,
						textStyle: { fontSize: 14 }
					},
					splitLine: { lineStyle: { color: '#eee' /*color: '#57617B'*/ } }
				}],
				series: [{
					name: 'Sales',
					type: 'line',
					smooth: true,
					symbol: 'circle',
					symbolSize: 5,
					showSymbol: false,
					lineStyle: { normal: { width: 1 } },
					areaStyle: {
						normal: {
							color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
								offset: 0,
								color: 'rgba(19, 206, 102, 0.3)'
							}, {
								offset: 0.8,
								color: 'rgba(19, 206, 102, 0)'
							}], false),
							shadowColor: 'rgba(0, 0, 0, 0.1)',
							shadowBlur: 10
						}
					},
					itemStyle: {
						normal: {
							color: 'rgb(19, 206, 102)',
							borderColor: 'rgba(19, 206, 102, 0.27)',
							borderWidth: 12
						}
					},
					data: this.sales
				}]
			})
		},
		initPie() {
			this.pie = echarts.init(document.getElementById('pie'))
			var colors = ['rgb(95, 143, 223)','rgb(19, 206, 102)','rgb(247, 186, 43)','rgb(204, 57, 57)'];
			var colors2 = ['#3f84f6', '#4c8bf7', '#5a95f7', '#70a3f8', '#8ab4fa', '#a3c4fb', '#bfd6fc', '#d4e4fd', '#d7e4f7', '#e6eefa'];
			var vals = []; var vals2 = [];
			vals = [
					{value: this.badges.main, name: "Нийлүүлэгчийн бараа", selected: true, itemStyle: { normal: { color: colors[2]}}},
					{value: this.badges.sub, name: "Үндсэн бараа", selected: false, itemStyle: { normal: { color: colors[1]}}}
				];

			this.many.forEach((el, index) => {
				vals2.push({value: el.qty, name: el.model, itemStyle: { normal: { color: colors2[index]}}});
			});

			this.pie.setOption({
				title: {
					top: 20,
					text: 'PRODUCT STATUS',
					textStyle: { fontWeight: 'normal', fontSize: 16, fontFamily:'Nunito Sans' /*color: '#F1F1F3'*/ },
					left: '1%'
				},
				tooltip: {
					trigger: 'item',
					formatter: "{a} <br/>{b}: {c} ({d}%)"
				},
				series: [
					{
						name:'Status',
						type:'pie',
						selectedMode: 'single',
						radius: [0, '35%'],

						label: {
							normal: {
								position: 'inner'
							}
						},
						labelLine: {
							normal: {
								show: false
							}
						},
						data: vals,
					},
					{
						name:'Products',
						type:'pie',
						radius: ['45%', '60%'],
						
						data: vals2,

						itemStyle: {
							normal: {
								color: 'rgb(19, 206, 102)',
							}
						},
					}
				]
			})
		},
		initGridData() {
			const year = new Date().getFullYear()
			const status_list = ['Complete', 'Pending', 'Returned', 'Paid']

			_.times(10, (number) => {
				let price = chance.floating({ min: 1, max: 100, fixed: 2 })
				let qnt = chance.integer({ min: 1, max: 5 })
				let amount = price * qnt

				this.gridData.push({
					customer: chance.name(),
					photo: '/static/images/shop/'+chance.integer({ min: 0, max: 19 })+'.jpg',
					city: chance.city(),
					address: chance.address(),
					email: chance.email(),
					product: chance.sentence({ words: 3 }),
					price: _.replace(price.toFixed(2).toString(), '.', ','),
					qnt,
					amount: _.replace(amount.toFixed(2).toString(), '.', ','),
					status: status_list[chance.integer({ min: 0, max: 3 })],
					date: chance.date({string: true, year: year}),
					id: number
				})
			})
		}
	}
}
</script>

<style lang="scss">
@import '../../../assets/scss/_variables';

.page-ecommerce-dashboard {
	.widget {
		.icon-box {
			font-size: 30px;
		}
	}

	.table-box {
		.item-box {
			&.item-product {
				.product-image {
					width: 50px;
					margin-right: 15px;
					float: left;

					img {
						width: 100%;
					}
				}
			}

			&.item-status {
				padding: 5px 10px;

				&.status- {
					&Complete { background: rgba(44, 196, 120, 0.25); }
					&Pending { background: rgba(247, 186, 42, 0.25); }
					&Returned { background: rgba(243, 24, 71, 0.25); }
					&Paid { background: rgba(45, 109, 211, 0.25); }
				}
			}
		}
	}
}

</style>


