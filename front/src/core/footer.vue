<template>
	<div class="footer flex align-center justify-space-between" :class="{'above':position === 'above'}">
		<div><a href="javascript:;" class="font-weight-bold text-gray-90">mido.mn</a></div>
		<div>
			<!-- <span><a href="javascript:;">{{new Date().getFullYear()}}</a></span> -->
			© Бүх эрх хуулиар хамгаалагдсан
		</div>
	</div>
</template>
xz
<script>
export default {
	name: 'Footer',
	props: ['position']
}
</script>

<style lang="scss" scoped>
@import '../assets/scss/_variables';
@import '../assets/scss/_mixins';

.footer {
	width: 100%;
	height: 40px;
	padding: 0 20px;
	box-sizing: border-box;
	background: white;
	margin-top: 2px;
	font-size: 14px;
	border-top-left-radius: 20px;

	&.above {
		box-shadow: 0px 0px 10px 0px rgba(0, 0, 0, 0.08);
		z-index: 1;
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		border-radius: 0;
	}

	a {
		font-weight: bold;
		text-decoration: none;
		color: $text-color-accent;
	}

	.buy-btn {
		margin-left: 10px;
	}
}

@media (max-width: 768px) {
	.footer {
		padding: 0 12px;
		border-radius: 0;
	}
}
</style>
