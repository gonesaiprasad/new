const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const overlay = document.getElementById('overlay');
const startBtn = document.getElementById('startBtn');
const scoreEl = document.getElementById('score');
const bestEl = document.getElementById('best');
const music = document.getElementById('music');
const soundBtn = document.getElementById('soundBtn');

const W = canvas.width, H = canvas.height;
const face = new Image();
face.src = 'assets/srikanth.jpg';
let running = false, ended = false, score = 0, best = Number(localStorage.getItem('flyingSrikanthBest') || 0);
let bird, pipes, frame = 0, raf = null, musicEnabled = true;
bestEl.textContent = best;

function reset() {
  score = 0; frame = 0; pipes = [];
  bird = {x:115, y:270, vy:0, r:24};
  scoreEl.textContent = '0';
  for(let i=0;i<3;i++) pipes.push({x:W+100+i*205, gapY:145+Math.random()*270, passed:false});
}
function start() {
  if(running) return;
  reset(); running = true; ended = false;
  overlay.classList.add('hidden');
  if(musicEnabled){ music.currentTime = 0; music.play().catch(()=>{}); }
  if(raf) cancelAnimationFrame(raf);
  loop();
}
function flap(){ if(running){ bird.vy = -5.2; } }
function gameOver(){
  running = false; ended = true; music.pause();
  if(score > best){best=score; localStorage.setItem('flyingSrikanthBest',best);bestEl.textContent=best;}
  document.getElementById('overlayEyebrow').textContent = 'FLIGHT STATUS: DOWN';
  document.getElementById('overlayTitle').textContent = 'Nadhi Lesthaledhu!';
  document.getElementById('overlayText').textContent = `Score: ${score}. Bro met the pipes. Try one more flight.`;
  startBtn.innerHTML = 'Restart Game <span>↻</span>';
  overlay.classList.remove('hidden');
}
function drawBackground(){
  const sky=ctx.createLinearGradient(0,0,0,H);sky.addColorStop(0,'#8de0ff');sky.addColorStop(1,'#e0f9ff');ctx.fillStyle=sky;ctx.fillRect(0,0,W,H);
  // distant clouds
  ctx.fillStyle='#ffffffb8';
  for(let i=0;i<4;i++){let x=((i*155-frame*.35)%(W+100)+W+100)%(W+100)-40;let y=80+i*65;ctx.beginPath();ctx.ellipse(x,y,34,13,0,0,Math.PI*2);ctx.ellipse(x+24,y-8,23,16,0,0,Math.PI*2);ctx.ellipse(x+45,y,29,12,0,0,Math.PI*2);ctx.fill();}
  // hills
  ctx.fillStyle='#83c94e';ctx.beginPath();ctx.moveTo(0,H-90);ctx.quadraticCurveTo(110,H-180,230,H-90);ctx.quadraticCurveTo(360,H-10,480,H-115);ctx.lineTo(480,H);ctx.lineTo(0,H);ctx.fill();
  ctx.fillStyle='#a5dc5b';ctx.beginPath();ctx.moveTo(0,H-55);ctx.quadraticCurveTo(160,H-140,300,H-60);ctx.quadraticCurveTo(390,H-20,480,H-75);ctx.lineTo(480,H);ctx.lineTo(0,H);ctx.fill();
  ctx.fillStyle='#dedb8b';ctx.fillRect(0,H-42,W,42);ctx.fillStyle='#b6a95b';ctx.fillRect(0,H-42,W,7);
  for(let x=-(frame*2%28);x<W;x+=28){ctx.fillStyle='#c6bc70';ctx.fillRect(x,H-24,13,5);}
}
function drawPipe(p){
  const gap=155, top=p.gapY-gap/2, bottom=p.gapY+gap/2, pw=66;
  ctx.fillStyle='#5ba92d';ctx.fillRect(p.x,0,pw,top);ctx.fillRect(p.x,bottom,pw,H-bottom-42);
  ctx.fillStyle='#8bd94b';ctx.fillRect(p.x+8,0,13,top);ctx.fillRect(p.x+8,bottom,13,H-bottom-42);
  ctx.fillStyle='#3c8426';ctx.fillRect(p.x-6,top-23,pw+12,23);ctx.fillRect(p.x-6,bottom,pw+12,23);
  ctx.fillStyle='#a3ed5b';ctx.fillRect(p.x+2,top-20,10,16);ctx.fillRect(p.x+2,bottom+3,10,16);
}
function drawBird(){
  ctx.save();ctx.translate(bird.x,bird.y);ctx.rotate(Math.max(-.35,Math.min(.75,bird.vy*.06)));
  ctx.beginPath();ctx.arc(0,0,bird.r+3,0,Math.PI*2);ctx.fillStyle='#fff';ctx.fill();
  ctx.save();ctx.beginPath();ctx.arc(0,0,bird.r,0,Math.PI*2);ctx.clip();
  if(face.complete && face.naturalWidth){ctx.drawImage(face, -bird.r,-bird.r,bird.r*2,bird.r*2);}
  else{ctx.fillStyle='#e7bd9a';ctx.fillRect(-bird.r,-bird.r,bird.r*2,bird.r*2);}
  ctx.restore();
  ctx.strokeStyle='#243b24';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,bird.r+1,0,Math.PI*2);ctx.stroke();
  ctx.restore();
}
function draw(){
  drawBackground();pipes.forEach(drawPipe);drawBird();
  ctx.fillStyle='#fff';ctx.strokeStyle='#244022';ctx.lineWidth=4;ctx.font='800 42px Baloo 2, sans-serif';ctx.textAlign='center';ctx.strokeText(score,W/2,62);ctx.fillText(score,W/2,62);
}
function loop(){
  if(!running)return;
  frame++;bird.vy+=.28;bird.y+=bird.vy;
  pipes.forEach(p=>{p.x-=2.6;if(!p.passed&&p.x+66<bird.x){p.passed=true;score++;scoreEl.textContent=score;}});
  if(pipes[pipes.length-1].x<W-180)pipes.push({x:W+20,gapY:135+Math.random()*290,passed:false});
  pipes=pipes.filter(p=>p.x>-90);
  const hitFloor=bird.y+bird.r>H-42, hitCeiling=bird.y-bird.r<0;
  const hitPipe=pipes.some(p=>bird.x+bird.r>p.x-5&&bird.x-bird.r<p.x+71&&(bird.y-bird.r<p.gapY-77.5||bird.y+bird.r>p.gapY+77.5));
  draw();
  if(hitFloor||hitCeiling||hitPipe){gameOver();draw();return;}
  raf=requestAnimationFrame(loop);
}
canvas.addEventListener('pointerdown',e=>{e.preventDefault();flap();});
window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(!running)start();else flap();}});
startBtn.addEventListener('click',start);
soundBtn.addEventListener('click',()=>{musicEnabled=!musicEnabled;soundBtn.textContent=musicEnabled?'♫ Music: On':'♫ Music: Off';if(!musicEnabled)music.pause();else if(running)music.play().catch(()=>{});});
reset();draw();
