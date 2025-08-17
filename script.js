(function(){
  const audio   = document.getElementById('anthem');
  const flag    = document.getElementById('flag');
  const pole    = document.getElementById('pole');
  const playBtn = document.getElementById('playBtn');
  const pauseBtn= document.getElementById('pauseBtn');
  const stopBtn = document.getElementById('stopBtn');
  const clock   = document.getElementById('clock');

  let rafId = null;
  let maxY = 0;
  const bottomPad = 18;

  function formatTime(t){
    if(!isFinite(t)) return "00:00";
    const m = Math.floor(t/60).toString().padStart(2,'0');
    const s = Math.floor(t%60).toString().padStart(2,'0');
    return `${m}:${s}`;
  }

  function updateClock(){
    clock.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration || 0)}`;
  }

  function computeMaxY(){
    const poleH = pole.clientHeight;
    const flagH = flag.clientHeight;
    maxY = Math.max(0, poleH - flagH - bottomPad);
  }

  function setFlagByProgress(p){
    const y = (1 - p) * maxY;
    flag.style.setProperty('--y', `${y}px`);
    flag.style.transform = `translate(16px, ${y}px)`;
  }

  function tick(){
    updateClock();
    const dur = audio.duration || 0;
    const cur = audio.currentTime || 0;
    const p = dur > 0 ? Math.min(1, Math.max(0, cur / dur)) : 0;
    setFlagByProgress(p);
    rafId = requestAnimationFrame(tick);
  }

  function startRAF(){
    if(rafId == null) rafId = requestAnimationFrame(tick);
    document.querySelector('.field').classList.add('fluttering');
  }
  function stopRAF(){
    if(rafId != null){ cancelAnimationFrame(rafId); rafId = null; }
    document.querySelector('.field').classList.remove('fluttering');
  }

  function play(){
    computeMaxY();
    audio.play().then(()=>{
      playBtn.disabled = true;
      pauseBtn.disabled = false;
      stopBtn.disabled = false;
      startRAF();
    }).catch(err=>{
      alert('Tidak bisa autoplay. Tekan tombol lagi atau cek file audio.');
    });
  }

  function pause(){
    audio.pause();
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = false;
  }

  function stop(){
    audio.pause();
    audio.currentTime = 0;
    updateClock();
    computeMaxY();
    setFlagByProgress(0);
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    stopRAF();
  }

  playBtn.addEventListener('click', play);
  pauseBtn.addEventListener('click', pause);
  stopBtn.addEventListener('click', stop);

  audio.addEventListener('loadedmetadata', ()=>{
    computeMaxY();
    setFlagByProgress(0);
    updateClock();
  });

  audio.addEventListener('ended', ()=>{
    setFlagByProgress(1);
    playBtn.disabled = false;
    pauseBtn.disabled = true;
    stopBtn.disabled = true;
    stopRAF();
  });

  window.addEventListener('resize', ()=>{
    const prevP = (audio.duration>0) ? (audio.currentTime / audio.duration) : 0;
    computeMaxY();
    setFlagByProgress(prevP);
  });

  computeMaxY();
  setFlagByProgress(0);
  updateClock();
})();
