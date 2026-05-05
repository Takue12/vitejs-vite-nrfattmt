# Write the complete enhanced code to a file
with open('/mnt/agents/output/CyberPlayer.tsx', 'w') as f:
    f.write('''import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

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
