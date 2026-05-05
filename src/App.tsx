import React, { useState, useRef, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
  
  :root { 
    --neon: #00ff66; 
    --neon-dim: rgba(0, 255, 102, 0.3);
    --bg: #050a05; 
    --glass: rgba(10, 25, 15, 0.7);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  
  body {
    background-color: var(--bg);
    color: var(--neon);
    font-family: 'Share Tech Mono', monospace;
    overflow: hidden;
  }

  .app {
    max-width: 420px; margin: 0 auto; height: 100dvh; display: flex; flex-direction: column;
    background: linear-gradient(180deg, #0a1a0a 0%, #050a05 100%);
    position: relative;
    border: 1px solid var(--neon-dim);
    box-shadow: inset 0 0 50px rgba(0, 255, 102, 0.1);
  }

  /* Scanline Effect */
  .app::before {
    content: " "; display: block; position: absolute; top: 0; left: 0; bottom: 0; right: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 118, 0.06));
    z-index: 10; background-size: 100% 2px, 3px 100%; pointer-events: none;
  }

  /* FIXED Visualizer - Stops Shaking */
  .viz-container {
    height: 120px; width: 100%; display: flex; align-items: flex-end; justify-content: center;
    gap: 4px; padding: 20px; position: relative; overflow: hidden;
  }
  .v-bar {
    width: 6px; background: var(--neon); box-shadow: 0 0 10px var(--neon);
    border-radius: 3px 3px 0 0; transition: height 0.08s ease;
  }

  .main-display {
    flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center;
    position: relative; z-index: 2;
  }

  .cyber-disk {
    width: 200px; height: 200px; border-radius: 50%;
    border: 2px solid var(--neon); position: relative;
    background: radial-gradient(circle, #111 30%, #000 70%);
    box-shadow: 0 0 20px var(--neon-dim);
    display: flex; align-items: center; justify-content: center;
  }
  .disk-inner {
    width: 180px; height: 180px; border-radius: 50%;
    border: 1px dashed var(--neon);
    animation: spin 6s linear infinite; animation-play-state: paused;
  }
  .playing .disk-inner { animation-play-state: running; }

  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .track-meta { text-align: center; margin-top: 30px; font-family: 'Orbitron', sans-serif; }
  .track-title { font-size: 1.2rem; letter-spacing: 3px; text-transform: uppercase; margin-bottom: 5px; color: #fff; text-shadow: 0 0 10px var(--neon); }

  .scrub-container { width: 80%; margin: 20px 0; }
  input[type=range] {
    -webkit-appearance: none; width: 100%; background: transparent; cursor: pointer;
  }
  input[type=range]::-webkit-slider-runnable-track {
    height: 2px; background: var(--neon-dim);
  }
  input[type=range]::-webkit-slider-thumb {
    -webkit-appearance: none; height: 12px; width: 12px; background: var(--neon);
    box-shadow: 0 0 10px var(--neon); border-radius: 0; margin-top: -5px;
  }

  .controls-hex { display: flex; align-items: center; gap: 25px; margin-bottom: 40px; }
  .btn-hex {
    background: var(--glass); border: 1px solid var(--neon); color: var(--neon);
    padding: 15px; cursor: pointer; backdrop-filter: blur(5px);
    transition: 0.3s; clip-path: polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%);
  }
  .btn-hex:active { background: var(--neon); color: #000; }
  .btn-play { width: 80px; height: 80px; font-size: 20px; }

  .nav-bar {
    display: flex; border-top: 1px solid var(--neon-dim); background: var(--glass);
    backdrop-filter: blur(10px); z-index: 20;
  }
  .nav-item {
    flex: 1; padding: 20px; text-align: center; font-family: 'Orbitron';
    font-size: 10px; letter-spacing: 2px; color: var(--neon-dim); cursor: pointer;
  }
  .nav-item.active { color: var(--neon); border-bottom: 2px solid var(--neon); text-shadow: 0 0 5px var(--neon); }

  /* Library Styles */
  .library-list { flex: 1; overflow-y: auto; padding: 20px; z-index: 2; }
  .track-card {
    background: rgba(0, 255, 102, 0.05); border: 1px solid var(--neon-dim);
    padding: 15px; margin-bottom: 10px; display: flex; justify-content: space-between;
    align-items: center; cursor: pointer;
  }
  .track-card.active { border-color: var(--neon); background: rgba(0, 255, 102, 0.15); }
  .upload-btn {
    display: block; width: 100%; padding: 15px; border: 1px dashed var(--neon);
    text-align: center; margin-bottom: 20px; color: var(--neon); cursor: pointer;
  }
`;

export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cur, setCur] = useState(0);
  const [isP, setIsP] = useState(false);
  const [tab, setTab] = useState("PLAYER");
  const [vH, setVH] = useState<number[]>(Array(20).fill(10));
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);
  
  const aRef = useRef<HTMLAudioElement>(null);

  // Audio Sync
  useEffect(() => {
    const a = aRef.current;
    if (!a) return;
    const update = () => { setProg(a.currentTime); setDur(a.duration || 0); };
    a.addEventListener("timeupdate", update);
    return () => a.removeEventListener("timeupdate", update);
  }, [tracks, cur]);

  // Visualizer Animation (Locked array size to prevent shaking)
  useEffect(() => {
    if (!isP) { setVH(Array(20).fill(10)); return; }
    const i = setInterval(() => {
      setVH(new Array(20).fill(0).map(() => Math.random() * 80 + 10));
    }, 100);
    return () => clearInterval(i);
  }, [isP]);

  const toggle = async () => {
    if (!tracks.length || !aRef.current) return;
    if (isP) { aRef.current.pause(); setIsP(false); }
    else { await aRef.current.play(); setIsP(true); }
  };

  const addFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFs = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36),
      name: f.name.replace(/\.[^/.]+$/, ""),
      artist: "EXTERNAL_FILE",
      url: URL.createObjectURL(f)
    }));
    setTracks(prev => [...prev, ...newFs]);
  };

  const select = (i: number) => {
    setCur(i); setTab("PLAYER"); setIsP(true);
    setTimeout(() => aRef.current?.play(), 150);
  };

  const t = tracks[cur];

  return (
    <div className="app">
      <style>{css}</style>
      <audio ref={aRef} src={t?.url} playsInline onEnded={() => setIsP(false)} />

      {tab === "PLAYER" ? (
        <>
          <div className="viz-container">
            {vH.map((h, i) => <div key={i} className="v-bar" style={{height:`${h}px`}} />)}
          </div>

          <div className={`main-display ${isP ? 'playing' : ''}`}>
            <div className="cyber-disk">
              <div className="disk-inner" />
              <div style={{position:'absolute', width:10, height:10, background: 'var(--neon)', borderRadius:'50%'}} />
            </div>

            <div className="track-meta">
              <div className="track-title">{t ? t.name : "NO_DATA"}</div>
              <div style={{fontSize:10, opacity:0.6}}>{isP ? "STATUS: STREAMING..." : "STATUS: IDLE"}</div>
            </div>

            <div className="scrub-container">
              <input type="range" min={0} max={dur} value={prog} onChange={(e) => {
                if(aRef.current) aRef.current.currentTime = Number(e.target.value);
              }} />
              <div style={{display:'flex', justifyContent:'space-between', fontSize:10, marginTop:5}}>
                <span>{Math.floor(prog/60)}:{Math.floor(prog%60).toString().padStart(2,'0')}</span>
                <span>{Math.floor(dur/60)}:{Math.floor(dur%60).toString().padStart(2,'0')}</span>
              </div>
            </div>

            <div className="controls-hex">
              <button className="btn-hex" onClick={() => cur > 0 && select(cur-1)}>PREV</button>
              <button className="btn-hex btn-play" onClick={toggle}>{isP ? "STOP" : "GO"}</button>
              <button className="btn-hex" onClick={() => cur < tracks.length -1 && select(cur+1)}>NEXT</button>
            </div>
          </div>
        </>
      ) : (
        <div className="library-list">
          <label className="upload-btn">
            <input type="file" multiple accept="audio/*" style={{display:'none'}} onChange={addFiles} />
            [ LOAD_EXTERNAL_DATA ]
          </label>
          {tracks.map((tk, i) => (
            <div key={tk.id} className={`track-card ${i===cur?'active':''}`} onClick={() => select(i)}>
              <div>
                <div style={{fontSize:14}}>{tk.name}</div>
                <div style={{fontSize:9, color:'var(--neon-dim)'}}>ID: {tk.id.toUpperCase()}</div>
              </div>
              <div>{i===cur && isP ? ">>" : ">"}</div>
            </div>
          ))}
        </div>
      )}

      <div className="nav-bar">
        <div className={`nav-item ${tab==="PLAYER"?'active':''}`} onClick={()=>setTab("PLAYER")}>CORE</div>
        <div className={`nav-item ${tab==="LIB"?'active':''}`} onClick={()=>setTab("LIB")}>DATABASE</div>
      </div>
    </div>
  );
}
