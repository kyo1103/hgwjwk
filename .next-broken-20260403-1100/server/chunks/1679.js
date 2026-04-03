"use strict";exports.id=1679,exports.ids=[1679],exports.modules={2511:(e,t,r)=>{r.d(t,{I9:()=>m,Q1:()=>d,Qj:()=>g,Yo:()=>p,ce:()=>f,kd:()=>h});var n=r(6005),i=r.n(n);let o={channelId:"_HIxcZX",firmName:"신정노동법률사무소"};function a(){return{apiKey:process.env.SOLAPI_API_KEY??"",apiSecret:process.env.SOLAPI_API_SECRET??"",senderNumber:process.env.SOLAPI_SENDER_NUMBER??"",pfId:process.env.SOLAPI_KAKAO_PF_ID??""}}let s=["SOLAPI_API_KEY","SOLAPI_API_SECRET","SOLAPI_KAKAO_PF_ID"],l=["SOLAPI_SENDER_NUMBER","KAKAO_WEBHOOK_SECRET"];function p(){let{apiKey:e,apiSecret:t,senderNumber:r,pfId:n}=a(),i={SOLAPI_API_KEY:e,SOLAPI_API_SECRET:t,SOLAPI_KAKAO_PF_ID:n},o={SOLAPI_SENDER_NUMBER:r,KAKAO_WEBHOOK_SECRET:process.env.KAKAO_WEBHOOK_SECRET??""},p=s.filter(e=>!i[e]),u=l.filter(e=>!o[e]);return{provider:"solapi",configured:0===p.length,missing:[...p],optionalMissing:[...u]}}function u(e){return e.replace(/[^0-9]/g,"")}async function c(e){let t=p();if(!t.configured){let e=`필수 설정 누락: ${t.missing.join(", ")}`;return console.warn(`[Solapi] ${e} — 발송 스킵`),{success:!1,error:e}}try{let t=await fetch("https://api.solapi.com/messages/v4/send",{method:"POST",headers:{"Content-Type":"application/json;charset=UTF-8",Authorization:function(){let{apiKey:e,apiSecret:t}=a(),r=new Date().toISOString(),n=i().randomBytes(16).toString("hex"),o=i().createHmac("sha256",t).update(r+n).digest("hex");return`HMAC-SHA256 apiKey=${e}, date=${r}, salt=${n}, signature=${o}`}()},body:JSON.stringify({messages:e})}),r=await t.json();if(!t.ok||r.errorCode){let e=r.errorMessage??`HTTP ${t.status}`;return console.error("[Solapi] 발송 실패:",e),{success:!1,error:e}}return{success:!0,groupId:r.groupId}}catch(t){let e=t instanceof Error?t.message:String(t);return console.error("[Solapi] 요청 오류:",e),{success:!1,error:e}}}async function m(e){let{pfId:t,senderNumber:r}=a(),n=u(e.recipientPhone),i=function(e,t){let r=o.firmName,n=e=>t[e]??"";return({DOC_COLLECT_DONE:()=>`[${r}] 안녕하세요, ${n("clientName")}님.

${n("year")}년 ${n("month")}월 민원서류 수집이 완료되었습니다.

수집 문서: ${n("docCount")}건
확인: ${n("portalUrl")}

문의: 카카오채널 @${r}`,PAYSLIP_READY:()=>`[${r}] ${n("employeeName")}님의
${n("year")}년 ${n("month")}월 급여명세서가 발행되었습니다.

실수령액: ${n("netPay")}원
명세서 확인: ${n("portalUrl")}

문의: 카카오채널 @${r}`,FILING_DUE:()=>`[${r}] 신고 기한 안내

${n("clientName")}님, ${n("filingType")} 신고 기한이
${n("dueDate")} 입니다.

준비 서류: ${n("required")}

문의: 카카오채널 @${r}`,CONTRACT_SIGN:()=>`[${r}] 전자서명 요청

${n("recipientName")}님께 서명 요청 드립니다.

계약서: ${n("contractTitle")}
서명 링크: ${n("signUrl")}
유효기간: ${n("expireDate")}

문의: 카카오채널 @${r}`,CONSULT_CONFIRM:()=>`[${r}] 상담 예약이 확인되었습니다.

성함: ${n("clientName")}
일시: ${n("datetime")}
장소: ${n("location")||"신정노동법률사무소"}

변경/취소: 카카오채널 @${r} 또는 전화 문의`,CASE_UPDATE:()=>`[${r}] 사건 진행 안내

${n("clientName")}님의 사건 상황을 안내드립니다.

사건명: ${n("caseName")}
내용: ${n("updateContent")}

문의: 카카오채널 @${r}`,LABOR_NOTICE:()=>`[${r}] 노무 안내

${n("clientName")}님께 안내 드립니다.

${n("title")}

${n("content")}

문의: 카카오채널 @${r}`})[e]?.()??Object.entries(t).reduce((e,[t,r])=>e.replace(RegExp(`#\\{${t}\\}`,"g"),r),e)}(e.templateCode,e.templateParams??{}),s={to:n,kakaoOptions:e.solapiTemplateId?{pfId:t,templateId:e.solapiTemplateId,variables:Object.fromEntries(Object.entries(e.templateParams??{}).map(([e,t])=>[`#{${e}}`,t]))}:{pfId:t,content:i},type:e.solapiTemplateId?"ATA":"FT"};return r&&(s.from=r),{...await c([s]),requestedAt:new Date}}async function f(e){let{pfId:t,senderNumber:r}=a(),n=u(e.recipientPhone),i={pfId:t,content:e.content};e.buttons?.length&&(i.buttons=e.buttons),e.imageUrl&&(i.imageUrl=e.imageUrl);let o={to:n,type:!1!==e.isAd?"FTA":"FT",kakaoOptions:i};return r&&(o.from=r),{...await c([o]),requestedAt:new Date}}async function d(e){let t=new Date;t.setDate(t.getDate()+(e.expireDays??7));let r=t.toLocaleDateString("ko-KR",{year:"numeric",month:"long",day:"numeric"});return m({recipientPhone:e.recipientPhone,templateCode:"CONTRACT_SIGN",solapiTemplateId:e.solapiTemplateId,templateParams:{recipientName:e.recipientName,contractTitle:e.contractTitle,signUrl:e.signUrl,expireDate:r}})}async function h(e){let t=e.linkUrl?[{buttonType:"WL",buttonName:e.linkLabel??"자세히 보기",linkMo:e.linkUrl,linkPc:e.linkUrl}]:[],r=`[${o.firmName}]

📢 ${e.title}

`+e.content+"\n\n"+`채널톡: http://pf.kakao.com/${o.channelId}`;return Promise.all(e.phones.map(e=>f({recipientPhone:e,content:r,buttons:t,isAd:!0})))}function g(e,t){let r=process.env.KAKAO_WEBHOOK_SECRET;if(!r)return!0;if(!t)return!1;let n=i().createHmac("sha256",r).update(e,"utf8").digest("hex");try{return i().timingSafeEqual(Buffer.from(n,"hex"),Buffer.from(t,"hex"))}catch{return!1}}},6801:e=>{var t=Object.defineProperty,r=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,i=Object.prototype.hasOwnProperty,o={};function a(e){var t;let r=["path"in e&&e.path&&`Path=${e.path}`,"expires"in e&&(e.expires||0===e.expires)&&`Expires=${("number"==typeof e.expires?new Date(e.expires):e.expires).toUTCString()}`,"maxAge"in e&&"number"==typeof e.maxAge&&`Max-Age=${e.maxAge}`,"domain"in e&&e.domain&&`Domain=${e.domain}`,"secure"in e&&e.secure&&"Secure","httpOnly"in e&&e.httpOnly&&"HttpOnly","sameSite"in e&&e.sameSite&&`SameSite=${e.sameSite}`,"partitioned"in e&&e.partitioned&&"Partitioned","priority"in e&&e.priority&&`Priority=${e.priority}`].filter(Boolean),n=`${e.name}=${encodeURIComponent(null!=(t=e.value)?t:"")}`;return 0===r.length?n:`${n}; ${r.join("; ")}`}function s(e){let t=new Map;for(let r of e.split(/; */)){if(!r)continue;let e=r.indexOf("=");if(-1===e){t.set(r,"true");continue}let[n,i]=[r.slice(0,e),r.slice(e+1)];try{t.set(n,decodeURIComponent(null!=i?i:"true"))}catch{}}return t}function l(e){var t,r;if(!e)return;let[[n,i],...o]=s(e),{domain:a,expires:l,httponly:c,maxage:m,path:f,samesite:d,secure:h,partitioned:g,priority:_}=Object.fromEntries(o.map(([e,t])=>[e.toLowerCase(),t]));return function(e){let t={};for(let r in e)e[r]&&(t[r]=e[r]);return t}({name:n,value:decodeURIComponent(i),domain:a,...l&&{expires:new Date(l)},...c&&{httpOnly:!0},..."string"==typeof m&&{maxAge:Number(m)},path:f,...d&&{sameSite:p.includes(t=(t=d).toLowerCase())?t:void 0},...h&&{secure:!0},..._&&{priority:u.includes(r=(r=_).toLowerCase())?r:void 0},...g&&{partitioned:!0}})}((e,r)=>{for(var n in r)t(e,n,{get:r[n],enumerable:!0})})(o,{RequestCookies:()=>c,ResponseCookies:()=>m,parseCookie:()=>s,parseSetCookie:()=>l,stringifyCookie:()=>a}),e.exports=((e,o,a,s)=>{if(o&&"object"==typeof o||"function"==typeof o)for(let a of n(o))i.call(e,a)||void 0===a||t(e,a,{get:()=>o[a],enumerable:!(s=r(o,a))||s.enumerable});return e})(t({},"__esModule",{value:!0}),o);var p=["strict","lax","none"],u=["low","medium","high"],c=class{constructor(e){this._parsed=new Map,this._headers=e;let t=e.get("cookie");if(t)for(let[e,r]of s(t))this._parsed.set(e,{name:e,value:r})}[Symbol.iterator](){return this._parsed[Symbol.iterator]()}get size(){return this._parsed.size}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed);if(!e.length)return r.map(([e,t])=>t);let n="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(([e])=>e===n).map(([e,t])=>t)}has(e){return this._parsed.has(e)}set(...e){let[t,r]=1===e.length?[e[0].name,e[0].value]:e,n=this._parsed;return n.set(t,{name:t,value:r}),this._headers.set("cookie",Array.from(n).map(([e,t])=>a(t)).join("; ")),this}delete(e){let t=this._parsed,r=Array.isArray(e)?e.map(e=>t.delete(e)):t.delete(e);return this._headers.set("cookie",Array.from(t).map(([e,t])=>a(t)).join("; ")),r}clear(){return this.delete(Array.from(this._parsed.keys())),this}[Symbol.for("edge-runtime.inspect.custom")](){return`RequestCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(e=>`${e.name}=${encodeURIComponent(e.value)}`).join("; ")}},m=class{constructor(e){var t,r,n;this._parsed=new Map,this._headers=e;let i=null!=(n=null!=(r=null==(t=e.getSetCookie)?void 0:t.call(e))?r:e.get("set-cookie"))?n:[];for(let e of Array.isArray(i)?i:function(e){if(!e)return[];var t,r,n,i,o,a=[],s=0;function l(){for(;s<e.length&&/\s/.test(e.charAt(s));)s+=1;return s<e.length}for(;s<e.length;){for(t=s,o=!1;l();)if(","===(r=e.charAt(s))){for(n=s,s+=1,l(),i=s;s<e.length&&"="!==(r=e.charAt(s))&&";"!==r&&","!==r;)s+=1;s<e.length&&"="===e.charAt(s)?(o=!0,s=i,a.push(e.substring(t,n)),t=s):s=n+1}else s+=1;(!o||s>=e.length)&&a.push(e.substring(t,e.length))}return a}(i)){let t=l(e);t&&this._parsed.set(t.name,t)}}get(...e){let t="string"==typeof e[0]?e[0]:e[0].name;return this._parsed.get(t)}getAll(...e){var t;let r=Array.from(this._parsed.values());if(!e.length)return r;let n="string"==typeof e[0]?e[0]:null==(t=e[0])?void 0:t.name;return r.filter(e=>e.name===n)}has(e){return this._parsed.has(e)}set(...e){let[t,r,n]=1===e.length?[e[0].name,e[0].value,e[0]]:e,i=this._parsed;return i.set(t,function(e={name:"",value:""}){return"number"==typeof e.expires&&(e.expires=new Date(e.expires)),e.maxAge&&(e.expires=new Date(Date.now()+1e3*e.maxAge)),(null===e.path||void 0===e.path)&&(e.path="/"),e}({name:t,value:r,...n})),function(e,t){for(let[,r]of(t.delete("set-cookie"),e)){let e=a(r);t.append("set-cookie",e)}}(i,this._headers),this}delete(...e){let[t,r,n]="string"==typeof e[0]?[e[0]]:[e[0].name,e[0].path,e[0].domain];return this.set({name:t,path:r,domain:n,value:"",expires:new Date(0)})}[Symbol.for("edge-runtime.inspect.custom")](){return`ResponseCookies ${JSON.stringify(Object.fromEntries(this._parsed))}`}toString(){return[...this._parsed.values()].map(a).join("; ")}}},5911:(e,t,r)=>{Object.defineProperty(t,"__esModule",{value:!0}),function(e,t){for(var r in t)Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}(t,{RequestCookies:function(){return n.RequestCookies},ResponseCookies:function(){return n.ResponseCookies},stringifyCookie:function(){return n.stringifyCookie}});let n=r(6801)}};