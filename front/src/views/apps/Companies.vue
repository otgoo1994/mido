<template>
    <div class="scrollable">
        <div class="page-ecommerce-orders flex column" v-loading.fullscreen.lock="loading">
            <div class="page-header">
                <div class="flex justify-space-between">
                    <el-breadcrumb separator="/" class="mb-10">
                        <el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
                        <el-breadcrumb-item>Харилцагчдын жагсаалт</el-breadcrumb-item>
                    </el-breadcrumb>
                    <el-button-group>
                        <el-tooltip class="item" effect="dark" content="Шинэ харилцагч бүртгэх" placement="top-end">
                            <el-button icon="el-icon-edit" @click="modals.addItem = true" size="small" circle></el-button>
                        </el-tooltip>
                        <el-tooltip class="item" effect="dark" content="Хуулах" placement="top-end">
                            <el-button icon="el-icon-document-copy" @click="copyCompanies" size="small" circle></el-button>
                        </el-tooltip>
                    </el-button-group>
                </div>
            </div>
            <input type="text" ref="text-creator" style="opacity: 0;">
        </div>
        <div class="page-ecommerce-dashboard">
		    <div class="table-box card-base card-outline">
                <table class="styled striped hover" style="font-size: 16px;">
                    <thead>
                        <tr>
                            <th>Компани</th>
                            <th>Ажилтан</th>
                            <th>Имэйл</th>
                            <th>Утасны дугаар</th>
                            <th>Регистр</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="item in company.list" :key="item.id" :style="{'cursor': 'pointer'}">
                            <td>{{item.name}}</td>
                            <td>{{item.nickname}}</td>
                            <td>{{item.email}}</td>
                            <td>{{item.phone}}</td>
                            <td>{{item.register}}</td>
                            <td>
                                <el-button-group>
                                    <el-button @click="getCurrentShop(item)" icon="el-icon-setting" size="small" circle></el-button>
                                    <el-button @click="deleteCompany(item.id, item.name)" icon="el-icon-delete" size="small" circle></el-button>
                                </el-button-group>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        <el-dialog title="Засварлах" :visible.sync="modals.editItem" width="30%">
            <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-input placeholder="Компани" v-model="company.selected.name" clearable></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Ажилтны нэр" v-model="company.selected.nickname" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Утасны дугаар" v-model="company.selected.phone" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Регистрийн дугаар" v-model="company.selected.register" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Имэйл" v-model="company.selected.email" clearable class="mt-5"></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.editItem = false">Болих</el-button>
				<el-button type="primary" @click="saveShop">Хадгалах</el-button>
			</span>
		</el-dialog>
        <el-dialog title="Шинэ харилцагч" :visible.sync="modals.addItem" width="30%">
            <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                    <el-input placeholder="Компани" v-model="company.new.name" clearable></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Ажилтны нэр" v-model="company.new.nickname" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Утасны дугаар" v-model="company.new.phone" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Регистрийн дугаар" v-model="company.new.register" clearable class="mt-5"></el-input>
                </el-col>
                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                    <el-input placeholder="Имэйл" v-model="company.new.email" clearable class="mt-5"></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.editItem = false">Болих</el-button>
				<el-button type="primary" @click="addShop">Хадгалах</el-button>
			</span>
		</el-dialog>
    </div>
</template>
<script>
export default {
    data() {
        return {
            company: {
                selected: '',
                list: [],
                new: {
                    name: '',
                    nickname: '',
                    email: '',
                    phone: '',
                    register: ''
                }
            },
            loading: false,
            modals: {
                editItem: false,
                addItem: false
            }
        }
    },
    mounted() {
        this.getShops(); 
    },
    methods: {
        addShop() {
            this.loading = true;
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/add-company`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        company: this.company.new
                    }
				})
				.then(function(data){
                    rts.loading = false;
					if(data.data.result == 'success') {
						rts.$notify({
                            title: 'Амжилттай',
                            dangerouslyUseHTMLString: true,
                            message: `Байгууллага бүртгэгдлээ`,
                            type: 'success'
                        });
                        rts.getShops();
					} else {
                        rts.$notify({
                            title: 'Амжилтгүй',
                            dangerouslyUseHTMLString: true,
                            message: `Бүртгэлтэй имэйл`,
                            type: 'error'
                        });
                    }
					
				}).catch(error => {
					console.log(error);
                    rts.loading = false;
				});
			}
        },
        saveShop() {
            // var a = this.company.selected;
            this.loading = true;
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/edit-company`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
                    data: {
                        company: this.company.selected
                    }
				})
				.then(function(data){
                    rts.loading = false;
					if(data.data.result == 'success') {
						rts.$notify({
                            title: 'Амжилттай',
                            dangerouslyUseHTMLString: true,
                            message: `Байгууллага шинэчлэгдлээ`,
                            type: 'success'
                        });
					}
					
				}).catch(error => {
					console.log(error);
                    rts.loading = false;
				});
			}
        },
        copyCompanies() {
            var name = '';
            this.company.list.forEach(el => {
                if(name == '') {
                    name = el.email;
                } else {
                    name = name + ', ' +el.email;
                }
            });
            this.$refs['text-creator'].value = name;
            this.$refs['text-creator'].select();
            this.$refs['text-creator'].setSelectionRange(0, 99999);
            document.execCommand("cut");
        },
        getCurrentShop(s) {
            this.company.selected = s;
            this.modals.editItem = true;
        },
        deleteCompany(id, name) {
            this.$confirm(`<strong>${name}</strong> харилцагчыг устгах уу`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                type: 'warning',
                dangerouslyUseHTMLString: true
            }).then(() => {
                this.loading = true;
                var rts = this;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/delete-company`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.company.list.forEach((el, index) => {
                                if(el.id == id) {
                                    rts.company.list.splice(index, 1);
                                }
                            });
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `Байгууллага устгагдлаа`,
                                type: 'success'
                            });
                        }
                        
                    }).catch(error => {
                        console.log(error);
                        rts.loading = false;
                    });
                }
            });
        },
        getShops() {
            this.loading = true;
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/companies`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				})
				.then(function(data){
                    rts.loading = false;
					if(data.data.result == 'success') {
						rts.company.list = data.data.companies;
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