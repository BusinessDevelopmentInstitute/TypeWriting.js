/*!
 * TypeWriting.js
 *
 * Copyright © 2017 Eddie Wen | MIT license
 * https://github.com/EddieWen-Taiwan/TypeWriting.js
 */

(function(root, factory) {
	'use strict';
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	root.TypeWriting = factory()
}(this, () => {
	'use strict';

	/**
	 * the exported string position
	 */
	let _currentNumber = 1;
	/**
	 * whether is between a html tag
	 */
	let _inHTMLTag = false;

	/**
	 * plugin task status
	 */
	const taskStatus = {
		UNREADY: 'UNREADY',
		READY: 'READY',
		TYPEING: 'TYPEING',
	};

	/**
	 * the default config
	 */
	let defaults = {
		targetElement	: null,
		inputString 	: '',
		typing_interval	: 150,
		blink_interval	: '0.7s',
		cursor_color	: 'black',
		tw_callback		: undefined,
		task			: taskStatus.UNREADY,
	};

	const _typingGo = () => {

		if( _currentNumber <= defaults.inputString.length ) {

			const nextString = _sliceDisplayText(_currentNumber);
			_currentNumber += 1;

			if( nextString.slice(-1) === '<' ) {
				_inHTMLTag = true;
			}
			else if( nextString.slice(-1) === '>' ) {
				_inHTMLTag = false;
			}

			defaults.targetElement.innerHTML = nextString;

			if( _inHTMLTag ) {
				_typingGo();
			}
			else {
				setTimeout(() => {
					_typingGo();
				}, defaults.typing_interval);
			}

		}
		else {
			defaults.task = taskStatus.READY;
			_currentNumber = 1;
			defaults.tw_callback.call();
		}

	};

	const _sliceDisplayText = (to) => (
		defaults.inputString.slice( 0, to )
	);

	const _cleanCallback = () => {
		defaults.tw_callback = undefined;
	};

	// Utility method to extend defaults with user options
	const extendDefaults = (source, properties) => {
		for( const property in properties ) {
			if( properties.hasOwnProperty(property) ) {
				source[property] = properties[property];
			}
		}
		return source;
	};

	/**
	 * TypeWriting constructor
	 */
	class TypeWriting {

		constructor(options, callbackFunction) {

			if( !options || typeof options !== 'object' ) {
				throw new Error('`options` is invalid');
			}

			/**
			 * check value from user
			 * the string will be put in target later
			 */
			if( !options.inputString ) {
				throw new Error('Missing argument: inputString');
			}
			if( typeof options.inputString !== 'string' ) {
				throw new Error('`inputString` is not a string');
			}

			/**
			 * set the custom config
			 */
			defaults = extendDefaults(defaults, options);

			/**
			 * callback function
			 */
			if( callbackFunction ) {
				if( typeof callbackFunction === 'function' ) {
					defaults.tw_callback = callbackFunction;
				}
				else {
					console.error(`${callbackFunction} is not a function`);
					_cleanCallback();
				}
			}
			else {
				_cleanCallback();
			}

			/**
			 * Calculate proper size of cursor
			 * by inserting a new inline-element with `I`
			 */
			const calcDiv = document.createElement('div');
			calcDiv.style.display = 'inline-block';
			calcDiv.innerHTML = 'I';
			defaults.targetElement.appendChild(calcDiv);
			const cursorHeight = calcDiv.offsetHeight;
			const cursorWidth = calcDiv.offsetWidth;
			defaults.targetElement.removeChild(calcDiv);

			/**
			 * cursor css style
			 */
			const cssStyle = `@-webkit-keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@-moz-keyframes blink{0%,100%{opacity:1}50%{opacity:0}}@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}.typingCursor::after{content:'';width:${cursorWidth}px;height:${cursorHeight}px;margin-left:5px;display:inline-block;vertical-align:bottom;background-color:${defaults.cursor_color};-webkit-animation:blink ${defaults.blink_interval} infinite;-moz-animation:blink ${defaults.blink_interval} infinite;animation:blink ${defaults.blink_interval} infinite}`;

			/**
			 * add CSS style in HEAD
			 */
			const styleNode = document.createElement('style');
			styleNode.type = 'text/css';
			if( styleNode.styleSheet ) {
				styleNode.styleSheet.cssText = cssStyle;
			}
			else {
				styleNode.appendChild(document.createTextNode(cssStyle));
			}
			document.head.appendChild(styleNode);

			defaults.targetElement.className += ' typingCursor';
			defaults.task = taskStatus.TYPING;
			_typingGo();

		}

		/**
		 * change the text on the same target
		 */
		rewrite(inputString, callbackFunction) {

			if( defaults.task === taskStatus.TYPING ) {
				console.warn('Last task is not finished yet');
				setTimeout(() => {
					this.rewrite( inputString, callbackFunction );
				}, defaults.typing_interval);
				return;
			}

			/**
			 * check value
			 * the string will be put in target later
			 */
			if( !inputString ) {
				throw new Error('Missing argument: inputString');
			}
			if( typeof inputString !== 'string' ) {
				throw new Error('`inputString` is not a string');
			}

			defaults.inputString = inputString;

			/**
			 * callback function
			 */
			if( callbackFunction ) {
				if( typeof callbackFunction === 'function' ) {
					defaults.tw_callback = callbackFunction;
				}
				else {
					console.error(`${callbackFunction} is not a function`);
					_cleanCallback();
				}
			}
			else {
				_cleanCallback();
			}

			defaults.task = taskStatus.TYPING;
			_typingGo();

		}

	}

	return TypeWriting;

}));
