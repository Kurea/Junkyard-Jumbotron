// ======================================================================
// Viewport class
/*$(document).ready(function(){
//document.getElementById('crop').appendChild(media);
//});*/
var media;
function videotr(){
media = document.createElement('video');
media.preload = true;
//media.controls = true;
media.className = 'c1';
media.id = 'it'; 
document.getElementById('crop').appendChild(media);
//media.loop = true;
//media.autoplay = true;


return media;

}
function Viewport(options) {
    options = options || {};

    // Position
    this.x = options.x || 0;
    this.y = options.y || 0;

    // Size
    this.width  = options.width  || 1;
    this.height = options.height || 1;

    // Rotation: 0=up 1=90deg 2=180deg 3=270deg
    this.rotation = options.rotation || 0;

    this.fitMode = options.fitMode || 'stretch';
}

Viewport.prototype = {

    translate: function translate(x, y) {
	this.x += x;
	this.y += y;
    },

    scale: function scale(x, y, ox, oy) {
	this.x = (this.x - ox) * x + ox;
	this.y = (this.y - oy) * y + oy;
	this.width *= x;
	this.height *= y;
    },

    string: function string() {
	return ('' + this.x + ',' + this.y +
		' ' + this.width + 'x' + this.height +
		' (' + this.rotation + ' - ' / this.fitMode + ')');
    },

    equals: function equals(other) {
	return (this.x == other.x && this.y == other.y &&
		this.width == other.width && this.height == other.height &&
		this.rotation == other.rotation && this.fitMode == other.fitMode);
    },

    isSideways: function isSideways() {
	return this.rotation == 1 || this.rotation == 3;
    }
};

// ======================================================================
// Display class

function Display() {
    Client.call(this);

    // Cache for speed
    this.imgElem = $('#it');
    this.cropElem = $('#crop');

    this.mode = 'idle';	// idle|dragging|scaling|loading

    this.image = new videotr();
    this.image.onload  = bind(this, this.onImageLoad);
    this.image.onerror = bind(this, this.onImageError);
    this.viewport = new Viewport();
    this.frozen = false; // Can we pan and zoom?
    
    this.firstMouseX = 0;
    this.firstMouseY = 0;
    this.lastTranslateX = 0;
    this.lastTranslateY = 0;
    this.lastScaleX = 1;
    this.lastScaleY = 1;

    this.viewportMsgScheduled = null;

    this.initDom();
    this.initSocket();

    if (this.doDebug)
	this.startPinging();
}

Display.prototype = new Client();
$.extend(Display.prototype, {

    initDom: function initDom() {
	// This ony works on IE, Firefox and Chrome, not Safari (or Android?)
	window.onerror = bind(this, this.handleError);
	$(window)
	    .resize   (bind(this, this.handleResize));
	$(document)
	    .keyup    (bind(this, this.handleKeyup))
	    .mousedown(bind(this, this.handleMousedown))
	    .mousemove(bind(this, this.handleMousemove))
	    .mouseup  (bind(this, this.handleMouseup));
	document.ontouchstart	= bind(this, this.handleTouchstart);
	document.ontouchmove	= bind(this, this.handleTouchmove);
	document.ontouchend	= bind(this, this.handleTouchend);
	document.ongesturestart = bind(this, this.handleGesturestart);
	document.ongesturechange= bind(this, this.handleGesturechange);
	document.ongestureend	= bind(this, this.handleGestureend);
    },

    getJumbotronName: function getJumbotronName() {
	var url = window.location.pathname;
	return url.substring(url.lastIndexOf('/')+1);
    },

    // ----------------------------------------------------------------------
    // Transforms

    transformImg: function transformImg() {
	var img = this.image;

//scales height on ppi of client.

  //  if(this.image.videoHeight){
  // img.height = this.image.videoHeight;
  // img.width = this.image.videoWidth;
    //}
	if (!document.getElementById('placeholder')){// || !img.width || !img.height){
    return;	   
    }
	// Cache for speed
	var round = Math.round;
	var vp = this.viewport;

	// Get doc size, swap if sideways
	var docWidth, docHeight;
	if (vp.isSideways()) {
	    docWidth  = $(window).height();
	    docHeight = $(window).width();
	}
	else {
	    docWidth  = $(window).width();
	    docHeight = $(window).height();
	}

	// if fitMode = stretch calculate both
  // if fitMode = vertical scaleX = scaleY
  // if fitMode = horizontal scaleY = sclaeX
	// Amount the image needs to be scaled
	var scaleX = docWidth  / vp.width;
	var scaleY = docHeight / vp.height;

  if (vp.fitMode == 'vertical')
    scaleX = scaleY;
  if (vp.fitMode == 'horizontal')
    scaleY = scaleX;

	// Final image size
	//var imgWidth  = round(img.width  * scaleX);
	//var imgHeight = round(img.height * scaleY);

	// Margins to push the image into place
	var marginX = round(-vp.x * scaleX);
	var marginY = round(-vp.y * scaleY);

	// Handle crop and rotation (on the 'crop' div)
	// TODO/SPEED? do this only if rotation has changed.
	var transformStr = ['rotate(0deg) translate(0%, 0%)',
			    'rotate(90deg) translate(0%, -100%)',
			    'rotate(180deg) translate(-100%, -100%)',
			    'rotate(270deg) translate(-100%, 0%)'][vp.rotation];
	this.cropElem.css({width : docWidth + 'px',
			   height: docHeight + 'px',
               'transform' : transformStr,
			   '-webkit-transform'	: transformStr,
			   '-moz-transform'	: transformStr,
			   '-o-transform'	: transformStr
			  });
	// IE: filter: "progid:DXImageTransform.Microsoft.Matrix
	//	(M11=1, M12=-1, M21=1, M22=1, DX=?, DY=?)"

	// Set size and position. Using a css 'background' rather than
	// an <img> element guarantees the xform and image change
	// happen simultaneously. Otherwise when a new image arrives
	// it occasionally is displayed with the old xform. Another
	// solution might be to create an entirely new <img> element
	// when a new image arrives and swap it in for the old one.
    
    if (this.image.src.indexOf('markers') != -1){
    var scaleString = 'scale(1, 1)';
    }
    else{
    var scaleString = 'scale('+scaleX+', '+scaleY+')'
    }
    
	//var bgPosStr  = marginX  + 'px ' + marginY   + 'px';
	//var bgSizeStr = imgWidth + 'px ' + imgHeight + 'px';


    $('#it').css({
	'position'                 : 'absolute',
	'margin-left'              : marginX +'px',
        'margin-top'               : marginY+'px',
        'transform'                : scaleString,
        '-webkit-transform'        : scaleString,
        '-moz-transform'           : scaleString,
        '-o-transform'	           : scaleString,
        '-transform-origin'        : 'top left', 
        '-webkit-transform-origin' : 'top left', 
        '-moz--transform-origin'   : 'top left', 
        '-o-transform-origin'      : 'top left', 
			 });

	/*this.imgElem.css({ 'width'  : imgWidth  + 'px',
			   'height' : imgHeight + 'px',
			   'background-image'		: 'url(' + img.src + ')',
			   'background-position'	: bgPosStr,
			   'background-size'		: bgSizeStr,
			   '-webkit-background-size'	: bgSizeStr,
			   '-moz-background-size'	: bgSizeStr,
			   '-o-background-size'		: bgSizeStr
			 });


	console.log({ docWidth : docWidth + 'px',
		      docHeight : docHeight + 'px',
		      //imgWidth : img.width,
		      //imgHeight : img.height,
		      scaleX: scaleX,
		      scaleY: scaleY,
		      vp: vp,
		      'background-image'   : 'url(' + img.src + ')',
		      'background-position': marginX + 'px ' + marginY + 'px',
		      //'background-size'    : imgWidth + 'px ' + imgHeight + 'px'
		    });
*/
    },
    
    translateViewport: function translateViewport(x, y) {

	// For consistency with how scaling is done, store last values,
	// invert, and retranslate.
	var vp = this.viewport;

	// Get viewport size, swap if sideways
	var vpWidth = vp.width;
	var vpHeight = vp.height;
	if (vp.isSideways()) {
	    vpWidth = vp.height;
	    vpHeight = vp.width;
	}

	// Convert from window pixels to viewport pixels
	x *= vpWidth  / $(window).width();
	y *= vpHeight / $(window).height();

	// Calculate delta, flipping if rotated
	var deltaX = x - this.lastTranslateX;
	var deltaY = y - this.lastTranslateY;
	var delta = [[ deltaX,  deltaY],
		     [ deltaY, -deltaX],
		     [-deltaX, -deltaY],
		     [-deltaY,  deltaX]][vp.rotation];

	// Translate and schedule a message to the server
	vp.translate(delta[0], delta[1]);
	this.transformImg();
	this.scheduleViewportMsg();

	// Save for next time
	this.lastTranslateX = x;
	this.lastTranslateY = y;
    },

    // Scaling should occur relative to first mouse-down event (dragging back to
    // the first point should reset the scale). We store how much we scaled last
    // time, invert it, and scale what we want.
    scaleViewport: function scaleViewport(x, y, ox, oy) {

	var vp = this.viewport;

	// Convert origin from window pixels to viewport pixels
	ox = ox * vp.width  / $(window).width () + vp.x;
	oy = oy * vp.height / $(window).height() + vp.y;

	// Don't let scale get really small
	x = Math.max(x, 0.1);
	y = Math.max(y, 0.1);

	// Calculate delta
	var deltaX = x / this.lastScaleX;
	var deltaY = y / this.lastScaleY;

	// Scale and schedule a message to the server
	vp.scale(deltaX, deltaY, ox, oy);
	this.transformImg();
	this.scheduleViewportMsg();

	// Save for next time
	this.lastScaleX = x;
	this.lastScaleY = y;
    },

    // ----------------------------------------------------------------------
    // Misc DOM manipulations

    setLabel: function setLabel(options) {
	$('#id'  ).text(isUndefined(options.id  ) ? '?' : options.id );
	$('#name').text(isUndefined(options.name) ? '?' : options.name);
    },

    showLabel: function showLabel(onOrOff) {
	$('#label').css({ display: (onOrOff ? 'block' : 'none') });
    },

    isShowingLabel: function isShowingLabel() {
	return $('#label').css('display') != 'none';
    },

    // ----------------------------------------------------------------------
    // Window events

    handleResize: function handleResize() {
	// Update css, update image transform, and notify the server
	//$('#finalcrop').css({'width' : '100%',//$(window).width() + 'px',
			//     'height': '100%'});//$(window).height() + 'px'}); 
	this.transformImg();
	this.sendSizeMsg();
    },

    handleError: function handleError(msg, url, line) {
	try {
	    url = url.replace(/^.*(\\|\/|\:)/, ''); // path -> filename
	    this.error(msg + ' (' +  url + ":" + line + ')');
	}
	catch (err) {
	    console.log("[And that threw another error] " + err);
	}
	return true;
    },

    // ----------------------------------------------------------------------
    // Key events

    handleKeyup: function handleKeyup(event) {
	switch (event.which) {
	  case 68: // d(ebug)
	    this.doDebug = ! this.doDebug;
	    break;
	  case 73: // i(nfo))
	    this.showLabel(! this.isShowingLabel());
	    break;
	  default:
	    break;
	}
    },

    // ----------------------------------------------------------------------
    // Mouse events

    handleMousedown: function handleMousedown(event) {
	event.preventDefault();
	if (this.frozen)
	    return;

	this.firstMouseX = event.pageX;
	this.firstMouseY = event.pageY;
	this.mode = event.shiftKey ? 'scaling' : 'dragging';
	if (event.shiftKey) {
	    this.mode = 'scaling';
	    this.lastScaleX = 1;
	    this.lastScaleY = 1;
	}
	else {
	    this.mode = 'dragging';
	    this.lastTranslateX = 0;
	    this.lastTranslateY = 0;
	}
    },

    handleMousemove: function handleMousemove(event) {
	var deltaX = event.pageX - this.firstMouseX;
	var deltaY = event.pageY - this.firstMouseY;
	if (this.mode == 'scaling') {
	    // Normalize mouse movements so they're in the range (-1,1)
	    // and allow only uniform scales.
	    var wsize = Math.max($(window).width(), $(window).height());
	    var scale = 1.0 + (deltaY - deltaX) / wsize;
	    this.scaleViewport(scale, scale, this.firstMouseX, this.firstMouseY);
	}
	else if (this.mode == 'dragging') {
	    this.translateViewport(-deltaX, -deltaY);
	}
    },

    handleMouseup: function handleMouseup(event) {
	event.preventDefault();
	if (this.mode == 'scaling' || this.mode == 'dragging')
	    this.mode = 'idle';
    },

    // ----------------------------------------------------------------------
    // Touch events

    handleTouchstart: function handleTouchstart(event) {
	event.preventDefault();
	if (this.frozen)
	    return;

	var touch = event.changedTouches[0];
	this.firstMouseX = touch.pageX;
	this.firstMouseY = touch.pageY;

	// Only deal with one finger
	if (event.changedTouches.length == 1) {
	    this.mode = 'dragging';
	    this.lastTranslateX = 0;
	    this.lastTranslateY = 0;
	}
    },

    handleTouchmove: function handleTouchmove(event) {
	if (this.mode == 'dragging') {
	    event.preventDefault();
	    var touch = event.changedTouches[0];
	    var deltaX = touch.pageX - this.firstMouseX;
	    var deltaY = touch.pageY - this.firstMouseY;
	    this.translateViewport(-deltaX, -deltaY);
	}
    },

    handleTouchend: function handleTouchend(event) {
    media.play();
	event.preventDefault();
	if (this.mode == 'scaling' || this.mode == 'dragging')
	    this.mode = 'idle';
    },

    // ----------------------------------------------------------------------
    // Gesture events

    handleGesturestart: function handleGesturestart(event) {
	event.preventDefault();
	if (this.frozen)
	    return;

	this.mode = 'scaling';
	this.lastScaleX = 1;
	this.lastScaleY = 1;
    },

    handleGesturechange: function handleGesturechange(event) {
	event.preventDefault();
	this.scaleViewport(1.0 / event.scale, 1.0 / event.scale,
			    this.firstMouseX, this.firstMouseY);
    },

    handleGestureend: function handleGestureend(event) {
	event.preventDefault();
	this.scaleViewport(1.0 / event.scale, 1.0 / event.scale,
			    this.firstMouseX, this.firstMouseY);
	if (this.mode == 'scaling' || this.mode == 'dragging')
	    this.mode = 'idle';
    },

    // ----------------------------------------------------------------------
    // Communication 

    sendInitMsg: function sendInitMsg() {
	var id = $.cookie('jjid');
	var name = this.getJumbotronName();
	var docWidth  = $(window).width();
	var docHeight = $(window).height();
	this.sendMsg('connect', { jjid: id, jjname: name, type: 'display',
				  width: docWidth, height: docHeight });
    },

    sendViewportMsg: function sendViewportMsg() {
	this.viewportMsgScheduled = null;
	var vp = this.viewport;
	this.sendMsg('vp', {
	    x: vp.x, y: vp.y, width: vp.width, height: vp.height });
    },

    scheduleViewportMsg: function scheduleViewportMsg() {
	// Avoid overloading the server by restricting msgs/sec
	if (! this.viewportMsgScheduled)
	    this.viewportMsgScheduled = setTimeout(
		bind(this, this.sendViewportMsg), 100);
    },
    
    sendSizeMsg: function sendSizeMsg() {
	var docWidth  = $(window).width();
	var docHeight = $(window).height();
	this.sendMsg('size', {width: docWidth, height: docHeight});
    },

    onImageLoad: function onImageLoad() {
	this.transformImg();
	this.mode = 'idle';
    },

    onImageError: function onImageError() {

	this.error("Can't load image", this.image.src);
	this.mode = 'idle';

    },

    msgHandlers : {

	load: function load(args) {
	    var image = this.image;
	    if (this.image.src != args.src) {
		    this.mode = 'loading';
		    this.frozen = args.frozen;
		    this.viewport = new Viewport(args.vp);
            var oktypes = {'.jpg':1, '.gif':1, '.png':1};
            var type = args.src.slice(args.src.lastIndexOf('.'));
            if (type.toLowerCase() in oktypes){
                this.image = new Image();
                this.image.id = 'it';
                this.image.className = 'c1';
                this.image.src = args.src;  
                this.image.loop = true;
                //this.image.height = args.vp.height;
               // this.image.width = args.vp.width;
                var div = document.getElementById('crop');
                $(div).empty();
                div.appendChild(this.image);
                var trickery = document.createElement('div');
                trickery.id = 'placeholder';
                div.appendChild(trickery);//checks that src exists
            }
         /*   else if (fake.canPlayType(lib[ext])){
                console.log(navigator.userAgent);//fake.canPlayType(lib[ext]));
                var div = document.getElementById('crop');
                $(div).empty();
                this.image = new videotr();
        	    this.image.src = args.src;
            }*/
            else{
                var blankPath = 'http://' + window.location.hostname + ':' + window.location.port + '/' + args.src.slice(0, args.src.lastIndexOf('.'));
                var div = document.getElementById('crop');
                console.log(blankPath);
                $(div).empty();
                this.image = new videotr();
                    //this.image.height = args.vp.height;
                    //this.image.width = args.vp.width;
                    this.image.controls = 'controls';
                    this.image.autobuffer = true;
                    this.image.preload = true;
                    this.image.className ='tt';
                    var s = document.createElement('source');
                    s.src = blankPath+'.ogv';
                    s.type = 'video/ogg; codecs="theora, vorbis"';
                   var s2 = document.createElement('source');
                    s2.src = blankPath+'.mp4';
                    s2.id = 'placeholder';
                    //s2.type='video/mp4';
                   // console.log(s2);
                    this.image.appendChild(s2);
                    this.image.appendChild(s);   

                    var trickery = document.createElement('div');
                trickery.id = 'placeholder';
                div.appendChild(trickery);//checks that src exists                 
            }
            
        }
        this.onImageLoad();
        this.mode = 'idle';
	//	if (this.image.complete || this.image.readyState === 4){
	//	    this.onImageLoad();
	//    }
	 //   else{
	//	// Pass to viewport message handler
	//	    this.msgHandlers.viewport.call(this, args.viewport);
	//    }

	},

	vp: function vp(args) {
	    // Ignore changes while interacting or loading an image
	    if (! this.viewport.equals(args) &&
		(this.mode == 'idle' || this.mode == 'loading') && 
		! this.viewportMsgScheduled) {
		this.viewport = new Viewport(args);
		if (this.mode == 'idle')
		    this.transformImg();
	    }
	},

	id: function id(args) {
	    this.setLabel(args);
	},

	show: function show(args) {
	    if (! isUndefined(args.id))
		this.showLabel(args.id);
	}

    }
    
});

// ----------------------------------------------------------------------
$(function() {
    var display = new Display();
});
