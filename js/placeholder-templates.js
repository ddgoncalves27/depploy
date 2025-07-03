/**
 * Placeholder Templates for Random Deployments
 * These templates are used when creating new projects with random content
 */

export const placeholderTemplates = {
    comingSoon: [
        {
            name: "Cosmic Countdown",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Coming Soon</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#fff;font-family:system-ui;overflow:hidden}
.stars{position:fixed;width:100%;height:100%;top:0;left:0}
.star{position:absolute;width:2px;height:2px;background:#fff;border-radius:50%;animation:twinkle 3s infinite}
@keyframes twinkle{0%,100%{opacity:0}50%{opacity:1}}
h1{font-size:4rem;margin:0;text-shadow:0 0 20px rgba(255,255,255,0.5);z-index:1}
p{font-size:1.5rem;opacity:0.8;z-index:1}
.content{text-align:center;z-index:1}
</style></head><body>
<div class="stars" id="stars"></div>
<div class="content"><h1>Coming Soon</h1><p>Something amazing is on its way</p></div>
<script>
const s=document.getElementById('stars');
for(let i=0;i<100;i++){
  const star=document.createElement('div');
  star.className='star';
  star.style.left=Math.random()*100+'%';
  star.style.top=Math.random()*100+'%';
  star.style.animationDelay=Math.random()*3+'s';
  s.appendChild(star);
}
</` + `script></body></html>`
        },
        {
            name: "Neon Glow",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Coming Soon</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:system-ui}
h1{font-size:5rem;margin:0;color:#fff;text-transform:uppercase;letter-spacing:0.1em;animation:neon 2s ease-in-out infinite alternate}
@keyframes neon{
  from{text-shadow:0 0 10px #fff,0 0 20px #fff,0 0 30px #e60073,0 0 40px #e60073,0 0 50px #e60073,0 0 60px #e60073,0 0 70px #e60073}
  to{text-shadow:0 0 20px #fff,0 0 30px #ff4da6,0 0 40px #ff4da6,0 0 50px #ff4da6,0 0 60px #ff4da6,0 0 70px #ff4da6,0 0 80px #ff4da6}
}
</style></head><body><h1>Coming Soon</h1></body></html>`
        },
        {
            name: "Gradient Wave",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Coming Soon</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(-45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab);background-size:400% 400%;animation:gradient 15s ease infinite;font-family:system-ui;color:#fff}
@keyframes gradient{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
.container{text-align:center;padding:2rem;background:rgba(0,0,0,0.2);border-radius:20px;backdrop-filter:blur(10px)}
h1{font-size:3.5rem;margin:0 0 1rem;font-weight:800}
p{font-size:1.25rem;opacity:0.9}
</style></head><body>
<div class="container">
<h1>Coming Soon</h1>
<p>We're working on something special</p>
</div>
</body></html>`
        },
        {
            name: "Particles",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Coming Soon</title>
<style>
body{margin:0;height:100vh;background:#1a1a2e;color:#fff;font-family:system-ui;overflow:hidden;display:flex;align-items:center;justify-content:center}
canvas{position:fixed;top:0;left:0;width:100%;height:100%}
.content{position:relative;z-index:1;text-align:center}
h1{font-size:4rem;margin:0;background:linear-gradient(45deg,#f39c12,#e74c3c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
</style></head><body>
<canvas id="c"></canvas>
<div class="content"><h1>Coming Soon</h1><p>Launching something extraordinary</p></div>
<script>
const c=document.getElementById('c'),ctx=c.getContext('2d');
c.width=window.innerWidth;c.height=window.innerHeight;
const particles=[];
for(let i=0;i<100;i++){
  particles.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-0.5)*0.5,vy:(Math.random()-0.5)*0.5,r:Math.random()*2+1});
}
function draw(){
  ctx.fillStyle='rgba(26,26,46,0.05)';ctx.fillRect(0,0,c.width,c.height);
  ctx.fillStyle='#fff';
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;
    if(p.x<0||p.x>c.width)p.vx*=-1;
    if(p.y<0||p.y>c.height)p.vy*=-1;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill();
  });
  requestAnimationFrame(draw);
}
draw();
</` + `script></body></html>`
        }
    ],
    
    maintenance: [
        {
            name: "Circuit Board",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Maintenance Mode</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a1a;color:#00ff00;font-family:'Courier New',monospace;overflow:hidden}
.circuit{position:absolute;width:100%;height:100%;opacity:0.1;background-image:repeating-linear-gradient(0deg,transparent,transparent 50px,#00ff00 50px,#00ff00 51px),repeating-linear-gradient(90deg,transparent,transparent 50px,#00ff00 50px,#00ff00 51px)}
.terminal{background:#000;padding:2rem;border:2px solid #00ff00;border-radius:10px;box-shadow:0 0 20px #00ff00;text-align:center}
h1{margin:0;font-size:2rem}
.blink{animation:blink 1s infinite}
@keyframes blink{0%,50%{opacity:1}51%,100%{opacity:0}}
</style></head><body>
<div class="circuit"></div>
<div class="terminal">
<h1>SYSTEM MAINTENANCE</h1>
<p>Running diagnostics<span class="blink">_</span></p>
</div></body></html>`
        },
        {
            name: "Gear Works",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Maintenance</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#2c3e50;color:#ecf0f1;font-family:system-ui}
.gear{position:absolute;width:100px;height:100px;animation:spin 4s linear infinite}
.gear svg{width:100%;height:100%;fill:#34495e}
.gear:nth-child(2){width:70px;height:70px;top:45%;left:55%;animation-direction:reverse;animation-duration:3s}
@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
.content{position:relative;z-index:10;text-align:center;background:rgba(44,62,80,0.9);padding:3rem;border-radius:20px}
h1{margin:0 0 1rem;font-size:2.5rem}
</style></head><body>
<div class="gear"><svg viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/></svg></div>
<div class="gear"><svg viewBox="0 0 24 24"><path d="M12,15.5A3.5,3.5 0 0,1 8.5,12A3.5,3.5 0 0,1 12,8.5A3.5,3.5 0 0,1 15.5,12A3.5,3.5 0 0,1 12,15.5M19.43,12.97C19.47,12.65 19.5,12.33 19.5,12C19.5,11.67 19.47,11.34 19.43,11L21.54,9.37C21.73,9.22 21.78,8.95 21.66,8.73L19.66,5.27C19.54,5.05 19.27,4.96 19.05,5.05L16.56,6.05C16.04,5.66 15.5,5.32 14.87,5.07L14.5,2.42C14.46,2.18 14.25,2 14,2H10C9.75,2 9.54,2.18 9.5,2.42L9.13,5.07C8.5,5.32 7.96,5.66 7.44,6.05L4.95,5.05C4.73,4.96 4.46,5.05 4.34,5.27L2.34,8.73C2.21,8.95 2.27,9.22 2.46,9.37L4.57,11C4.53,11.34 4.5,11.67 4.5,12C4.5,12.33 4.53,12.65 4.57,12.97L2.46,14.63C2.27,14.78 2.21,15.05 2.34,15.27L4.34,18.73C4.46,18.95 4.73,19.03 4.95,18.95L7.44,17.94C7.96,18.34 8.5,18.68 9.13,18.93L9.5,21.58C9.54,21.82 9.75,22 10,22H14C14.25,22 14.46,21.82 14.5,21.58L14.87,18.93C15.5,18.67 16.04,18.34 16.56,17.94L19.05,18.95C19.27,19.03 19.54,18.95 19.66,18.73L21.66,15.27C21.78,15.05 21.73,14.78 21.54,14.63L19.43,12.97Z"/></svg></div>
<div class="content">
<h1>Under Maintenance</h1>
<p>We'll be back shortly</p>
</div></body></html>`
        },
        {
            name: "Progress Bar",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Maintenance</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#1e272e;color:#fff;font-family:system-ui}
.container{text-align:center;max-width:500px;padding:2rem}
h1{font-size:3rem;margin:0 0 1rem}
.progress{width:100%;height:8px;background:#485460;border-radius:10px;overflow:hidden;margin:2rem 0}
.progress-bar{height:100%;background:linear-gradient(90deg,#4834d4,#686de0);animation:load 3s ease-in-out infinite}
@keyframes load{0%{width:0%}50%{width:80%}100%{width:100%}}
</style></head><body>
<div class="container">
<h1>Maintenance Mode</h1>
<p>We're upgrading our systems to serve you better</p>
<div class="progress"><div class="progress-bar"></div></div>
<p style="opacity:0.7;font-size:0.9rem">This won't take long...</p>
</div></body></html>`
        }
    ],
    
    error404: [
        {
            name: "Space Lost",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 - Lost in Space</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-family:system-ui;overflow:hidden}
.astronaut{font-size:5rem;animation:float 6s ease-in-out infinite}
@keyframes float{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-20px) rotate(5deg)}}
.content{text-align:center;z-index:1}
h1{font-size:8rem;margin:0;background:linear-gradient(45deg,#f093fb,#f5576c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
</style></head><body>
<div class="content">
<div class="astronaut">👨‍🚀</div>
<h1>404</h1>
<p>Houston, we have a problem</p>
</div></body></html>`
        },
        {
            name: "Glitch Effect",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 Error</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#000;color:#fff;font-family:monospace}
h1{font-size:8rem;margin:0;position:relative;font-weight:700}
h1::before,h1::after{content:'404';position:absolute;top:0;left:0;width:100%;height:100%}
h1::before{animation:glitch1 0.5s infinite;color:#0ff;z-index:-1}
h1::after{animation:glitch2 0.5s infinite;color:#f0f;z-index:-2}
@keyframes glitch1{0%{clip:rect(44px,450px,56px,0)}20%{clip:rect(24px,450px,16px,0)}40%{clip:rect(4px,450px,66px,0)}60%{clip:rect(34px,450px,46px,0)}80%{clip:rect(14px,450px,76px,0)}100%{clip:rect(54px,450px,26px,0)}}
@keyframes glitch2{0%{clip:rect(65px,450px,35px,0)}20%{clip:rect(15px,450px,85px,0)}40%{clip:rect(75px,450px,25px,0)}60%{clip:rect(5px,450px,95px,0)}80%{clip:rect(45px,450px,55px,0)}100%{clip:rect(25px,450px,75px,0)}}
</style></head><body>
<div style="text-align:center">
<h1>404</h1>
<p style="font-size:1.5rem">Page not found</p>
</div></body></html>`
        },
        {
            name: "Desert Wanderer",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>404 - Lost</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(to bottom,#ff6b6b 0%,#ffd93d 100%);font-family:system-ui;color:#2d3436}
.scene{text-align:center;position:relative}
.cactus{font-size:6rem;margin:0}
h1{font-size:6rem;margin:0;font-weight:900}
.shadow{width:150px;height:20px;background:rgba(0,0,0,0.2);border-radius:50%;margin:0 auto;animation:pulse 2s ease-in-out infinite}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
</style></head><body>
<div class="scene">
<div class="cactus">🌵</div>
<h1>404</h1>
<p style="font-size:1.5rem;margin:1rem 0">Looks like you're lost in the desert</p>
<div class="shadow"></div>
</div></body></html>`
        }
    ],
    
    construction: [
        {
            name: "Building Blocks",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Under Construction</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#f5f3f0;font-family:system-ui}
.construction{text-align:center}
.emoji{font-size:5rem;animation:swing 2s ease-in-out infinite}
@keyframes swing{0%,100%{transform:rotate(-5deg)}50%{transform:rotate(5deg)}}
h1{font-size:3rem;color:#2d3436;margin:1rem 0}
.blocks{display:flex;justify-content:center;gap:0.5rem;margin:2rem 0}
.block{width:40px;height:40px;background:#ff6348;animation:build 1.5s ease-in-out infinite}
.block:nth-child(2){animation-delay:0.2s;background:#4ecdc4}
.block:nth-child(3){animation-delay:0.4s;background:#45b7d1}
@keyframes build{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px)}}
</style></head><body>
<div class="construction">
<div class="emoji">🏗️</div>
<h1>Under Construction</h1>
<div class="blocks">
<div class="block"></div>
<div class="block"></div>
<div class="block"></div>
</div>
<p>We're building something awesome!</p>
</div></body></html>`
        },
        {
            name: "Hard Hat Zone",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Construction Zone</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#ffd32c;font-family:system-ui;color:#2d3436}
.zone{text-align:center;padding:2rem}
.warning{background:#2d3436;color:#ffd32c;display:inline-block;padding:1rem 2rem;transform:rotate(-2deg);font-weight:bold;font-size:1.5rem;margin-bottom:2rem}
.helmet{font-size:6rem;animation:bounce 2s infinite}
@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
h1{font-size:2.5rem;margin:1rem 0}
.stripes{height:20px;background:repeating-linear-gradient(45deg,#2d3436,#2d3436 10px,#ffd32c 10px,#ffd32c 20px);margin:2rem 0}
</style></head><body>
<div class="zone">
<div class="warning">⚠️ CONSTRUCTION ZONE ⚠️</div>
<div class="helmet">👷</div>
<h1>Pardon Our Dust</h1>
<p>We're making improvements!</p>
<div class="stripes"></div>
</div></body></html>`
        }
    ],
    
    loading: [
        {
            name: "Pulse Dots",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Loading...</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#667eea;font-family:system-ui}
.loader{display:flex;gap:1rem}
.dot{width:20px;height:20px;background:#fff;border-radius:50%;animation:pulse 1.4s ease-in-out infinite}
.dot:nth-child(2){animation-delay:0.2s}
.dot:nth-child(3){animation-delay:0.4s}
@keyframes pulse{0%,80%,100%{transform:scale(0);opacity:0.5}40%{transform:scale(1);opacity:1}}
h2{position:absolute;bottom:30%;color:#fff;font-weight:300}
</style></head><body>
<div>
<div class="loader">
<div class="dot"></div>
<div class="dot"></div>
<div class="dot"></div>
</div>
<h2>Loading...</h2>
</div></body></html>`
        },
        {
            name: "Infinity Spinner",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Loading</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a2e;font-family:system-ui;color:#fff}
.infinity{position:relative;width:120px;height:60px}
.infinity:before,.infinity:after{content:'';position:absolute;top:0;left:0;width:50px;height:50px;border-radius:50%;border:5px solid #0f4c75}
.infinity:before{animation:orbit1 2s linear infinite}
.infinity:after{left:60px;animation:orbit2 2s linear infinite}
@keyframes orbit1{0%{transform:rotate(0deg) translateX(30px) rotate(0deg)}100%{transform:rotate(360deg) translateX(30px) rotate(-360deg)}}
@keyframes orbit2{0%{transform:rotate(180deg) translateX(30px) rotate(-180deg)}100%{transform:rotate(540deg) translateX(30px) rotate(-540deg)}}
p{position:absolute;bottom:25%;width:100%;text-align:center;opacity:0.8}
</style></head><body>
<div>
<div class="infinity"></div>
<p>Please wait...</p>
</div></body></html>`
        }
    ],
    
    offline: [
        {
            name: "No Signal",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#2c3e50;font-family:system-ui;color:#ecf0f1}
.offline{text-align:center}
.icon{font-size:6rem;margin-bottom:1rem;filter:grayscale(1)}
h1{font-size:3rem;margin:0.5rem 0}
.bars{display:flex;justify-content:center;gap:4px;margin:2rem 0}
.bar{width:8px;height:40px;background:#7f8c8d;border-radius:4px}
.bar:nth-child(1){height:10px}
.bar:nth-child(2){height:20px}
.bar:nth-child(3){height:15px}
.bar:nth-child(4){height:25px}
.bar:nth-child(5){height:5px}
</style></head><body>
<div class="offline">
<div class="icon">📡</div>
<h1>Offline</h1>
<div class="bars">
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
<div class="bar"></div>
</div>
<p>Check your internet connection</p>
</div></body></html>`
        },
        {
            name: "Cloud Disconnect",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Offline</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);font-family:system-ui;color:#fff}
.cloud{font-size:8rem;position:relative;animation:drift 4s ease-in-out infinite}
.cloud::after{content:'❌';position:absolute;bottom:0;right:0;font-size:3rem}
@keyframes drift{0%,100%{transform:translateX(0)}50%{transform:translateX(20px)}}
h1{font-size:3rem;margin:1rem 0}
button{padding:1rem 2rem;font-size:1rem;background:#fff;color:#667eea;border:none;border-radius:30px;cursor:pointer;margin-top:1rem}
button:hover{transform:scale(1.05)}
</style></head><body>
<div style="text-align:center">
<div class="cloud">☁️</div>
<h1>You're Offline</h1>
<p>Unable to connect to the server</p>
<button onclick="location.reload()">Try Again</button>
</div></body></html>`
        }
    ],
    
    beta: [
        {
            name: "Beta Lab",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Beta Version</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0f0f0f;font-family:system-ui;color:#fff;overflow:hidden}
.lab{text-align:center;position:relative;z-index:10}
.flask{font-size:6rem;animation:bubble 3s ease-in-out infinite}
@keyframes bubble{0%,100%{transform:translateY(0) rotate(-5deg)}50%{transform:translateY(-10px) rotate(5deg)}}
h1{font-size:3rem;margin:1rem 0;background:linear-gradient(45deg,#00d2ff,#3a7bd5);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.badge{display:inline-block;padding:0.5rem 1rem;background:rgba(0,210,255,0.2);border:1px solid #00d2ff;border-radius:20px;font-size:0.875rem;margin-top:1rem}
.particles{position:fixed;width:100%;height:100%;top:0;left:0;z-index:1}
.particle{position:absolute;width:4px;height:4px;background:#00d2ff;border-radius:50%;animation:rise 10s linear infinite}
@keyframes rise{from{transform:translateY(100vh)}to{transform:translateY(-100px)}}
</style></head><body>
<div class="particles" id="particles"></div>
<div class="lab">
<div class="flask">🧪</div>
<h1>Beta Version</h1>
<p>Experimenting with new features</p>
<div class="badge">v0.1.0-beta</div>
</div>
<script>
const p=document.getElementById('particles');
for(let i=0;i<50;i++){
  const particle=document.createElement('div');
  particle.className='particle';
  particle.style.left=Math.random()*100+'%';
  particle.style.animationDelay=Math.random()*10+'s';
  particle.style.animationDuration=(Math.random()*10+10)+'s';
  p.appendChild(particle);
}
</` + `script></body></html>`
        },
        {
            name: "Neon Beta",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Beta</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0a0a0a;font-family:system-ui;color:#fff}
.container{text-align:center;padding:3rem;border:2px solid #ff00ff;border-radius:20px;box-shadow:0 0 40px #ff00ff,inset 0 0 40px rgba(255,0,255,0.1)}
h1{font-size:4rem;margin:0;text-transform:uppercase;letter-spacing:0.2em;animation:glow 2s ease-in-out infinite}
@keyframes glow{0%,100%{text-shadow:0 0 10px #ff00ff,0 0 20px #ff00ff,0 0 30px #ff00ff}50%{text-shadow:0 0 20px #ff00ff,0 0 30px #ff00ff,0 0 40px #ff00ff}}
.beta{display:inline-block;padding:0.5rem 1.5rem;background:#ff00ff;color:#0a0a0a;font-weight:bold;transform:skew(-10deg);margin:1rem 0}
</style></head><body>
<div class="container">
<h1>BETA</h1>
<div class="beta">TESTING PHASE</div>
<p>Early access preview</p>
</div></body></html>`
        }
    ],
    
    scheduled: [
        {
            name: "Calendar Event",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Scheduled Launch</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,#667eea,#764ba2);font-family:system-ui;color:#fff}
.calendar{text-align:center}
.date-box{background:#fff;color:#667eea;width:200px;margin:0 auto 2rem;border-radius:20px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.3)}
.month{background:#764ba2;padding:1rem;font-weight:bold;text-transform:uppercase;color:#fff}
.day{font-size:4rem;font-weight:900;padding:2rem}
h1{font-size:2.5rem;margin:1rem 0}
.time{font-size:1.5rem;opacity:0.9;margin-top:1rem}
</style></head><body>
<div class="calendar">
<div class="date-box">
<div class="month">Coming Soon</div>
<div class="day">?</div>
</div>
<h1>Mark Your Calendar</h1>
<p>Something special is launching</p>
<div class="time">Stay tuned for the big reveal</div>
</div></body></html>`
        },
        {
            name: "Countdown Timer",
            html: `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>Launching Soon</title>
<style>
body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#1a1a2e;font-family:system-ui;color:#fff}
.timer{text-align:center}
h1{font-size:3rem;margin-bottom:3rem;background:linear-gradient(45deg,#f093fb,#f5576c);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.countdown{display:flex;gap:2rem;justify-content:center}
.time-block{text-align:center}
.number{font-size:4rem;font-weight:bold;background:#16213e;padding:1rem 2rem;border-radius:10px;box-shadow:0 5px 20px rgba(0,0,0,0.3);min-width:100px}
.label{font-size:0.875rem;text-transform:uppercase;margin-top:0.5rem;opacity:0.7}
</style></head><body>
<div class="timer">
<h1>Launching Soon</h1>
<div class="countdown">
<div class="time-block">
<div class="number">00</div>
<div class="label">Days</div>
</div>
<div class="time-block">
<div class="number">00</div>
<div class="label">Hours</div>
</div>
<div class="time-block">
<div class="number">00</div>
<div class="label">Minutes</div>
</div>
</div>
</div></body></html>`
        }
    ]
};

/**
 * Get a random template from all categories
 * @returns {Object} Template object with category, name, and html
 */
export function getRandomPlaceholderTemplate() {
    const categories = Object.keys(placeholderTemplates);
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const templates = placeholderTemplates[randomCategory];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
        category: randomCategory,
        name: randomTemplate.name,
        html: randomTemplate.html
    };
}

/**
 * Get a random template from a specific category
 * @param {string} category - Category name
 * @returns {Object|null} Template object or null if category doesn't exist
 */
export function getRandomTemplateByCategory(category) {
    if (!placeholderTemplates[category]) {
        return null;
    }
    
    const templates = placeholderTemplates[category];
    const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
    
    return {
        category: category,
        name: randomTemplate.name,
        html: randomTemplate.html
    };
}

/**
 * Get all available categories
 * @returns {Array} Array of category names
 */
export function getTemplateCategories() {
    return Object.keys(placeholderTemplates);
}

/**
 * Get all templates for a specific category
 * @param {string} category - Category name
 * @returns {Array|null} Array of templates or null if category doesn't exist
 */
export function getTemplatesByCategory(category) {
    return placeholderTemplates[category] || null;
}

/**
 * Get category display names
 * @returns {Object} Mapping of category keys to display names
 */
export function getCategoryDisplayNames() {
    return {
        comingSoon: '🚀 Coming Soon',
        maintenance: '🔧 Maintenance',
        error404: '👾 404 Page',
        construction: '🏗️ Construction',
        loading: '⏳ Loading',
        offline: '🌊 Offline',
        beta: '✨ Beta',
        scheduled: '🕐 Scheduled'
    };
}