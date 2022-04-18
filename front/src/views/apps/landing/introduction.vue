<template>
    <div class="scrollable" style="margin: 0;">
        <el-row :gutter="10">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-10">
                <el-menu class="el-menu-demo" mode="horizontal">
                    <el-menu-item index="1">
                        <img src="@/assets/images/icbc.png" alt="logo" style="height: 70%; width: auto;">
                    </el-menu-item>
                    <el-menu-item index="2" :hidden="showItem" class="navitem"><a href="#contact" style="text-decoration: none;">ХОЛБОО БАРИХ</a></el-menu-item>
                    <el-menu-item index="3" :hidden="showItem" class="navitem"><a href="#shops" style="text-decoration: none;">САЛБАР</a></el-menu-item>
                    <el-menu-item index="4" :hidden="showItem" class="navitem"><a href="#home" style="text-decoration: none;">НҮҮР</a></el-menu-item>
                    <el-menu-item index="5" :hidden="!showItem" class="navitem">
                        <el-dropdown trigger="click">
                        <span class="el-dropdown-link">
                            <i class="el-icon-s-unfold"></i>
                        </span>
                        <el-dropdown-menu slot="dropdown">
                            <el-dropdown-item><a href="#home" style="text-decoration: none;">НҮҮР</a></el-dropdown-item>
                            <el-dropdown-item><a href="#shops" style="text-decoration: none;">САЛБАР</a></el-dropdown-item>
                            <el-dropdown-item><a href="#contact" style="text-decoration: none;">ХОЛБОО БАРИХ</a></el-dropdown-item>
                        </el-dropdown-menu>
                        </el-dropdown>
                    </el-menu-item>
                </el-menu>
            </el-col>
        </el-row>

        <el-row :gutter="10" class="mt-10">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <section id="home">
                    <el-carousel  arrow="never" class="bannerHeight backgroundColor">
                        <el-carousel-item v-for="(i, index) in banners" :key="index" class="bannerHeight">
                            <el-row>
                                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                                    <div class="titleBody">
                                        <span class="banner-title-model">{{i.model}}</span><br>
                                        <span class="banner-title">{{i.name}}</span><br>
                                        <div class="banner-text">{{i.text}}</div><br>
                                        <el-button type="primary" class="buyButton"><a href="https://www.itlab.mn" style="color: #fff; text-decoration: none;" target="_blank">BUY NOW</a></el-button>
                                    </div>
                                </el-col>
                                <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
                                    <img :src="$appUrl + i.url" alt="logo" class="bannerImage">
                                </el-col>
                            </el-row>
                        </el-carousel-item>
                    </el-carousel>
                </section>
            </el-col>
        
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <section id="shops" class="mt-50">
                    <div align="center">
                        <h3>САЛБАРЫН БАЙРШИЛ</h3>
                        <p style="margin-top: -10px">Та салбар дэлгүүр дээр дарж дэлгэрэнгүй мэдэллийг авна уу</p>
                    </div>
                    <div class="list box grow mt-10">
                        <!--<div class="masonry">-->
                        <masonry :cols="{default: 5, 1200: 3, 1000: 2, 480: 1}" :gutter="20">
                            <div class="item card-base card-alt mt-10 cardbox" @click="showDetail(i)" 
                                v-for="(i, index) in shops" 
                                :key="index" 
                            >
                                <img :src="$appUrl + '/images/local/shops/' + i.image" alt="card image" style="height: 250px;">
                                <div class="p-20">
                                    <h4 class="mt-0 mb-0">{{i.name}}</h4>
                                    <p class="mt-10 text-justify" style="text-overflow: ellipsis; overflow: hidden; width: 100%; white-space: nowrap;">{{i.title}}</p>
                                    <div class="flex justify-space-between o-050 fs-14">
                                        <div class="accent-text"><strong>Утас: {{i.phone}}</strong></div>
                                    </div>
                                </div>
                            </div>
                        </masonry>
                        <!--</div>-->
                    </div>
                </section>
            </el-col>
        </el-row>
        <div class="aboutBody">
            <el-row :gutter="50">
                <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24" class="mt-50">
                    <div align="center">
                        <h3>БИДНИЙ ТУХАЙ</h3>
                        <!-- <p style="margin-top: -10px">Та салбар дэлгүүр дээр дарж дэлгэрэнгүй мэдэллийг авна уу</p> -->
                    </div>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="14" :xl="14">
                    <vue-plyr>
                        <video controls crossorigin playsinline :data-poster="$appUrl + '/images/local/shops/shangrila.jpg'">
                            <source
                                size="720"
                                src="https://api.icbc.mn/images/local/banner/introduction.mp4"
                                type="video/mp4"
                            />
                        </video>
                    </vue-plyr>
                </el-col>
                <el-col :xs="24" :sm="24" :md="24" :lg="10" :xl="10">
                    <p style="text-align: justify;" class="hideText"> Дэлхий нийтэд мэдээлэл технологийн эрин үе эхэлжээ. Хүмүүс мэдээллийн технологийг ашиглан амьдралын чанараа сайжруулж, эрүүл мэнд, байгаль орчноо хамгаалж бизнесээ өргөжүүлсээр байна. Үнэхээр зөв технологийг зөв цагтаа нэвтрүүлэх нь үнэлж баршгүй их өр өгөөжтэй байдаг билээ. Хөгжиж буй орны хувьд Монгол улс ч гэсэн энэ салбарын өсөлт хөгжилтэй мөр зэрэгцэн алхах шаардлагатай тулгарч байна. Энэ чухал цаг үед олон шинэ компаниуд технологийн салбарт мэндлэн бий болж шинэ дэвшилтэт бүтээгдэхүүн үйлчилгээ хүргэхээр ажиллаж байгааг харах таатай байна.</p>
                    <p style="text-align: justify;"> Ай Си Би Си ХХК нь 2011 онд мэдээлэл технологийн бараа бүтээгдэхүүний ханган нийлүүлэлтийн чиглэлээр байгуулагдан, байгуулагдсан цагаасаа өнөөг хүртэл мэдээлэл технологийн бараа бүтээгдэхүүний худалдаан дээр төвлөрөн ажиллаж байгаа бөгөөд одоогоор бид 20 брэндийн 2000 гаран нэр төрлийн барааг орон нутаг болон Улаанбаатар хотын борлуулагчид, өөрсдийн ITLAB болон Remax нэрийн дэлгүүрийн сүлжээгээр дамжуулан борлуулж байна. Бид шинэ цаг үед бий болж байгаа шинэ хэрэгцээ шаардлагыг ухаалгаар шийдсэн бүтээгдэхүүн үйлчилгээг хэрэглэгчиддээ танилцуулцуулахыг гол зорилгоо болгон ажилладаг бөгөөд бидний олон олон шийдлүүд төр болон хувийн хэвшлийн байгууллагууд , жирийн хэрэглэгч ард иргэдийн талархлыг хүлээж байгаад бид баяртай байдаг.</p>
                </el-col>
            </el-row>
        </div>
        <el-row :gutter="10" class="mb-50">
            <el-col :xs="24" :sm="24" :md="24" :lg="24" :xl="24">
                <section id="contact" class="mt-50">
                    <div align="center">
                        <h3>ХОЛБОО БАРИХ</h3>
                        <p style="margin-top: -10px">Та дараах холбоосуудаар бидэнтэй холбогдох боломжтой</p>
                    </div>
                </section>
            </el-col>
            <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
                <div class="card-base card-shadow--medium map-box" style="height: 400px;">
                <l-map :zoom="maps.zoom" :center="def.center" :options="{dragging: maps.dragging}">
                    <l-tile-layer :url="maps.url" :attribution="maps.attribution"></l-tile-layer>
                    <l-marker :lat-lng="def.marker"></l-marker>
                </l-map>
                </div>
            </el-col>
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <div class="ml-20" align="left" style="border-bottom: 1px solid #bfbebb;">
                    <div style="border-bottom: 1px solid black; width: 30%;"><strong>ХАЯГ</strong></div>
                </div>
                <div class="mb-6 ml-20 mt-10">
                    Монгол улс, Улаанбаатар хот, ЧД 4-р хороо,  <br>
                    Жуулчны гудамж 4/4, Макс Цамхаг, <br>
                    3 давхар 306 тоот
                </div>
                <div class="ml-20 mt-20" style="font-size: 20px;">
                    <i class="el-icon-phone-outline"></i> <strong class="ml-10">+976 7511-7733</strong>, <i class="el-icon-message ml-20"></i> <strong class="ml-10">Sales@icbc.mn</strong>
                </div>
                <!-- <div class="ml-20 mt-10" style="font-size: 20px;">
                    <i class="el-icon-message"></i> <strong class="ml-20">sales@icbc.mn</strong>
                </div> -->
            </el-col>
        </el-row>
        <el-dialog title="Салбар дэлгүүрийн дэлгэрэнгүй" :visible.sync="modals.detail">
                <div class="card-base card-shadow--medium map-box">
                    <l-map :zoom="maps.zoom" :center="maps.center" :options="{dragging: maps.dragging}">
                        <l-tile-layer :url="maps.url" :attribution="maps.attribution"></l-tile-layer>
                        <l-marker :lat-lng="maps.marker"></l-marker>
                    </l-map>
                </div>
            </el-dialog>
            <Footer :position="footer" style="z-index: 5000;"/>
    </div>
</template>

<script>
import VuePlyr from 'vue-plyr'
import 'vue-plyr/dist/vue-plyr.css'
import Footer from '@/core/footer.vue'
export default {
    components: {
        VuePlyr,
        Footer
    },
    data() {
        return {
            footer: 'above',
            contact: {
                email: '',
                name: '',
                text: ''
            },
            modals: {
                detail: false
            },
            def: {
                center: L.latLng(47.920562315124684, 106.91004203979018),
                marker: L.latLng(47.920562315124684, 106.91004203979018)
            },
            maps: {
                zoom: 20,
                center: L.latLng(47.413220, -1.219482),
                url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
                attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
                marker: L.latLng(47.413220, -1.219482),
                innerWidth: 0,
                dragging: true
            },
            showItem: false,
            bannderHeight: 50,
            banners: [{
                url: '/images/local/banner/rb-660hb.png',
                model: 'RB-660HB',
                name: 'BLUETOOTH HEADPHONE',
                text: 'Бүх төрлийн гар утас, Tablet, iPad зэрэгт таарах хамгийн сүүлийн үеийн bluetooth v5.0 технологи дээр суурилсан 40mm диаметр бүхий маш хүчирхэг чихэвч'
            },
            {
                url: '/images/local/banner/headphone.png',
                model: 'RB-600HB',
                name: 'BLUETOOTH HEADPHONE',
                text: 'Бүх төрлийн гар утас, Tablet, iPad зэрэгт таарах хамгийн сүүлийн үеийн bluetooth v5.0 технологи дээр суурилсан 40mm диаметр бүхий маш хүчирхэг чихэвч'
            }],
            list: [],
            shops: [{
                name: 'REMAX - ТЭДИ ТӨВ',
                title: 'Тэди төвийн 3 давхарт',
                image: 'remax-tedy.jpg',
                phone: '-',
                code: 'shop_01',
                lat: '',
                lng: ''
            },
            {
                name: 'ITLAB - ТЭДИ ТӨВ',
                title: 'Тэди төвийн 3 давхарт',
                image: 'itlab-tedy.jpg',
                phone: '7000-0766',
                code: 'shop_02',
                lat: '',
                lng: ''
            },
            {
                name: 'ITLAB - ШАНГРИ-ЛА',
                title: 'Шангри-ла дэлгүүрийн 3 давхарт',
                image: 'shangrila.jpg',
                phone: '-',
                code: 'shop_04',
                lat: '',
                lng: ''
            },
            {
                name: 'REMAX - УИД',
                title: 'Улсын их дэлгүүрийн 5 давхарт',
                image: 'uid.jpg',
                phone: '-',
                code: 'shop_03',
                lat: '',
                lng: ''
            },
            {
                name: 'REMAX - CENTRAL MALL',
                title: 'Соёл амралтын моллын 1 давхарт',
                image: 'centralmall.jpg',
                phone: '-',
                code: 'shop',
                lat: '',
                lng: ''
            },
            {
                name: 'REMAX - ХАН УУЛ',
                title: 'Хан-Уул дүүрэг Номин худалдааны төв',
                image: 'hanuul.jpg',
                phone: '-',
                code: 'shop_06',
                lat: '',
                lng: ''
            },
            {
                name: 'REMAX - НАТУР',
                title: 'НАТУР худалдааны төв',
                image: 'natur.jpg',
                phone: '-',
                code: 'shop_05',
                lat: '',
                lng: ''
            },
            {
                name: 'REMAX - ИХ НАЯД',
                title: 'Их наяд худалдааны төвийн 1 давхарт',
                image: 'ihnayd.jpg',
                phone: '-',
                code: 'shop_10',
                lat: '',
                lng: ''
            }]
        }
    },
    methods: {
        resizePopoverWidth() {
			if(window.innerWidth <= 768) {
				this.showItem = true;
                this.bannderHeight = 30;
			} else {
				this.showItem = false;
                this.bannderHeight = 50;
			}
		},
        showDetail(item) {
            this.maps.center = L.latLng(item.lat, item.lng);
            this.maps.marker = L.latLng(item.lat, item.lng);
            this.modals.detail = true;
        },
        getInfo() {
            var rts = this;
            this.$axios({
                method: 'post',
                url: rts.$appUrl +`/api/user/get-home-info`
            })
            .then(function(data){
                data.data.store.forEach(el => {
                    rts.shops.forEach(s => {
                        if(el.code == s.code) {
                            s.lat = el.lat;
                            s.lng = el.lng;
                        }
                    });
                });

                rts.shops.forEach(el => {
                    data.data.time.forEach(t => {
                        if(t.address == el.code && el.code != 'shop_02') {
                            el.phone = t.phone;
                        }
                    });
                });
            }).catch(error => {
                console.log(error);
            });
        }
    },
    mounted() {
        this.resizePopoverWidth();
		window.addEventListener('resize', this.resizePopoverWidth);
        this.getInfo();
    },
    beforeDestroy() {
		window.removeEventListener('resize', this.resizePopoverWidth);
	}
}
</script>
<style scoped>
    .aboutBody {
        padding-left: 150px;
        padding-right: 150px;
    }
    .map-box {
		height: 500px;
		width: 100%;
	}
    .cardbox {
        transition: all .25s;
        cursor: pointer;
    }
    .cardbox:hover {
        /* border-color: #5f8fdf; */
        opacity: 1;
	    box-shadow: 0px 0px 0px 4px #5f8fdf;
    }
    
    .buyButton {
        font-weight: 700;
        margin-top: -20%;
    }
    .navitem {
        float: right;
    }
    
    .titleBody {
        color: #fff;
        padding-top: 20%;
        padding-left: 20%;
    }

    .banner-title {
        font-size: 50px;
        font-weight: 700;
    }
    .banner-title-model {
        font-size: 25px;
        font-weight: 400;
    }
    .backgroundColor {
        background-image: linear-gradient(to right, #323232 , #9B9B9B);
    }

  .bannerHeight {
      height: 60vh;
  }
  .bannerImage {
      height: 100%;
      width: auto;
      float: right;
      margin-right: 100px;
      margin-top: 5%;
      margin-bottom: 10%;
  }
  

  @media (max-width: 500px) {
    .aboutBody {
        padding: 0;
    }
    .banner-text {
        text-overflow: ellipsis;
        overflow: hidden; 
        width: 100%; 
        white-space: nowrap;
    }
    .banner-title-model {
        font-size: 10px;
        font-weight: 400;
    }
    .banner-title {
        font-size: 15px;
    }
	.bannerHeight {
		height: auto;
	}
    .bannerImage {
      width: 100%;
      height: auto;
      margin-right: 0px;
      margin-top: 20%;
  }
    .titleBody {
        color: #fff;
        padding-top: 30%;
        padding-left: 20%;
    }
}

@media (min-width: 768px ) and (max-width: 1024px){
    .banner-text {
        text-overflow: ellipsis;
        overflow: hidden; 
        width: 100%; 
        white-space: nowrap;
    }
    .banner-title-model {
        font-size: 12px;
        font-weight: 400;
    }
    .banner-title {
        font-size: 15px;
    }
	.bannerHeight {
		height: auto;
	}
    .bannerImage {
      width: 55%;
      height: auto;
      margin-right: 0px;
      margin-top: 5%;
  }
    .titleBody {
        color: #fff;
        padding-top: 20%;
        padding-left: 20%;
    }
}

@media (min-width: 1000px ) and (max-width: 1400px){
    .hideText {
        display: none;
    }
    .banner-text {
        text-overflow: ellipsis;
        overflow: hidden; 
        width: 100%; 
        white-space: nowrap;
    }
    .banner-title-model {
        font-size: 12px;
        font-weight: 400;
    }
    .banner-title {
        font-size: 15px;
    }
	.bannerHeight {
		height: auto;
	}
    .bannerImage {
      width: 32%;
      height: auto;
      margin-right: 20%;
      margin-top: 8%;
      margin-bottom: 5%;
  }
    .titleBody {
        color: #fff;
        padding-top: 15%;
        padding-left: 20%;
    }
}
</style>
