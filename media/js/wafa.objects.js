/*----------------------------------------------------------------------------|
                                                              _____           |
      Autor: Notsgnik                                       /||   /           |
      Email: Labruillere gmail.com                         / ||  /            |
      website: notsgnik.github.io                         /  || /             |
      License: GPL v3                                    /___||/              |
      																		  |
------------------------------------------------------------------------------*/

var _colorTable = {
	"red" : "#FF0000",
	"black" : "#000000",
	"white" : "#FFFFFF"
};
var _fontTable = {
	"Arial" : true,
	"Calibri" : true
};

var _defaultMedia = {
	"font" 		: "Arial",
	"image" 	: false,
	"video" 	: false,
	"audio" 	: false,
	"text"  	: false,
	"font-size" : 15,
	"color"     : ["hidden","white"],
	"effect"    : false ,
	"fullScreen": false
};
var NfxActionObject = function(nfx,key){

	this.nfx = nfx;
	
	this.step = "zero";
	this.satus = 0 ;
	this.associatedKey = key;
	this.timeStamp = new Date().getTime();
	this.garbage = false;
	this.timeBeforeGarbage = 0.5;
	this.turnBeforeGarbage = this.nfx._targetFps * this.timeBeforeGarbage;
	this.turnCount = 0;
	
	this.mtekEntry = notsfxMerge(_defaultMedia, nfxMedias[nfxCharMap[key]]);
	this.action = this.mtekEntry.action ;
	
	this.animate = function(){
		if(!this._pressedKeys[this.associatedKey]){
			this.garbage = true;
			return false;
		}
		this.turnCount = this.turnCount + 1;
		if(this.turnCount >= this.turnBeforeGarbage){
				this.garbage = true;
				return false;
		}
		if(this.action == "NEXTCAM"){
			if(this.turnCount == 1){
				this.nfx._currentCam = this.nfx._currentCam + 1;
				if( this.nfx._currentCam == this.nfx._camCount){
					this.nfx._currentCam = 0;
				}
				this.nfx.debug('[ info ]  getting cam ' + this.nfx._currentCam +" / " + this.nfx._camCount,-1);
				this.nfx.videoElem.src = this._videoSrcs[this._currentCam];
				//this.nfx.init();
				//window.setTimeout(function(){this.videoHandler_b()}, 100);
			}
			return true;
		}
		return true;
	};
	
	return this;
};
var NfxMediaObject = function(nfx,key){
	
	this.nfx = nfx;
	
	this.step = "zero";
	this.animationSatus = 0 ;
	this.associatedKey = key;
	this.garbage = false;
	this.timeStamp = new Date().getTime();// + "_" + Math.floor((Math.random() * 99999) + 1);
	this.video = false;
	this.audio = false;
	this.image = false;
	this.text = false;
	this.div = false;
	this.media = false;
	
	this.mtekEntry = notsfxMerge(_defaultMedia, nfxMedias[nfxCharMap[key]]);

	if(this.mtekEntry.fullScreen){
		this.windowSize = this.nfx._res[this.nfx.res] ;
		this.windowPos = [0, 0];
	}
	else{
		this.windowSize = this.nfx.smallWindowsSize ;
		this.windowPos = this.nfx.smallWindowsTop;
	}
	if(this.mtekEntry.video){
		this.media = document.createElement('video');
		this.media.setAttribute('id',this.timeStamp);
		this.media.src = "media/video/" + encodeURIComponent(this.mtekEntry.video);
		this.video = true;
	}
	else{
		if(this.mtekEntry.audio){
			this.audio = document.createElement('audio');
			this.audio.setAttribute('id',this.timeStamp);
			this.audio.src = "media/audio/" + encodeURIComponent(this.mtekEntry.audio);
		}
		if(this.mtekEntry.image){
			this.media = new Image();
			this.media.id = this.timeStamp+'_img';
			this.media.src = "media/image/" + encodeURIComponent(this.mtekEntry.image);
			this.image = true;
		}
	}
	if(this.mtekEntry.text){
		if(mtekEntry["font-size"] > 100){
			mtekEntry["font-size"] = 100;
		}
		if(mtekEntry["font-size"] < 0){
			mtekEntry["font-size"] = 1;
		}
		this.textSize =  Math.floor((this.windowSize[1] * mtekEntry["font-size"]) / 100);
		this.textPos = this.mtekEntry.fullScreen 
							? [ 0, Math.floor((this.windowSize[1] - this.textSize)/2) ] 
							: [ this.windowPos[0], Math.floor((this.windowSize[1] - this.textSize)/2) + this.windowPos[1] ] ;
		this.nfx.debug('[ info ]  window pos tx,ty w/h text : '+ this.textPos + ' ' + this.windowSize[0] + '/' + this.windowSize[1] + '  ' + this.textSize , 2);
		this.textElem  = document.createElement('div');
		this.textElem.id = this.timeStamp + "_txt";
		this.nfx.holderElem.appendChild(this.textElem);
		this.text = true;
	}
	if(this.text == true && this.media == false && this.mtekEntry.color[0] != "hidden"){
		this.media = document.createElement('div');
		this.media.id = this.timeStamp+"_div";
		this.div = true;
	}
	if(this.video == true || this.image == true || this.div == true){
		this.nfx.holderElem.appendChild(this.media);
		if(this.image == true){
			this.image = this.media;
			this.media = false;
		}
	}
	if(this.audio){
		this.media = this.audio ;
		this.nfx.holderElem.appendChild(this.audio);
		this.audio = true ;
	}
	
	
	this.handleImagery = function(){
		if(this.image || this.div || this.video ){
			this.nfx.holderElem.style.opacity = this.animationSatus;
			this.nfx.holderElem.style.filter  = 'alpha(opacity='+this.animationSatus*100+')'; // give some love to IE
		}
	};
	
	this.handleSteps = function(){
		this.nfx.debug('[ info ] animation step / status : ' + this.step + ' ' + this.animationSatus, 2);
		if(this.step == "one" 
		&& this.animationSatus < 1 ){
			this.nfx.context.globalAlpha = this.animationSatus;
			if(this.media){
				this.media.volume = this.animationSatus;
				if(this.media.ended || this.media.paused ){ this.media.play();}
			}
			this.handleImagery();
			this.animationSatus = this.animationSatus + 0.1;
		}
		else if(this.step == "one" 
		&& this.animationSatus > 0.9){
			this.animationSatus = 1;
			this.nfx.context.globalAlpha = this.animationSatus;
			if(this.media){
				this.media.volume = this.animationSatus;
				if(this.media.ended || this.media.paused ){ this.media.play();}
			}
			this.step == "idle";
			this.handleImagery();
		}
		else if(this.step == "idle"){
			this.animationSatus = 1;
			this.nfx.context.globalAlpha = this.animationSatus;
			if(this.media){
				this.media.volume = this.animationSatus;
				if(this.media.ended || this.media.paused ){ this.media.play();}
			}
			this.handleImagery();
		}
		else if(this.step == "decay"
		&& this.animationSatus > 0.1){
			if(this.animationSatus > 1){
				this.animationSatus = 1;
			}
			this.nfx.context.globalAlpha = this.animationSatus;
			if(this.media){
				this.media.volume = this.animationSatus;
				if(this.media.ended || this.media.paused ){ this.media.play();}
			}
			this.handleImagery();
			this.animationSatus = this.animationSatus - 0.1;
		}
		else{
			this.nfx.debug('[ info ] animation done : step / status / text, video, image : ' + this.step + ' ' + this.animationSatus + ' ( ' + this.textElem+', '
			+this.video+', '+this.image+' )', 2);
			if(this.text){
				this.nfx.debug("[ info ] removing text child",1);
				this.textElem.remove();
				
			}
			if(this.video || this.audio){
				this.media.pause();
				this.media.src = "";
				this.media.remove();
			}
			if(this.image){
				this.image.remove();
				this.image = false;
			}
			if(this.div){
				document.getElementById(this.timeStamp + "_div" ).remove();
			}
			this.nfx.debug("[ info ] removing media child",1);
			this.garbage = true;
			return false;
		}
		return true;
		
	};
	
	this.animate = function(){
		if(this.step == "zero"){
			this.handleImagery();
			this.step = "almost";
			return true;
		}
		else if(this.step == "almost"){
			if(this.audio || this.video){
				this.media = document.getElementById(this.timeStamp);
			}
			var tmp = false;
			if(this.image){
				tmp = document.getElementById(this.timeStamp + "_img" );
			}
			else if(this.div){
				tmp = document.getElementById(this.timeStamp + "_div" );
			}
			else if (this.video){
				tmp = this.media;
			}
			if(this.text){
				this.textElem = document.getElementById(this.timeStamp+'_txt');
				this.textElem.style.zIndex = 2 ;
				this.textElem.style.color = _colorTable[this.mtekEntry.color[1]] ? _colorTable[this.mtekEntry.color[1]] :  "#000000";
				this.textElem.style.fontFamily =  _fontTable[this.mtekEntry.font] ? _fontTable[this.mtekEntry.font] :  "Arial";
				this.textElem.innerHTML = this.mtekEntry.text;
			}
			this.nfx.debug('[ info ] div var / color : ' + this.div +' / ' + this.mtekEntry.color , 2);
			if(this.mtekEntry.color[0] != "hidden" ){
				tmp.style.backgroundColor =  _colorTable[this.mtekEntry.color[0]] ? _colorTable[this.mtekEntry.color[0]] :  "#FFFFFF";
			}
			if(tmp){
				tmp.width = this.windowSize[0]+"px";
				tmp.height = this.windowSize[1]+"px";
				tmp.style.width = this.windowSize[0]+"px";
				tmp.style.height = this.windowSize[1]+"px";
				tmp.style.top = this.windowPos[1] +"px";
				tmp.style.left = this.windowPos[0] +"px";
				tmp.style.position = "absolute";		
				tmp.style.zIndex = 1;
			}
			if(this.text == true){
					//this.nfx.debug('some value : ' +  this.textSize,2);
					this.textElem.style.position = "absolute";
					this.textElem.style.fontSize = this.textSize + "px " ;
					this.textElem.style.top = this.textPos[1]+"px";
					this.textElem.style.left = this.textPos[0]+"px";
					this.textElem.width = this.windowSize[0]+"px";
					this.textElem.height =this.textSize+"px";
					this.textElem.style.width = this.windowSize[0]+"px";
					this.textElem.style.height = this.textSize+"px";
					this.textElem.style.zIndex =12;
			}
			if(this.audio || this.video){
				this.media.volume = 0;
				this.media.play();
			}
			this.step = "one";
			return true;
		}else{
			if(!this._pressedKeys[this.associatedKey]){
				this.nfx.debug('[ info ]  key not pressed anymore :\'(',1);
				this.step = "decay";
			}
			else{
				if(this.step == "decay"){
					if(this.animationSatus > 1){
						this.animationSatus = 1;
					}
					if(this.animationSatus < 0){
						this.animationSatus = 0;
					}
					this.step = "one";
				}
			}
			return this.handleSteps();
		
		}
	};
	return this;
};
