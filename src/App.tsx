import React, { useState, useRef, useEffect } from "react";

interface Track {
  id: string;
  name: string;
  artist: string;
  url: string;
}

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Rajdhani:wght@400;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  :root { --n: #00c853; --nb: #00e676; --bg: #020c05; --s: #07180b; --t: #d4f5dc; }
  html,body,#root{height:100%;width:100%;overflow:hidden;background:var(--bg);font-family:'Rajdhani',sans-serif;color:var(--t);}
  .app{max-width:420px;margin:0 auto;height:100dvh;display:flex;flex-direction:column;position:relative;background: radial-gradient(circle at top, #092e14, var(--bg));}
  .viz-box{height:80px;display:flex;align-items:flex-end;justify-content:center;gap:3px;padding:0 20px;margin-top:20px;overflow:hidden;}
  .v-bar{flex:1;background:linear-gradient(to top, var(--n), var(--nb));border-radius:2px 2px 0 0;}
  .disk-sec{display:flex;justify-content:center;margin:30px 0;}
  .disk{width:180px;height:180px;border-radius:50%;border:4px solid rgba(0,200,83,0.2);display:flex;align-items:center;justify-content:center;background:var(--s);}
  .disk.play{animation:spin 5s linear infinite;}
  @keyframes spin{to{transform:rotate(360deg);}}
  .info{text-align:center;padding:0 20px;flex:1;}
  .t-name{font-family:'Orbitron';font-size:18px;color:var(--nb);margin-bottom:8px;}
  .ctrls{display:flex;justify-content:center;padding-bottom:40px;}
  .p-btn{width:70px;height:70px;border-radius:50%;background:var(--n);border:none;color:#000;display:flex;align-items:center;justify-content:center;box-shadow:0 0 20px var(--n);cursor:pointer;outline:none;}
  .tabs{display:flex;background:rgba(10,34,17,0.8);border-top:1px solid rgba(0,200,83,0.2);}
  .tab{flex:1;padding:15px;background:none;border:none;color:#3d9e5a;font-family:'Orbitron';font-size:10px;cursor:pointer;}
  .tab.act{color:var(--nb);}
  .lib{flex:1;overflow-y:auto;padding:20px;}
  .up-z{border:2px dashed var(--n);padding:30px;text-align:center;border-radius:15px;margin-bottom:20px;display:block;cursor:pointer;}
  .row{padding:12px;border-bottom:1px solid rgba(0,200,83,0.1);display:flex;justify-content:space-between;cursor:pointer;}
`;

export default function B2Player() {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [cur, setCur] = useState(0);
  const [isP, setIsP] = useState(false);
  const [tab, setTab] = useState("player");
  const [vH, setVH] = useState<number[]>(Array(25).fill(5));
  const aRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isP) { setVH(Array(25).fill(5)); return; }
    const i = setInterval(() => {
      setVH(prev => prev.map(() => Math.random() * 50 + 5));
    }, 100);
    return () => clearInterval(i);
  }, [isP]);

  // POWERFUL FIX: This forces the audio to "Wake Up" on mobile
  const handlePlay = async () => {
    if (!tracks.length || !aRef.current) return;

    try {
      if (isP) {
        aRef.current.pause();
        setIsP(false);
      } else {
        // We call .play() directly inside the click handler
        const playPromise = aRef.current.play();
        if (playPromise !== undefined) {
          await playPromise;
          setIsP(true);
        }
      }
    } catch (err) {
      console.error("Playback failed:", err);
      alert("Please tap again to enable audio.");
    }
  };

  const add = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const fs = Array.from(e.target.files).map(f => ({
      id: Math.random().toString(36),
      name: f.name.replace(/\.[^/.]+$/, ""),
      artist: "Local Track",
      url: URL.createObjectURL(f)
    }));
    setTracks(prev => [...prev, ...fs]);
  };

  const sel = (i: number) => {
    setCur(i);
    setTab("player");
    // Ensure the state updates, then force the play
    setTimeout(() => {
      if(aRef.current) {
        aRef.current.play().catch(e => console.log(e));
        setIsP(true);
      }
    }, 200);
  };

  const t = tracks[cur];

  return (
    <div className="app">
      <style>{css}</style>
      <audio 
        ref={aRef} 
        src={t?.url} 
        playsInline 
        onEnded={() => setIsP(false)} 
      />
      
      {tab === "player" ? (
        <>
          <div className="viz-box">{vH.map((h, i) => <div key={i} className="v-bar" style={{height:`${h}px`}}/>)}</div>
          <div className="disk-sec">
            <div className={`disk ${isP?'play':''}`}>
               <div style={{width:40,height:40,borderRadius:'50%',background:'#020c05',border:'2px solid #00c853'}}/>
            </div>
          </div>
          <div className="info">
            <div className="t-name">{t ? t.name : "No Track"}</div>
            <div style={{color:'#3d9e5a'}}>{t ? "Playing" : "Go to Library to add songs"}</div>
          </div>
          <div className="ctrls">
            <button className="p-btn" onClick={handlePlay}>
              {isP ? (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6zm8-14v14h4V5z"/></svg>
              ) : (
                <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>
          </div>
        </>
      ) : (
        <div className="lib">
          <label className="up-z">
            <input type="file" multiple accept="audio/*" onChange={add} style={{display:'none'}} />
            <div style={{color:'#00c853', fontWeight:'bold'}}>+ UPLOAD SONGS</div>
          </label>
          {tracks.length === 0 && <div style={{textAlign:'center', color:'#3d9e5a'}}>Your library is empty</div>}
          {tracks.map((tk, i) => (
            <div key={tk.id} className="row" onClick={() => sel(i)}>
              <span>{tk.name}</span>
              <span style={{color:'#00c853'}}>{i===cur && isP ? "●" : "▶"}</span>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        <button className={`tab ${tab==='player'?'act':''}`} onClick={() => setTab("player")}>PLAYER</button>
        <button className={`tab ${tab==='library'?'act':''}`} onClick={() => setTab("library")}>LIBRARY</button>
      </div>
    </div>
  );
}
