<template>
	<div class="layout-picker" :class="{'open':pickerOpened, 'pos-left': position === 'right'}" v-loading.fullscreen.lock="loading">
		<div class="icon-box" @click="pickerOpened = !pickerOpened">		
			<i class="mdi mdi-cog"></i>
		</div>
		<div class="picker-box">
			<div class="close-btn" @click="pickerOpened = !pickerOpened">		
				<i class="mdi mdi-close"></i>
			</div>
		</div>
	</div>
</template>


<script>
export default {
	name: 'LayoutPicker',
	props: ['position'],
	data() {
		return {
			pickerOpened: false,
			loading: false
		}
	},
	computed: {
		navPos: {
			get() {
				return this.$store.getters.navPos
			},
			set(val) {
				this.$store.commit('setLayout', {navPos:val})
			}
		},
		toolbar: {
			get() {
				return this.$store.getters.toolbar
			},
			set(val) {
				this.$store.commit('setLayout', {toolbar:val})
			}
		},
		footer: {
			get() {
				return this.$store.getters.footer
			},
			set(val) {
				this.$store.commit('setLayout', {footer:val})
			}
		},
		boxed: {
			get() {
				return this.$store.getters.boxed
			},
			set(val) {
				this.$store.commit('setLayout', {boxed:val})
			}
		},
		roundedCorners: {
			get() {
				return this.$store.getters.roundedCorners
			},
			set(val) {
				this.$store.commit('setLayout', {roundedCorners:val})
			}
		},
		viewAnimation: {
			get() {
				return this.$store.getters.viewAnimation
			},
			set(val) {
				this.$store.commit('setLayout', {viewAnimation:val})
			}
		}
	},	
	methods: {
	}
}
</script>

<style lang="scss">
@import '../assets/scss/_variables';
@import '../assets/scss/_mixins';

.layout-picker {
	width: 60px;
	height: 60px;
	background: lighten($background-color, 20%);
	position: fixed;
	right: -35px;
	top: 50%;
	transform: translateX(-5px) translateY(-50%);
	border-radius: 50%;
	box-shadow: 0px 4px 20px 0px rgba(0, 0, 0, 0.08), 0px 2px 7px 0px rgba(0, 0, 0, 0.02);
	transition: all .5s;
	overflow: hidden;
	z-index: 2000;

	.icon-box {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 60px;
		line-height: 60px;
		text-align: center;
		font-size: 40px;
		opacity: .3;
		cursor: pointer;
		transform: translateX(0px) translateY(-50%);
		transition: all .5s;

		i::before {
			animation: spin 5s infinite linear;
		}
	}

	.picker-box {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		bottom: 0;
		width: 100%;
		height: 100%;
		opacity: 0;
		padding: 15px 30px;
		box-sizing: border-box;
		transform: translateX(-100%) translateY(-50%);
		transition: all .2s ease-in-out .0s;

		.close-btn {
			cursor: pointer;
			text-align: right;
			font-size: 20px;
			float: right;
			position: relative;
			top: -6px;
			right: -16px;
		}

		.selector-box {
			width: 100%;
			margin: 10px 0;

			& > .label {
				width: 100%;
				display: block;
			}
		}

		.theme-box {
			display: block;
			height: 30px;
			width: 40px;
			float: left;
			border-radius: 5px;
			overflow: hidden;
			margin-right: 5px;
			box-sizing: border-box;
			border: 1px solid rgba(0, 0, 0, 0.2);

			.color {
				display: block;
				width: 33.3333%;
				float: left;
				height: 100%;
			}

			&:hover {
				border: 2px solid white;
			}
		}
	}

	&.open {
		width: 255px;
		height: 460px;
		right: -35px !important;
		border-radius: 6px;
		transform: translateX(-42px) translateY(-50%);

		.icon-box {
			transform: translateX(100%) translateY(-50%);
			opacity: 0;
		}
		.picker-box {
			transform: translateX(0%) translateY(-50%);
			opacity: 1;
			transition: all .5s ease-in-out .2s;
		}
	}

	&:hover {
		right: 0;
	}

	&.pos-left {
		right: initial;
		left: 0px;
		transform: translateX(5px) translateY(-50%);

		&.open {
			transform: translateX(15px) translateY(-50%);
		}
	}

}

@keyframes spin {
	0% {
		-webkit-transform: rotate(0deg);
		transform: rotate(0deg)
	}

	100% {
		-webkit-transform: rotate(359deg);
		transform: rotate(359deg)
	}
}

@media (max-width: 768px) {
	.layout-picker {
		display: none;
	}
}
</style>
