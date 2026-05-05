import { useState, useRef, useEffect, useCallback } from "react";

const css = `
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700;900&family=Rajdhani:wght@300;400;500;600&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root {
  --netlify: #00c853;
  --netlify-bright: #00e676;
  --netlify-glow: #69ff9b;
  --netlify-dim: #00792f;
  --netlify-deep: #002914;
  --bg: #020c05;
  --bg2: #041008;
  --surface: #07180b;
  --surface2: #0a2211;
  --border: rgba(0,200,83,0.18);
  --border-bright: rgba(0,230,118,0.4);
  --text: #d4f5dc;
  --muted: #3d9e5a;
  --radius: 18px;
}

html,body,#root{height:100%;width:100%;overflow:hidden;}
body{background:var(--bg);color:var(--text);font-family:'Rajdhani',sans-serif;touch-action:manipulation;-webkit-tap-highlight-color:transparent;}

/* SCANLINE OVERLAY */
body::after{content:'';position:fixed;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,255,100,0.012) 2px,rgba(0,255,100,0.012) 4px);z-index:999;}

.app{
  max-width:420px;
  margin:0 auto;
  height:100vh;
  height:100dvh;
  display:flex;
  flex-direction:column;
  background: radial-gradient(ellipse at 50% 0%, #092e14 0%, var(--bg) 70%);
  position:relative;
  overflow:hidden;
}

/* GRID BG */
.app::before{
  content:'';
  position:absolute;
  inset:0;
  background-image: linear-gradient(rgba(0,200,83,0.04) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0,200,83,0.04) 1px, transparent 1px);
  background-size: 32px 32px;
  pointer-events:none;
  z-index:0;
}

/* TOP BAR */
.topbar{
  position:relative;
  z-index:10;
  display:flex;
  align-items:center;
  justify-content:space-between;
  padding:16px 20px 10px;
}
.logo{font-family:'Orbitron',monospace;font-weight:900;font-size:22px;letter-spacing:4px;color:var(--netlify-bright);text-shadow:0 0 20px var(--netlify),0 0 40px rgba(0,200,83,0.5);}
.logo span{color:var(--netlify-glow);}
.topbar-right{display:flex;align-items:center;gap:10px;}
.time-chip{font-family:'Orbitron',monospace;font-size:11px;color:var(--muted);letter-spacing:2px;}

/* VISUALIZER */
.viz-wrap{
  position:relative;
  z-index:10;
  height:80px;
  display:flex;
  align-items:flex-end;
  justify-content:center;
  gap:3px;
  padding:0 24px;
  margin-bottom:4px;
}
.viz-bar{
  flex:1;
  max-width:10px;
  border-radius:3px 3px 0 0;
  background:linear-gradient(to top, var(--netlify), var(--netlify-bright));
  box-shadow:0 0 6px var(--netlify);
  transition:height 0.08s ease;
  transform-origin:bottom;
}

/* ALBUM ART */
.art-section{
  position:relative;
  z-index:10;
  display:flex;
  justify-content:center;
  padding:0 32px;
  margin-bottom:16px;
}
.art-outer{
  width:200px;height:200px;
  border-radius:50%;
  padding:3px;
  background:conic-gradient(from 0deg, var(--netlify), var(--netlify-bright), var(--netlify-glow), var(--netlify-dim), var(--netlify));
  box-shadow:0 0 40px rgba(0,200,83,0.4), 0 0 80px rgba(0,200,83,0.15), inset 0 0 20px rgba(0,0,0,0.5);
  animation:spin-ring 8s linear infinite;
  animation-play-state:paused;
}
.art-outer.playing{animation-play-state:running;}
@keyframes spin-ring{to{transform:rotate(360deg);}}
.art-inner{
  width:100%;height:100%;
  border-radius:50%;
  background:var(--surface);
  display:flex;align-items:center;justify-content:center;
  overflow:hidden;
  border:2px solid var(--bg);
}
.art-inner img{width:100%;height:100%;object-fit:cover;border-radius:50%;}
.art-placeholder{
  display:flex;flex-direction:column;align-items:center;gap:6px;
}
.art-icon{font-size:48px;filter:drop-shadow(0 0 12px var(--netlify));}
.art-label{font-size:10px;color:var(--muted);letter-spacing:3px;font-family:'Orbitron',monospace;}
/* vinyl hole */
.art-hole{
  position:absolute;
  width:20px;height:20px;
  border-radius:50%;
  background:var(--bg);
  border:2px solid var(--border-bright);
  box-shadow:0 0 8px var(--netlify);
  z-index:2;
}

/* TRACK INFO */
.track-info{
  position:relative;
  z-index:10;
  text-align:center;
  padding:0 28px;
  margin-bottom:14px;
}
.track-name{
  font-family:'Orbitron',monospace;
  font-size:17px;
  font-weight:700;
  letter-spacing:2px;
  color:var(--netlify-bright);
  text-shadow:0 0 16px rgba(0,230,118,0.6);
  white-space:nowrap;
  overflow:hidden;
  text-overflow:ellipsis;
  margin-bottom:4px;
}
.track-artist{font-size:14px;color:var(--muted);letter-spacing:1.5px;}
.track-meta{display:flex;align-items:center;justify-content:center;gap:12px;margin-top:8px;}
.meta-chip{background:var(--surface2);border:1px solid var(--border);border-radius:20px;padding:3px 10px;font-size:11px;color:var(--netlify);letter-spacing:1px;font-family:'Orbitron',monospace;}

/* PROGRESS */
.progress-wrap{
  position:relative;
  z-index:10;
  padding:0 24px;
  margin-bottom:10px;
}
.progress-times{display:flex;justify-content:space-between;font-family:'Orbitron',monospace;font-size:10px;color:var(--muted);letter-spacing:1px;margin-bottom:6px;}
.progress-track{
  height:4px;
  background:var(--surface2);
  border-radius:2px;
  cursor:pointer;
  position:relative;
  overflow:visible;
}
.progress-fill{
  height:100%;
  border-radius:2px;
  background:linear-gradient(90deg, var(--netlify-dim), var(--netlify-bright));
  box-shadow:0 0 10px var(--netlify);
  position:relative;
  transition:width 0.3s linear;
}
.progress-fill::after{
  content:'';
  position:absolute;
  right:-5px;top:50%;transform:translateY(-50%);
  width:10px;height:10px;
  border-radius:50%;
  background:var(--netlify-glow);
  box-shadow:0 0 12px var(--netlify-bright), 0 0 24px var(--netlify);
}

/* CONTROLS */
.controls{
  position:relative;
  z-index:10;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:20px;
  padding:4px 24px 10px;
}
.ctrl-btn{
  background:transparent;border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  color:var(--muted);transition:all 0.2s;
  padding:8px;border-radius:50%;
  -webkit-tap-highlight-color:transparent;
}
.ctrl-btn:hover{color:var(--netlify-bright);}
.ctrl-btn.active{color:var(--netlify-glow);}
.ctrl-btn svg{width:22px;height:22px;}
.ctrl-btn.sm svg{width:18px;height:18px;}

.play-btn{
  width:68px;height:68px;
  border-radius:50%;
  background:linear-gradient(135deg, var(--netlify), var(--netlify-bright));
  border:none;cursor:pointer;
  display:flex;align-items:center;justify-content:center;
  box-shadow:0 0 30px rgba(0,200,83,0.6), 0 0 60px rgba(0,200,83,0.2);
  transition:all 0.15s;
  color:#001a0a;
  -webkit-tap-highlight-color:transparent;
  position:relative;
}
.play-btn::before{
  content:'';
  position:absolute;inset:-3px;
  border-radius:50%;
  background:conic-gradient(var(--netlify-glow), transparent 60%, var(--netlify-glow));
  animation:play-ring 2s linear infinite;
  animation-play-state:paused;
  opacity:0;
  transition:opacity 0.3s;
}
.play-btn.playing::before{animation-play-state:running;opacity:1;}
@keyframes play-ring{to{transform:rotate(360deg);}}
.play-btn:active{transform:scale(0.94);}
.play-btn svg{width:28px;height:28px;position:relative;z-index:1;}

/* VOLUME */
.volume-row{
  position:relative;z-index:10;
  display:flex;align-items:center;gap:10px;
  padding:0 24px 6px;
}
.vol-icon{color:var(--muted);font-size:16px;}
.vol-track{flex:1;height:3px;background:var(--surface2);border-radius:2px;cursor:pointer;position:relative;}
.vol-fill{height:100%;border-radius:2px;background:linear-gradient(90deg,var(--netlify-dim),var(--netlify));box-shadow:0 0 6px var(--netlify);}

/* QUEUE / LIBRARY */
.bottom-tabs{
  position:relative;z-index:10;
  display:flex;
  border-top:1px solid var(--border);
  background:rgba(4,18,16,0.8);
  backdrop-filter:blur(10px);
}
.btab{flex:1;padding:10px 4px 6px;display:flex;flex-direction:column;align-items:center;gap:3px;cursor:pointer;border:none;background:transparent;color:var(--muted);transition:color 0.2s;font-family:'Rajdhani',sans-serif;font-size:11px;letter-spacing:1px;}
.btab.active{color:var(--netlify-bright);}
.btab svg{width:20px;height:20px;}
.btab-line{width:20px;height:2px;border-radius:1px;background:var(--netlify-bright);opacity:0;transition:opacity 0.2s;margin-top:3px;}
.btab.active .btab-line{opacity:1;}

/* LIBRARY PANEL */
.panel{
  position:relative;z-index:10;
  flex:1;
  overflow-y:auto;
  padding:0 16px 8px;
  display:none;
}
.panel.visible{display:block;}
.panel::-webkit-scrollbar{width:3px;}
.panel::-webkit-scrollbar-track{background:transparent;}
.panel::-webkit-scrollbar-thumb{background:var(--netlify-dim);border-radius:2px;}

.panel-head{display:flex;align-items:center;justify-content:space-between;padding:12px 0 10px;}
.panel-title{font-family:'Orbitron',monospace;font-size:13px;letter-spacing:2px;color:var(--netlify-bright);}
.panel-count{font-size:12px;color:var(--muted);}

.search-bar{
  display:flex;align-items:center;gap:8px;
  background:var(--surface2);
  border:1px solid var(--border);
  border-radius:10px;
  padding:8px 12px;
  margin-bottom:12px;
}
.search-bar input{
  flex:1;background:transparent;border:none;outline:none;
  font-family:'Rajdhani',sans-serif;font-size:14px;
  color:var(--text);letter-spacing:0.5px;
}
.search-bar input::placeholder{color:var(--muted);}
.search-bar svg{width:16px;height:16px;color:var(--muted);flex-shrink:0;}

.track-row{
  display:flex;align-items:center;gap:12px;
  padding:10px 12px;
  border-radius:10px;
  cursor:pointer;
  transition:all 0.15s;
  border:1px solid transparent;
  margin-bottom:4px;
}
.track-row:hover{background:var(--surface2);border-color:var(--border);}
.track-row.playing-row{background:rgba(0,200,83,0.08);border-color:rgba(0,200,83,0.3);}
.tr-num{font-family:'Orbitron',monospace;font-size:11px;color:var(--muted);width:20px;text-align:center;flex-shrink:0;}
.tr-num.playing-num{color:var(--netlify-bright);}
.tr-art{width:38px;height:38px;border-radius:8px;background:var(--surface);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:18px;border:1px solid var(--border);overflow:hidden;}
.tr-art img{width:100%;height:100%;object-fit:cover;}
.tr-info{flex:1;min-width:0;}
.tr-name{font-size:14px;font-weight:600;letter-spacing:0.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tr-name.playing-name{color:var(--netlify-bright);}
.tr-artist{font-size:12px;color:var(--muted);letter-spacing:0.5px;}
.tr-dur{font-family:'Orbitron',monospace;font-size:11px;color:var(--muted);flex-shrink:0;}
.tr-eq{display:flex;gap:2px;align-items:flex-end;height:16px;flex-shrink:0;}
.tr-eq-bar{width:3px;border-radius:1px;background:var(--netlify-bright);animation:eq-bar 0.6s ease-in-out infinite alternate;}
.tr-eq-bar:nth-child(2){animation-delay:0.2s;height:60%;}
.tr-eq-bar:nth-child(3){animation-delay:0.1s;height:80%;}
@keyframes eq-bar{0%{height:30%;}100%{height:100%;}}

/* UPLOAD ZONE */
.upload-zone{
  border:2px dashed var(--border-bright);
  border-radius:14px;
  padding:24px;
  text-align:center;
  cursor:pointer;
  transition:all 0.2s;
  margin-bottom:14px;
  background:rgba(0,200,83,0.02);
}
.upload-zone:hover,.upload-zone.drag{background:rgba(0,200,83,0.06);border-color:var(--netlify-glow);}
.upload-icon{font-size:32px;margin-bottom:8px;display:block;filter:drop-shadow(0 0 8px var(--netlify));}
.upload-text{font-family:'Orbitron',monospace;font-size:12px;color:var(--netlify);letter-spacing:1.5px;margin-bottom:4px;}
.upload-sub{font-size:12px;color:var(--muted);}

/* EMPTY */
.empty{text-align:center;padding:40px 20px;color:var(--muted);}
.empty-icon{font-size:40px;display:block;margin-bottom:12px;opacity:0.5;}
.empty-text{font-size:13px;letter-spacing:1px;line-height:1.8;}

/* TOAST */
.toast{
  position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);
  background:var(--surface2);border:1px solid var(--border-bright);
  border-radius:20px;padding:10px 20px;
  font-family:'Orbitron',monospace;font-size:12px;color:var(--netlify-bright);
  box-shadow:0 0 20px rgba(0,200,83,0.3);
  z-index:500;opacity:0;transition:all 0.3s;pointer-events:none;
  white-space:nowrap;
}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0);}

/* REPEAT/SHUFFLE on */
.ctrl-btn.on{color:var(--netlify-bright);}
.ctrl-btn.on svg{filter:drop-shadow(0 0 4px var(--netlify));}

/* Pulsing glow when playing */
@keyframes glow-pulse{0%,100%{box-shadow:0 0 30px rgba(0,200,83,0.6),0 0 60px rgba(0,200,83,0.2);}50%{box-shadow:0 0 50px rgba(0,230,118,0.8),0 0 90px rgba(0,200,83,0.35);}}
.play-btn.playing{animation:glow-pulse 2s ease-in-out infinite;}

/* Hex grid decoration */
.hex-deco{position:absolute;top:10px;right:-30px;width:120px;height:120px;opacity:0.04;pointer-events:none;}
`;

// ── ICONS ─────────────────────────────────────────────────────────────────────
const Icon = {
  Play: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>,
  Pause: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>,
  Prev: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6 8.5 6V6z"/></svg>,
  Next: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="m6 18 8.5-6L6 6v12zm2.5-6 5.5 4-5.5 4V6l5.5 4-5.5 4z" /><path d="M16 6h2v12h-2z"/></svg>,
  Shuffle: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17 5.41 4 4 5.41l5.17 5.17zm4.76-.08 4.65 4.65V11h2V7h-4v2zM4 18.59 18.59 4 20 5.41 5.41 20zm14-.17V16h-2v2.67l-3.17-3.17-1.42 1.42 4.59 4.58 2-2V20h2v-4h-2z"/></svg>,
  Repeat: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z"/></svg>,
  Repeat1: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2zm-4-2V9h-1l-2 1v1h1.5v4z"/></svg>,
  VolumeHigh: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02M14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77"/></svg>,
  VolumeMute: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63m2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71M4.27 3 3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9zm9-.76v2.06c1.48.73 2.5 2.25 2.5 4.03 0 .62-.12 1.21-.33 1.76L17.67 8.3A6 6 0 0 0 16.5 5z"/></svg>,
  Music: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3zm-2 16c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2"/></svg>,
  List: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 13h2v-2H3zm0 4h2v-2H3zm0-8h2V7H3zm4 4h14v-2H7zm0 4h14v-2H7zM7 7v2h14V7z"/></svg>,
  Search: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14"/></svg>,
  Upload: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M9 16h6v-6h4l-7-7-7 7h4zm-4 2h14v2H5z"/></svg>,
  Heart: ({filled}) => <svg viewBox="0 0 24 24" fill={filled?"currentColor":"none"} stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  Home: () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
};

// ── UTILS ─────────────────────────────────────────────────────────────────────
function fmtTime(secs) {
  if (!secs || isNaN(secs)) return "0:00";
  const m = Math.floor(secs / 60), s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}
function cleanName(filename) {
  return filename.replace(/\.(mp3|wav|ogg|flac|aac|m4a|opus|weba)$/i, "").replace(/[_-]/g, " ");
}

// ── VIZ BARS (animated) ───────────────────────────────────────────────────────
function Visualizer({ playing }) {
  const BARS = 28;
  const [heights, setHeights] = useState(() => Array(BARS).fill(4));
  const raf = useRef(null);

  useEffect(() => {
    if (!playing) {
      setHeights(Array(BARS).fill(4));
      return;
    }
    const animate = () => {
      setHeights(h => h.map((_, i) => {
        const base = 8 + Math.sin(Date.now() / 300 + i * 0.7) * 15;
        const rand = Math.random() * 35;
        return Math.max(4, Math.min(72, base + rand));
      }));
      raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf.current);
  }, [playing]);

  return (
    <div className="viz-wrap">
      {heights.map((h, i) => (
        <div key={i} className="viz-bar" style={{ height: h, opacity: playing ? 0.7 + (h / 72) * 0.3 : 0.2 }} />
      ))}
    </div>
  );
}

// ── MAIN APP ──────────────────────────────────────────────────────────────────
export default function B2Player() {
  const [tracks, setTracks] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [muted, setMuted] = useState(false);
  const [shuffle, setShuffle] = useState(false);
  const [repeat, setRepeat] = useState(0); // 0=off 1=all 2=one
  const [liked, setLiked] = useState(new Set());
  const [tab, setTab] = useState("player"); // player | library
  const [search, setSearch] = useState("");
  const [drag, setDrag] = useState(false);
  const [toast, setToast] = useState({ msg: "", show: false });
  const [time, setTime] = useState("");

  const audioRef = useRef(null);
  const fileRef = useRef(null);

  const track = tracks[currentIdx] || null;

  // Clock
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }));
    };
    tick();
    const t = setInterval(tick, 10000);
    return () => clearInterval(t);
  }, []);

  // Audio events
  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setProgress(a.currentTime);
    const onDur = () => setDuration(a.duration);
    const onEnd = () => handleEnd();
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onDur);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onDur);
      a.removeEventListener("ended", onEnd);
    };
  });

  useEffect(() => {
    const a = audioRef.current;
    if (!a || !track) return;
    a.src = track.url;
    a.load();
    setProgress(0); setDuration(0);
    if (playing) a.play().catch(() => {});
  }, [currentIdx]);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (playing) a.play().catch(() => {});
    else a.pause();
  }, [playing]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = muted ? 0 : volume;
  }, [volume, muted]);

  const showToast = (msg) => {
    setToast({ msg, show: true });
    setTimeout(() => setToast(t => ({ ...t, show: false })), 2000);
  };

  const handleEnd = () => {
    if (repeat === 2) { audioRef.current.currentTime = 0; audioRef.current.play(); return; }
    if (shuffle) { playRandom(); return; }
    if (currentIdx < tracks.length - 1) { setCurrentIdx(i => i + 1); }
    else if (repeat === 1) { setCurrentIdx(0); }
    else setPlaying(false);
  };

  const playRandom = () => {
    const idx = Math.floor(Math.random() * tracks.length);
    setCurrentIdx(idx);
  };

  const handlePrev = () => {
    if (progress > 3) { audioRef.current.currentTime = 0; return; }
    setCurrentIdx(i => (i - 1 + tracks.length) % tracks.length);
  };

  const handleNext = () => {
    if (shuffle) { playRandom(); return; }
    setCurrentIdx(i => (i + 1) % tracks.length);
  };

  const handleProgressClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    const t = pct * duration;
    audioRef.current.currentTime = t;
    setProgress(t);
  };

  const handleVolClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(v);
    if (v > 0) setMuted(false);
  };

  const loadFiles = (files) => {
    const audioFiles = [...files].filter(f =>
      f.type.startsWith("audio/") ||
      /\.(mp3|wav|ogg|flac|aac|m4a|opus|weba|wma)$/i.test(f.name)
    );
    if (!audioFiles.length) { showToast("No audio files found"); return; }

    const newTracks = audioFiles.map(f => ({
      id: Math.random().toString(36).slice(2),
      name: cleanName(f.name),
      artist: "Local File",
      file: f,
      url: URL.createObjectURL(f),
      size: f.size,
    }));

    setTracks(prev => {
      const wasEmpty = prev.length === 0;
      const combined = [...prev, ...newTracks];
      if (wasEmpty) {
        // will be picked up by useEffect on currentIdx=0
        setTimeout(() => setPlaying(true), 100);
      }
      return combined;
    });

    showToast(`✓ ${newTracks.length} track${newTracks.length > 1 ? "s" : ""} added`);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDrag(false);
    loadFiles(e.dataTransfer.files);
  };

  const filtered = tracks.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.artist.toLowerCase().includes(search.toLowerCase())
  );

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <>
      <style>{css}</style>
      <audio ref={audioRef} />

      <div className="app">
        {/* TOP BAR */}
        <div className="topbar">
          <div className="logo">B<span>2</span></div>
          <div className="topbar-right">
            <span className="time-chip">{time}</span>
          </div>
        </div>

        {/* PLAYER VIEW */}
        {tab === "player" && (
          <>
            <Visualizer playing={playing && !!track} />

            {/* ALBUM ART */}
            <div className="art-section">
              <div className={`art-outer ${playing && track ? "playing" : ""}`}>
                <div className="art-inner">
                  {track ? (
                    <div className="art-placeholder">
                      <span className="art-icon">🎵</span>
                      <span className="art-label">B2 PLAYER</span>
                    </div>
                  ) : (
                    <div className="art-placeholder">
                      <span className="art-icon">📂</span>
                      <span className="art-label">NO TRACK</span>
                    </div>
                  )}
                  <div className="art-hole" />
                </div>
              </div>
            </div>

            {/* TRACK INFO */}
            <div className="track-info">
              <div className="track-name">{track ? track.name : "No Track Loaded"}</div>
              <div className="track-artist">{track ? track.artist : "Open library to add music"}</div>
              <div className="track-meta">
                <span className="meta-chip">{tracks.length} TRACKS</span>
                {track && <span className="meta-chip">{currentIdx + 1} / {tracks.length}</span>}
              </div>
            </div>

            {/* PROGRESS */}
            <div className="progress-wrap">
              <div className="progress-times">
                <span>{fmtTime(progress)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
              <div className="progress-track" onClick={handleProgressClick}>
                <div className="progress-fill" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* CONTROLS */}
            <div className="controls">
              <button className={`ctrl-btn sm ${shuffle ? "on" : ""}`} onClick={() => { setShuffle(s => !s); showToast(shuffle ? "Shuffle off" : "Shuffle on"); }}>
                <Icon.Shuffle />
              </button>
              <button className="ctrl-btn" onClick={handlePrev} disabled={!track}>
                <Icon.Prev />
              </button>
              <button className={`play-btn ${playing ? "playing" : ""}`} onClick={() => { if (!track) { showToast("Load music from Library"); return; } setPlaying(p => !p); }}>
                {playing ? <Icon.Pause /> : <Icon.Play />}
              </button>
              <button className="ctrl-btn" onClick={handleNext} disabled={!track}>
                <Icon.Next />
              </button>
              <button className={`ctrl-btn sm ${repeat > 0 ? "on" : ""}`} onClick={() => { setRepeat(r => (r + 1) % 3); showToast(["Repeat off", "Repeat all", "Repeat one"][(repeat + 1) % 3]); }}>
                {repeat === 2 ? <Icon.Repeat1 /> : <Icon.Repeat />}
              </button>
            </div>

            {/* VOLUME */}
            <div className="volume-row">
              <button className="ctrl-btn sm" style={{ padding: 4 }} onClick={() => setMuted(m => !m)}>
                {muted || volume === 0 ? <Icon.VolumeMute /> : <Icon.VolumeHigh />}
              </button>
              <div className="vol-track" onClick={handleVolClick}>
                <div className="vol-fill" style={{ width: `${muted ? 0 : volume * 100}%` }} />
              </div>
              <button
                className={`ctrl-btn sm ${liked.has(track?.id) ? "on" : ""}`}
                onClick={() => {
                  if (!track) return;
                  setLiked(l => { const n = new Set(l); n.has(track.id) ? n.delete(track.id) : n.add(track.id); return n; });
                }}
              >
                <Icon.Heart filled={liked.has(track?.id)} />
              </button>
            </div>
          </>
        )}

        {/* LIBRARY VIEW */}
        {tab === "library" && (
          <div className="panel visible">
            <div className="panel-head">
              <span className="panel-title">LIBRARY</span>
              <span className="panel-count">{tracks.length} tracks</span>
            </div>

            {/* UPLOAD — label wraps input for reliable Android tap */}
            <label
              className={`upload-zone ${drag ? "drag" : ""}`}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={onDrop}
              style={{ display: "block", cursor: "pointer" }}
            >
              <input
                ref={fileRef}
                type="file"
                accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/flac,audio/aac,audio/x-m4a,audio/mp4,audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.weba,.wma"
                multiple
                style={{ position: "absolute", width: "1px", height: "1px", opacity: 0, pointerEvents: "none" }}
                onChange={e => { if (e.target.files?.length) loadFiles(e.target.files); e.target.value = ""; }}
              />
              <span className="upload-icon">📁</span>
              <div className="upload-text">TAP TO LOAD MUSIC</div>
              <div className="upload-sub">MP3 · WAV · FLAC · OGG · AAC · M4A</div>
              <div className="upload-sub" style={{ marginTop: 4, color: "var(--netlify)", fontSize: 11 }}>Browses your Downloads &amp; local storage</div>
            </label>

            {tracks.length > 0 && (
              <div className="search-bar">
                <Icon.Search />
                <input placeholder="Search tracks..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
            )}

            {filtered.length === 0 && tracks.length === 0 && (
              <div className="empty">
                <span className="empty-icon">🎧</span>
                <div className="empty-text">No music loaded yet.<br />Tap the green box above,<br />then pick files from<br /><strong style={{color:"var(--netlify)"}}>Downloads</strong> or <strong style={{color:"var(--netlify)"}}>Music</strong> folder.</div>
              </div>
            )}

            {filtered.map((t, i) => (
              <div
                key={t.id}
                className={`track-row ${t.id === track?.id ? "playing-row" : ""}`}
                onClick={() => {
                  const realIdx = tracks.indexOf(t);
                  if (realIdx === currentIdx) { setPlaying(p => !p); }
                  else { setCurrentIdx(realIdx); setPlaying(true); setTab("player"); }
                }}
              >
                <span className={`tr-num ${t.id === track?.id ? "playing-num" : ""}`}>
                  {t.id === track?.id && playing ? (
                    <div className="tr-eq">
                      <div className="tr-eq-bar" style={{ height: "40%" }} />
                      <div className="tr-eq-bar" />
                      <div className="tr-eq-bar" style={{ height: "60%" }} />
                    </div>
                  ) : (i + 1)}
                </span>
                <div className="tr-art">🎵</div>
                <div className="tr-info">
                  <div className={`tr-name ${t.id === track?.id ? "playing-name" : ""}`}>{t.name}</div>
                  <div className="tr-artist">{t.artist}</div>
                </div>
                <button
                  className={`ctrl-btn sm ${liked.has(t.id) ? "on" : ""}`}
                  style={{ padding: 4 }}
                  onClick={e => { e.stopPropagation(); setLiked(l => { const n = new Set(l); n.has(t.id) ? n.delete(t.id) : n.add(t.id); return n; }); }}
                >
                  <Icon.Heart filled={liked.has(t.id)} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* BOTTOM TABS */}
        <div className="bottom-tabs">
          {[
            { id: "player", icon: <Icon.Music />, label: "PLAYER" },
            { id: "library", icon: <Icon.List />, label: "LIBRARY" },
          ].map(t => (
            <button key={t.id} className={`btab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.icon}
              {t.label}
              <div className="btab-line" />
            </button>
          ))}
        </div>

        {/* TOAST */}
        <div className={`toast ${toast.show ? "show" : ""}`}>{toast.msg}</div>
      </div>
    </>
  );
}