const intro=document.querySelector('#intro'),canvas=document.querySelector('#code'),ctx=canvas.getContext('2d'),decode=document.querySelector('.decode');let introTimer,frame;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const logo=new Image();logo.src='assets/mec-vector.png';let pixels;const maskSize=216;
logo.onload=()=>{
  const c=document.createElement('canvas');c.width=c.height=maskSize;
  const x=c.getContext('2d');x.clearRect(0,0,maskSize,maskSize);
  const scale=Math.min(maskSize/logo.naturalWidth,maskSize/logo.naturalHeight);
  const width=logo.naturalWidth*scale,height=logo.naturalHeight*scale;
  x.drawImage(logo,(maskSize-width)/2,(maskSize-height)/2,width,height);
  pixels=x.getImageData(0,0,maskSize,maskSize).data;
};
function endIntro(){clearTimeout(introTimer);cancelAnimationFrame(frame);intro.classList.add('finished')}
function playIntro(){
  clearTimeout(introTimer);cancelAnimationFrame(frame);
  intro.classList.remove('finished');decode.classList.remove('resolved');
  document.querySelector('#decode-status').textContent='DECODIFICANDO LO IMPOSIBLE_';
  const start=performance.now();let last=0;
  function draw(now){
    const elapsed=now-start;
    const progress=Math.min(elapsed/3100,1);
    const eased=1-Math.pow(1-progress,3);
    if(now-last>52){
      last=now;ctx.fillStyle='#050505';ctx.fillRect(0,0,540,540);
      const cell=Math.max(10,Math.round(56-(46*eased)));
      ctx.font=`${Math.max(9,cell*.86)}px monospace`;
      ctx.textAlign='center';ctx.textBaseline='middle';
      for(let y=cell/2;y<540;y+=cell)for(let x=cell/2;x<540;x+=cell){
        const sx=Math.min(maskSize-1,Math.floor(x/540*maskSize));
        const sy=Math.min(maskSize-1,Math.floor(y/540*maskSize));
        const dark=pixels&&pixels[(sy*maskSize+sx)*4+3]>40;
        const reveal=progress>.78||Math.random()<(.14+eased*.86);
        const glyph='01<>/{}∆×:░'[Math.floor(Math.random()*11)];
        if(dark&&reveal){ctx.fillStyle=`rgba(255,56,46,${.36+eased*.64})`;ctx.fillText(glyph,x,y)}
        else if(Math.random()<(1-eased)*.12){ctx.fillStyle=`rgba(255,56,46,${.08+(1-eased)*.16})`;ctx.fillText(glyph,x,y)}
      }
    }
    if(elapsed<3100){frame=requestAnimationFrame(draw)}else{
      decode.classList.add('resolved');
      document.querySelector('#decode-status').textContent='CARGANDO...';
      introTimer=setTimeout(endIntro,3500);
    }
  }
  if(reduced){decode.classList.add('resolved');introTimer=setTimeout(endIntro,1800)}else{frame=requestAnimationFrame(draw)}
}
document.querySelector('#replay').addEventListener('click',playIntro);document.addEventListener('keydown',e=>{if(e.key==='Escape')endIntro()});playIntro();
const compare=document.querySelector('#compare'),range=document.querySelector('#comparison');function update(v){v=Math.max(0,Math.min(100,Math.round(v)));range.value=v;compare.style.setProperty('--split',v+'%');document.querySelector('#percentage').textContent=v+' / '+(100-v);range.setAttribute('aria-valuetext',v+' por ciento antes, '+(100-v)+' por ciento después')};range.addEventListener('input',()=>update(range.value));range.addEventListener('pointermove',e=>{if(e.pointerType==='mouse'||e.buttons){const r=compare.getBoundingClientRect();update((e.clientX-r.left)/r.width*100)}});range.addEventListener('pointerdown',e=>{const r=compare.getBoundingClientRect();update((e.clientX-r.left)/r.width*100)});
let videoUrl;const video=document.querySelector('#demo-video'),file=document.querySelector('#video-file');file.addEventListener('change',()=>{const f=file.files[0];if(!f)return;if(videoUrl)URL.revokeObjectURL(videoUrl);videoUrl=URL.createObjectURL(f);video.src=videoUrl;video.hidden=false;document.querySelector('#demo-prompt').hidden=true;document.querySelector('.demo-art').hidden=true;document.querySelector('#change-video').hidden=false;video.play().catch(()=>{})});document.querySelector('#change-video').addEventListener('click',()=>file.click());


const processGallery=document.querySelector('#process-gallery'),processSlides=[...processGallery.children],processPrev=document.querySelector('#process-prev'),processNext=document.querySelector('#process-next');let processIndex=0,requestedIndex=0,drag=null,scrollTimer;
processSlides.forEach((slide,i)=>slide.dataset.frame=String(i+1).padStart(2,'0'));
function slidePosition(i){return processSlides[i].offsetLeft-processSlides[0].offsetLeft}
function nearestSlide(){let best=0;processSlides.forEach((s,i)=>{if(Math.abs(slidePosition(i)-processGallery.scrollLeft)<Math.abs(slidePosition(best)-processGallery.scrollLeft))best=i});return best}
function syncProcess(){processIndex=nearestSlide();document.querySelector('#process-count').textContent=String(processIndex+1).padStart(2,'0')+' / 04';processPrev.disabled=processIndex===0;processNext.disabled=processIndex===3}
function moveProcess(i){requestedIndex=Math.max(0,Math.min(3,i));processGallery.scrollTo({left:slidePosition(requestedIndex),behavior:reduced?'instant':'smooth'})}
processPrev.addEventListener('click',()=>moveProcess(requestedIndex-1));processNext.addEventListener('click',()=>moveProcess(requestedIndex+1));
processGallery.addEventListener('scroll',()=>{syncProcess();clearTimeout(scrollTimer);scrollTimer=setTimeout(()=>{requestedIndex=nearestSlide()},160)},{passive:true});
processGallery.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();moveProcess(requestedIndex+(e.key==='ArrowRight'?1:-1))}});
processGallery.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;drag={x:e.clientX,left:processGallery.scrollLeft};processGallery.classList.add('is-dragging');processGallery.setPointerCapture(e.pointerId);processGallery.scrollTo({left:drag.left,behavior:'instant'});e.preventDefault()});
processGallery.addEventListener('pointermove',e=>{if(!drag)return;processGallery.scrollLeft=drag.left-(e.clientX-drag.x)});
function finishDrag(e){if(!drag)return;drag=null;const target=nearestSlide();processGallery.classList.remove('is-dragging');if(processGallery.hasPointerCapture(e.pointerId))processGallery.releasePointerCapture(e.pointerId);moveProcess(target)}
processGallery.addEventListener('pointerup',finishDrag);processGallery.addEventListener('pointercancel',finishDrag);
let galleryWidth=processGallery.clientWidth;new ResizeObserver(()=>{const w=processGallery.clientWidth;if(w===galleryWidth)return;galleryWidth=w;processGallery.scrollTo({left:slidePosition(processIndex),behavior:'instant'})}).observe(processGallery);syncProcess();
