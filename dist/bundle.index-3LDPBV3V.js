var a,l=new Array(128).fill(void 0);l.push(void 0,null,!0,!1);function c(e){return l[e]}var h=l.length;function W(e){e<132||(l[e]=h,h=e)}function k(e){let n=c(e);return W(e),n}var L=typeof TextDecoder<"u"?new TextDecoder("utf-8",{ignoreBOM:!0,fatal:!0}):{decode:()=>{throw Error("TextDecoder not available")}};typeof TextDecoder<"u"&&L.decode();var m=null;function T(){return(m===null||m.byteLength===0)&&(m=new Uint8Array(a.memory.buffer)),m}function b(e,n){return e=e>>>0,L.decode(T().subarray(e,e+n))}function i(e){h===l.length&&l.push(l.length+1);let n=h;return h=l[n],l[n]=e,n}function S(e){let n=typeof e;if(n=="number"||n=="boolean"||e==null)return`${e}`;if(n=="string")return`"${e}"`;if(n=="symbol"){let r=e.description;return r==null?"Symbol":`Symbol(${r})`}if(n=="function"){let r=e.name;return typeof r=="string"&&r.length>0?`Function(${r})`:"Function"}if(Array.isArray(e)){let r=e.length,s="[";r>0&&(s+=S(e[0]));for(let _=1;_<r;_++)s+=", "+S(e[_]);return s+="]",s}let t=/\[object ([^\]]+)\]/.exec(toString.call(e)),o;if(t.length>1)o=t[1];else return toString.call(e);if(o=="Object")try{return"Object("+JSON.stringify(e)+")"}catch{return"Object"}return e instanceof Error?`${e.name}: ${e.message}
${e.stack}`:o}var p=0,x=typeof TextEncoder<"u"?new TextEncoder("utf-8"):{encode:()=>{throw Error("TextEncoder not available")}},F=typeof x.encodeInto=="function"?function(e,n){return x.encodeInto(e,n)}:function(e,n){let t=x.encode(e);return n.set(t),{read:e.length,written:t.length}};function E(e,n,t){if(t===void 0){let u=x.encode(e),d=n(u.length,1)>>>0;return T().subarray(d,d+u.length).set(u),p=u.length,d}let o=e.length,r=n(o,1)>>>0,s=T(),_=0;for(;_<o;_++){let u=e.charCodeAt(_);if(u>127)break;s[r+_]=u}if(_!==o){_!==0&&(e=e.slice(_)),r=t(r,o,o=_+e.length*3,1)>>>0;let u=T().subarray(r+_,r+o),d=F(e,u);_+=d.written,r=t(r,o,_,1)>>>0}return p=_,r}var y=null;function g(){return(y===null||y.byteLength===0)&&(y=new Int32Array(a.memory.buffer)),y}var A=typeof FinalizationRegistry>"u"?{register:()=>{},unregister:()=>{}}:new FinalizationRegistry(e=>{a.__wbindgen_export_2.get(e.dtor)(e.a,e.b)});function j(e,n,t,o){let r={a:e,b:n,cnt:1,dtor:t},s=(..._)=>{r.cnt++;try{return o(r.a,r.b,..._)}finally{--r.cnt===0&&(a.__wbindgen_export_2.get(r.dtor)(r.a,r.b),r.a=0,A.unregister(r))}};return s.original=r,A.register(s,r,r),s}function D(e,n){a._dyn_core__ops__function__Fn_____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__hb3b537968530c82d(e,n)}function v(e,n,t,o){let r={a:e,b:n,cnt:1,dtor:t},s=(..._)=>{r.cnt++;let u=r.a;r.a=0;try{return o(u,r.b,..._)}finally{--r.cnt===0?(a.__wbindgen_export_2.get(r.dtor)(u,r.b),A.unregister(r)):r.a=u}};return s.original=r,A.register(s,r,r),s}function U(e,n,t){a._dyn_core__ops__function__FnMut__A____Output___R_as_wasm_bindgen__closure__WasmClosure___describe__invoke__ha5d2c2a23700699b(e,n,i(t))}function O(){a.start()}function w(e){return e==null}function f(e,n){try{return e.apply(this,n)}catch(t){a.__wbindgen_exn_store(i(t))}}async function q(e,n){if(typeof Response=="function"&&e instanceof Response){if(typeof WebAssembly.instantiateStreaming=="function")try{return await WebAssembly.instantiateStreaming(e,n)}catch(o){if(e.headers.get("Content-Type")!="application/wasm")console.warn("`WebAssembly.instantiateStreaming` failed because your server does not serve wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",o);else throw o}let t=await e.arrayBuffer();return await WebAssembly.instantiate(t,n)}else{let t=await WebAssembly.instantiate(e,n);return t instanceof WebAssembly.Instance?{instance:t,module:e}:t}}function N(){let e={};return e.wbg={},e.wbg.__wbindgen_object_drop_ref=function(n){k(n)},e.wbg.__wbg_instanceof_Window_f401953a2cf86220=function(n){let t;try{t=c(n)instanceof Window}catch{t=!1}return t},e.wbg.__wbg_document_5100775d18896c16=function(n){let t=c(n).document;return w(t)?0:i(t)},e.wbg.__wbg_querySelector_a5f74efc5fa193dd=function(){return f(function(n,t,o){let r=c(n).querySelector(b(t,o));return w(r)?0:i(r)},arguments)},e.wbg.__wbg_querySelectorAll_4e0fcdb64cda2cd5=function(){return f(function(n,t,o){let r=c(n).querySelectorAll(b(t,o));return i(r)},arguments)},e.wbg.__wbg_classList_1f0528ee002e56d4=function(n){let t=c(n).classList;return i(t)},e.wbg.__wbg_instanceof_HtmlElement_3bcc4ff70cfdcba5=function(n){let t;try{t=c(n)instanceof HTMLElement}catch{t=!1}return t},e.wbg.__wbg_dataset_2dc9c005573ba3b5=function(n){let t=c(n).dataset;return i(t)},e.wbg.__wbg_setonclick_4fd9bd8531d33a17=function(n,t){c(n).onclick=c(t)},e.wbg.__wbg_contains_8f0a8795c4640e9e=function(n,t,o){return c(n).contains(b(t,o))},e.wbg.__wbindgen_string_new=function(n,t){let o=b(n,t);return i(o)},e.wbg.__wbindgen_object_clone_ref=function(n){let t=c(n);return i(t)},e.wbg.__wbg_get_2a1a5424f4996392=function(n,t,o,r){let s=c(t)[b(o,r)];var _=w(s)?0:E(s,a.__wbindgen_malloc,a.__wbindgen_realloc),u=p;g()[n/4+1]=u,g()[n/4+0]=_},e.wbg.__wbg_set_5e34713fed5f48f2=function(){return f(function(n,t,o,r,s){c(n)[b(t,o)]=b(r,s)},arguments)},e.wbg.__wbg_target_2fc177e386c8b7b0=function(n){let t=c(n).target;return w(t)?0:i(t)},e.wbg.__wbg_get_8cd5eba00ab6304f=function(n,t){let o=c(n)[t>>>0];return w(o)?0:i(o)},e.wbg.__wbg_new_abda76e883ba8a5f=function(){let n=new Error;return i(n)},e.wbg.__wbg_stack_658279fe44541cf6=function(n,t){let o=c(t).stack,r=E(o,a.__wbindgen_malloc,a.__wbindgen_realloc),s=p;g()[n/4+1]=s,g()[n/4+0]=r},e.wbg.__wbg_error_f851667af71bcfc6=function(n,t){let o,r;try{o=n,r=t,console.error(b(n,t))}finally{a.__wbindgen_free(o,r,1)}},e.wbg.__wbg_crypto_1d1f22824a6a080c=function(n){let t=c(n).crypto;return i(t)},e.wbg.__wbindgen_is_object=function(n){let t=c(n);return typeof t=="object"&&t!==null},e.wbg.__wbg_process_4a72847cc503995b=function(n){let t=c(n).process;return i(t)},e.wbg.__wbg_versions_f686565e586dd935=function(n){let t=c(n).versions;return i(t)},e.wbg.__wbg_node_104a2ff8d6ea03a2=function(n){let t=c(n).node;return i(t)},e.wbg.__wbindgen_is_string=function(n){return typeof c(n)=="string"},e.wbg.__wbg_require_cca90b1a94a0255b=function(){return f(function(){let n=module.require;return i(n)},arguments)},e.wbg.__wbindgen_is_function=function(n){return typeof c(n)=="function"},e.wbg.__wbg_msCrypto_eb05e62b530a1508=function(n){let t=c(n).msCrypto;return i(t)},e.wbg.__wbg_randomFillSync_5c9c955aa56b6049=function(){return f(function(n,t){c(n).randomFillSync(k(t))},arguments)},e.wbg.__wbg_getRandomValues_3aa56aa6edec874c=function(){return f(function(n,t){c(n).getRandomValues(c(t))},arguments)},e.wbg.__wbg_newnoargs_e258087cd0daa0ea=function(n,t){let o=new Function(b(n,t));return i(o)},e.wbg.__wbg_call_27c0f87801dedf93=function(){return f(function(n,t){let o=c(n).call(c(t));return i(o)},arguments)},e.wbg.__wbg_self_ce0dbfc45cf2f5be=function(){return f(function(){let n=self.self;return i(n)},arguments)},e.wbg.__wbg_window_c6fb939a7f436783=function(){return f(function(){let n=window.window;return i(n)},arguments)},e.wbg.__wbg_globalThis_d1e6af4856ba331b=function(){return f(function(){let n=globalThis.globalThis;return i(n)},arguments)},e.wbg.__wbg_global_207b558942527489=function(){return f(function(){let n=global.global;return i(n)},arguments)},e.wbg.__wbindgen_is_undefined=function(n){return c(n)===void 0},e.wbg.__wbg_call_b3ca7c6051f9bec1=function(){return f(function(n,t,o){let r=c(n).call(c(t),c(o));return i(r)},arguments)},e.wbg.__wbg_buffer_12d079cc21e14bdb=function(n){let t=c(n).buffer;return i(t)},e.wbg.__wbg_newwithbyteoffsetandlength_aa4a17c33a06e5cb=function(n,t,o){let r=new Uint8Array(c(n),t>>>0,o>>>0);return i(r)},e.wbg.__wbg_new_63b92bc8671ed464=function(n){let t=new Uint8Array(c(n));return i(t)},e.wbg.__wbg_set_a47bac70306a19a7=function(n,t,o){c(n).set(c(t),o>>>0)},e.wbg.__wbg_newwithlength_e9b4878cebadb3d3=function(n){let t=new Uint8Array(n>>>0);return i(t)},e.wbg.__wbg_subarray_a1f73cd4b5b42fe1=function(n,t,o){let r=c(n).subarray(t>>>0,o>>>0);return i(r)},e.wbg.__wbindgen_debug_string=function(n,t){let o=S(c(t)),r=E(o,a.__wbindgen_malloc,a.__wbindgen_realloc),s=p;g()[n/4+1]=s,g()[n/4+0]=r},e.wbg.__wbindgen_throw=function(n,t){throw new Error(b(n,t))},e.wbg.__wbindgen_memory=function(){let n=a.memory;return i(n)},e.wbg.__wbindgen_closure_wrapper67=function(n,t,o){let r=j(n,t,10,D);return i(r)},e.wbg.__wbindgen_closure_wrapper68=function(n,t,o){let r=v(n,t,10,U);return i(r)},e}function H(e,n){return a=e.exports,M.__wbindgen_wasm_module=n,y=null,m=null,a}async function M(e){if(a!==void 0)return a;typeof e>"u"&&(e=new URL("wasm_15puzzle_bg.wasm",import.meta.url));let n=N();(typeof e=="string"||typeof Request=="function"&&e instanceof Request||typeof URL=="function"&&e instanceof URL)&&(e=fetch(e));let{instance:t,module:o}=await q(await e,n);return H(t,o)}var R=M;function B(){O()}R().then(()=>{document.readyState==="loading"?document.addEventListener("DOMContentLoaded",B):B()});
