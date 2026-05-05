# Write the complete enhanced code to a file
with open('/mnt/agents/output/CyberPlayer.tsx', 'w') as f:
    f.write('''import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Track {
  id: string;
  name: string;
  artist: string;import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════
interface Track {
  id: string;
  name: string;
  artist: string;
  album?: string;
  url: string;
  duration?: number;
  cover?: string;
  addedAt: number;
}

interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const VISUALIZER_BARS = 36;

const DEMO_TRACKS: Track[] = [
  {
    id: "demo_1",
    name: "Neon Horizon",
    artist: "Cyberwave Collective",
    album: "Midnight Protocol",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    duration: 372,
    addedAt: Date.now(),
  },
  {
    id: "demo_2",
    name: "Digital Rain",
    artist: "Neon Drifter",
    album: "Chrome Dreams",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    duration: 425,
    addedAt: Date.now() - 1000,
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS (SVG) - Completing your missing icons
// ═══════════════════════════════════════════════════════════════════════════════
const PlayIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon = () => <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
const SearchIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const PlayerTabIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>;
const LibraryTabIcon = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>;

// ═══════════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;900&family=Inter:wght@400;600&display=swap');
  
  :root {
    --neon-cyan: #00f0ff;
    --neon-pink: #ff00e4;
    --dark-bg: #050510;
  }

  body { background: var(--dark-bg); color: white; font-family: 'Inter', sans-serif; overflow: hidden; }

  .app {
    width: 100vw; height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, #0a0a25 0%, #03030f 100%);
  }

  .player-container {
    width: 400px; height: 800px; background: rgba(8, 8, 24, 0.9);
    backdrop-filter: blur(20px); border-radius: 32px;
    border: 1px solid rgba(0, 240, 255, 0.2);
    display: flex; flex-direction: column; overflow: hidden; position: relative;
  }

  .viz-area { height: 100px; display: flex; align-items: flex-end; gap: 2px; padding: 20px; }
  .viz-bar { flex: 1; background: var(--neon-cyan); box-shadow: 0 0 10px var(--neon-cyan); transition: height 0.05s ease; }

  .track-info { text-align: center; padding: 20px; }
  .track-name { font-family: 'Orbitron'; font-size: 1.5rem; text-shadow: 0 0 10px var(--neon-cyan); }
  
  .controls { display: flex; justify-content: center; align-items: center; gap: 20px; padding: 20px; }
  .play-btn { 
    width: 70px; height: 70px; border-radius: 50%; background: var(--neon-cyan); 
    border: none; display: flex; align-items: center; justify-content: center; cursor: pointer;
    box-shadow: 0 0 20px var(--neon-cyan);
  }

  .nav-tabs { display: flex; border-top: 1px solid rgba(255,255,255,0.1); margin-top: auto; }
  .tab { flex: 1; padding: 20px; text-align: center; cursor: pointer; color: #666; font-size: 12px; font-family: 'Orbitron'; }
  .tab.active { color: var(--neon-cyan); }
`;

export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [cur, setCur] = useState(0);
  const [isP, setIsP] = useState(false);
  const [tab, setTab] = useState("PLAYER");
  const [viz, setViz] = useState<number[]>(new Array(VISUALIZER_BARS).fill(5));
  
  const aRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isP) return;
    const interval = setInterval(() => {
      setViz(new Array(VISUALIZER_BARS).fill(0).map(() => Math.random() * 60 + 5));
    }, 100);
    return () => clearInterval(interval);
  }, [isP]);

  const toggle = () => {
    if (isP) aRef.current?.pause();
    else aRef.current?.play();
    setIsP(!isP);
  };

  const t = tracks[cur];

  return (
    <div className="app">
      <style>{css}</style>
      <audio ref={aRef} src={t?.url} onEnded={() => setIsP(false)} />
      
      <div className="player-container">
        <div className="viz-area">
          {viz.map((h, i) => <div key={i} className="viz-bar" style={{height: `${h}%`}} />)}
        </div>

        {tab === "PLAYER" ? (
          <div className="main-view">
            <div className="track-info">
              <div className="track-name">{t?.name || "IDLE"}</div>
              <div style={{color: 'var(--neon-pink)', fontSize: '12px'}}>{t?.artist || "READY"}</div>
            </div>

            <div className="controls">
              <button className="play-btn" style={{background: 'none', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)'}} onClick={() => setCur(Math.max(0, cur - 1))}><PrevIcon /></button>
              <button className="play-btn" onClick={toggle}>{isP ? <PauseIcon /> : <PlayIcon />}</button>
              <button className="play-btn" style={{background: 'none', border: '1px solid var(--neon-cyan)', color: 'var(--neon-cyan)'}} onClick={() => setCur(Math.min(tracks.length - 1, cur + 1))}><NextIcon /></button>
            </div>
          </div>
        ) : (
          <div style={{padding: '20px'}}>
            <div style={{display: 'flex', gap: '10px', marginBottom: '20px', background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '10px'}}>
              <SearchIcon />
              <input placeholder="SEARCH_DATABASE..." style={{background: 'none', border: 'none', color: 'white', outline: 'none'}} />
            </div>
            {tracks.map((track, i) => (
              <div key={track.id} onClick={() => {setCur(i); setTab("PLAYER");}} style={{padding: '10px', borderBottom: '1px solid rgba(0,240,255,0.1)', cursor: 'pointer', color: i === cur ? 'var(--neon-cyan)' : 'white'}}>
                {track.name}
              </div>
            ))}
          </div>
        )}

        <div className="nav-tabs">
          <div className={`tab ${tab === "PLAYER" ? "active" : ""}`} onClick={() => setTab("PLAYER")}>
            <PlayerTabIcon />
            <div>CORE</div>
          </div>
          <div className={`tab ${tab === "LIB" ? "active" : ""}`} onClick={() => setTab("LIB")}>
            <LibraryTabIcon />
            <div>DATA</div>
          </div>
        </div>
      </div>
    </div>
  );
}
  album?: string;
  url: string;
  duration?: number;
  addedAt: number;
}

interface EQBand {
  frequency: number;
  gain: number;
  label: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════
const VISUALIZER_BARS = 32;

const DEMO_TRACKS: Track[] = [
  {
    id: "demo_1",
    name: "Neon Horizon",
    artist: "Cyberwave Collective",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    addedAt: Date.now(),
  },
  {
    id: "demo_2",
    name: "Digital Rain",
    artist: "Neon Drifter",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    addedAt: Date.now() - 1000,
  }
];

const EQ_PRESETS: Record<string, number[]> = {
  flat: [0, 0, 0, 0, 0],
  bass: [6, 4, 0, 0, 0],
  treble: [0, 0, 0, 4, 6],
};

// ═══════════════════════════════════════════════════════════════════════════════
// CSS
// ═══════════════════════════════════════════════════════════════════════════════
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Inter:wght@400;600&display=swap');
  
  :root {
    --neon-cyan: #00f0ff;
    --neon-pink: #ff00e4;
    --dark-bg: #050510;
  }

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    background: var(--dark-bg);
    font-family: 'Inter', sans-serif;
    color: white;
    overflow: hidden;
  }

  .app {
    width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: radial-gradient(circle at center, #0a0a25 0%, #03030f 100%);
    position: relative;
  }

  /* Scanline / CRT effect */
  .app::after {
    content: ""; position: absolute; inset: 0;
    background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%), 
                linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
    background-size: 100% 3px, 3px 100%; pointer-events: none; z-index: 100;
  }

  .player-container {
    width: 380px; height: 750px;
    background: rgba(10, 10, 30, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 40px;
    border: 1px solid rgba(0, 240, 255, 0.2);
    display: flex; flex-direction: column;
    position: relative; overflow: hidden;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5), inset 0 0 20px rgba(0, 240, 255, 0.05);
  }

  .viz-container {
    height: 120px; display: flex; align-items: flex-end; justify-content: center;
    gap: 3px; padding: 20px;
  }

  .v-bar {
    width: 6px; background: linear-gradient(to top, var(--neon-cyan), var(--neon-pink));
    border-radius: 3px; transition: height 0.1s ease;
    box-shadow: 0 0 10px var(--neon-cyan);
  }

  .track-art {
    width: 220px; height: 220px; margin: 0 auto;
    border-radius: 50%; border: 4px solid var(--neon-cyan);
    background: #000; position: relative;
    display: flex; align-items: center; justify-content: center;
    box-shadow: 0 0 30px rgba(0, 240, 255, 0.2);
  }

  .track-art.playing { animation: rotate 10s linear infinite; }
  @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .controls {
    padding: 30px; display: flex; flex-direction: column; align-items: center; gap: 20px;
  }

  .play-btn {
    width: 80px; height: 80px; border-radius: 50%;
    background: var(--neon-cyan); border: none; color: black;
    font-weight: bold; cursor: pointer; font-size: 20px;
    box-shadow: 0 0 20px var(--neon-cyan);
    transition: 0.3s;
  }

  .play-btn:hover { transform: scale(1.1); box-shadow: 0 0 30px var(--neon-cyan); }

  .nav-tabs {
    margin-top: auto; display: flex; background: rgba(0,0,0,0.4);
    border-top: 1px solid rgba(0, 240, 255, 0.1);
  }

  .tab {
    flex: 1; padding: 15px; text-align: center; font-size: 10px;
    font-family: 'Orbitron'; color: #666; cursor: pointer; transition: 0.3s;
  }

  .tab.active { color: var(--neon-cyan); text-shadow: 0 0 5px var(--neon-cyan); }
`;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CyberPlayer() {
  const [tracks, setTracks] = useState<Track[]>(DEMO_TRACKS);
  const [curIdx, setCurIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tab, setTab] = useState("CORE");
  const [vHeights, setVHeights] = useState<number[]>(new Array(VISUALIZER_BARS).fill(5));
  
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (!isPlaying) {
      setVHeights(new Array(VISUALIZER_BARS).fill(5));
      return;
    }
    const interval = setInterval(() => {
      setVHeights(new Array(VISUALIZER_BARS).fill(0).map(() => Math.random() * 80 + 10));
    }, 100);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const currentTrack = tracks[curIdx];

  return (
    <div className="app">
      <style>{css}</style>
      <audio ref={audioRef} src={currentTrack?.url} onEnded={() => setIsPlaying(false)} />
      
      <div className="player-container">
        <div className="viz-container">
          {vHeights.map((h, i) => (
            <div key={i} className="v-bar" style={{ height: `${h}px` }} />
          ))}
        </div>

        <div className="controls">
          <div className={`track-art ${isPlaying ? 'playing' : ''}`}>
             <span style={{fontFamily:'Orbitron', fontSize: 40}}>⚡</span>
          </div>

          <div style={{textAlign:'center', marginTop: 20}}>
            <h2 style={{fontFamily:'Orbitron', letterSpacing:2}}>{currentTrack?.name}</h2>
            <p style={{color: 'var(--neon-cyan)', fontSize: 12}}>{currentTrack?.artist}</p>
          </div>

          <button className="play-btn" onClick={togglePlay}>
            {isPlaying ? "PAUSE" : "PLAY"}
          </button>
        </div>

        <div className="nav-tabs">
          <div className={`tab ${tab === "CORE" ? "active" : ""}`} onClick={() => setTab("CORE")}>SYSTEM</div>
          <div className={`tab ${tab === "LIB" ? "active" : ""}`} onClick={() => setTab("LIB")}>DATA</div>
        </div>
      </div>
    </div>
  );
}''')
