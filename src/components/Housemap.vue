<template>
	
 	<div class="col-md-9">
 		<div ref="container" class="houseMap"></div>
 	</div> 
 	
</template>

<script>
import messageBus from './messageBus'

export default {
  name: 'Map',
  data () {
    return {
     areaPoint : [
					 {area:"宝山区",x:121.487639,y:31.41195},
					 {area:"闵行区",x:121.387604,y:31.118592},
					 {area:"浦东区",x:121.54973,y:31.227597},
					 {area:"松江区",x:121.234676,y:31.040406},
					 {area:"杨浦区",x:121.531908,y:31.266374},
					 {area:"普陀区",x:121.403989,y:31.256002},
					 {area:"嘉定区",x:121.270321,y:31.380386},
					 {area:"徐汇区",x:121.443011,y:31.195045},
					 {area:"闸北区",x:121.461239,y:31.28946},
					 {area:"奉贤区",x:121.47959,y:30.926475},
					 {area:"虹口区",x:121.510636,y:31.270571},
					 {area:"金山区",x:121.349659,y:30.748865},
					 {area:"青浦区",x:121.133491,y:31.156177},
					 {area:"长宁区",x:121.429573,y:31.227844},
					 {area:"静安区",x:121.453072,y:31.234082},
					 {area:"崇明区",x:121.403414,y:31.628657},
					 {area:"黄浦区",x:121.491304,y:31.238281}
				 ]
    }
  },
  
  mounted(){	
  	const self = this;
  	//初始化地图
  	global.initilize = function(){
  		self.initMap();
  	}
  	//jsonp跨域处理
  	if(global.BMap !== 'undefined'){
  		const mapscript = document.createElement('script');
  		mapscript.src = "http://api.map.baidu.com/api?v=2.0&ak=6h5Hz6Weys6ogOwuag9rtGPOdUiIujsy&callback=initilize";
  		document.body.appendChild(mapscript);
  	}
  },
  
  methods : {
  		//初始化函数
		initMap :function(){
			var map = new BMap.Map(this.$refs.container);          				// 创建地图实例  
			var top_left_control = new BMap.ScaleControl({anchor: BMAP_ANCHOR_TOP_LEFT});// 左上角，添加比例尺
			var top_left_navigation = new BMap.NavigationControl();  //左上角，添加默认缩放平移控件
			var _this = this;
			
			//添加控件和比例尺
			function add_control(){
				map.addControl(top_left_control);        
				map.addControl(top_left_navigation);     
			}
			add_control();
			
			map.enableScrollWheelZoom(true);							//控制地图缩放
			map.addControl(new BMap.MapTypeControl());   				//添加地图类型控件
			map.centerAndZoom("上海", 12);//通过设置城市来访问地图  
			
			//地图根据区域跳转
		  	messageBus.$on('areaObj',(data)=>{
		  		_this.areaPoint.forEach(function(value,index){		
		  			if(data==value.area){
		  				map.centerAndZoom(new BMap.Point(value.x, value.y), 14);
		  			}
		  		})
		  	})		
			
			//监听地图变化
			map.addEventListener('tilesloaded',function(){		
					var zoom = map.getZoom();
					if(zoom>11 && zoom<15){
						map.clearOverlays();
						
						_this.$http.get('/areaPrice').then((req) => {
							for(let i=0;i<_this.areaPoint.length;i++){
								let point = new BMap.Point(_this.areaPoint[i].x, _this.areaPoint[i].y);
	
								let opts = {
									position : point,    // 指定文本标注所在的地理位置
									offset   : new BMap.Size(-25,-20)    //设置文本偏移量
								}
								
								let label = new BMap.Label(_this.areaPoint[i].area+'</br>'+req.body[i].avgPrice+'/㎡', opts);  // 创建文本标注对象
								label.setStyle({
									  boxSizing:"border-box",
						              color: "#fff",
						              background: "rgba(0,128,0,.6)",
						              fontSize: "12px",
						              height: "100px",
						              width:"100px",
						              maxWidth: "100px",
						              borderRadius: "50%",
						              paddingTop:"25px",
						              paddingLeft:"5px",
						              border: "1px solid transparent",
						              lineHeight: "20px",
						              overflow: "hidden",
						              textAlign: "center",
						              fontFamily: "微软雅黑"	,
						              cursor: 'pointer'
								});
								
								map.addOverlay(label); 
								
								(function(i){
									let point = new BMap.Point(_this.areaPoint[i].x, _this.areaPoint[i].y);
									label.addEventListener('click',function(){
										map.centerAndZoom(point,15);
									})
								})(i);							
							}						
						})
					}else if(zoom>14){
						map.clearOverlays();
						var bs = map.getBounds();   							//获取可视区域
						var bssw = bs.getSouthWest();   						//可视区域左下角
						var bsne = bs.getNorthEast();  							//可视区域右上角
						_this.$http.post('/searchZone',
							{
								bssw_lng : bssw.lng,
								bssw_lat : bssw.lat,
								bsne_lng : bsne.lng,
								bsne_lat : bsne.lat
							}).then((data)=>{
								
								messageBus.$emit('MapZones',data);			//给侧边栏发送地图内小区信息
								data.body.forEach(function(value,index){
									// 复杂的自定义覆盖物
								    function ComplexCustomOverlay(point, text, mouseoverText){
								      this._point = point;
								      this._text = text;
								      this._overText = mouseoverText;
								    }
								    
								    ComplexCustomOverlay.prototype = new BMap.Overlay();
								    ComplexCustomOverlay.prototype.initialize = function(map){
									      this._map = map;
									      var div = this._div = document.createElement("div");
									      div.style.position = "absolute";
									      div.style.zIndex = BMap.Overlay.getZIndex(this._point.lat);
									      const rate = value.priceRate;
									    	if(rate>30){
									    		div.style.background = '#DC143C';	
									    	}else if(rate>20&&rate<30){
									    		div.style.background = '#FF1493';	
									    	}else if(10<rate&&rate<20){
									    		div.style.background = '#9400D3';
									    	}else if(0<rate&&rate<10){
									    		div.style.background = '#1E90FF	';
									    	}else{
									    		div.style.background = '#3CB371';
									    	}
									      div.style.border = "1px solid #000";
									      div.style.color = "white";
									      div.style.padding = "2px";
									      div.style.lineHeight = "20px";
									      div.style.borderRadius = "5px";
									      div.style.whiteSpace = "nowrap";
									      div.style.MozUserSelect = "none";
									      div.style.fontSize = "12px"
									      var span = this._span = document.createElement("span");
									      div.appendChild(span);
									      span.appendChild(document.createTextNode(this._text));      
									      var that = this;
									
									      var arrow = this._arrow = document.createElement("div");
									      
									      arrow.style.position = "absolute";
									      arrow.style.width = "11px";
									      arrow.style.height = "10px";
									      arrow.style.top = "22px";
									      arrow.style.left = "10px";
									      arrow.style.overflow = "hidden";
									      div.appendChild(arrow);
					  
									      div.onmouseover = function(){  
									       	this.style.cursor = "pointer";
									       	this.style.zIndex = 999;
									       	arrow.style.backgroundPosition = "0px -20px";
									      }
									
									      div.onmouseout = function(){
									        this.style.zIndex = 99;
									        arrow.style.backgroundPosition = "0px 0px";
									      }
									      
									      map.getPanes().labelPane.appendChild(div);
									      return div;
								    }
								    
								    ComplexCustomOverlay.prototype.draw = function(){
								      let map = this._map;
								      let pixel = map.pointToOverlayPixel(this._point);
								      this._div.style.left = pixel.x - parseInt(this._arrow.style.left) + "px";
								      this._div.style.top = pixel.y - 30 + "px";
								     }
								    
								    let point = new BMap.Point(value.villageX,value.villageY);
								    let myCompOverlay = new ComplexCustomOverlay(point,value.villageName+'|'+value.priceRate+'%');
									map.addOverlay(myCompOverlay);
							})
						})
					}
					else{
						map.clearOverlays();
					}
			})	
		}
	}		
}
</script>

<style scoped>
.col-md-9{
	position: fixed;
	top: 52px;
	right: 0px;
	bottom: 0px;	
	margin: 0px;
	padding: 0px;
}
.houseMap{
	height: 100%;
}
</style>
