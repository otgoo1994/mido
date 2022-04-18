<template>
    <div class="page-ecommerce-checkout scrollable">
		
		<el-breadcrumb separator="/" class="mb-20">
			<el-breadcrumb-item :to="{ path: '/products' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
			<el-breadcrumb-item :to="{ path: '/customer-reports' }">Кассын тайлан</el-breadcrumb-item>
			<el-breadcrumb-item>{{ordernumber}}</el-breadcrumb-item>
		</el-breadcrumb>

        <el-row class="cart-box" :gutter="20">
            <el-col :xs="24" :sm="24" :md="24" :lg="17" :xl="17">
                <div class="widget review card-shadow--small b-rad-4">
                    <div class="title">
                        Бүтээгдэхүүн
                    </div>
                    <div class="content">
                        <div class="page-ecommerce-dashboard mt-10" style="width: 100%;" :style="{'border-radius': '10px'}">
                        <div class="table-box card-base card-outline" style="overflow: auto;">
                            <table class="styled striped hover">
                                <thead>
                                    <tr style="font-size: 14px;">
                                        <th>#</th>
                                        <th style="width: 50%;">Бүтээгдэхүүн</th>
                                        <th>Үнэ</th>
                                        <th>Тоо ширхэг</th>
                                        <th>Нийт</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(item, index) in product" :key="index">
                                        <td>{{index + 1}}</td>
                                        <td>
                                            <div class="item-box item-product flex">
                                                <div class="product-image">
                                                    <el-avatar v-if="item.type == 1" :size="40" :src="$imgUrl+item.image">
                                                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                                                    </el-avatar>
                                                    <el-avatar v-else :size="40" :src="$appUrl+'/images/local/product/'+item.image">
                                                        <img src="https://cube.elemecdn.com/e/fd/0fc7d20532fdaf769a25683617711png.png"/>
                                                    </el-avatar>
                                                </div>
                                                <div>
                                                    <h4 class="m-0">{{item.model}}</h4>
                                                    <p class="m-0">{{item.name}}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            ₮{{Number(item.price).toLocaleString()}}
                                        </td>
                                        <td>{{Number(item.qty).toLocaleString()}}</td>
                                        <td>₮{{Number(item.qty * item.price).toLocaleString()}}</td>
                                    </tr>
                                    <tr>
                                        <td colspan="3"><strong>Нийт</strong></td>
                                        <td>{{Number(totalCount).toLocaleString()}}</td>
                                        <td>₮{{Number(totalCash).toLocaleString()}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        </div>
                    </div>
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="24" :lg="7" :xl="7">
                <div class="widget payment card-shadow--small b-rad-4">
                    <div class="title">
                        Нэмэлт мэдээлэл
                    </div>
                    <div class="content">
                        <div class="flex justify-space-between">
                            <div class="box grow mt-10 total">
                                <div class="t-row">
                                    <table align="center">
                                        <tr>
                                            <td class="label" width="50%">Огноо</td>
                                            <td class="value" width="50%" v-if="detail.created_at !== undefined">{{detail.created_at.split('T')[0]}}</td>
                                        </tr>
                                        <tr>
                                            <td class="label" width="50%">Үүсгэсэн</td>
                                            <td class="value" width="50%" v-if="detail.name !== undefined">{{detail.name}}</td>
                                        </tr>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-col>
        </el-row>
	</div>
</template>
<script>
export default {
    data() {
        return {
            detail: [],
            ordernumber: '',
            loading: false,
            product: []
        }
    },
    computed: {
		totalCash() {
			var total = 0;
            this.product.forEach(element => {
                total += element.qty * element.price;
            });
            return total;
		},
        totalCount () {
            var total = 0;
            this.product.forEach(element => {
                total += element.qty;
            });
            return total;
        }
	},
    mounted() {
        this.ordernumber = this.$route.params.id;
        this.getReport();
    },
    methods: {
        getReport() {
            var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/order/show-customer-report`,
					headers: {
						"Authorization": `Bearer ${token}`
					}, 
					data: {
					    ordernumber: this.ordernumber
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
                        rts.detail = data.data.report;
                        rts.product = [];
                        data.data.product1.forEach(element => {
                            rts.product.push(element);
                        });
                        data.data.product2.forEach(element => {
                            rts.product.push(element);
                        });
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
}
</script>