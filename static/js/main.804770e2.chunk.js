(this["webpackJsonpgarmin-g5"]=this["webpackJsonpgarmin-g5"]||[]).push([[0],[,,,,,,,,function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){},function(e,a,t){"use strict";t.r(a);var n=t(0),r=t.n(n),c=t(3),l=t.n(c),i=(t(8),t(9),t(1)),s=r.a.createContext(),m=(t(10),function(){var e=Object(n.useContext)(s),a=e.pitch,t=e.roll,c={transform:"scale(2) translateY(".concat(a,"px) rotate(").concat(t,"deg)")};return r.a.createElement("div",{className:"ArtificialHorizon",style:c},r.a.createElement("div",{className:"Sky"}),r.a.createElement("div",{className:"Horizon"}),r.a.createElement("div",{className:"Ground"}))}),o=(t(11),t(12),function(e){var a=e.ias;return r.a.createElement("div",{className:"Measure"},r.a.createElement("div",{className:"Caret"}),r.a.createElement("div",{className:"MeasureInner"},r.a.createElement("div",{className:"Digits"},r.a.createElement("span",{className:"Digit"},function(e){return e>=100?e.toString()[0]:null}(a)),r.a.createElement("span",{className:"Digit"},function(e){return e>=100?e.toString()[1]:e>=10?e.toString()[0]:null}(a)),r.a.createElement("span",{className:"Digit OnesDigit"},function(e){var a=e.toString();return a[a.length-1]}(a)))))}),u=function(){var e=Object(n.useContext)(s).ias;return r.a.createElement("div",{className:"Airspeed"},r.a.createElement(o,{ias:e}),r.a.createElement("div",{className:"AirspeedOverlay"}),r.a.createElement("div",{className:"AirspeedTape"}))},v=(t(13),function(){return r.a.createElement("div",{className:"Altimeter"},"0",r.a.createElement("div",{className:"AltimeterOverlay"}),r.a.createElement("div",{className:"AltimeterTape"}))}),d=(t(14),function(){return r.a.createElement("div",{className:"Screen"},r.a.createElement(m,null),r.a.createElement(u,null),r.a.createElement(v,null))}),E=(t(15),function(e){return r.a.createElement("div",{className:"G5"},r.a.createElement("div",{className:"PrimaryContainer"},r.a.createElement("div",{className:"Logo"},"GARMIN"),r.a.createElement("div",{className:"Screen"},r.a.createElement(s.Provider,{value:e},r.a.createElement(d,null)))),r.a.createElement("div",{className:"Controls"},r.a.createElement("div",{className:"Power"})))}),N=(t(16),function(){var e=Object(n.useState)(0),a=Object(i.a)(e,2),t=a[0],c=a[1],l=Object(n.useState)(0),s=Object(i.a)(l,2),m=s[0],o=s[1],u=Object(n.useState)(0),v=Object(i.a)(u,2),d=v[0],N=v[1];return r.a.createElement("div",{className:"Playground"},r.a.createElement("div",{className:"Sidebar"},r.a.createElement("div",{className:"Header"},"Garmin G5"),r.a.createElement("div",{className:"Inputs"},r.a.createElement("div",{className:"Input"},r.a.createElement("div",{className:"Label"},"Pitch"),r.a.createElement("div",{className:"Control"},r.a.createElement("input",{type:"range",min:"-30",max:"30",value:t,onChange:function(e){return c(parseInt(e.target.value))}}))),r.a.createElement("div",{className:"Input"},r.a.createElement("div",{className:"Label"},"Roll"),r.a.createElement("div",{className:"Control"},r.a.createElement("input",{type:"range",min:"-45",max:"45",value:m,onChange:function(e){return o(parseInt(e.target.value))}}))),r.a.createElement("div",{className:"Input"},r.a.createElement("div",{className:"Label"},"Airspeed"),r.a.createElement("div",{className:"Control"},r.a.createElement("input",{type:"number",min:(0).toString(),max:250..toString(),value:d,onChange:function(e){return N(function(e){if(""===e)return 0;var a=parseInt(e);return a>250?250:a<0?0:a}(e.target.value))}}))))),r.a.createElement("div",{className:"Container"},r.a.createElement(E,{pitch:t,roll:m,ias:d})))});var g=function(){return r.a.createElement("div",{className:"App"},r.a.createElement(N,null))};Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));l.a.render(r.a.createElement(r.a.StrictMode,null,r.a.createElement(g,null)),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(e){e.unregister()})).catch((function(e){console.error(e.message)}))}],[[17,1,2]]]);
//# sourceMappingURL=main.804770e2.chunk.js.map