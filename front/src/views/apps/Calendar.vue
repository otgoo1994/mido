<template>
	<div class="page-calendar scrollable" v-loading.fullscreen.lock="loading">
		<div class="page-header">
			<div class="flex justify-space-between">
				<el-breadcrumb separator="/" >
					<el-breadcrumb-item :to="{ path: '/ecommerce-dashboard' }"><i class="mdi mdi-home-outline"></i></el-breadcrumb-item>
					<el-breadcrumb-item>Ажлын төлөвлөгөө</el-breadcrumb-item>
				</el-breadcrumb>
				<el-button-group>
					<el-select v-model="shops.selected" filterable placeholder="Select" @change="getPlan">
						<el-option
						v-for="(item, index) in shops.list"
						:key="index"
						:label="item.name"
						:value="item.code">
						</el-option>
					</el-select>
				</el-button-group>
			</div>
		</div>
		<FullCalendar 
			ref="fullCalendar"
			:options="calendarOptions"
			:event="plans"
			class="calendar-wrap card-base card-shadow--medium" 
		/>
		
		<el-dialog title="Төлөвлөгөө оруулах" :visible.sync="dialogFormVisible" width="30%">
			<el-form :model="form" ref="form" label-position="top">
				<el-select v-model="users.selected" filterable placeholder="Ажилтнаа сонгоно уу" style="width: 100%;">
					<el-option
					v-for="item in users.list"
					:key="item.id"
					:label="item.name"
					:value="item.id">
					</el-option>
				</el-select>
			</el-form>
			<span slot="footer" class="dialog-footer">
				<el-button @click="closeEventDialog">Болих</el-button>
				<el-button type="primary" @click="setEvent">Хадгалах</el-button>
			</span>
		</el-dialog>
	</div>

</template>

<script>
import moment from 'moment-timezone'
import FullCalendar from '@fullcalendar/vue'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid';
import listPlugin from '@fullcalendar/list';
import interactionPlugin from '@fullcalendar/interaction';
export default {
	name: 'Calendar',
	data() {
		const __Y = moment().format('YYYY')
		const __M = moment().format('MM')

		return {
			calendarOptions: {
				customButtons: {
					addEvent: {
						text: '✚',
						click: this.addEventDialog
					}
				},
				locale: 'en',
				headerToolbar: {
					left:   'prev,next',
					center: 'title',
					right:  'dayGridMonth'
				},
				customButtons: {
					prev: {
						text: 'prev',
						click: () => {
							let calendarApi = this.$refs.fullCalendar.getApi();
            				calendarApi.prev();
							// calendarApi.getDate()
						}
					},
					next: {
						text: 'next',
						click: () => {
							let calendarApi = this.$refs.fullCalendar.getApi();
            				calendarApi.next();
							// calendarApi.getDate()
						}
					}
				},
				height: "auto",
				firstDay: 1,
				allDaySlot: true,
				slotEventOverlap: true,
				selectable: true,
				selectMirror: true,
				eventTimeFormat: { // like '14:30'
					hour: '2-digit',
					minute: '2-digit',
					meridiem: false
				},
				navLinks: true, // can click day/week names to navigate views
				editable: true,
				dayMaxEvents: true, // allow "more" link when too many events
				plugins: [ dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin ],
				events: [],
				dateClick: this.dayClick,
				eventClick: this.eventClick
			},
			dialogFormVisible: false,
			form: {
				title: '',
				description: '',
				allDay: false,
				startDate: '',
				startTime: '',
				endDate: '',
				endTime: '',
				id: '',
				color: '#4a596a'
			},
			predefineColors: [
				'#ff4500',
				'#ff8c00',
				'#ffd700',
				'#90ee90',
				'#00ced1',
				'#1e90ff',
				'#4a596a',
				'#c71585'
			],
			user: [],
			shops: {
				selected: '',
				list: []
			},
			plans: [],
			users: {
				selected: '',
				list: [],
				date: ''
			}
		}
	},
	created() {
		this.user = JSON.parse(localStorage.user);
		this.shops.selected = this.user.call_store;
		this.getPlan();
	},
	methods: {
		getPlan() {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/calendar`,
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
						rts.shops.list = data.data.shops;
						var p = [];
						let calendarApi = rts.$refs.fullCalendar.getApi();
						var r = calendarApi.getEvents();
						r.forEach(element => {
							element.remove();
						});
						data.data.plan.forEach(el => {
							p.push({title: el.name, start: el.date});
							calendarApi.addEvent({
								id: el.id,
								title: el.name,
								start: el.date
							})
						});
						rts.plans = p;
            			rts.users.list = data.data.user;
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		closeEventDialog() {
			this.$refs.form.resetFields()
			this.dialogFormVisible = false
			this.form = {
				title: '',
				description: '',
				allDay: false,
				startDate: '',
				startTime: '',
				endDate: '',
				endTime: '',
				color: '#4a596a'
			}
		},
		setEvent() {
			var rts = this;
			this.loading = true;
			const token = localStorage.getItem('token');
			if(token) {
				this.$axios({
					method: 'post',
					url: rts.$appUrl +`/api/usefull/add-event`,
					headers: {
						"Authorization": `Bearer ${token}`
					},
					data: {
						shop: this.shops.selected,
						date: this.users.date,
						id: this.users.selected
					}
				})
				.then(function(data){
					rts.loading = false;
					if(data.data.result == 'success') {
						let calendarApi = rts.$refs.fullCalendar.getApi();
						rts.users.list.forEach(el => {
							if(el.id == rts.users.selected) {
								calendarApi.addEvent({
									id: el.id,
									title: el.name,
									start: rts.users.date
								})
							}
						});
						rts.$notify({
							title: 'Амжилттай',
							message: `Амжилттай бүртгэгдлээ`,
							type: 'success'
						});
						rts.dialogFormVisible = false;
					}
				}).catch(error => {
					rts.loading = false;
					console.log(error);
				});
			}
		},
		addEventDialog() {
			this.dialogFormVisible = true;
		},
		getPlanArray() {
			console.log(this.plans);
			return this.plans;
		},
		dayClick(arg) {
			// this.form.startDate = arg.date
			var dt = new Date(arg.date);
        	dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
			this.users.date = dt;
			this.dialogFormVisible = true;
		},
		eventClick(arg) {
			var dt = new Date(arg.event.start);
        	dt = dt.getFullYear() + '-' + ((dt.getMonth() > 8) ? (dt.getMonth() + 1) : ('0' + (dt.getMonth() + 1))) + '-' + ((dt.getDate() > 9) ? dt.getDate() : ('0' + dt.getDate()));
			this.$confirm('Тухайн өдрийн ажилтныг устгах уу', 'Санамж', {
				confirmButtonText: 'Тийм',
				cancelButtonText: 'Болих',
				type: 'warning'
			}).then(() => {
				var rts = this;
				this.loading = true;
				const token = localStorage.getItem('token');
				if(token) {
					this.$axios({
						method: 'post',
						url: rts.$appUrl +`/api/usefull/delete-event`,
						headers: {
							"Authorization": `Bearer ${token}`
						},
						data: {
							shop: this.shops.selected,
							date: dt,
							id: arg.event.id
						}
					})
					.then(function(data){
						rts.loading = false;
						if(data.data.result == 'success') {
							arg.event.remove();
							
							rts.$notify({
								title: 'Амжилттай',
								message: `Амжилттай устгагдлаа`,
								type: 'success'
							});
						}
					}).catch(error => {
						rts.loading = false;
						console.log(error);
					});
				}
			});
		}
	},
	components: {
		FullCalendar
	}
}
</script>

<style lang="scss">
@import '../../assets/scss/_variables';
//@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';
@import '~@fullcalendar/timegrid/main.css';
@import '~@fullcalendar/list/main.css';

/*.page-calendar {
	.calendar-wrap {
		//background: white;
	}
}*/
</style>

