<template>
  <div class="col-md-3">
  	
  	<div class="sideHead">
  			<div class="sideTitle">
  				<div class="progress">
						  <div class="progress-bar" aria-valuenow=">30" @click="percentSearch(1)"  style="width: 20%;background: #DC143C;cursor: pointer;">
						    <span>>30%</span>
						  </div>
						  <div class="progress-bar" aria-valuenow="20-30" @click="percentSearch(2)"  style="width: 20%;background: #FF1493;cursor: pointer;">
						    <span>20%-30%</span>
						  </div>
						  <div class="progress-bar" aria-valuenow="10-20" @click="percentSearch(3)" style="width: 20%;background: #9400D3;cursor: pointer;">
						    <span>10%-20%</span>
						  </div>
						   <div class="progress-bar" aria-valuenow="0-10" @click="percentSearch(4)" style="width: 20%;background: #1E90FF;cursor: pointer;">
						    <span>0%-10%</span>
						  </div>
						   <div class="progress-bar" aria-valuenow="<0" @click="percentSearch(5)" style="width: 20%;background: #3CB371;cursor: pointer;">
						    <span>0%></span>
						  </div>
					</div>
  			</div>
  			<div class="sideChose">加入讨论组</div>
  	</div>
  	
    <ul>
	      <li v-for="(item,index) in priceList" :class="{'check':curIndex==index}" v-on:mouseover="curIndex=index" v-on:mouseout="curIndex=-1">
				     <p style="font-weight: bold;">小区名称：{{item.villageName}}</p>
				     <p>本月售价：{{item.priceNow}}/㎡ | 涨幅：{{item.priceRate}}%</p>
				     <p>小区地址：{{item.district.substring(0,item.district.indexOf('-'))}}区{{item.address}}</p>
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
		top: 150px;
		bottom: 0px;
	  list-style-type: none;
		width: inherit;
	  margin: 0px;
	  padding: 0px;
	  overflow-y: auto;
	}
	
	li {
	 	height: 90px;
	 	padding:10px 10px 10px 20px;
	 	border-bottom: 1px solid #F8E5BE; 
	}
	
	.check{
		background:#F7F7F7;
	}
	
	li>p{
		height:20px;
		line-height: 20px;
		margin-bottom: 5px;
	}
</style>
