var mongoose = require('mongoose');
var md5 = require('md5');
var SALT = 10;
var UserSchema = new mongoose.Schema({
	account : {
		type : Object
	},
	password : String,
	meta: {
        createdAt: {
          type: Date,
          default: Date.now()
        },
        updatedAt: {
          type: Date,
          default: Date.now()
        }
     }
})


UserSchema.pre('save', function (next) {
    var user = this;
    if (this.isNew) {
      this.meta.createdAt = this.meta.updatedAt = Date.now();
    } else {
      this.meta.updatedAt = Date.now();
    }

    var classified = user.account + md5(user.password) + SALT;
    user.password = md5(classified);
    
    next()
  });
  
// 实例方法
UserSchema.methods = {
  comparePassword: function (account,pwd,callback){
    var _pwd = md5(account + md5(pwd) + SALT);
    
    if(_pwd === this.password){
      var isMatch = true;
    }else{
      var isMatch = false;
    }

    callback(null,isMatch);
    
  }
}

// 静态方法
  UserSchema.statics = {
    fetch: function (callback) {
      return this.find({}).sort('meta.updatedAt').exec(callback);
    },
  
    findById: function (id, callback) {
      return this.findOne({_id: id}).exec(callback);
    }
  };

module.exports = UserSchema;