import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '../views/apps/Dashboard.vue'
import EcommerceDashboard from '../views/apps/ecommerce/Dashboard.vue'
import CustomerDashboard from '../views/apps/ecommerce/CustomerDashboard.vue'
import Login2 from '../views/pages/authentication/Login2.vue'
import Products from '../views/apps/ecommerce/Products.vue'
import ProductDetail from '../views/apps/ecommerce/ProductDetail.vue'
import ProductDetailCustomer from '../views/apps/ecommerce/ProductDetailCustomer.vue'
import Cart from '../views/apps/ecommerce/Cart.vue'
import Orders from '../views/apps/ecommerce/Orders.vue'
import Imports from '../views/apps/ecommerce/imports.vue'
import ImportEdit from '../views/apps/ecommerce/importEdit.vue'
import Movements from '../views/apps/ecommerce/movements.vue'
import ShowOrder from '../views/apps/ecommerce/ShowOrder.vue'
import ShowMovement from '../views/apps/ecommerce/showMovement.vue'
import ShowImport from '../views/apps/ecommerce/showImport.vue'
import InvoiceEdit from '../views/apps/document/invoiceEdit.vue'
import OfferEdit from '../views/apps/document/offerEdit.vue'
import OfficialEdit from '../views/apps/document/officialEdit.vue'
import Invoices from '../views/apps/document/invoices.vue'
import SentInvoices from '../views/apps/document/sentInvoice.vue'
import Reports from '../views/apps/document/reports.vue'
import CustomerReports from '../views/apps/customer/Reports.vue'
import ShowCustomerReports from '../views/apps/customer/showReport.vue'
import Offers from '../views/apps/document/offers.vue'
import SentOffers from '../views/apps/document/sentOffer.vue'
import Officials from '../views/apps/document/officials.vue'
import Invoice from '../views/apps/document/viewInvoice.vue'
import Report from '../views/apps/document/viewReport.vue'
import Offer from '../views/apps/document/viewOffer.vue'
import Official from '../views/apps/document/viewOfficial.vue'
import NewProduct from '../views/apps/ecommerce/NewProduct.vue'
import CustomerNewProduct from '../views/apps/ecommerce/CustomerNewProduct.vue'
import NotFound from '../views/pages/NotFound.vue'
import icons from '../views/ui/Icons/MdIcons.vue'
import Contacts from '../views/apps/Contacts.vue'
import Shops from '../views/apps/Shops.vue'
import NewContacts from '../views/apps/newContact.vue'
import layouts from '../layout'
import store from '../store'
import Calendar from '../views/apps/Calendar.vue'
import TimeRegister from '../views/apps/TimeRegister.vue'
import Companies from '../views/apps/Companies.vue'
import brands from '../views/apps/brands.vue'
import invoiceClient from '../views/apps/document/invoiceClient.vue'
import offerClient from '../views/apps/document/offerClient.vue'
import Expends from '../views/apps/document/expends.vue'
import SentExpends from '../views/apps/document/sentExpend.vue'
import Expend from '../views/apps/document/expend.vue'
import ExpendEdit from '../views/apps/document/expendEdit.vue'
import expendClient from '../views/apps/document/expendClient.vue'
import Rma from '../views/apps/ecommerce/rma.vue'
import RmaProduct from '../views/apps/ecommerce/rmaProduct.vue'
import Profile from '../views/apps/ecommerce/Account.vue'
import CustomerExpends from '../views/apps/customer/Expends.vue'
import CustomerRevenues from '../views/apps/customer/Revenues.vue'
import Main from '../views/apps/ecommerce/Main.vue'

Vue.use(Router)

const router = new Router({
	mode: 'history',
	//base: '/sub-path/',
	routes: [
		{
			path: '/',
			name: 'main',
			component: Main,
			meta: {
				auth: true,
				layout: layouts.contenOnly,
				searchable: true,
				title: 'Дэлгүүр',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/contacts',
			name: 'contacts',
			component: Contacts,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Хэрэглэгчид',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/client-invoice',
			name: 'client-invoice',
			component: invoiceClient,
			meta: {
				auth: false,
				layout: layouts.contenOnly,
				searchable: false,
				title: 'Нэхэмжлэх'
			}
		},
		{
			path: '/profile',
			name: 'profile',
			component: Profile,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Хувийн мэдээлэл',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/rma',
			name: 'rma',
			component: Rma,
			meta: {
				auth: false,
				layout: layouts.navLeft,
				searchable: true,
				title: 'RMA'
			}
		},
		{
			path: '/rma-product/:id/:type',
			name: 'rma-product',
			component: RmaProduct,
			meta: {
				auth: false,
				layout: layouts.navLeft,
				searchable: true,
				title: 'RMA барааны дэлгэрэнгүй'
			}
		},
		{
			path: '/client-expend',
			name: 'client-expend',
			component: expendClient,
			meta: {
				auth: false,
				layout: layouts.contenOnly,
				searchable: false,
				title: 'Зарлагын баримт'
			}
		},
		{
			path: '/client-offer',
			name: 'client-offer',
			component: offerClient,
			meta: {
				auth: false,
				layout: layouts.contenOnly,
				searchable: false,
				title: 'Үнийн санал'
			}
		},
		{
			path: '/brand-category',
			name: 'brand-and-category',
			component: brands,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Брэнд & Категори',
				permission: [1,2,4]
			}
		},
		{
			path: '/companies',
			name: 'companies',
			component: Companies,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Харилцагч байгууллага',
				permission: [1,2,4]
			}
		},
		{
			path: '/time-register',
			name: 'time-register',
			component: TimeRegister,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Цаг бүртгэл',
				permission: [1,2]
			}
		},
		{
			path: '/shops',
			name: 'shops',
			component: Shops,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Салбарын жагсаалт',
				permission: [1,2,4]
			}
		},
		{
			path: '/new-contact',
			name: 'new-contact',
			component: NewContacts,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Шинэ хэрэглэгч бүртгэх',
				permission: [1,2,4]
			}
		},
		{
			path: '/calendar',
			name: 'calendar',
			component: Calendar,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Ажлын төлөвлөгөө',
				permission: [1,2,4]
			}
		},
		{
			path: '/reports',
			name: 'reports',
			component: Reports,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Кассын тайлан',
				permission: [1,2,3,4,5]
			}
		},
		{
			path: '/customer-reports',
			name: 'customer-reports',
			component: CustomerReports,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Кассын тайлан',
				permission: [6]
			}
		},
		{
			path: '/customer-revenues',
			name: 'customer-revenues',
			component: CustomerRevenues,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Орлогын жагсаалт',
				permission: [6]
			}
		},
		{
			path: '/show-customer-reports/:id',
			name: 'show-customer-reports',
			component: ShowCustomerReports,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Тайлангын дэлгэрэнгүй',
				permission: [6]
			}
		},
		{
			path: '/dashboard',
			name: 'analytic-dashboard',
			component: Dashboard,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Хяналтын самбар',
				permission: [1,2,4]
			}
		},
		{
			path: '/icons',
			name: 'icons',
			component: icons,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'icons',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/new-product',
			name: 'new-product',
			component: NewProduct,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Шинэ бүтээгдэхүүн',
				permission: [1,2,4]
			}
		},
		{
			path: '/customer-new-product',
			name: 'customer-new-product',
			component: CustomerNewProduct,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Шинэ бүтээгдэхүүн',
				permission: [6]
			}
		},
		{
			path: '/ecommerce-dashboard',
			name: 'ecommerce-admin-dashboard',
			component: EcommerceDashboard,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Үндсэн самбар',
				permission: [1,2,3,4,5]
			}
		},
		{
			path: '/customer-dashboard',
			name: 'customer-dashboard',
			component: CustomerDashboard,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Үндсэн самбар',
				permission: [6]
			}
		},
		{
			path: '/edit-official/:id',
			name: 'edit-official',
			component: OfficialEdit,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Албан бичиг үүсгэх',
				permission: [1,2,4]
			}
		},
		{
			path: '/report/:id',
			name: 'report',
			component: Report,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Кассын тайлангийн дэлгэрэнгүй',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/officials/',
			name: 'officials',
			component: Officials,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Албан бичгийн жагсаалт',
				permission: [1,2,4]
			}
		},
		{
			path: '/official/:id',
			name: 'official',
			component: Official,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Албан бичиг',
				permission: [1,2,4]
			}
		},
		{
			path: '/edit-offer/:id',
			name: 'edit-offer',
			component: OfferEdit,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Үнийн санал үүсгэх',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/edit-expend/:id',
			name: 'edit-expend',
			component: ExpendEdit,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Зарлагын баримт үүсгэх',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/expends/',
			name: 'expends',
			component: Expends,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Зарлагын баримтууд',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/customer-expends/',
			name: 'customer-expends',
			component: CustomerExpends,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Зарлага',
				permission: [6]
			}
		},
		{
			path: '/sent-expends/',
			name: 'sent-expends',
			component: SentExpends,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Илгээсэн зарлагын баримтууд',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/expend/:id',
			name: 'expend',
			component: Expend,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Зарлагын баримт',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/offers/',
			name: 'offers',
			component: Offers,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Үнийн саналын жагсаалт',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/sent-offers/',
			name: 'sent-offers',
			component: SentOffers,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Илгээсэн үнийн саналын жагсаалт',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/offer/:id',
			name: 'offer',
			component: Offer,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Үнийн санал',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/edit-invoice/:id',
			name: 'edit-invoice',
			component: InvoiceEdit,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Нэхэмжлэх үүсгэх',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/invoices/',
			name: 'invoices',
			component: Invoices,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Нэхэмжлэхийн жагсаалт',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/sent-invoices/',
			name: 'sent-invoices',
			component: SentInvoices,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Илгээсэн нэхэмжлэхийн жагсаалт',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/invoice/:id',
			name: 'invoice',
			component: Invoice,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Нэхэмжлэх',
				permission: [1,2,3,4]
			}
		},
		{
			path: '/ecommerce-show-order/:id',
			name: 'ecommerce-show-order',
			component: ShowOrder,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Захиалгын дэлгэрэнгүй',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/ecommerce-show-movement/:id',
			name: 'ecommerce-show-movement',
			component: ShowMovement,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Захиалгын дэлгэрэнгүй',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/import/:id',
			name: 'import',
			component: ShowImport,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: false,
				title: 'Захиалгын дэлгэрэнгүй',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/products',
			name: 'ecommerce-products',
			component: Products,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				//layout: layouts.navTop,
				searchable: true,
				title: 'Бүтээгдэхүүний жагсаалт',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/product-detail/:id',
			name: 'ecommerce-product-detail',
			component: ProductDetail,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				//layout: layouts.navTop,
				searchable: true,
				title: 'Бүтээгдэхүүний дэлгэрэнгүй',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/product-detail-customer/:id',
			name: 'ecommerce-product-detail-customer',
			component: ProductDetailCustomer,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				//layout: layouts.navTop,
				searchable: true,
				title: 'Бүтээгдэхүүний дэлгэрэнгүй',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [6]
			}
		},
		{
			path: '/cart',
			name: 'ecommerce-cart',
			component: Cart,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				//layout: layouts.navTop,
				searchable: true,
				title: 'Миний сагс',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/orders',
			name: 'ecommerce-orders',
			component: Orders,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Агуулахын захиалгын жагсаалт',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/imports',
			name: 'imports',
			component: Imports,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Ирж байгаа захиалгын жагсаалт',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/import-edit',
			name: 'import-edit',
			component: ImportEdit,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Гадаад захиалга үүсгэх',
				tags: ['ecommerce', 'shop', 'products'],
				permission: [1,4]
			}
		},
		{
			path: '/movements',
			name: 'ecommerce-movements',
			component: Movements,
			meta: {
				auth: true,
				layout: layouts.navLeft,
				searchable: true,
				title: 'Дотоод хөдөлгөөний жагсаалт',
				tags: ['ecommerce', 'shop', 'movement'],
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '/login',
			name: 'login',
			component: Login2,
			meta: {
				layout: layouts.contenOnly,
				title: 'Нэвтрэх',
				permission: [1,2,3,4,5,6]
			}
		},
		{
			path: '*',
			name: 'not-found',
			component: NotFound,
			meta: {
				layout: layouts.contenOnly,
				searchable: true,
				title: 'Алдаа',
				permission: [1,2,3,4,5,6]
			}
		}
	]
})


const l = {
	contenOnly(){
		store.commit('setLayout', layouts.contenOnly)
	},
	navLeft(){
		store.commit('setLayout', layouts.navLeft)
	},
	navRight(){
		store.commit('setLayout', layouts.navRight)
	},
	navTop(){
		store.commit('setLayout', layouts.navTop)
	},
	navBottom(){
		store.commit('setLayout', layouts.navBottom)
	},
	set(layout){
		store.commit('setLayout', layout)
	}	
}

//insert here login logic
const auth = {
	loggedIn() {
		var token = localStorage.getItem("token");
		if (token) {
			return true;
		} else {
			return false;
		}
		// return store.getters.isLogged
	},
	logout() {
		store.commit('setLogout')
	}
}

router.beforeEach((to, from, next) => {
	document.title = to.meta.title;
	let authrequired = false
	if(to && to.meta && to.meta.auth)
		authrequired = true

	//console.log('authrequired', authrequired, to.name)
	if(authrequired) {
		if(auth.loggedIn()) {
			var per = JSON.parse(localStorage.user).posID;
			if(to.meta.permission.includes(per)) {
				if(to.name === 'login') {
					window.location.href = '/products'
					return false
				} else { 
					next()
				}	
			} else {
				window.location.href = '/not-found'
			}
		} else {
			if(to.name !== 'login'){
				window.location.href = '/login'
				return false
			}
			next()
		}
	} else {
		if(auth.loggedIn() && to.name === 'login'){
			window.location.href = '/products'
			return false
		} else {
			next()
		}
	}

	if(to && to.meta && to.meta.layout){
		l.set(to.meta.layout)
	}	
})

router.afterEach((to, from) => {
	setTimeout(()=>{
		store.commit('setSplashScreen', false)
	}, 500)
})

export default router