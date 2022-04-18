<template>
	<div class="page-cards flex column">
		
		<!--<resize-observer @notify="__resizeHanlder" />-->

		<el-row>
			<div class="card-form card-base card-outline" @click="openForm" v-click-outside="onClickOutside" :class="{'open':formOpen}">
				<div v-if="!formOpen">Write a note</div>
				<div v-if="formOpen">
					<input v-model="title" placeholder="Title">
					<textarea v-model="description" placeholder="Description"></textarea>
					<button @click="addCard" :disabled="!title.trim() && !description.trim()" class="accent-text">Save</button>
					<button @click="closeForm">close</button>
				</div>
			</div>
		</el-row>

		<div class="list box grow scrollable">
			<!--<div class="masonry">-->
			<masonry :cols="{default: 4, 1200: 3, 1000: 2, 480: 1}" :gutter="20">
				<div class="item card-base card-alt" 
					v-for="i in listSorted" 
					:key="i.id" 
				>
					<img v-if="i.image" :src="i.image_url" alt="card image">
					<div class="p-20">
						<h2 class="mt-0 mb-0">{{i.title}}</h2>
						<p class="mt-10 text-justify">{{i.description}}</p>
						<div class="flex justify-space-between o-050 fs-14">
							<div class="accent-text"><strong>{{i.date}}</strong></div>
						</div>
					</div>
				</div>
			</masonry>
			<!--</div>-->
		</div>

	</div>
</template>

<script>
import _ from 'lodash'
import moment from 'moment'
import Chance from 'chance'
const chance = new Chance()

export default {
	name: 'Cards',
	data () {
		return {
			title: '',
			description: '',
			list: [],
			masonryCols: 4,
			formOpen: false
		}
	},
	computed: {
		listSorted() {
			return _.orderBy(this.list, ['id'], ['desc'])
		}
	},
	methods: {
		__resizeHanlder: _.throttle(function (e) {
			if (window.innerWidth <= 480) this.masonryCols = 1
			else if (window.innerWidth <= 1000) this.masonryCols = 2
			else if (window.innerWidth <= 1200) this.masonryCols = 3
			else this.masonryCols = 4
		}, 700),
		addCard() {
			this.list.push({
				id: this.list.length,
				title: this.title,
				description: this.description,
				date: moment().format('MM/DD/YYYY')
			})

			this.title = ''
			this.description = ''
		},
		generateCards() {
			const year = new Date().getFullYear()

			for(let i=0; i<=50; i++) {
				this.list.push({
					id: i,
					image: chance.bool(),
					image_url: '/static/images/gallery/photo-'+chance.integer({ min: 0, max: 50 })+'.jpg',
					title: chance.sentence({words: 3}),
					description: chance.sentence(),
					date: chance.date({string: true, year: year})
				})
			}
		},
		onClickOutside() {
			this.formOpen = false
		},
		openForm() {
			this.formOpen = true
		},
		closeForm() {
			setTimeout(this.onClickOutside, 100)
		}
	},
	created() {
		this.generateCards()
	}
}
</script>

<style lang="scss">
@import '../../assets/scss/_variables';

.page-cards {
	overflow: hidden;

	.list {
		//overflow: hidden;
		//overflow-y: auto;
		padding: 10px 20px;
		margin: 0 -20px;
		margin-top: 20px;

		.masonry {
			column-count: 4;
			column-gap: 40px;
		}

		.item {
			//padding: 20px;
			//margin: 20px 0;
			margin-bottom: 20px;
			//border-radius: 5px;
			opacity: .85;
			transition: all .25s;

			/* masonry */
			//display: inline-block;
			box-sizing: border-box;
			width: 100%;

			img {
				width: 100%;
				max-width: 100%;
			}

			&:hover {
				opacity: 1;
				box-shadow: 0px 0px 0px 4px $text-color-accent;
			}
		}
	}

	.card-form {
		width: 100%;
		max-width: 400px;
		margin: 0 auto;
		box-sizing: border-box;
		padding: 8px;
		overflow: hidden;

		* {
			box-sizing: border-box;
			display: block;
			width: 100%;
			border: none;
			outline: none;
			padding: 8px;
			background: transparent;
			color: $text-color;
		}

		input {
			font-weight: bold;
			font-size: 16px;
		}

		textarea {
			resize: none;
		}

		button {
			text-transform: uppercase;
			width: auto;
			margin: 0 auto;
			cursor: pointer;
			border-bottom: 1px solid transparent;
			display: inline-block;

			&:hover {
				border-color: $text-color;
			}

			&.accent-text {
				color: $text-color-accent;
			
				&:hover {
					border-color: $text-color-accent;
				}
			}

			&[disabled] {
				border-color: transparent !important;
				opacity: .5;
				cursor: not-allowed;
			}

		}

		&:not(.open) {
			padding: 0px;
		}
	}
}

/* Masonry on large screens */
@media (max-width: 1200px) {
	.page-cards {
		.list {
			.masonry {
				column-count: 3;
			}
		}
	}
}

/* Masonry on medium-sized screens */
@media (max-width: 1000px) {
	.page-cards {
		.list {
			.masonry {
				column-count: 2;
			}
		}
	}
}

/* Masonry on small screens */
@media (max-width: 480px) {
	.page-cards {
		.list {
			.masonry {
				column-count: 1;
			}
		}
	}
}

</style>


