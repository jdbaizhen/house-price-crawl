<template>
  <div class="col-md-3">	
    <ul>
	      <li v-for="(item,index) in priceList" :class="{'check':curIndex==index}" v-on:mouseover="curIndex=index" v-on:mouseout="curIndex=-1">
						<div class="li-left">
							<img :src="item.villageImage" alt="">
						</div>
						<div class="li-right">
							<p style="font-weight: bold;">小区名称：{{item.villageName}}</p>
				    	 <p>本月售价：{{item.priceNow}}/㎡</p>
				    	 <p>小区地址：{{item.district.substring(0,item.district.indexOf('-'))}}区{{item.address}}</p>
						</div> 
	      </li> 
    </ul>  
  </div>
</template>

<script>
import messageBus from './messageBus'

export default {
  name: 'sidebar',
  data () {
    return {
      priceList : [],
      curIndex : '-1'
    }
  },
  mounted(){
 
  	messageBus.$on('areaZones',(data)=>{
  		this.priceList = data.body;
  	})
  	
  	messageBus.$on('submitMsg',(data)=>{
  		this.$http.post('/findZones',{zoneName:data}).then((data)=>{
  			this.priceList = data.body;
  		})
  	});
  	
  	messageBus.$on('MapZones',(data)=>{
  		this.priceList = data.body;
  	})
  	
  	this.$nextTick(function(){
			this.createView();
		})
  },
	methods : {
		
		createView :function(){
			this.$http.get('/getZones').then((response) => {   
           this.priceList =  response.body;  
      })
		},
		
		percentSearch : function(n){
			this.$http.post('/percentSearch',{
				num : n
			}).then((data)=>{
				console.log(data+'|'+data.body);
				this.priceList = data.body;
			})
		}
		
	}
}
</script>

<style scoped>
	.col-md-3{
		padding: 0px;
	}
	.sideHead{
		height: 100px;
	}
	.sideTitle{
		padding-top: 20px;
		padding-right: 20px;
		height: 60px;
		font-size: 12px;
		padding-left: 20px;
	}
	.sideChose{
		height: 38px;
		border-top: 1px solid #F8E5BE;
		padding-left: 20px;
		border-bottom: 1px solid #F8E5BE;
		line-height: 36px;
	}
	ul {
		position: fixed;
		top: 52px;
		bottom: 0px;
	  list-style-type: none;
		width: inherit;
	  margin: 0px;
	  padding: 0px;
	  overflow-y: auto;
	}
	
	li {
		display: flex;
		flex-direction: row;
	 	height: 90px;
	 	padding:10px 10px 10px 20px;
	 	border-bottom: 1px solid #F8E5BE; 
	}
	
	.li-left{
		flex: 1;
	}
	.li-left img{
		width: 100%;
		height: 100%;
	}
	.li-right{
		margin-left: 15px;
		display: flex;
		flex: 3;
		flex-direction: column;
	}

	.check{
		background:#F7F7F7;
	}
	
	.li-right p{
		height:20px;
		line-height: 20px;
		margin-bottom: 3px;
		white-space: nowrap;
  	overflow: hidden;
  	text-overflow: ellipsis;
	}
</style>
