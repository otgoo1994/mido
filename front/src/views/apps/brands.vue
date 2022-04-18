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
                <el-tab-pane label="Брэнд" name="brand">
                    <div class="page-ecommerce-dashboard">
                        <div class="table-box card-base card-outline">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Брэнд нэр</th>
                                        <!-- <th>Категори код</th> -->
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(c, index) in brand.list" :key="index">
                                        <td>{{index + 1}}</td>
                                        <!-- <td>{{c.category_name}}</td> -->
                                        <td>{{c.brandname}}</td>
                                        <td>
                                            <el-button-group>
                                                <el-button icon="el-icon-setting" @click="editBrand(c)" size="small" circle></el-button>
                                                <el-button icon="el-icon-delete" size="small" @click="deleteBrand(c)" circle></el-button>
                                            </el-button-group>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="Категори" name="category">
                    <div class="page-ecommerce-dashboard">
                        <div class="table-box card-base card-outline">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Категори нэр</th>
                                        <th>Категори код</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(c, index) in category.list" :key="index">
                                        <td>{{index + 1}}</td>
                                        <td>{{c.category_name}}</td>
                                        <td>{{c.category_code}}</td>
                                        <td>
                                            <el-button-group>
                                                <el-button icon="el-icon-setting" @click="editCategory(c)" size="small" circle></el-button>
                                                <el-button icon="el-icon-delete" @click="deleteCategory(c)" size="small" circle></el-button>
                                            </el-button-group>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-tab-pane>
                <el-tab-pane label="Дэд категори" name="subcategory">
                    <div class="page-ecommerce-dashboard">
                        <div class="table-box card-base card-outline">
                            <table class="styled striped hover">
                                <thead>
                                    <tr>
                                        <!-- <th>#</th> -->
                                        <th>#</th>
                                        <th>Дэд категори</th>
                                        <th>Категори код</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="(s, i) in sub.list" :key="i">
                                            <td>{{i + 1}}</td>
                                            <td>{{s.sub_category_name}}</td>
                                            <td>{{s.sub_category_code}}</td>
                                            <td>
                                                <el-button-group>
                                                    <el-button icon="el-icon-setting" @click="editSub(s)" size="small" circle></el-button>
                                                    <el-button icon="el-icon-right" size="small" @click="selectSub(s)" circle></el-button>
                                                    <el-button icon="el-icon-delete" @click="deleteSubCategory(s)" size="small" circle></el-button>
                                                </el-button-group>
                                            </td>
                                        </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </el-tab-pane>
            </el-tabs>
        </div>
        <el-dialog title="Брэнд засварлах" :visible.sync="modals.brandEdit" width="30%">
            <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
                    <el-input placeholder="Нэр" v-model="brand.selected.brandname" clearable></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.brandEdit = false">Болих</el-button>
				<el-button type="primary" @click="saveBrand">Хадгалах</el-button>
			</span>
		</el-dialog>
        <el-dialog title="Үндсэн категори засварлах" :visible.sync="modals.categoryEdit" width="30%">
            <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
                    <el-input placeholder="Нэр" v-model="category.selected.category_name" clearable></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.categoryEdit = false">Болих</el-button>
				<el-button type="primary" @click="saveCategory">Хадгалах</el-button>
			</span>
		</el-dialog>
        <el-dialog title="Дэд категори засварлах" :visible.sync="modals.subEdit" width="30%">
            <el-row :gutter="10">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
                    <el-input placeholder="Нэр" v-model="sub.selected.sub_category_name" clearable></el-input>
                </el-col>
            </el-row>
			<span slot="footer" class="dialog-footer">
				<el-button @click="modals.subEdit = false">Болих</el-button>
				<el-button type="primary" @click="saveSubCategory">Хадгалах</el-button>
			</span>
		</el-dialog>
        <el-dialog
            title=""
            :show-close="false"
            :visible.sync="modals.changeDialog"
            width="30%"
            center>
            <el-button type="primary" style="width: 100%;" @click="modals.changeSub = true" plain>Дэд категори шилжүүлэх</el-button><br>
            <el-button type="info" style="width: 100%; margin-top: 10px;" @click="modals.changeProductSub = true" plain>Бүтээгдэхүүн шилжүүлэх</el-button>
        </el-dialog>

        <el-dialog
            title=""
            :visible.sync="modals.changeSub"
            width="30%"
            center>
            <el-select v-model="toCategory" filterable placeholder="Шилжүүлэх категори" style="width: 100%;">
                <el-option
                v-for="(item, index) in category.list"
                :key="index"
                :label="item.category_name"
                :value="item.id">
                </el-option>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button @click="modals.changeSub = false">Болих</el-button>
                <el-button type="primary" @click="transferSub">Хадгалах</el-button>
            </span>
        </el-dialog>

        <el-dialog
            title=""
            :visible.sync="modals.changeProductSub"
            width="30%"
            center>
            <el-select v-model="toSubCategory.main" filterable placeholder="Шилжүүлэх үндсэн категори" style="width: 100%;">
                <el-option
                v-for="(item, index) in category.list"
                :key="index"
                :label="item.category_name"
                :value="item.id">
                </el-option>
            </el-select>
            <el-select v-model="toSubCategory.sub" filterable placeholder="Шилжүүлэх дэд категори" style="width: 100%; margin-top: 10px;">
                <el-option
                v-for="(item, index) in filterSub"
                :key="index"
                :label="item.sub_category_name"
                :value="item.id">
                </el-option>
            </el-select>
            <span slot="footer" class="dialog-footer">
                <el-button @click="modals.changeProductSub = false">Болих</el-button>
                <el-button type="primary" @click="transferSubProduct">Хадгалах</el-button>
            </span>
        </el-dialog>
    </div>
</template>
<script>

export default {
    data() {
        return {
            activeName: 'brand',
            brand: {
                selected: '',
                list: []
            },
            category: {
                selected: '',
                list: []
            },
            sub: {
                selected: '',
                list: []
            },
            loading: false,
            modals: {
                brandEdit: false,
                categoryEdit: false,
                subEdit: false,
                changeDialog: false,
                changeProductSub: false,
                changeSub: false
            },
            toCategory: '',
            toSubCategory: {
                main: '',
                sub: ''
            }
        }
    },
    computed: {
        filterSub() {
			var arr = [];
			this.sub.list.forEach(el => {
				if(el.categoryID == this.toSubCategory.main) {
					arr.push(el);
				}
			});
			return arr;
		}
    },
    mounted() {
        this.getInfo();
    },
    methods: {
        transferSubProduct() {
            var rts = this;
            this.loading = true;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/product/transper-sub-category-product`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    data: {
                        sub: this.sub.selected,
                        to: this.toSubCategory
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.$notify({
                            title: 'Амжилттай',
                            dangerouslyUseHTMLString: true,
                            message: `Бүтээгдэхүүн амжилттай шилжүүллээ`,
                            type: 'success'
                        });
                        rts.modals.changeDialog = false;
                        rts.modals.changeProductSub = false;
                        rts.getInfo();
                    }   
                }).catch(error => {
                    rts.loading = false;
                    console.log(error);
                });
            }
        },
        transferSub() {
            var rts = this;
            this.loading = true;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/product/transper-sub-category`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    data: {
                        sub: this.sub.selected,
                        to: this.toCategory
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.$notify({
                            title: 'Амжилттай',
                            dangerouslyUseHTMLString: true,
                            message: `<strong>${rts.sub.selected.sub_category_name}</strong> шилжлээ`,
                            type: 'success'
                        });
                        rts.modals.changeDialog = false;
                        rts.modals.changeSub = false;
                        rts.getInfo();
                    }   
                }).catch(error => {
                    rts.loading = false;
                    console.log(error);
                });
            }
        },
        selectSub(item) {
            this.sub.selected = item;
            this.toCategory = item.categoryID;
            this.modals.changeDialog = true;
        },
        saveSubCategory() {
            var rts = this;
            this.loading = true;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/usefull/edit-sub-category`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    data: {
                        category: this.sub.selected
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.modals.subEdit = false;
                    }   
                }).catch(error => {
                    rts.loading = false;
                    console.log(error);
                });
            }
        },
        saveCategory() {
            var rts = this;
            this.loading = true;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/usefull/edit-category`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    data: {
                        category: this.category.selected
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.modals.categoryEdit = false;
                    }
                        
                }).catch(error => {
                    rts.loading = false;
                    console.log(error);
                });
            }
        },
        deleteCategory(item) {
            this.$confirm(`<strong>${item.category_name}</strong> категори утсгахдаа итгэлтэй байна уу?`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                dangerouslyUseHTMLString: true,
                type: 'warning'
            }).then(() => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/delete-category`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            id: item.id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.category.list.forEach((el, index) => {
                                if(el.id == item.id) {
                                    rts.category.list.splice(index, 1);
                                }
                            });
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${item.category_name}</strong> устгагдлаа`,
                                type: 'success'
                            });
                        } else {
                            rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `Энэ категори дээр <strong>${data.data.p}</strong> ширхэг бараа бүртгэлтэй байна`,
                                type: 'error'
                            });
                        }
                            
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
        },
        deleteSubCategory(item) {
            this.$confirm(`<strong>${item.sub_category_name}</strong> категори утсгахдаа итгэлтэй байна уу?`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                dangerouslyUseHTMLString: true,
                type: 'warning'
            }).then(() => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/delete-sub-category`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            id: item.id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.sub.list.forEach((el, index) => {
                                if(el.id == item.id) {
                                    rts.sub.list.splice(index, 1);
                                }
                            });
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${item.sub_category_name}</strong> устгагдлаа`,
                                type: 'success'
                            });
                        } else {
                            rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `Энэ категори дээр <strong>${data.data.p}</strong> ширхэг бараа бүртгэлтэй байна`,
                                type: 'error'
                            });
                        }
                            
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
        },
        deleteBrand(item) {
            this.$confirm(`<strong>${item.brandname}</strong> устгахдаа итгэлтэй байна уу?`, 'Санамж', {
                confirmButtonText: 'Тийм',
                cancelButtonText: 'Үгүй',
                dangerouslyUseHTMLString: true,
                type: 'warning'
            }).then(() => {
                var rts = this;
                this.loading = true;
                const token = localStorage.getItem('token');
                if(token) {
                    this.$axios({
                        method: 'post',
                        url: rts.$appUrl +`/api/usefull/delete-brand`,
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        data: {
                            id: item.id
                        }
                    })
                    .then(function(data){
                        rts.loading = false;
                        if(data.data.result == 'success') {
                            rts.brand.list.forEach((el, index) => {
                                if(el.id == item.id) {
                                    rts.brand.list.splice(index, 1);
                                }
                            });
                            rts.$notify({
                                title: 'Амжилттай',
                                dangerouslyUseHTMLString: true,
                                message: `<strong>${item.brandname}</strong> устгагдлаа`,
                                type: 'success'
                            });
                        } else {
                            rts.$notify({
                                title: 'Амжилтгүй',
                                dangerouslyUseHTMLString: true,
                                message: `Энэ брэнд дээр <strong>${data.data.p}</strong> ширхэг бараа бүртгэлтэй байна`,
                                type: 'error'
                            });
                        }
                            
                    }).catch(error => {
                        rts.loading = false;
                        console.log(error);
                    });
                }
            })
        },
        saveBrand() {
            var rts = this;
            this.loading = true;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/usefull/edit-brand`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    data: {
                        brand: this.brand.selected
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.modals.brandEdit = false;
                    }
                        
                }).catch(error => {
                    rts.loading = false;
                    console.log(error);
                });
            }
        },
        editSub(item) {
            this.sub.selected = item;
            this.modals.subEdit = true;
        },
        editBrand(item) {
            this.brand.selected = item;
            this.modals.brandEdit = true;
        },
        editCategory(item) {
            this.category.selected = item;
            this.modals.categoryEdit = true;
        },
        getInfo() {
            this.loading = true;
            var rts = this;
            const token = localStorage.getItem('token');
            if(token) {
                this.$axios({
                    method: 'post',
                    url: rts.$appUrl +`/api/usefull/get-brand-and-category`,
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                })
                .then(function(data){
                    rts.loading = false;
                    if(data.data.result == 'success') {
                        rts.brand.list = data.data.brands;
                        rts.category.list = data.data.category;
                        rts.sub.list = data.data.sub;
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