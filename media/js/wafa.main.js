/*----------------------------------------------------------------------------|
                                                              _____           |
      Autor: Notsgnik                                       /||   /           |
      Email: Labruillere gmail.com                         / ||  /            |
      website: notsgnik.github.io                         /  || /             |
      License: GPL v3                                    /___||/              |
      																		  |
------------------------------------------------------------------------------*/


documentReady(function(){

	var nfx = Nfx("somediv");
	nfx.count = 0;
	nfx.myTimeStamp = 0;
	nfx.res = "360p";
	nfx._targetFps = 24;
	nfx.videoInBackground = false;
	nfx.animationsList = [];
	nfx.verbosity = 1;
	nfx.backgroundColor = "white";
	nfx.inited = false;
	
	nfx.calculatePropWindow = function(){
		var factors = [5,10,35,35] ;
		this.smallWindowsTop = [Math.floor((this._res[this.res][0] * factors[0])/100)
								,Math.floor((this._res[this.res][1] * factors[1])/100)] ;
		this.smallWindowsSize = [Math.floor((this._res[this.res][0] * factors[2])/100)
							    ,Math.floor((this._res[this.res][1] * factors[3])/100)];
	};
	
	nfx.doTheStuff = function(){
		for ( var attr_k in this._pressedKeys ){
			
			if(!this.animationsList[attr_k]){
				if(nfxMedias[this._pressedKeys[attr_k]]){
					if(nfxMedias[this._pressedKeys[attr_k]].action){
						this.debug('[ info ] creating action object : ' + this._pressedKeys[attr_k],-1);
						this.animationsList[attr_k] = NfxActionObject(this,attr_k);
					}
					else{
						this.debug('[ info ] creating media object : ' + this._pressedKeys[attr_k],-1);
						this.animationsList[attr_k] = NfxMediaObject(this,attr_k);
					}
				}
			}
		}
		var result = [];
		for (var attr_l in this.animationsList ){
			//this.animationsList[attr_l].animate();
			if(this.animationsList[attr_l].animate() && !this.animationsList[attr_l].garbage){
				result[attr_l] = this.animationsList[attr_l];
			}
			else{
				this.debug('[ info ] ... removing object ' + attr_l,1);
			}
		}
		this.animationsList = result;
		
		this.debug('[ info ] ... stuff done , garbage collecting',3);
		/*for ( var i in garbageCollector){
			this.debug('[ info ] ... garbage ' + garbageCollector[i],1);
			this.animationsList.splice(garbageCollector[i],1);
		}*/
		
	
	};
	
	nfx.init = function(){
		//this.mainElement.innerHTML = this.count;
		//this.debug('[ info ] edited init !');
		document.body.style.overflow = "hidden";
		document.body.style.backgroundColor = this.backgroundColor;
		//this.mainElement.style.overflow = "hidden";
		this.calculatePropWindow();
		this.mainElement.innerHTML = returnHtml()
		this.videoElem = document.getElementById('nfxVideoElement');
		this.canvasElem = document.getElementById('nfxCanvasElement');
		this.holderElem = document.getElementById('nfxHolderElement');
		if(!this.inited){
			this._getCams();
			this.inited = true;
		}
		return true;
	};
	
	nfx.returnHtml = function(){
	
		if(this.videoInBackground){
			var innerHTML =  '<video autoplay id="nfxVideoElement" style="z-index:1;width:100%;height:100%;margin:auto;overflow:hidden;opacity:0.5;filter:alpha(opacity=50);"></video>';
		}
		else{
			var innerHTML =  '<video autoplay id="nfxVideoElement" style="z-index:-20;margin:auto;position:absolute;top:0px;left:0px;right:0px;bottom:0px;"></video><img src="data:image/gif;base64,R0lGODlhCgAKAIAAAP///wAAACH5BAAAAAAALAAAAAAKAAoAAAIIhI+py+0PYysAOw==" id="nfxBackgroundElement" style="z-index:3;width:100%;height:100% !important;margin:auto;overflow:hidden;" />';
		}
		
		innerHTML = innerHTML + '<canvas id="nfxCanvasElement" style="width:'
		+this._res[this.res][0]
		+'px;height:'
		+this._res[this.res][1]
		+'px;background-color: #AAA;z-index:10;margin: auto;position: absolute;text-align: center;top: 0; left: 0; bottom: 0; right: 0;"></canvas>';

		innerHTML = innerHTML +  '<div id="nfxHolderElement" style="width:'
		+this._res[this.res][0]
		+'px;height:'
		+this._res[this.res][1]
		+'px;z-index:13;margin: auto;position: absolute;text-align: center;top: 0; left: 0; bottom: 0; right: 0;"></div>';
		
		return innerHTML;
	};
	
	
	nfx.videoHandler = function(){
		this.videoElem.src = "";
		window.setTimeout(function(){this.videoHandler_b()}, 100);
		return true;
		
	};
	nfx.videoHandler_b = function(){
		if(this._videoSrcs == []){
			this.mainElement.innerHTML = "the webcam is not supported";
			this.debug('[ error ] the webcam is not supported ');
			this.exit();
			return false;
		}
		this.videoElem.src = this._videoSrcs[this._currentCam];
		window.setTimeout(function(){this.videoHandler_c()}, 100);
		return true;
	};
	nfx.videoHandler_c = function(){
		this.videoWidth = parseInt(this._getElmStyleProp(this.videoElem, "width"));
		//this.debug('[ info ] ' + this.videoWidth, -1);
		this.videoHeight = parseInt(this._getElmStyleProp(this.videoElem, "height"));
		this.sHeight = this.videoHeight / 1.78 ;
		this.sy = Math.floor( this.sHeight / 2 ) ;
		this.sHeight = Math.floor(this.sHeight);
		this.context = this.canvasElem.getContext('2d');
		this.debug('[ info ] resuming run ...');
		this._noRun = false;
		this._videoAsked = false;
		if(this.run()){
			this.debug('[ info ] ... success');
			this.debug('[ info ] Running loop ...');
			this._interval = window.setTimeout(function(){this._loop()}, this._loopInterval);
			return true;
		}
		else{
			this.debug('[ error ] ... error durring run one ', 0 );
			this._exit();
			return false;
		}
	
	};
	
	nfx.run = function(){
		 if(this.videoElem.paused || this.videoElem.ended) this.videoElem.play() ;
		 this.context.globalAlpha = 1.0;
		 this.context.drawImage(this.videoElem,0,this.sy,this.videoWidth,this.sHeight,0,0,this.canvasElem.width,this.canvasElem.height);
		 this.doTheStuff();
		/*
		this.debug('[ info ] run !' + this._targetFps);
		var obj =  new Date();
		obj = obj.getTime();
		if(this.myTimeStamp == 0){
			this.myTimeStamp = obj;
			this.count = this.count + 1;
		}
		else{
			this.count = this.count + 1;
			obj = obj - this.myTimeStamp;
			if(obj > 1000){
				this.mainElement.innerHTML = this.count;
				this.myTimeStamp = 0;
				this.count = 0;
			}
		}
		*/
		
		if(this.isPressed('C') == true && this.isPressedUni('') == true){
			this.debug('[ info ] exiting!');
			return false;
		}
		this.debug('[ info ] runed !',3);
		return true;
	};
	nfx._start();


});
