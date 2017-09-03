<template>
	<nav class="navbar navbar-default">
	  <div class="container-fluid">
	
		    <div class="navbar-header">
		      <span class="navbar-brand" href="#">魔都近期房价涨幅</span>
		    </div>
	   
	      <form class="navbar-form navbar-left" onsubmit="return false">
		   		 <div class="form-group">
		          <input type="text" class="form-control" placeholder="请输入小区名开始找房" v-model="zoneName">
		       </div>
	         <button type="submit" class="btn btn-default" @click="submit">查询</button>
	      </form>
	     
			  <select id="areaChose" @change="changeMap()">
			  		<option>选择区域</option>
			 			<option v-for="(item,index) in areaPoint" v-bind:value="item.area">{{item.area}}</option>
			 	</select>
	 		
	    <div class="admin">
		    	<a href="#" @click="startRegister" v-if="!showModel">&nbsp;注册&nbsp;&nbsp;</a>
		    	<a href="#" @click="startLogin" v-if="!showModel">&nbsp;&nbsp;登录&nbsp;</a>
			    <a href="#" @click="loginout" v-if="showModel">&nbsp;注销&nbsp;&nbsp;</a>
			    <a href="#" v-if="showModel">&nbsp;&nbsp;欢迎&nbsp;{{adminAccount}}&nbsp;</a>
	  	</div>
	  	
	  </div>
	</nav>
</template>

<script>
import messageBus from './messageBus'

export default {
  name: 'Navbar',
  data () {
    return {
    	showModel : false,
      zoneName : '',
      adminAccount : '',
      areaPoint : [
									 {area:"宝山区"},
									 {area:"闵行区"},
									 {area:"浦东区"},
									 {area:"松江区"},
									 {area:"杨浦区"},
									 {area:"普陀区"},
									 {area:"嘉定区"},
									 {area:"徐汇区"},
									 {area:"闸北区"},
									 {area:"奉贤区"},
									 {area:"虹口区"},
									 {area:"金山区"},
									 {area:"青浦区"},
									 {area:"长宁区"},
									 {area:"静安区"},
									 {area:"崇明区"},
									 {area:"黄浦区"}
									]
    }
  },
  methods:{
  	//发送要查取得信息至Sidebar.vue
    submit:function(){
      messageBus.$emit('submitMsg',this.zoneName);
    },
    //登录入口
    startLogin : function(){
    	const self = this;
    	messageBus.$emit('login','true');
    	messageBus.$on('account',function(data){
    		const rsp = data.body;
    		if(rsp.code){
    			self.showModel = true;
    			self.adminAccount = rsp.account;
    		}else{
    			alert(rsp.msg);
    		}
    	})
    },
    //注册入口
    startRegister : function(){
    	messageBus.$emit('register','true');
    },
    //注销入口
    loginout : function(){
    	this.showModel = false;
    	this.$http.get('/logout',function(data){
    		console.log("注销");
    	})
    },
    //下拉框逻辑
    changeMap : function(){
    	var obj = document.getElementById('areaChose');
      var areaObj = obj.options[obj.selectedIndex].value;
      messageBus.$emit('areaObj',areaObj);		//将选择的区域告诉Housemap.vue
      this.$http.post('/areaZonesInfo',{			//给后台发送请求获取该区域所有信息
      	areaObj : areaObj
	      }).then((result)=>{
	      	messageBus.$emit('areaZones',result);	//将获取的信息发送至Sidebar.vue
	      })
    }
    
  }
}
</script>

<style scoped>
	nav{
		margin:0px;
		background: #2E8B57;
		font-family: cursive;
	}
	.container-fluid>.navbar-header{
		margin-right: 45px;
	} 
	.navbar-form{
    position: absolute;
    left: 25%;
    padding: 0px;
    width: 35%;
	}
	.form-group{
		width: 70%;
	}
	.form-group>input{
		width: 99%;
	}
	.btn{
		width: 15%;
	}
	select{
		position: absolute;
		top: 10px;
		left: 65%;
		padding: 6px 12px;
		width: 8%;
		height: 32px;
		border-radius: 4px;
		border: 1px solid rgb(204,204,204);
	}	
	.navbar-brand{
		font-size: 24px;	
		color: #fff;
	}
	.admin{
		float: right;
		margin-right: 20px;
		height: 50px;
	}
	.admin>a{
		margin:0px;
		color: #fff;
		font-size: 16px;
		line-height: 50px;
		text-decoration: none;
	}
</style>
