let express = require('express');
let router = express.Router();
let mongoose = require("mongoose");
let Zone = require("../models/zone");
let ZonePrice = require("../models/zoneprice");
let Area = require("../models/area");
let User = require("../models/user");
let request = require('request-promise');
let cheerio = require('cheerio');
const Url = "http://esf.fangdd.com/shanghai/xiaoqu_";
const areaUrlArr = ['s988','s977','s994','s993','s984','s986','s987','s978','s985','s990','s982','s992','s989','s979','s980','s991','s983'];
const areaName = ['宝山','闵行','浦东','松江','杨浦','普陀','嘉定','徐汇','闸北','奉贤','虹口','金山','青浦','长宁','静安','崇明','黄浦'];

mongoose.Promise = global.Promise;  
mongoose.connect('mongodb://localhost:27017/fddPrice');

router.get('/', function(req, res, next) {
	var _user = req.session.user;
	if(_user){
		app.locals.user = _user;
	}
  res.render('index', { title: 'Express' });
});

//清空所有数据库
router.get('/delZoneInfo',async function(req,res){
	await Zone.remove({});
	await ZonePrice.remove({});
	await Area.remove({});
	res.json("delete success");
})
//爬取所需数据
router.get('/getVillageInfo',async function(req,res){
	//爬取前先对数据库进行清空
	await Zone.remove({});
	await ZonePrice.remove({});
	await Area.remove({});
	res.json("success");
	//遍历所有区域
	for(let i=0;i<areaUrlArr.length;i++){
		const now = new Date();
		console.log(now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+"  开始爬取 "+areaName[i]+"区");
		const areaPageUrl = Url+areaUrlArr[i]+"_ocost-desc";
		const areaPageInfo = await request(areaPageUrl);
		//const pages = villagePages(areaPageInfo);	
		var areaPriceArr = [];
		//遍历每个区域的每一页
		for(let j=1;j<=3;j++){
			const now = new Date();
			console.log(now.getHours()+":"+now.getMinutes()+":"+now.getSeconds()+"  开始爬取第"+j+"页...");
			const zonePageUrl = Url+areaUrlArr[i]+"_ocost-desc_pa"+j;
			const response = await request(zonePageUrl);
			const zones = everyVillageUrl(response);
			//遍历每张页面内的所有小区
			for(let k=0;k<zones.length;k++){	
					//包头，防止被屏蔽
					let options = {
						url : zones[k],
						timeout :2000,
						headers : {
							'User-Agent':'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3159.5 Safari/537.36'
						}
					}
					try{
					const zoneRep = await request(options);								
					const zoneInfo = zonesInfo(zoneRep);
					const zone = new Zone({
						district : zoneInfo.district,
						villageName : zoneInfo.villageName,
						villageKey : zoneInfo.villageKey,
						address : zoneInfo.address,
						villageX : zoneInfo.villageX,
						villageY : zoneInfo.villageY
					});
					const zoneSave = await zone.save();
					const priceMonthUrl = 'http://esf.fangdd.com/data/cell/price_history_trend?type=4&id='+zoneInfo.villageKey;
					const priceRep = await request({url:priceMonthUrl,timeout:2000});						
					const priceArr = getMonthPrice(priceRep);
					//遍历每个小区每个月的信息
					for(let i=0;i<priceArr.length;i++){
						const zoneprice = new ZonePrice({
							zone : zoneSave._id,
							time : priceArr[i].time,
							listedPrice : priceArr[i].listedPrice,
							currentPrice : priceArr[i].currentPrice,
							district : zoneInfo.district
						})
						const zonepriceSave = zoneprice.save();
					}
					
					let febPrice = priceArr[0].listedPrice;
					let julyPrice = priceArr[priceArr.length-1].listedPrice;
					areaPriceArr.push(julyPrice);
					
					if(febPrice!=0&&julyPrice!=0){
						const priceRate = ((julyPrice-febPrice)/febPrice*100).toFixed(3);
						await Zone.update({_id:zoneSave._id},{priceRate:priceRate,priceNow:julyPrice});
					}else{
						await Zone.update({_id:zoneSave._id},{priceRate:"暂无数据",priceNow:julyPrice});
					}	
					}catch(e){
						console.log(e.messgae);
					}
			}
			const nowTime =new Date();
			console.log(nowTime.getHours()+":"+nowTime.getMinutes()+":"+nowTime.getSeconds()+"  第"+j+"页爬取结束");
		}
		
		let sum=0;
		for(let t=0;t<areaPriceArr.length;t++){
			sum = sum + Number(areaPriceArr[t]);
		}
		let avgPrice = Math.round(sum/areaPriceArr.length);
		const area = new Area({
			district : areaName[i],
			avgPrice : avgPrice
		})
		const areaSave = area.save();
		
		const nowDate =new Date();
		console.log(nowDate.getHours()+":"+nowDate.getMinutes()+":"+nowDate.getSeconds()+"  "+areaName[i]+"区爬取结束"+'\n');
	}
})

//获取区域均价
router.get('/areaPrice', async function(req,res){
	let data = await Area.find('avgPrice');
	res.json(data);
})


//获取前台传来的坐标，并在后台查找出对应的数据
router.post('/searchZone',async function(req,res){
	let bssw_lng = req.body.bssw_lng,
			bssw_lat = req.body.bssw_lat,
			bsne_lng = req.body.bsne_lng,
			bsne_lat = req.body.bsne_lat;
	let result = await Zone
						.where('villageX').gte(bssw_lng).lte(bsne_lng)
						.where('villageY').gte(bssw_lat).lte(bsne_lat);
	res.json(result);				
})

//获取50个小区数据
router.get('/getZones',async function(req,res){
	Zone.find({}).limit(50).exec(function(err,data){
		res.json(data);
	})
})

//查找小区
router.post('/findZones',async function(req,res){
	const result = await Zone.find({villageName:new RegExp(req.body.zoneName)});
	if(result != undefined){
		res.json(result);	
	}else{
		res.json('Not found');
	}
})

//获取某个区域的所有小区
router.post('/areaZonesInfo',async function(req,res){
	const areaObj = req.body.areaObj;
	const area = areaObj.substring(0,areaObj.indexOf('区'));
	const result = await Zone.find({district:new RegExp(area)});
	res.json(result);
})

//根据百分比检索数据
router.post('/percentSearch',async function(req,res){
	const percent = req.body.num;
	if(percent==1){
		await Zone
				  .where('priceRate').gte(30)
				  .sort({'priceRate':-1})
				  .exec(function(data){
				  	console.log(data);
				  	res.json(data);
				  })
	}else if(percent==2){
		await Zone
				  .where('priceRate').gte(20).lte(30)
				  .exec(function(data){
				  	console.log(data);
				  	res.json(data);
				  })
	}else if(percent==3){
		await Zone
				  .where('priceRate').gte(10).lte(20)
				  .exec(function(data){
				  	console.log(data);
				  	res.json(data);
				  })
	}else if(percent==4){
		await Zone
				  .where('priceRate').gte(0).lte(10)
				  .exec(function(data){
				  	console.log(data);
				  	res.json(data);
				  })
	}else{
		await Zone
				  .where('priceRate').gte(0)
				 
				  .exec(function(data){
				  	console.log(data);
				  	res.json(data);
				  })
	}
})


//获取每个区小区的分页数
function villagePages(html){
	if(html){
		let $ = cheerio.load(html);
		const pageElem = $('.contain>.clearfix>.cell--result>.list-title>h4>span').text();
		let pages;
		if((pageElem/15)<100){
			pages = Math.ceil(pageElem/20);
		}else{
			pages = 100;
		}
		return pages;
	}
}

//获取每个小区的url
function everyVillageUrl(html){
	if(html){
		let $ = cheerio.load(html);
		let villageElem = $('.main>.cell--result>.cell--result--list>.cell--item');
		let villageInfo = [];
		villageElem.each(function(index,value){
			let elem = $(value);
			let villageUrl = elem.find('a').attr('href');
			villageInfo.push(villageUrl);
		})
		return villageInfo;
	}
}

//获取小区的所有信息
function zonesInfo(html){
	if(html){
		let $ = cheerio.load(html);
		let basicElem = $('.cell--detail--container>.main__cell__info>.right__cell__info>.cell__info--title');
		let villageName = basicElem.find('.cell__name').text();
		if(villageName.indexOf('(')!=-1){
			villageName = villageName.substring(0,villageName.indexOf('('));
		}
		let district = $(basicElem.find('a')[0]).text()+"--"+$(basicElem.find('a')[1]).text();
		let address = $(basicElem.find('span')[2]).text();
//		let subwayElem = $('div>.cell--detail--container>.left-right-content>.left-side>.nearby__metro>.content>.station_item');
//		console.log(subwayElem.length);
//		let subway = subwayElem.find('.station_name').text()+"："+$(subwayElem.find('.subway_line>.line_no>a>span')[0]).text()+"号线"+$(subwayElem.find('.subway_line>.line_no>a>span')[1]).text();
		let scriptText = $($('script')[11]).html().trim();
		let villageKey = scriptText.substring(scriptText.indexOf("g_cell_id")+13,scriptText.indexOf("g_cell_name")-9);
		let position = scriptText.substring(scriptText.indexOf('g_cell_geo')+14,scriptText.indexOf('g_cell_price')-9);
		let posiArr = position.split(',');
		let villageY = posiArr[0],
				villageX = posiArr[1];
		
		let zoneObj = {
			district : district,
			villageName : villageName,
			villageKey : villageKey,
			address : address,
			villageX : villageX,
			villageY : villageY
		}
		return zoneObj;
	}
}

//获取每个小区一年来每个月的房价
function getMonthPrice(html){
	let $ = cheerio.load(html);
	let htmlText = $.html();
	let text = htmlText.replace(/&quot;/g,'"');
	let text2 = text.replace(/\\u6708/g,'月');
	let obj = text2.substring(text2.lastIndexOf("detail")+9,text2.lastIndexOf("name")-3);	//挂牌价
	let objArr = obj.split("},{");
	let obj2 = text2.substring(text2.indexOf("detail")+9,text2.indexOf("name")-3);				//成交均价
	let objArr2 = obj2.split("},{");
	var priceArr = [];
	for(let i=0;i<objArr.length;i++){
		let time = objArr[i].substring(objArr[i].indexOf("time_str")+11,objArr[i].indexOf("ancient_index")-3);
		let listedPrice = objArr[i].substring(objArr[i].indexOf("number")+8,objArr[i].indexOf("time_str")-2);	
		let currentPrice = objArr2[i].substring(objArr2[i].indexOf("number")+8,objArr2[i].indexOf("time_str")-2);
		let priceObj = {
			time :time,
			listedPrice : listedPrice,
			currentPrice : currentPrice
		}
		priceArr.push(priceObj);
	}
	return priceArr;
}



//注册账户
router.post('/registerNumber',async function(req,res){
	let userAccount = req.body.userAccount;
	let userPassword = req.body.userPassword;
	const hadUser = await User.find({account :　userAccount});
	if(hadUser.length>0){
		res.json({
			code : 0,
			msg :　'该账号已被注册'
		});
		return;
	}else{
		const user = new User({
			account : userAccount,
			password : userPassword
		});
		user.save();
		res.json({
			code : 1,
			msg : '注册成功'
		})
	}
})

//登录
router.post('/loginNumber',function(req,res){
	let userAccount = req.body.userAccount;
	let userPassword = req.body.userPassword;	
	User.findOne({account : userAccount},function(err,data){
		if(!data){
			res.json({
				code : 0,
				msg : '当前帐号未注册'
			})
			return;
		}
		else{
			data.comparePassword(userAccount,userPassword,function(err,isMatched){
				if(isMatched){
					req.session.user = userAccount;
					res.json({
						account : data.account,
						code : 1,
						msg :　'登录成功'
					})	
				}else{
					res.json({
						code :0,
						msg : '密码错误'
					})
				}
			})	
			}
	})
})	

//注销
router.get('/logout',function(req,res){
	delete req.session.user;
	res.json({
		code : 1,
		msg : '注销成功'
	})
})


module.exports = router;
