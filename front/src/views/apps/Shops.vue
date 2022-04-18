<template>
    <div>
        <div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
            <div class="page-header">
                <div class="flex justify-space-between">
                    <el-breadcrumb separator="/" class="mb-10">
                        <el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
                        <el-breadcrumb-item>Салбарын жагсаалт</el-breadcrumb-item>
                    </el-breadcrumb>
                    
                </div>
            </div>
        </div>
        <div class="page-ecommerce-dashboard scrollable" :style="{'max-height': '97%'}">
		    <div class="table-box card-base card-outline" :style="{'overflow': 'auto'}">
                <table class="styled striped hover" style="font-size: 16px;">
                    <thead>
                        <tr>
                            <th>Shop name</th>
                            <th>Worktime</th>
                            <th>Second part</th>
                            <th>Worktime (weekend)</th>
                            <th>Restday</th>
                            <th>Plan Monthly</th>
                            <th>Plan Daily</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in shops.list" :key="item.id" :style="{'cursor': 'pointer'}">
                            <td width="15%">
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{item.name}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{item.start}} - {{item.end}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{item.second_part}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{item.weekend}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{item.rest}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{Number(item.sale_plan).toLocaleString()}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <h4 class="m-0 o-080">{{Number(item.sale_plan_day).toLocaleString()}}</h4>
                                </div>
                            </td>
                            <td>
                                <div class="item-box item-customer">
                                    <el-button @click="getCurrentShop(item)" icon="el-icon-setting" size="small" circle></el-button>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <el-dialog title="Засварлах" :visible.sync="modals.editItem" width="30%">
            <el-row :gutter="10">
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-time-select style="width: 100%"
                        placeholder="Эхлэх цаг"
                        v-model="shops.selected.start"
                        :picker-options="{
                        start: '00:00',
                        step: '00:05',
                        end: '23:59'
                        }">
                    </el-time-select>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-time-select style="width: 100%"
                        placeholder="Эхлэх цаг"
                        v-model="shops.selected.end"
                        :picker-options="{
                        start: '00:00',
                        step: '00:05',
                        end: '23:59'
                        }">
                    </el-time-select>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
                    <el-input placeholder="Өдрийн ээлж" v-model="shops.selected.second_part" clearable></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
                    <el-time-select style="width: 100%"
                        placeholder="Амралтын өдрийн ажлын цаг"
                        v-model="shops.selected.weekend"
                        :picker-options="{
                        start: '00:00',
                        step: '00:05',
                        end: '23:59'
                        }">
                    </el-time-select>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
                    <el-select v-model="shops.selected.rest" placeholder="Амралтын өдөр" style="width: 100%">
                        <el-option
                        v-for="(item, index) in days"
                        :key="index"
                        :label="item.label"
                        :value="item.value">
                        </el-option>
                    </el-select>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12" class="mt-10">
                    <el-input placeholder="Өдрийн орлого" v-model="shops.selected.sale_plan_day" clearable></el-input>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
                    <el-input placeholder="Өдрийн орлого" v-model="shops.selected.sale_plan" clearable></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.editItem = false">Болих</el-button>
				<el-button type="primary" @click="saveShop">Хадгалах</el-button>
			</span>
		</el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            shops: {
                selected: [],
                list: []
            },
            loading: false,
            modals: {
                editItem: false
            },
            days: [{
                label: 'None',
                value: 'none'
            },{
                label: 'Monday',
                value: 'Mon'
            },{
                label: 'Tuesday',
                value: 'Thu'
            },{
                label: 'Wednesday',
                value: 'Wed'
            },{
                label: 'Thursday',
                value: 'Thu'
            },{
                label: 'Friday',
                value: 'Fri'
            },{
                label: 'Saturday',
                value: 'Sat'
            },{
                label: 'Sunday',
                value: 'Sun'
            }]
        }
    },
    mounted() {
        this.getShops();
    },
    methods: {
        saveShop() {
            if(this.shops.selected.start == null || this.shops.selected.end == null || this.shops.selected.second_part == '' || this.shops.selected.weekend == null || this.shops.selected.sale_plan == '' || this.shops.selected.sale_plan_day == '') {
                this.$notify({
                    title: 'Амжилтгүй',
                    dangerouslyUseHTMLString: true,
                    message: `Талбараа бүрэн бөглөнө үү`,
                    type: 'error'
                });
            } else {
                this.loading = true;
                var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/edit-shop`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            shop: this.shops.selected
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.modals.editItem = false;
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `Мэдээлэл шинэчлэгдлээ`,
                                type: 'success'
                            });
                        }
                        
                    }).catch(error => {
                        console.log(error);
                        rts.loading = false;
                    });
                }
            }
        },
        getCurrentShop(s) {
            this.shops.selected = s;
            this.modals.editItem = true;
        },
        getShops() {
            this.loading = true;
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/shops`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
                    rts.loading = false;
					if(data.data.result == 'success') {
						rts.shops.list = data.data.shops;
					}
					
				}).catch(error => {
					console.log(error);
                    rts.loading = false;
				});
			}
        }
    }
}
</script>