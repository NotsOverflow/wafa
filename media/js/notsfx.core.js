/*----------------------------------------------------------------------------|
                                                              _____           |
      Autor: Notsgnik                                       /||   /           |
      Email: Labruillere gmail.com                         / ||  /            |
      website: notsgnik.github.io                         /  || /             |
      License: GPL v3                                    /___||/              |
      																		  |
------------------------------------------------------------------------------*/

var Nfx = function(element_name){
	
	this.verbosity = 0 ;
	
	this.debug = function(string, level){
		level = level || 1;		
		if( this.verbosity >= level ){
			console.log('log: ' + string);
		}	
	};
	
	this.mainElement = document.getElementById(element_name) ;
	
	if(!this.mainElement){
		nfx.debug("[ error ] Given element '" + main_element_id + "' not found",0);
		return undefined;
	}
	if(typeof this.mainElement != 'object'){
		this.debug('[ error ] HTML element needed to use Nfx !', 0);
		return undefined;
	}
	
	
	this.videoHandler = function(){
		this.debug('[ info ] function videoHandler is not set and it look like it\'s needed ...',1);
	};
	this.init = function(){
		
	};
	this.run  = function(){
		this.debug('[ error ] Nothing to do ( you should probably overide .run() )...', 0);
		return false;
	};
	this.tweekUp = function(){
		this.debug('[ info ] function tweekUp is not set and it look like it\'s needed ...',1);
	};
	this.tweekDown = function(){
		this.debug('[ info ] function tweekDown is not set and it look like it\'s needed ...',1);
	};
	this.exit = function(){
		this.debug('[ info ] exiting ...', 0);
		this._exit();
	};
	
	this._pressedKeys = {};
	this._keyUpOrder = {};
	this._keyDownOrder = {};
	this._tweekedDown = false;
	this._tweekCount = 0;
	this._beforTweek = 2000;
	this._targetFps = 60;
	this._loopInterval = 10;
	this._timeStamp = 0;
	this._deltaTime = 33;
	this._interval = undefined;
	this._window = window;
	this._videoSrcs = [];
	this._videoAsked = false;
	this._noRun = false;
	this._audioSource = [];
	this._videoSource = [];
	this._currentCam = 0;
	this._currentMic = 0;
	this._camCount = 0;
	this._camAudio = true;
	this._handleVideoCount = 0;
	this._micCount = 0;
	this._cameraLoaded = false;
	this._cameraTimeout = 30000;
	window.streams = [];
	
	
	this._windowListenerD = this._window.addEventListener('keydown',function(e) { this._keydown(e);}.bind(this),false);
    this._windowListenerU = this._window.addEventListener('keyup',function(e) { this._keyup(e);}.bind(this),false);
    
    this._res = {"1080p" : ["1920","1080"],"720p":["1280","720"],"480p":["854","480"], '17"' : ["1280","720"], "360p" : ["640", "360"]};
	
	this.isPressed = function(key){
		for (var attr in this._pressedKeys) {  
			
            if(this._pressedKeys[attr] == key){
            	this.debug('[ info ] ... key found ' + key, 3);
            	return true;
            }
        } 
        this.debug('[ info ] ... key not found ' + key, 3);
        return false;
	};
	this.isPressedUni = function(key){
		for (var attr in this._pressedKeys) {  
            if(attr == key){
            	return true;
            }
        } 
	};
	this._keydown = function(e){
		var unikey = String(e.keyCode? e.keyCode : e.charCode);
		this._keyDownOrder[unikey] = nfxCharMap[unikey] ;
	};
	this._keyup = function(e){
		var unikey = e.keyCode? e.keyCode : e.charCode;
		this._keyUpOrder[unikey] = nfxCharMap[unikey];
	};
	this._keyTaker = function(){
		for ( var attr in this._keyDownOrder){
			if(!this._pressedKeys[attr]){
				this._pressedKeys[attr] = this._keyDownOrder[attr];
				this.debug('[ info ] ... keydown unikey / sk : ' + attr +' / ' + this._keyDownOrder[attr] , 1);
			}
		}
		var tmp = [];
		for(var attr_k in this._pressedKeys){
			var notFound = true;
			for ( var attr_u in this._keyUpOrder){
				if(attr_k == attr_u){
					notFound = false;
					this.debug('[ info ] ... keyup unikey / sk : ' + attr_u +' / ' + this._keyUpOrder[attr_u] , 1);
				}
			}
			if(notFound){
				tmp[attr_k] = this._pressedKeys[attr_k];
			}
		}
		this._pressedKeys = tmp ;
		this._keyDownOrder = [];
		this._keyUpOrder = [];
	};
	
	this._sleep = function(milliseconds) {
  		var start = new Date().getTime();
  		for (var i = 0; i < 1e7; i++) {
    		if ((new Date().getTime() - start) > milliseconds){
      			break;
    		}
  		}
	};
	this._start = function(){
		// do stuff then run this.init()
		this._recalculateDeltaTime();
		this._setTimeStamp();
		MediaStreamTrack.getSources(this._getDeviceList);
		//done runing this.init()
		
		window.setTimeout(function(){this._runInit();}, 10);
		return true;
	};
	this._runInit = function(){
		this.debug('[ info ] Runing init ...',1);
		if(!this.init()){
			this.debug('[ error ] ... error durring init ', 1 );
			this._exit();
			return false;
		}
		this.debug('[ info ] ... success', 1);
		window.setTimeout(function(){this._runOne();}, 10);
	};
	this._runOne = function(){
		//done doing init doing this.run()
		if(!this._noRun){
			this.debug('[ info ] first run ...');
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
		}
		this.debug('[ info ] first run cancelled ...');
	};
	
	this._loop = function(){
		if(this._noRun){
			window.clearTimeout(this._interval);
		}
		else{
			this.debug('[ info ] inside loop ',3);
			if( this._getDeltaTime() >= this._deltaTime ){
				this._keyTaker();
				this._setTimeStamp();
				if(!this.run()){
					this.exit();
					return true;
				}
				if(this._getDeltaTime >= this._deltaTime){
					this.debug('[ info ] Your computer is to slow !');
					this.tweekDown();
					this._tweekedDown = true;
				}
				else{
					if(this._tweekedDown == false && this._tweekCount > this._beforTweek){
						this.tweekUp();
						this._tweekCount = 0;
					}
					else{
						this._tweekCount = this._tweekCount + 1;
					}
				}
				this.debug('[ info ] ... today ?',3);
				this._interval = window.setTimeout(function(){this._loop()}, 0);
			}
			else{
				this.debug('[ info ] ... not today',3);
				this._interval = window.setTimeout(function(){this._loop()}, this._loopInterval);
			}
		}
	};
	
	this._setTimeStamp = function(){
		this._timeStamp = new Date().getTime();
	};
	
	this._getDeltaTime = function(){
		return ( new Date().getTime() - this._timeStamp );
	};
	
	this._recalculateDeltaTime = function(){
		this._deltaTime = Math.floor( 1000 / this._targetFps );
	};
	
	this._getCams = function(){
		if(this._videoAsked == true){return true;}
		this._camTimeoutInterval = window.setTimeout(function(){this._cameraTimeoutFunction()}, this._cameraTimeout);
		if (navigator.getUserMedia) {
			for(var i in  this._videoSource){
				navigator.getUserMedia({
												audio: this._camAudio,
												video: {
													optional: [{ sourceId : this._videoSource[i][0]}]
												}
											},
											this._handleVideo,
											this._videoError
										   );
		
			}
    	}
    	else{
    		this._videoSrc = [];
    	}
    	this._videoAsked = true;
    	this._noRun = true;
	};
	this._cameraTimeoutFunction = function(){
		if(this._cameraLoaded == false){
			this.debug('[ error ] ... camera timeout reached ...' ,0);
			this.exit();
			this._exit();
		}
	};
	this._getDeviceList = function(sourceInfos) {
		for (var i = 0; i != sourceInfos.length; ++i) {
			var sourceInfo = sourceInfos[i];
			if (sourceInfo.kind === 'audio') {
				this.debug('[ info ] audio device : id / label | ' +sourceInfo.id +' / ' + (sourceInfo.label || 'microphone'),1);
				this._audioSource.push([sourceInfo.id,(sourceInfo.label || 'microphone')]);
				this._micCount = this._micCount + 1;
			} else if (sourceInfo.kind === 'video') {
				this.debug('[ info ] video device : id / label | ' + sourceInfo.id +' / ' + (sourceInfo.label || 'camera'),1);
				this._videoSource.push([sourceInfo.id,(sourceInfo.label || 'camera')]);
				this._camCount = this._camCount + 1;
			} else {
				this.debug('[ info ] other kind of device : ' +sourceInfo, 0);
			}
		}
		this.debug('[ info ] device arrays : audio / video | ' + this._audioSource +' / ' + this._videoSource,2);
	};
	this._handleVideo = function(stream){
		this._handleVideoCount = this._handleVideoCount + 1;
		window.streams.push(stream) ;
		this._videoSrcs.push(window.URL.createObjectURL(stream));
		if(this._handleVideoCount == this._camCount){
			this.debug('[ info ] ... all camera allowed succesfully' ,1);
			this._cameraLoaded = true;
			window.clearTimeout(this._camTimeoutInterval);
			this.videoHandler();
		}
		
	};
	this._videoError = function(e){
		this.debug("[ error ] Can't access webcam -> " + e.name, 0 );
		this._videoSrc = false;
	};
	
	this._getElmStyleProp = function(el,styleProp)
	{
		if (el.currentStyle)
		    return el.currentStyle[styleProp];

		return document.defaultView.getComputedStyle(el,null)[styleProp];
	};
	
	this._exit = function(){
		this.debug('[ info ] Final Exiting ...', 1);
		window.clearTimeout(this._interval);
		// this = {}; // Not today ! ;)
		return true;
	};
	
	return this;

};

function snfx(main_element_id){
	var nfx = Nfx(main_element_id);
	nfx.debug("[ info ] Element found, execute _start() to run ...",1);
	nfx._start();
	return nfx;
}

navigator.getUserMedia = (navigator.getUserMedia || 
                          navigator.webkitGetUserMedia || 
                          navigator.mozGetUserMedia || 
                          navigator.msGetUserMedia);

function documentReady(someFunction){
	if(window.attachEvent) {
		window.attachEvent('onload', someFunction);
	} else {
		if(window.onload) {
		    var curronload = window.onload;
		    var newonload = function() {
		        curronload();
		        someFunction();
		    };
		    window.onload = someFunction;
		} else {
		    window.onload = someFunction;
		}
	}

}



function notsfxMerge(obj1,obj2){
    var obj3 = {};
    for (var attrname in obj1) { 
        obj3[attrname] = obj1[attrname];
    }
    for (var attrname in obj2) { 
        obj3[attrname] = obj2[attrname];
    }
    return obj3;
}

Element.prototype.remove = function() {
    this.parentElement.removeChild(this);
}
NodeList.prototype.remove = HTMLCollection.prototype.remove = function() {
    for(var i = 0, len = this.length; i < len; i++) {
        if(this[i] && this[i].parentElement) {
            this[i].parentElement.removeChild(this[i]);
        }
    }
}