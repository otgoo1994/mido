<template>
	<div class="page-ecommerce-new-product scrollable">
		<div class="page-header">
			<el-breadcrumb separator="/" class="mb-10">
				<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
				<el-breadcrumb-item :to="{ path: '/products' }">Бүтээгдэхүүний жагсаалт</el-breadcrumb-item>
				<el-breadcrumb-item>Шинэ бүтээгдэхүүн</el-breadcrumb-item>
			</el-breadcrumb>
		</div>

		<el-row>
			<el-col>
				<div class="item-box card-shadow--small b-rad-4">
					<el-row>
						<el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
							<div class="detail-box">
								<el-row :gutter="20">
									<el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-input placeholder="НЭР" style="width: 100%;" prefix-icon="el-icon-user" v-model="user.name" clearable> </el-input>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-input placeholder="УТАС" style="width: 100%;" v-model="user.phone" prefix-icon="el-icon-phone-outline" clearable> </el-input>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-input placeholder="ИМЭЙЛ" style="width: 100%;" v-model="user.email" prefix-icon="el-icon-message" clearable> </el-input>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-select v-model="permissions.selected" filterable placeholder="Хэрэглэгчийн эрх" @change="changedPermission" clearable>
                                            <el-option
                                            v-for="(item, index) in permissions.list"
                                            :key="index"
                                            :label="item.position_name"
                                            :value="item.id">
                                            </el-option>
                                        </el-select>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-select v-model="shops.selected" filterable placeholder="Салбар дэлгүүр" clearable :disabled="shops.hidden">
                                            <el-option
                                            v-for="(item, index) in shops.list"
                                            :key="index"
                                            :label="item.name"
                                            :value="item.code">
                                            </el-option>
                                        </el-select>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-select v-model="title.selected" filterable placeholder="Ажлын чиглэл" clearable>
                                            <el-option
                                            v-for="(item, index) in title.list"
                                            :key="index"
                                            :label="item.pro_name"
                                            :value="item.id">
                                            </el-option>
                                        </el-select>
									</el-col>
                                    <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12" align="center" class="mb-10">
										<el-select v-model="city.selected" filterable placeholder="Хот / Аймаг" clearable>
                                            <el-option
                                            v-for="(item, index) in city.list"
                                            :key="index"
                                            :label="item.city"
                                            :value="item.id">
                                            </el-option>
                                        </el-select>
									</el-col>
								</el-row>

								<el-row>
									<el-col>
										<div class="actions-box text-right">
											<el-button class="themed mb-10 mr-10" @click="addContact" type="primary" plain><i class="mdi mdi-content-save"></i> ХАДГАЛАХ</el-button>
											<!-- <el-button class="themed mb-10" type="primary" plain><i class="mdi mdi-refresh"></i> Reset</el-button> -->
										</div>
									</el-col>
								</el-row>

							</div>
						</el-col>
					</el-row>
				</div>
			</el-col>
		</el-row>
	</div>
</template>
<script>
export default {
    data() {
        return {
            permissions: {
                selected: '',
                list: []
            },
            shops: {
                selected: '',
                list: [],
                hidden: false
            },
            title: {
                selected: '',
                list: []
            },
            city: {
                selected: '',
                list: []
            },
            user: {
                name: '',
                phone: '',
                email: ''
            }
        }
    },
    mounted() {
        this.getInfo();
    },
    methods: {
        changedPermission() {
            if(this.permissions.selected == 6) {
                this.shops.selected = '';
                this.shops.hidden = true;
            } else {
                this.shops.hidden = false;
            }
        },
        getInfo() {
            var rts = this;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/user/new-contact-info`,
					headers: {
						"Authorization": `Bearer ${token}`
					}
				}).then(data => {
					if(data.data.result == 'success') {
						rts.shops.list = data.data.shop;
                        rts.permissions.list = data.data.position;
                        rts.title.list = data.data.profession;
                        rts.city.list = data.data.city;
					}
				});
			}
        },
        addContact() {
            if(this.permissions.selected !== 6) {
                if(this.user.name == '' || this.user.phone == '' || this.user.email == '' || this.shops.selected == '' || this.permissions.selected == '' || this.title.selected == '' || this.city.selected == '') {
                    this.$notify({
                        title: 'Амжилтгүй',
                        dangerouslyUseHTMLString: true,
                        message: `Талбараа бүрэн бөглөнө үү`,
                        type: 'error'
                    });
                } else {
                    var rts = this;
                    const token = localStorage.getItem('token');
                    if(token) {
                        this.$axios({
                            method: 'post',
                            url: rts.$appUrl +`/api/user/add-contact`,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            data: {
                                user: this.user,
                                city: this.city.selected,
                                role: this.permissions.selected,
                                title: this.title.selected,
                                shop: this.shops.selected
                            }
                        }).then(data => {
                            if(data.data.result == 'success') {
                                rts.$notify({
                                    title: 'Амжилттай',
                                    dangerouslyUseHTMLString: true,
                                    message: `Хэрэглэгч бүртгэгдлээ`,
                                    type: 'success'
                                });
                                rts.user.name = '';
                                rts.user.phone = '';
                                rts.user.email = '';
                            } else if (data.data.result == 'failed') {
                                rts.$notify({
                                    title: 'Амжилтгүй',
                                    dangerouslyUseHTMLString: true,
                                    message: `Бүртгэлтэй имэйл`,
                                    type: 'error'
                                });
                            }
                        });
                    }
                }
            } else {
                if(this.user.name == '' || this.user.phone == '' || this.user.email == '' || this.permissions.selected == '' || this.title.selected == '' || this.city.selected == '') {
                    this.$notify({
                        title: 'Амжилтгүй',
                        dangerouslyUseHTMLString: true,
                        message: `Талбараа бүрэн бөглөнө үү`,
                        type: 'error'
                    });
                } else {
                    var rts = this;
                    const token = localStorage.getItem('token');
                    if(token) {
                        this.$axios({
                            method: 'post',
                            url: rts.$appUrl +`/api/user/add-contact`,
                            headers: {
                                "Authorization": `Bearer ${token}`
                            },
                            data: {
                                user: this.user,
                                city: this.city.selected,
                                role: this.permissions.selected,
                                title: this.title.selected,
                                shop: this.shops.selected
                            }
                        }).then(data => {
                            if(data.data.result == 'success') {
                                rts.$notify({
                                    title: 'Амжилттай',
                                    dangerouslyUseHTMLString: true,
                                    message: `Хэрэглэгч бүртгэгдлээ`,
                                    type: 'success'
                                });
                                rts.user.name = '';
                                rts.user.phone = '';
                                rts.user.email = '';
                            } else if (data.data.result == 'failed') {
                                rts.$notify({
                                    title: 'Амжилтгүй',
                                    dangerouslyUseHTMLString: true,
                                    message: `Бүртгэлтэй имэйл`,
                                    type: 'error'
                                });
                            }
                        });
                    }
                }
            }
        }
    }
}
</script>