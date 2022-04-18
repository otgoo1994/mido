<style scoped>
.button {
    cursor: pointer;
    background: #4E9CAF;
    padding: 8px;
    text-align: center;
    border-bottom-left-radius: 3px;
    border-top-left-radius: 3px;
    color: white;
    font-size: 15px;
    font-weight: bold;
    /* line-height: 25px; */
}
</style>
<template>
    <div class="scrollable">
        <div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
            <el-tabs v-model="activeName">
                <el-tab-pane label="Цаг бүртгэлийн жагсаалт" name="register">
                    <div class="card-base p-10 flex justify-space-between" align="center">
                        <div>
                            <el-date-picker @change="timeRegisterChanged" v-model="timerRegisterList" type="month" placeholder="Он сар"> </el-date-picker>
                        </div>
                        <el-button-group style="display: flex;">
                            <download-excel v-if="timerRegisterList != null"
                            class="button"
                            :data="ExcelData"
                            :fields="ExcelField"
                            worksheet="My Worksheet"
                            name="Цаг бүртгэлийн дэлгэрэнгүй.xls"
                            >
                            Цагийн дэлгэрэнгүй татах
                            </download-excel>
                            <el-tooltip class="item" effect="dark" content="Фонт цаг бүртгэх" placement="top-end">
                                <el-button type="danger" icon="el-icon-edit" size="mini" @click="addFontTime"></el-button>
                            </el-tooltip>
                        </el-button-group>
                    </div>
                    <div class="page-ecommerce-dashboard">
                        <div class="table-box card-base card-outline">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th>Ажилтны нэр</th>
                                        <th>Ажиллах цаг</th>
                                        <th>Ажилласан цаг</th>
                                        <th>Хоцорсон цаг</th>
                                        <th>Илүү цаг</th>
                                        <th>Бонус цалин</th>
                                    </tr>
                                </thead>
                                <tbody v-if="timerRegisterList == null">
                                    <tr>
                                        <td colspan="6" style="font-size: 18px; text-align: center;">
                                            САРАА СОНГОНО УУ ...
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr v-for="(item, index) in timelist" :key="index">
                                        <td>
                                            {{item.name}}
                                        </td>
                                        <td>
                                            {{item.default_hour}}
                                        </td>
                                        <td>
                                            {{item.total_time.split('.')[0]}}
                                        </td>
                                        <td>{{item.total_lost_time.split('.')[0]}}</td>
                                        <td>
                                            {{diffTime(item.total_time, item.default_hour)}}
                                        </td>
                                        <td>
                                            {{checkBonus(item.id)}}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="Хоолны мөнгө" name="meal">
                    <div class="card-base p-10 flex justify-space-between" align="center">
                        <div>
                            <el-date-picker @change="MealTimeChanged" v-model="MealTimeList" style="width: 100%;" type="daterange" range-separator="-" start-placeholder="Эхлэх огноо" end-placeholder="Дуусах огноо"> </el-date-picker>
                        </div>
                    </div>
                    <div class="page-ecommerce-dashboard">
                        <div class="table-box card-base card-outline">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th>Ажилтны нэр</th>
                                        <th>Ажилласан өдөр</th>
                                        <th>Хоолны мөнгө</th>
                                        <th>Дансны дугаар</th>
                                    </tr>
                                </thead>
                                <tbody v-if="MealTimeList == null">
                                    <tr>
                                        <td colspan="4" style="font-size: 18px; text-align: center;">
                                            ЭХЛЭХ БОЛОН ТӨГСӨХ ӨДРӨӨ СОНГОНО УУ ...
                                        </td>
                                    </tr>
                                </tbody>
                                <tbody v-else>
                                    <tr v-for="(item, index) in mealList" :key="index">
                                        <td>{{item.name}}</td>
                                        <td>{{item.day}}</td>
                                        <td>{{Number(item.day * 4000).toLocaleString()}}</td>
                                        <td>{{item.acc_number}}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
    </div>
</template>
<script>

export default {
    data() {
        return {
            activeName: 'register',
            timerRegisterList: null,
            MealTimeList: null,
            loading: false,
            timelist: [],
            mealList: [],
            bonus: [],
            ExcelField: {
                "Огноо": "date",
                "Эхэлсэн цаг": "start",
                "Хаасан цаг": "end",
                "Ажилласан цаг": "worktime",
                "Хоцорсон цаг": "losttime"
            },
            ExcelData: [
            {
                date: 'Отгонбаатар'
            },
            {
                date: '2020-02-20',
                start: '09:00',
                end: '17:00',
                worktime: '11:00',
                losttime: '00:00:00'
            }]
        }
    },
    mounted() {
        this.timeRegisterChanged();
    },
    methods: {
        addFontTime() {
            if (this.timerRegisterList != null) {
                this.$prompt('Фонт цагаа оруулна уу', 'Цаг бүртгэх', {
                    confirmButtonText: 'Хадгалах',
                    cancelButtonText: 'Болих',
                    inputPattern: /[0-9]/,
                    inputErrorMessage: 'Зөвхөн тоо оруулна уу'
                }).then(({ value }) => {
                    var rts = this;
                    const token = localStorage.getItem('token');
                    if(token) {
                        this.$axios({
                            method: 'post',
                            url: rts.$appUrl +`/api/usefull/update-font-time`,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            data: {
                                date: this.timerRegisterList,
                                fonttime: value
                            }
                        })
                        .then(function(data){
                            if(data.data.result == 'success') {
                                rts.$notify({
                                    title: 'Амжилттай',
                                    dangerouslyUseHTMLString: true,
                                    message: `Фонт цаг шинэчлэгдлээ`,
                                    type: 'success'
                                });
                                rts.timeRegisterChanged();
                            }
                            
                        }).catch(error => {
                            console.log(error);
                        });
                    }
                });
            }
        },
        checkBonus(id) {
            var b = 0;
            this.bonus.forEach(el => {
                if(el.user_id == id) {
                    b = el.total_bonus;
                }
            });
            if(b < 0) {
                return 0;
            }
            return Number(b).toLocaleString();
        },
        diffTime(time, def) {
            time = time.split('.')[0];
            def = def * 60 * 60;
            time = time.split(':');
            var hour = (time[0] * 60 * 60) ;
            var min = (time[1]  * 60)
            var sec = time[2] * 1;
            time = hour + min + sec;
            if(time > def) {
                time = time - def;
                var hour = Math.floor(time / 3600);
                var min = Math.floor( (time - (hour * 3600)) / 60);
                var sec = time % 60;
				if(sec < 10) {
                    sec = '0' + sec;
                }

                if (hour < 10) {
                    hour = '0' + hour;
                }
                if (min < 10) {
                    min = '0' + min;
                }
                return hour + ':' + min + ':' + sec;
            } else {
                return '00:00:00';
            }
        },
        timeRegisterChanged () {
            if (this.timerRegisterList != null) {
                var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/get-total-time`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            date: this.timerRegisterList
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.timelist = [];
                            rts.timelist = data.data.total;
                            rts.bonus = data.data.bonus;
                            var a = [];
                            rts.ExcelData = [];
                            data.data.users.forEach(user => {
                                a.push({date: user.name});
                                data.data.MoreTime.forEach(time => {
                                    if(time.user_id == user.id) {
                                        a.push({date: time.date, start: time.starttime, end: time.endtime, worktime: rts.workTimeDiff(time.starttime, time.endtime), losttime: time.lost});
                                    }
                                });
                            });
                            rts.ExcelData = a;
                        }
                        
                    }).catch(error => {
                        console.log(error);
                    });
                }
            }
        },
        workTimeDiff(start, end) {
            var start = new Date("01/01/2007 " + start);
			var end = new Date("01/01/2007 " + end);
            var diff = Math.abs(Math.round((end.getTime() - start.getTime()) / 1000));
			var hour = Math.floor(diff / 3600);
			var min = Math.floor( (diff - (hour * 3600)) / 60);
			var sec = diff % 60;
				if(sec < 10) {
                    sec = '0' + sec;
                }
				if (hour < 10) {
					hour = '0' + hour;
				}
				if(min < 10) {
					min = '0' + min;
				}
			return hour + ':' + min + ':' + sec;
        },
        MealTimeChanged() {
            if (this.MealTimeList != null) {
                var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/get-meal-money`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            datetime: this.MealTimeList
                        }
                    })
                    .then(function(data){
                        if(data.data.result == 'success') {
                            rts.mealList = [];
                            rts.mealList = data.data.meal;
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