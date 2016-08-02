/*
Copyright (c) 2014 - Bram Stein
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions
are met:

 1. Redistributions of source code must retain the above copyright
    notice, this list of conditions and the following disclaimer.
 2. Redistributions in binary form must reproduce the above copyright
    notice, this list of conditions and the following disclaimer in the
    documentation and/or other materials provided with the distribution.

THIS SOFTWARE IS PROVIDED BY THE AUTHOR "AS IS" AND ANY EXPRESS OR IMPLIED
WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
(function(){'use strict';var e=[];function g(a){e.push(a);1===e.length&&l()}function m(){for(;e.length;)e[0](),e.shift()}if(window.MutationObserver){var n=document.createElement("div");(new MutationObserver(m)).observe(n,{attributes:!0});var l=function(){n.setAttribute("x",0)}}else l=function(){setTimeout(m)};function p(a){this.a=q;this.b=void 0;this.c=[];var b=this;try{a(function(a){b.resolve(a)},function(a){b.reject(a)})}catch(c){b.reject(c)}}var q=2;function r(a){return new p(function(b,c){c(a)})}function t(a){return new p(function(b){b(a)})}
p.prototype.resolve=function(a){var b=this;if(b.a===q){if(a===b)throw new TypeError("Promise settled with itself.");var c=!1;try{var d=a&&a.then;if(null!==a&&"object"===typeof a&&"function"===typeof d){d.call(a,function(a){c||b.resolve(a);c=!0},function(a){c||b.reject(a);c=!0});return}}catch(f){c||b.reject(f);return}b.a=0;b.b=a;u(b)}};p.prototype.reject=function(a){if(this.a===q){if(a===this)throw new TypeError("Promise settled with itself.");this.a=1;this.b=a;u(this)}};
function u(a){g(function(){if(a.a!==q)for(;a.c.length;){var b=a.c.shift(),c=b[0],d=b[1],f=b[2],b=b[3];try{0===a.a?"function"===typeof c?f(c.call(void 0,a.b)):f(a.b):1===a.a&&("function"===typeof d?f(d.call(void 0,a.b)):b(a.b))}catch(h){b(h)}}})}p.prototype.catch=function(a){return this.then(void 0,a)};p.prototype.then=function(a,b){var c=this;return new p(function(d,f){c.c.push([a,b,d,f]);u(c)})};
function v(a){return new p(function(b,c){function d(c){return function(d){h[c]=d;f+=1;f===a.length&&b(h)}}var f=0,h=[];0===a.length&&b(h);for(var k=0;k<a.length;k+=1)a[k].then(d(k),c)})}function w(a){return new p(function(b,c){for(var d=0;d<a.length;d+=1)a[d].then(b,c)})};window.Promise||(window.Promise=p,window.Promise.resolve=t,window.Promise.reject=r,window.Promise.race=w,window.Promise.all=v,window.Promise.prototype.then=p.prototype.then,window.Promise.prototype["catch"]=p.prototype.catch);}());
