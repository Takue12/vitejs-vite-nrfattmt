import React, { useState, useRef, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@400;600;700&display=swap');
  
  :root { 
    --n: #00c853; 
    --nb: #00e676; 
    --bg: #010803; 
    --s: rgba(7, 24, 11, 0.8); 
    --t: #d4f5dc; 
    --glow: 0 0 15px rgba(0, 200, 83, 0.6);
  }

  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  
  html,body,#root{height:100%;width:100%;overflow:hidden;background:var(--bg);font-family:'Rajdhani',sans-serif;color:var(--t);}
  
  .app{
    max-width:420px;margin:0 auto;height:100dvh;display:flex;flex-direction:column;
    background: radial-gradient(circle at 50% -20%, #0c4a1e, var(--bg) 80%);
    position:relative;
    border-left: 1px solid rgba(0,200,83,0.1);
    border-right: 1px solid rgba(0,200,83,0.1);
  }

  /* Futuristic Visualizer */
  .viz-box{height:100px;display:flex;align-items:flex-end;justify-content:center;gap:2px;padding:0 30px;margin-top:20px;}
  .v-bar{flex:1;background:linear-gradient(to top, var(--n), var(--nb));box-shadow: var(--glow);border-radius:1px 1px 0 0;transition: height 0.1s ease;}

  .disk-sec{display:flex;justify-content:center;margin:20px 0;position:relative;}
  .disk{
    width:160px;height:160px;border-radius:50%;
    border:2px solid var(--n);box-shadow: var(--glow);
    display:flex;align-items:center;justify-content:center;
    background: repeating-radial-gradient(circle, #07180b, #010803 10%);
  }
  .disk.play{animation:spin 4s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}

  .info{text-align:center;padding:0 30px;margin-bottom:15px;}
  .t-name{font-family:'Orbitron';font-size:20px;font-weight:900;color:var(--nb);text-shadow: var(--glow);margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}

  /* UI Components */
  .slider-box{padding:0 40px;margin-bottom:20px;}
  .label-row{display:flex;justify-content:space-between;font-family:'Orbitron';font-size:9px;color:var(--n);margin-bottom:6px;letter-spacing:1px;}
  
  input[type=range] {
    -webkit-appearance: none; width: 100%; background: transparent;
  }
  input[type=range]::-webkit-slider-runnable-track {
    width: 100%; height: 4px; cursor: pointer; background: rgba(0,200,83,0.2); border-radius: 2px;
  }
  input[type=range]::-webkit-slider-thumb {
    height: 14px; width: 14px; border-radius: 50%; background: var(--nb); cursor: pointer; -webkit-appearance: none; margin-top: -5px; box-shadow: var(--glow);
  }

  .ctrls{display:flex;justify-content:center;align-items:center;gap:30px;padding-bottom:30px;}
  .p-btn{
    width:75px;height:75px;border-radius:50%;background:var(--n);border:none;
    display:flex;align-items:center;justify-content:center;box-shadow: var(--glow);cursor:pointer;
  }
  .s-btn{background:none;border:none;color:var(--n);cursor:pointer;opacity:0.8;}

  .tabs{display:flex;background:rgba(7,24,11,0.9);backdrop-filter:blur(10px);border-top:1px solid rgba(0,200,83,0.2);}
  .tab{flex:1;padding:18px;background:none;border:none;color:#3d9e5a;font-family:'Orbitron';font-size:11px;font-weight:700;cursor:pointer;}
  .tab.act{color:var(--nb);text-shadow: var(--glow);border-top: 2px solid var(--n);}

  .lib{flex:1;overflow-y:auto;padding:20px;}
  .up-z{
    border:1px solid var(--n);background:rgba(0,200,83,0.05);
    padding:25px;text-align:center;border-radius:10px;margin-bottom:20px;display:block;cursor:pointer;
    font-family:'Orbitron';font-size:12px;color:var(--nb);
  }
  .row{
    padding:15px;background:rgba(255,255,255,0.03);margin-bottom:8px;border-radius:8px;
    display:flex;justify-content:space-between;align-items:center;border-left: 3px solid transparent;
  }
  .row.active{border-left: 3px solid var(--n);background:rgba(0,200,83,0.1);}
`;

export default function B2Player() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cur, setCur] = useState(0);
  const [isP, setIsP] = useState(false);
  const [tab, setTab] = useState("player");
  const [vH, setVH] = useState<number[]>(Array(30).fill(5));
  
  const [prog, setProg] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(0.8);

  const aRef = useRef<HTMLAudioElement>(null);

  // Sync Audio Metadata
  useEffect(() => {
    const a = aRef.current;
    if (!a) return;
    const updateTime = () => setProg(a.currentTime);
    const updateDur = () => setDur(a.duration);
    a.addEventListener("timeupdate", updateTime);
    a.addEventListener("loadedmetadata", updateDur);
    return () => {
      a.removeEventListener("timeupdate", updateTime);
      a.removeEventListener("loadedmetadata", updateDur);
    };
  }, [tracks, cur]);

  // Visualizer Animation
  useEffect(() => {
    if (!isP) { setVH(Array(30).fill(5)); return; }
    const i = setInterval(() => {
      setVH(prev => prev.map(() => Math.random() * 80 + 5));
    }, 80);
    return () => clearInterval(i);
  }, [isP]);

  const toggle = async () => {
    if (!tracks.length || !aRef.current) return;
    if (isP) {
      aRef.current.pause();
      setIsP(false);
    } else {
      await aRef.current.play();
      setIsP(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (aRef.current) {
      aRef.current.currentTime = val;
      setProg(val);
    }
  };

  const handleVol = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVol(val);
    if (aRef.current) aRef.current.volume = val;
  };

  const add = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fs = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36),
      name: f.name.replace(/\.[^/.]+$/, ""),
      artist: "System Track",
      url: URL.createObjectURL(f)
    }));
    setTracks(prev => [...prev, ...fs]);
  };

  const fmtTime = (s: number) => {
    if (isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const rs = Math.floor(s % 60);
    return `${m}:${rs < 10 ? '0' : ''}${rs}`;
  };

  const t = tracks[cur];

  return (
    <div className="app">
      <style>{css}</style>
      <audio ref={aRef} src={t?.url} playsInline onEnded={() => setIsP(false)} />
      
      {tab === "player" ? (
        <>
          <div className="viz-box">{vH.map((h, i) => <div key={i} className="v-bar" style={{height:`${h}px`}}/>)}</div>
          
          <div className="disk-sec">
            <div className={`disk ${isP?'play':''}`}>
               <div style={{width:50,height:50,borderRadius:'50%',background:'#010803',border:'1px solid #00c853',boxShadow:'inset 0 0 10px #00c853'}}/>
            </div>
          </div>

          <div className="info">
            <div className="t-name">{t ? t.name : "CORE READY"}</div>
            <div style={{color:'#3d9e5a', fontSize:'12px', letterSpacing:'2px'}}>SYSTEM STATUS: {isP ? 'ACTIVE' : 'STANDBY'}</div>
          </div>

          {/* PROGRESS TRACKER */}
          <div className="slider-box">
            <div className="label-row">
              <span>{fmtTime(prog)}</span>
              <span>{fmtTime(dur)}</span>
            </div>
            <input type="range" min={0} max={dur || 0} value={prog} onChange={handleSeek} />
          </div>

          {/* VOLUME TRACKER */}
          <div className="slider-box">
            <div className="label-row"><span>VOLUME</span><span>{Math.round(vol * 100)}%</span></div>
            <input type="range" min={0} max={1} step={0.01} value={vol} onChange={handleVol} />
          </div>

          <div className="ctrls">
            <button className="s-btn" onClick={() => {if(cur>0) setCur(cur-1)}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button className="p-btn" onClick={toggle}>
              {isP ? (
                <svg width="35" height="35" viewBox="0 0 24 24" fill="black"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
              ) : (
                <svg width="35" height="35" viewBox="0 0 24 24" fill="black"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
            <button className="s-btn" onClick={() => {if(cur<tracks.length-1) setCur(cur+1)}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
          </div>
        </>
      ) : (
        <div className="lib">
          <label className="up-z">
            <input type="file" multiple accept="audio/*" onChange={add} style={{display:'none'}} />
            INITIALIZE UPLOAD
          </label>
          {tracks.map((tk, i) => (
            <div key={tk.id} className={`row ${i===cur?'active':''}`} onClick={() => {setCur(i); setTab("player")}}>
              <div>
                <div style={{fontSize:'14px', fontWeight:'700'}}>{tk.name}</div>
                <div style={{fontSize:'10px', color:'#3d9e5a'}}>READY TO LOAD</div>
              </div>
              <div style={{color:i===cur && isP ? '#00e676' : '#3d9e5a'}}>
                {i===cur && isP ? 'ACTIVE' : '▶'}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab==='player'?'act':''}`} onClick={() => setTab("player")}>COMMAND</button>
        <button className={`tab ${tab==='library'?'act':''}`} onClick={() => setTab("library")}>DATABASE</button>
      </div>
    </div>
  );
}
