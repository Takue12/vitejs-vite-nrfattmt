import React, { useState, useRef, useEffect } from "react";

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

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS & MOCK DATA
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

// ═══════════════════════════════════════════════════════════════════════════════
// ICONS
// ═══════════════════════════════════════════════════════════════════════════════
const PlayIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>;
const PauseIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>;
const PrevIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>;
const NextIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>;
const SearchIcon = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════
export default function CyberPlayer() {
  const [tracks] = useState<Track[]>(DEMO_TRACKS);
  const [curIdx, setCurIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTab, setCurrentTab] = useState("PLAYER");
  const [vHeights, setVHeights] = useState<number[]>(new Array(VISUALIZER_BARS).fill(5));
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // Visualizer Animation Logic
  useEffect(() => {
    let animId: number;
    if (isPlaying) {
      const updateViz = () => {
        setVHeights(new Array(VISUALIZER_BARS).fill(0).map(() => Math.random() * 70 + 10));
        animId = requestAnimationFrame(updateViz);
      };
      animId = requestAnimationFrame(updateViz);
    } else {
      setVHeights(new Array(VISUALIZER_BARS).fill(5));
    }
    return () => cancelAnimationFrame(animId);
  }, [isPlaying]);

  const handleToggle = () => {
    if (isPlaying) audioRef.current?.pause();
    else audioRef.current?.play();
    setIsPlaying(!isPlaying);
  };

  const currentTrack = tracks[curIdx];

  return (
    <div style={{
      width: "100vw", height: "100vh", backgroundColor: "#050510", 
      display: "flex", alignItems: "center", justifyContent: "center",
      color: "white", fontFamily: "'Inter', sans-serif"
    }}>
      <audio ref={audioRef} src={currentTrack?.url} onEnded={() => setIsPlaying(false)} />
      
      <div style={{
        width: "360px", height: "700px", background: "rgba(15, 15, 35, 0.9)",
        borderRadius: "40px", border: "1px solid rgba(0, 240, 255, 0.3)",
        display: "flex", flexDirection: "column", overflow: "hidden", position: "relative"
      }}>
        
        {/* Visualizer Header */}
        <div style={{ height: "120px", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: "4px", padding: "20px" }}>
          {vHeights.map((h, i) => (
            <div key={i} style={{ width: "6px", height: `${h}%`, background: "#00f0ff", borderRadius: "3px", boxShadow: "0 0 10px #00f0ff" }} />
          ))}
        </div>

        {currentTab === "PLAYER" ? (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", padding: "20px" }}>
            <div style={{ 
              width: "200px", height: "200px", borderRadius: "50%", border: "4px solid #00f0ff",
              display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "30px",
              boxShadow: isPlaying ? "0 0 30px rgba(0, 240, 255, 0.4)" : "none"
            }}>
              <span style={{ fontSize: "40px" }}>💿</span>
            </div>

            <h2 style={{ fontSize: "24px", marginBottom: "5px", textAlign: "center" }}>{currentTrack.name}</h2>
            <p style={{ color: "#ff00e4", fontSize: "14px", marginBottom: "40px" }}>{currentTrack.artist}</p>

            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <button onClick={() => setCurIdx((prev) => (prev > 0 ? prev - 1 : tracks.length - 1))} style={{ background: "none", border: "none", color: "#00f0ff", cursor: "pointer" }}><PrevIcon /></button>
              <button onClick={handleToggle} style={{ width: "70px", height: "70px", borderRadius: "50%", background: "#00f0ff", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isPlaying ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button onClick={() => setCurIdx((prev) => (prev < tracks.length - 1 ? prev + 1 : 0))} style={{ background: "none", border: "none", color: "#00f0ff", cursor: "pointer" }}><NextIcon /></button>
            </div>
          </div>
        ) : (
          <div style={{ flex: 1, padding: "20px" }}>
            <div style={{ display: "flex", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "10px", marginBottom: "20px" }}>
              <SearchIcon />
              <input placeholder="Search tracks..." style={{ background: "none", border: "none", color: "white", marginLeft: "10px", outline: "none" }} />
            </div>
            {tracks.map((t, i) => (
              <div key={t.id} onClick={() => { setCurIdx(i); setCurrentTab("PLAYER"); }} style={{ padding: "15px", borderBottom: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: i === curIdx ? "#00f0ff" : "white" }}>
                {t.name} - {t.artist}
              </div>
            ))}
          </div>
        )}

        {/* Tab Bar */}
        <div style={{ display: "flex", borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0,0,0,0.2)" }}>
          <div onClick={() => setCurrentTab("PLAYER")} style={{ flex: 1, padding: "20px", textAlign: "center", cursor: "pointer", color: currentTab === "PLAYER" ? "#00f0ff" : "#666" }}>PLAYER</div>
          <div onClick={() => setCurrentTab("LIB")} style={{ flex: 1, padding: "20px", textAlign: "center", cursor: "pointer", color: currentTab === "LIB" ? "#00f0ff" : "#666" }}>LIBRARY</div>
        </div>
      </div>
    </div>
  );
}
