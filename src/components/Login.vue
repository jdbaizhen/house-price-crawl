<template>
		
	<div id="login">	
	  <transition name="modal" @close="showModal = false" v-if="showModal">
	  	
	    <div class="modal-mask">
	      <div class="modal-wrapper">
	        <div class="modal-container">
			 <span  class="glyphicon glyphicon-remove close"  @click="showModal=false"></span>
			 
	          <div class="modal-header">
	            <slot name="header">
	             <h3 slot="header">登录</h3>
	            </slot>
	          </div>
	
	          <div class="modal-body">
	            <slot name="body">
			    	<div class="form-group">
			    		<input type="text" class="form-control" name="userAccount" placeholder="账号" v-model="account">
			    	</div>
			    	
			    	<div class="form-group">
			    		<input type="password" class="form-control" name="userPassword" placeholder="密码" v-model="pwd">
			    	</div>
			    	
			    	<input type="checkbox" id="savepassword">
			    	<label for="savepassword">记住密码</label>
			    	<a href="#" @click="register">注册</a>
			    	<button type="submit" class="btn btn-success" @click="submit">登&nbsp;&nbsp;&nbsp;&nbsp;录</button>	
	            </slot>
	         </div>
	         
	        </div>
	      </div>
	    </div>
	  </transition>
	</div>
</template>

<script>
import messageBus from './messageBus'
import md5 from 'md5'

// start app
export default {
  name: 'login',
  data () {
    return {
      showModal: false,
      account : '',
      pwd :''
    }
  },
  mounted(){
  	messageBus.$on('login',(data)=>{
  		this.showModal = data;
  	})
  },
  methods : {
  	register : function(){
  		this.showModal = false;
  		messageBus.$emit('register','true');
  	},
  	//后台登陆接口
  	submit : function(){
  		const pwd = md5(this.pwd);
  		this.$http.post('/loginNumber',{
  			userAccount : this.account,
  			userPassword : pwd
  		}).then((data)=>{
  			messageBus.$emit('account',data);
  			if(data.body.code){
  				this.showModal = false;
  				this.name = '';
  				this.pwd = '';
  			}else{
  				this.showModal = true;
  			}
  		})
  	}
  	
  }
}
</script>

<style>
	
.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, .5);
  display: table;
  transition: opacity .3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  position: relative;
  width: 300px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
  transition: all .3s ease;
  font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

a{
	margin-bottom: 10px;
	float: right;
}

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}
.btn{width: 210px;}
.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
.close{
	position: absolute;
	top: 15px;
	right: 15px;
}
label{font-weight: normal;}
	
</style>