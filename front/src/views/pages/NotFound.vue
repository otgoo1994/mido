<template>
	<div class="not-found">
		<div class="msg-box">
			<h1 class="animated fadeInDown">404 Not Found</h1>
			<h2 class="animated fadeInUp">
				Oops!<br>Уучлаарай. Таны хайсан хуудас олдсонгүй.
			</h2>
			<router-link to="/products" class="btn-go-home"><strong>BACK</strong></router-link>
		</div>
	</div>
</template>

<script>
export default {
	name: 'NotFound'
}
</script>

<style lang="scss" scoped>
@import '../../assets/scss/_variables';
@import '../../assets/scss/_mixins';

.msg-box {
	max-width: 500px;
	margin: 50px auto;

	h1 {
		@include text-bordered-shadow();
	}
}
.btn-go-home{
    position: relative;
    z-index: 200;
    // margin: 15px auto;
    width: 120px;
    padding: 12px 17px;
    border: 1px solid #FFCB39;
    border-radius: 100px;
    font-weight: 700;
    display: block;
    color: #FFCB39;
    text-align: center;
    text-decoration: none;
    letter-spacing : 2px;
    font-size: 14px;
    
    -webkit-transition: all 0.3s ease-in;
    -moz-transition: all 0.3s ease-in;
    -ms-transition: all 0.3s ease-in;
    -o-transition: all 0.3s ease-in;
    transition: all 0.3s ease-in;
}

.btn-go-home:hover{
    background-color: #FFCB39;
    color: #fff;
    transform: scale(1.05);
    box-shadow: 0px 20px 20px rgba(0,0,0,0.1);
}
</style>

