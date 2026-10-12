(()=> {
const NS='http://www.w3.org/2000/svg';
const defs=[
{id:'tri',name:'正三角形',path:'M0 -42 L36.4 21 L-36.4 21Z'},
{id:'iso',name:'二等辺三角形',path:'M0 -44 L29 25 L-29 25Z'},
{id:'right',name:'直角三角形',path:'M-34 -30 L-34 30 L34 30Z'},
{id:'square',name:'正方形',path:'M-29 -29H29V29H-29Z'},
{id:'rect',name:'長方形',path:'M-39 -24H39V24H-39Z'},
{id:'para',name:'平行四辺形',path:'M-38 -24H22L38 24H-22Z'},
{id:'diamond',name:'ひし形',path:'M0 -38L29 0L0 38L-29 0Z'},
{id:'circle',name:'円',circle:true},
{id:'semi',name:'半円',path:'M-34 0A34 34 0 0 1 34 0Z'},
{id:'hex',name:'六角形',path:'M-22 -32H22L38 0L22 32H-22L-38 0Z'},
{id:'star',name:'星',path:'M0 -40L10 -13L38 -13L16 4L24 32L0 16L-24 32L-16 4L-38 -13L-10 -13Z'},
{id:'heart',name:'ハート',path:'M0 31C-8 22 -36 3 -34 -14C-32 -35 -7 -35 0 -17C8 -35 32 -35 34 -14C36 3 8 22 0 31Z'}
];
const colors=['#e76f51','#f4a261','#e9c46a','#8ab17d','#2a9d8f','#4d91bd','#5969a8','#8c6bb1','#d979a5','#55463f','#202d35','#ffffff'];
let objects=[],selected=null,currentColor=colors[0],gridOn=true,history=[],future=[],drag=null,toastTimer;
const $=id=>document.getElementById(id),canvas=$('canvas');
function say(msg){const t=$('toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),1800)}
function snap(){history.push(JSON.stringify({objects,selected,gridOn}));if(history.length>60)history.shift();future=[]}
function restore(s){const d=JSON.parse(s);objects=d.objects;selected=d.selected;gridOn=d.gridOn;render()}
function makeSvgShape(d,fill){const s=document.createElementNS(NS,d.circle?'circle':'path');if(d.circle){s.setAttribute('r','31')}else{s.setAttribute('d',d.path)}s.setAttribute('fill',fill);s.setAttribute('stroke','#263238');s.setAttribute('stroke-opacity','.22');s.setAttribute('stroke-width','1.5');return s}
function drawShapeIcon(d){const s=document.createElementNS(NS,'svg');s.setAttribute('viewBox','-50 -50 100 100');s.appendChild(makeSvgShape(d,'#78b8aa'));return s}
defs.forEach(d=>{const b=document.createElement('button');b.className='shape-btn';b.type='button';b.append(drawShapeIcon(d));const span=document.createElement('span');span.textContent=d.name;b.append(span);b.addEventListener('click',()=>addShape(d.id));$('shapeGrid').append(b)});
colors.forEach((c,i)=>{const b=document.createElement('button');b.className='swatch'+(i===0?' active':'');b.style.background=c;b.setAttribute('aria-label','色 '+(i+1));b.addEventListener('click',()=>{currentColor=c;document.querySelectorAll('.swatch').forEach(x=>x.classList.remove('active'));b.classList.add('active');if(selected){snap();selected.fill=c;render()}});$('swatches').append(b)});
function addShape(id,x=300,y=300){snap();const o={id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),shape:id,x,y,scale:1,angle:0,fill:currentColor};objects.push(o);selected=o.id;render()}
function chosen(){return objects.find(o=>o.id===selected)}
function render(){canvas.querySelectorAll('.obj,.selection').forEach(n=>n.remove());objects.forEach(o=>{const d=defs.find(s=>s.id===o.shape);const g=document.createElementNS(NS,'g');g.classList.add('obj');g.dataset.id=o.id;g.setAttribute('transform',`translate(${o.x} ${o.y}) rotate(${o.angle}) scale(${o.scale})`);g.appendChild(makeSvgShape(d,o.fill));if(o.id===selected){const ring=document.createElementNS(NS,'circle');ring.setAttribute('r',String((d.circle?35:49)*1));ring.setAttribute('fill','none');ring.setAttribute('stroke','#246c68');ring.setAttribute('stroke-width',String(2/o.scale));ring.setAttribute('stroke-dasharray','4 4');ring.classList.add('selection');g.append(ring)}canvas.append(g)});canvas.classList.toggle('grid-bg',gridOn);$('gridBtn').classList.toggle('active',gridOn);$('whiteBtn').classList.toggle('active',!gridOn);$('count').textContent='図形 '+objects.length+'こ';$('empty').classList.toggle('hidden',objects.length>0);const o=chosen();['rotL','rotR','smaller','larger','duplicateBtn','deleteBtn','front','back','radial','repeat','mirror','size','angle'].forEach(id=>$(id).disabled=!o);$('size').value=o?Math.round(o.scale*100):100;$('sizeText').textContent=o?Math.round(o.scale*100)+'%':'—';$('angle').value=o?((o.angle%360)+360)%360:0;$('angleText').textContent=o?o.angle+'°':'—';}
function change(fn){const o=chosen();if(!o)return;snap();fn(o);render()}
function pointerPos(e){const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*600/r.width,y:(e.clientY-r.top)*600/r.height}}
canvas.addEventListener('pointerdown',e=>{const target=e.target.closest('.obj');if(target){const id=target.dataset.id;if(id!==selected){selected=id;render()}const o=chosen(),p=pointerPos(e);snap();drag={id,dx:p.x-o.x,dy:p.y-o.y};canvas.setPointerCapture(e.pointerId);e.preventDefault()}else{selected=null;render()}});
canvas.addEventListener('pointermove',e=>{if(!drag)return;const o=objects.find(x=>x.id===drag.id),p=pointerPos(e);if(!o)return;o.x=Math.max(0,Math.min(600,p.x-drag.dx));o.y=Math.max(0,Math.min(600,p.y-drag.dy));render()});
canvas.addEventListener('pointerup',()=>{drag=null});canvas.addEventListener('pointercancel',()=>{drag=null});
$('rotL').onclick=()=>change(o=>o.angle=(o.angle+345)%360);$('rotR').onclick=()=>change(o=>o.angle=(o.angle+15)%360);$('smaller').onclick=()=>change(o=>o.scale=Math.max(.25,+(o.scale-.1).toFixed(2)));$('larger').onclick=()=>change(o=>o.scale=Math.min(2.2,+(o.scale+.1).toFixed(2)));
$('size').oninput=e=>{const o=chosen();if(!o)return;o.scale=+e.target.value/100;render()};$('size').onchange=()=>snap();$('angle').oninput=e=>{const o=chosen();if(!o)return;o.angle=+e.target.value;render()};$('angle').onchange=()=>snap();
$('duplicateBtn').onclick=()=>{const o=chosen();if(!o)return;snap();const c={...o,id:crypto.randomUUID?crypto.randomUUID():String(Date.now()+Math.random()),x:Math.min(550,o.x+35),y:Math.min(550,o.y+35)};objects.push(c);selected=c.id;render()};
$('deleteBtn').onclick=()=>{if(!chosen())return;snap();objects=objects.filter(o=>o.id!==selected);selected=objects.at(-1)?.id||null;render()};
$('front').onclick=()=>{if(!chosen())return;snap();const o=objects.splice(objects.findIndex(x=>x.id===selected),1)[0];objects.push(o);render()};
$('back').onclick=()=>{if(!chosen())return;snap();const o=objects.splice(objects.findIndex(x=>x.id===selected),1)[0];objects.unshift(o);render()};
$('radial').onclick=()=>{const o=chosen();if(!o)return;snap();const cx=300,cy=300,base={...o};for(let i=1;i<8;i++){const a=i*Math.PI/4;objects.push({...base,id:String(Date.now()+Math.random()+i),x:cx+(o.x-cx)*Math.cos(a)-(o.y-cy)*Math.sin(a),y:cy+(o.x-cx)*Math.sin(a)+(o.y-cy)*Math.cos(a),angle:o.angle+i*45})}render();say('円形の模様をつくったよ')};
$('repeat').onclick=()=>{const o=chosen();if(!o)return;snap();for(let i=1;i<4;i++)objects.push({...o,id:String(Date.now()+Math.random()+i),x:Math.min(560,o.x+i*75),y:o.y});render();say('横にならべたよ')};
$('mirror').onclick=()=>{const o=chosen();if(!o)return;snap();objects.push({...o,id:String(Date.now()+Math.random()),x:600-o.x,y:o.y,angle:(360-o.angle)%360});selected=objects.at(-1).id;render();say('左右対称にコピーしたよ')};
$('clear').onclick=()=>{if(!objects.length)return;snap();objects=[];selected=null;render()};
$('gridBtn').onclick=()=>{gridOn=true;render()};$('whiteBtn').onclick=()=>{gridOn=false;render()};
$('undoBtn').onclick=()=>{if(!history.length)return;future.push(JSON.stringify({objects,selected,gridOn}));restore(history.pop())};$('redoBtn').onclick=()=>{if(!future.length)return;history.push(JSON.stringify({objects,selected,gridOn}));restore(future.pop())};
$('newBtn').onclick=()=>{if(objects.length&&!confirm('今の作品を消して、新しくつくりますか？'))return;snap();objects=[];selected=null;render()};
$('saveBtn').onclick=()=>{const clone=canvas.cloneNode(true);clone.setAttribute('xmlns',NS);clone.classList.remove('grid-bg');clone.querySelectorAll('.selection').forEach(n=>n.remove());if(gridOn){const pattern=document.createElementNS(NS,'pattern');pattern.setAttribute('id','grid');pattern.setAttribute('width','30');pattern.setAttribute('height','30');pattern.setAttribute('patternUnits','userSpaceOnUse');const path=document.createElementNS(NS,'path');path.setAttribute('d','M 30 0 L 0 0 0 30');path.setAttribute('fill','none');path.setAttribute('stroke','#e2e6e1');path.setAttribute('stroke-width','.7');pattern.append(path);const defsEl=document.createElementNS(NS,'defs');defsEl.append(pattern);clone.prepend(defsEl);const rect=document.createElementNS(NS,'rect');rect.setAttribute('width','600');rect.setAttribute('height','600');rect.setAttribute('fill','url(#grid)');clone.insertBefore(rect,clone.children[1]||null)}const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='もよう工房-作品.svg';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('作品を画像として保存したよ')};
render();
})();
