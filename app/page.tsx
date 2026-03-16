"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- SUB-COMPONENT: The Frame-by-Frame Sprite Animator ---
const ImpactSprite = ({ id, x, y, impactType, onComplete }: { id: number, x: number, y: number, impactType: number, onComplete: (id: number) => void }) => {
  const [frameIndex, setFrameIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const frameCounts: Record<number, number> = { 1: 7, 2: 10, 3: 7, 4: 8 };
  const totalFrames = frameCounts[impactType] || 7;

  useEffect(() => {
    let currentFrame = 0; 
    const interval = setInterval(() => {
      currentFrame++; 
      if (currentFrame >= totalFrames) {
        clearInterval(interval);
        onCompleteRef.current(id); 
      } else {
        setFrameIndex(currentFrame); 
      }
    }, 45); 
    return () => clearInterval(interval);
  }, [totalFrames, id]); 

  const frameStr = `000${frameIndex}`.slice(-4);
  const srcPath = `/assets/impact/symmetrical_impact_00${impactType}/frame${frameStr}.png`;

  return (
    <img 
      src={srcPath} 
      alt="Impact" 
      className="absolute w-16 h-16 md:w-24 md:h-24 pixelated pointer-events-none z-50 transform -translate-x-1/2 -translate-y-1/2 drop-shadow-md"
      style={{ left: x, top: y }}
    />
  );
};

// --- MAIN COMPONENT ---
export default function InteractiveLanding() {
  const [appState, setAppState] = useState<'title' | 'transitioning' | 'loading' | 'dashboard' | 'project_transition' | 'project' | 'skills'>('title');
  const [isBooting, setIsBooting] = useState(true);
  const [typedText, setTypedText] = useState("");
  const [typingPhase, setTypingPhase] = useState("typing_typo"); 
  const [isDamaged, setIsDamaged] = useState(false);
  const [hearts, setHearts] = useState<{id: number, left: number}[]>([]);
  const [clicks, setClicks] = useState<{id: number, x: number, y: number, type: number}[]>([]);
  const [comboCount, setComboCount] = useState(0);
  const [comboTimer, setComboTimer] = useState(0); 
  const drainRate = 2.5; 
  const [stars, setStars] = useState<{id: number, top: string, left: string, size: number, delay: string}[]>([]);
  const [activeStage, setActiveStage] = useState(0);
  const [enlargedImage, setEnlargedImage] = useState<string | null>(null);

  // MAP DATA
  const stages = [
    { 
      id: "1", title: "TRAVEL ORDER SYS", type: "OJT MISSION", status: "COMPLETED",
      desc: "A COMPREHENSIVE TRAVEL ORDER MANAGEMENT SYSTEM ENGINEERED FROM THE GROUND UP DURING MY OJT PROGRAM. DESIGNED TO STREAMLINE REQUESTS, APPROVALS, AND TRACKING FOR PERSONNEL DEPLOYMENT.", 
      tech: ["WEB DEV", "SYSTEMS"],
      x: 15, y: 55, img: '/assets/geo1.gif', size: 'w-16 sm:w-20 md:w-36', rotate: '0deg',
      screenshot: '/assets/travel_order.png', 
      objective: "Digitize and automate the entire travel order workflow for personnel deployment. The legacy system relied on manual paperwork, leading to severe delays and tracking inaccuracies.",
      achievements: ["Engineered Role-based Access Control (Admin, Staff, Manager)", "Automated dynamic PDF report generation", "Built a real-time status tracking dashboard"]
    },
    { 
      id: "2", title: "PAPERBACK EXT.", type: "SCRIPT MISSION", status: "ACTIVE",
      desc: "A ROBUST CUSTOM EXTENSIONS REPOSITORY BUILT FOR PAPERBACK, A POPULAR APPLICATION FOR READING MANGA AND COMICS. FEATURES WEB SCRAPING AND API INTEGRATION TO PARSE IMAGE CHAPTERS RELIABLY.", 
      tech: ["JAVASCRIPT", "API"],
      x: 40, y: 25, img: '/assets/geo2.gif', size: 'w-12 sm:w-16 md:w-32', rotate: '0deg',
      screenshot: '', 
      objective: "Develop and maintain custom JavaScript scrapers that interface directly with various web APIs and raw HTML DOM to deliver reliable, high-quality image chapter payloads to the Paperback mobile app.",
      achievements: ["Parsed complex, obfuscated website DOMs reliably", "Optimized image loading times and bypassed rate-limiting", "Handled asynchronous API requests seamlessly"]
    },
    { 
      id: "3", title: "PIXEL ASSET PACK", type: "DESIGN MISSION", status: "COMPLETED",
      desc: "A COMPREHENSIVE COLLECTION OF ORIGINAL 16-BIT PIXEL ART CHARACTERS, TILESETS, AND ANIMATED SPRITES DESIGNED FOR USE IN MODERN RETRO-STYLE INDIE GAMES.", 
      tech: ["ASEPRITE", "ANIMATION"],
      x: 65, y: 50, img: '/assets/geo3.gif', size: 'w-16 sm:w-20 md:w-36', rotate: '0deg',
      screenshot: '', 
      objective: "Create a fully cohesive, modular pixel art package suitable for top-down RPGs or platformers, maintaining strict color palettes and fluid frame-by-frame animation principles.",
      achievements: ["Designed 8-directional walking and attacking animations", "Created 50+ seamless, interlocking terrain tiles", "Maintained a strict 32-color retro palette"]
    },
    { 
      id: "4", title: "SMART CONTRACT", type: "CRYPTO MISSION", status: "IN DEVELOPMENT",
      desc: "AN EXPERIMENTAL WEB3 PROJECT DEPLOYING A SECURE BLOCKCHAIN SMART CONTRACT FOR DECENTRALIZED ASSET TRADING AND OWNERSHIP VERIFICATION.", 
      tech: ["SOLIDITY", "WEB3.JS"],
      x: 85, y: 20, img: '/assets/geo4.gif', size: 'w-20 sm:w-24 md:w-40', rotate: '0deg',
      screenshot: '', 
      objective: "Research and implement a secure, gas-efficient ERC-721/ERC-1155 smart contract on a testnet to understand the fundamentals of decentralized applications and blockchain architecture.",
      achievements: ["Wrote and deployed gas-optimized Solidity contracts", "Implemented secure minting and burning functions", "Connected a React front-end using Web3.js/Ethers"]
    },
  ];

  const skillData = [
    { category: "LANGUAGES", items: [{name: "JAVASCRIPT", level: 9}, {name: "PHP", level: 8}, {name: "LUA", level: 8}, {name: "SOLIDITY", level: 6}, {name: "C++", level: 7}, {name: "HTML/CSS", level: 9}] },
    { category: "FRAMEWORKS", items: [{name: "REACT / NEXT.JS", level: 9}, {name: "LARAVEL", level: 8}, {name: "TAILWIND CSS", level: 9}] },
    { category: "TOOLS 'n' EXP.", items: [{name: "PIXEL ART / ASEPRITE", level: 8}, {name: "GAME DESIGN", level: 7}, {name: "GIT / GITHUB", level: 8}, {name: "UNITY ENGINE", level: 8}] }
  ];

  const mapPathPoints = stages.map(s => `${s.x},${s.y}`).join(' ');

  useEffect(() => {
    const bootTimer = setTimeout(() => setIsBooting(false), 2200);
    return () => clearTimeout(bootTimer);
  }, []);

  useEffect(() => {
    const generatedStars = Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      size: Math.random() * 3 + 1,
      delay: `${Math.random() * 3}s`
    }));
    setStars(generatedStars);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'a' || e.key === 'A' || e.key === 'Enter') && appState === 'dashboard') handleInitiateProject(e as any);
      if ((e.key === 's' || e.key === 'S') && appState === 'dashboard') setAppState('skills');
      if ((e.key === 'b' || e.key === 'B' || e.key === 'Escape')) {
        if (enlargedImage) setEnlargedImage(null); 
        else if (appState === 'project' || appState === 'skills') setAppState('dashboard'); 
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [appState, enlargedImage]); 

  useEffect(() => {
    if (appState !== 'title' || isBooting) return;
    const typoStr = "AN ASPIRING WEB DEV";
    const realStr = "AN ASPIRING GAME DEVELOPER";
    let timer: NodeJS.Timeout;
    if (typingPhase === "typing_typo") {
      if (typedText.length < typoStr.length) timer = setTimeout(() => setTypedText(typoStr.slice(0, typedText.length + 1)), 100);
      else timer = setTimeout(() => setTypingPhase("deleting"), 1200); 
    } else if (typingPhase === "deleting") {
      if (typedText.length > 13) timer = setTimeout(() => setTypedText(typedText.slice(0, -1)), 60);
      else timer = setTimeout(() => setTypingPhase("typing_real"), 400);
    } else if (typingPhase === "typing_real") {
      if (typedText.length < realStr.length) timer = setTimeout(() => setTypedText(realStr.slice(0, typedText.length + 1)), 100);
      else setTypingPhase("done");
    }
    return () => clearTimeout(timer);
  }, [typedText, typingPhase, appState, isBooting]);

  const triggerDamage = useCallback(() => {
    if (appState !== 'title') return; 
    setIsDamaged(true);
    const newHeart = { id: Date.now() + Math.random(), left: Math.random() * 80 + 10 }; 
    setHearts((prev) => [...prev, newHeart]);
    setComboCount((prev) => prev + 1);
    setComboTimer(100); 
    setTimeout(() => setIsDamaged(false), 200); 
    setTimeout(() => setHearts((prev) => prev.filter((h) => h.id !== newHeart.id)), 1500); 
  }, [appState]);

  useEffect(() => {
    if (comboCount === 0 || appState !== 'title') return; 
    const interval = setInterval(() => {
      setComboTimer((prev) => {
        const newTimer = prev - drainRate;
        if (newTimer <= 0) { setComboCount(0); return 0; }
        return newTimer;
      });
    }, 50); 
    return () => clearInterval(interval);
  }, [comboCount, appState]); 

  useEffect(() => {
    let damageTimer: NodeJS.Timeout;
    const loopDamage = () => {
      if (comboCount === 0 && appState === 'title' && !isBooting) triggerDamage(); 
      damageTimer = setTimeout(loopDamage, Math.random() * 4000 + 4000);
    };
    damageTimer = setTimeout(loopDamage, 3000);
    return () => clearTimeout(damageTimer);
  }, [triggerDamage, comboCount, appState, isBooting]);

  const handleScreenClick = (e: React.MouseEvent) => {
    if (appState !== 'title' || isBooting) return;
    const randomImpactType = Math.floor(Math.random() * 4) + 1;
    const newClick = { id: Date.now() + Math.random(), x: e.clientX, y: e.clientY, type: randomImpactType };
    setClicks((prev) => [...prev, newClick]);
  };

  const removeClick = useCallback((idToRemove: number) => {
    setClicks((prev) => prev.filter(c => c.id !== idToRemove));
  }, []);

  const handleStartGame = (e: React.MouseEvent) => {
    if (e.stopPropagation) e.stopPropagation();
    setAppState('transitioning');
    setTimeout(() => setAppState('loading'), 1200);
    setTimeout(() => setAppState('dashboard'), 3500); 
  };

  const handleLogout = (e: React.MouseEvent) => {
    if (e.stopPropagation) e.stopPropagation();
    setAppState('title'); 
    setActiveStage(0);
  };

  const handleInitiateProject = (e: React.MouseEvent) => {
    if (e.stopPropagation) e.stopPropagation();
    setAppState('project_transition');
    setTimeout(() => setAppState('project'), 2000);
  };

  return (
    <main 
      onClick={handleScreenClick}
      className="h-[100dvh] w-full bg-slate-950 font-pixel text-cyan-100 relative overflow-hidden flex flex-col items-center justify-center selection:bg-cyan-500 selection:text-slate-900 select-none uppercase"
    >
      <style>{`
        @keyframes damage-shake { 0%, 100% { transform: translateX(0); } 25% { transform: translateX(-4px) rotate(-2deg); } 75% { transform: translateX(4px) rotate(2deg); } }
        @keyframes heart-fly { 0% { transform: translateY(0) scale(1) rotate(0deg); opacity: 1; } 100% { transform: translateY(-100px) scale(1.5) rotate(20deg); opacity: 0; } }
        @keyframes title-drop-in { 0% { transform: translateY(-50px) scale(0.95); opacity: 0; } 100% { transform: translateY(0) scale(1); opacity: 1; } }
        @keyframes combo-hit-pop { 0% { transform: scale(1.5) rotate(15deg); filter: brightness(2); } 100% { transform: scale(1) rotate(12deg); filter: brightness(1); } }
        @keyframes star-twinkle { 0%, 100% { opacity: 0.2; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1.2); box-shadow: 0 0 8px #d8b4fe; } }
        
        @keyframes player-bounce { 0%, 100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(-12px) translateX(-50%); } }
        @keyframes dash-scroll { to { stroke-dashoffset: -20; } }
        @keyframes map-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

        @keyframes screen-wipe { 0% { transform: scaleY(0); } 50% { transform: scaleY(1); } 100% { transform: scaleY(0); } }
        @keyframes fade-in-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }

        @keyframes stage-overlay { 0%, 100% { opacity: 0; backdrop-filter: blur(0px); } 10%, 90% { opacity: 1; backdrop-filter: blur(10px); } }
        @keyframes band-sweep { 0% { transform: scaleY(0); opacity: 0; } 15%, 85% { transform: scaleY(1); opacity: 1; } 100% { transform: scaleY(0); opacity: 0; } }
        @keyframes text-slide-in-out { 0% { transform: translateX(100vw) skewX(-20deg); opacity: 0; } 20%, 80% { transform: translateX(0) skewX(0); opacity: 1; } 100% { transform: translateX(-100vw) skewX(20deg); opacity: 0; } }

        @keyframes crt-flicker { 0% { opacity: 0.95; } 50% { opacity: 1; } 100% { opacity: 0.95; } }

        @keyframes crt-turn-on-bg {
          0%, 60% { background-color: #000; opacity: 1; }
          80% { background-color: #fff; opacity: 1; }
          100% { background-color: transparent; opacity: 0; }
        }
        @keyframes crt-turn-on-line {
          0% { width: 0; height: 2px; opacity: 0; }
          10% { width: 0; height: 2px; opacity: 1; box-shadow: 0 0 10px #fff; }
          30% { width: 100%; height: 2px; opacity: 1; box-shadow: 0 0 20px #fff; }
          50% { width: 100%; height: 2px; opacity: 1; box-shadow: 0 0 20px #fff; }
          70% { width: 100%; height: 100vh; opacity: 1; }
          100% { width: 100%; height: 100vh; opacity: 0; }
        }

        .animate-damage { animation: damage-shake 0.2s ease-in-out; }
        .animate-fly-out { animation: heart-fly 1.2s ease-out forwards; }
        .animate-title-in { animation: title-drop-in 1s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
        .animate-combo-pop { animation: combo-hit-pop 0.15s ease-out forwards; }
        .animate-player { animation: player-bounce 0.4s infinite; }
        .animate-map-float { animation: map-float 4s ease-in-out infinite; }
        .animate-fade-up { animation: fade-in-up 0.4s ease-out forwards; }
        
        .animate-stage-overlay { animation: stage-overlay 2s ease-in-out forwards; }
        .animate-band-sweep { animation: band-sweep 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; transform-origin: center; }
        .animate-text-slide { animation: text-slide-in-out 2s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        
        .crt-effect { animation: crt-flicker 0.15s infinite; background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06)); background-size: 100% 4px, 3px 100%; }
        
        .animate-crt-bg { animation: crt-turn-on-bg 2.2s cubic-bezier(0.86, 0, 0.07, 1) forwards; }
        .animate-crt-line { animation: crt-turn-on-line 2.2s cubic-bezier(0.86, 0, 0.07, 1) forwards; }
      `}</style>

      {isBooting && (
        <div className="fixed inset-0 z-[999] bg-black flex items-center justify-center animate-crt-bg pointer-events-none">
          <div className="bg-white animate-crt-line absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
        </div>
      )}

      {/* GLOBAL EXPLOSIONS */}
      {clicks.map((click) => (
        <ImpactSprite key={click.id} id={click.id} x={click.x} y={click.y} impactType={click.type} onComplete={removeClick} />
      ))}

      {/* STATIC BACKGROUND */}
      <div 
        className="absolute inset-0 z-0 pixelated opacity-80 pointer-events-none transition-all duration-1000 ease-in"
        style={{ 
          backgroundImage: "url('/assets/space_bg.png')", 
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transform: (appState !== 'title' && appState !== 'transitioning' && appState !== 'loading') ? 'scale(1.1)' : 'scale(1)' 
        }}
      />

      {/* TWINKLING STARS */}
      <div className="absolute inset-0 z-[5] pointer-events-none">
        {stars.map((star) => (
          <div 
            key={star.id}
            className="absolute bg-purple-400 rounded-full"
            style={{ top: star.top, left: star.left, width: `${star.size}px`, height: `${star.size}px`, animation: `star-twinkle 3s infinite ease-in-out`, animationDelay: star.delay }}
          />
        ))}
      </div>

      <div className={`absolute inset-0 z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(2,6,23,0.8)_100%)] pointer-events-none transition-opacity duration-1000 ${(appState !== 'title' && appState !== 'transitioning' && appState !== 'loading') ? 'opacity-100 bg-slate-950/80' : 'opacity-100'}`}></div>

      {(appState === 'title' || appState === 'transitioning') && (
        <div className={`relative z-20 w-full flex flex-col items-center justify-center h-full transition-all duration-[1200ms] ease-in-out ${appState === 'transitioning' ? 'scale-125 opacity-0 blur-sm pointer-events-none' : 'scale-100 opacity-100 animate-title-in'}`}>
          <div className="absolute top-6 md:top-10 w-full px-6 md:px-16 flex justify-between z-30 pointer-events-none text-[8px] md:text-xs font-bold tracking-[0.2em] md:tracking-[0.4em]">
            <p className="text-cyan-400 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] leading-relaxed">PLAYER 1<br className="md:hidden" /> READY</p>
            <p className="text-fuchsia-500 animate-[pulse_1.5s_ease-in-out_infinite] drop-shadow-[0_0_8px_rgba(217,70,239,0.8)] text-right leading-relaxed">PLAYER 2<br className="md:hidden" /> INSERT COIN</p>
          </div>

          <div className="flex flex-col items-center justify-center pointer-events-none w-full px-4 mt-[-5vh] md:mt-0">
            <div className="text-center w-full max-w-5xl mx-auto pointer-events-auto">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight tracking-tight flex flex-col md:flex-row items-center justify-center">
                <span className="text-white drop-shadow-[2px_2px_0_#0f172a] md:drop-shadow-[4px_4px_0_#0f172a] mb-2 md:mb-0 pointer-events-none">HELLO, I'M </span>
                <div className="relative inline-block md:ml-6">
                  <button 
                    onClick={(e) => { e.stopPropagation(); triggerDamage(); handleScreenClick(e); }}
                    className={`p-2 transition-colors duration-75 inline-block ${isDamaged ? 'text-red-500 [text-shadow:2px_2px_0_#7f1d1d,4px_4px_0_#450a0a] animate-damage' : 'text-fuchsia-500 [text-shadow:2px_2px_0_#06b6d4,4px_4px_0_#0f172a]'}`}
                  >
                    MANUEL
                    {hearts.map(heart => (<img key={heart.id} src="/assets/heart_red.png" className="absolute bottom-4 w-6 h-6 md:w-10 md:h-10 pixelated animate-fly-out pointer-events-none drop-shadow-md z-50" style={{ left: `${heart.left}%` }} />))}
                    {comboCount > 1 && (
                      <div className="absolute -top-6 -right-8 md:-top-10 md:-right-16 z-50 flex flex-col items-center justify-center pointer-events-none drop-shadow-2xl">
                        <p key={comboCount} className={`text-xl md:text-3xl font-bold italic tracking-normal animate-combo-pop [text-shadow:none] drop-shadow-[2px_2px_0_#0f172a] ${comboCount > 50 ? 'text-red-500' : comboCount > 25 ? 'text-orange-400' : comboCount > 10 ? 'text-yellow-400' : 'text-purple-300'}`}>
                          {comboCount}x COMBO
                        </p>
                      </div>
                    )}
                  </button>
                </div>
              </h1>
              <div className="inline-block min-w-[300px] md:min-w-[500px] border-y-2 md:border-y-4 border-cyan-500 py-3 md:py-4 px-6 md:px-12 bg-slate-950/60 backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)] mx-2 text-left md:text-center pointer-events-none">
                <p className="text-[9px] sm:text-xs md:text-xl text-yellow-400 tracking-[0.1em] md:tracking-[0.2em] drop-shadow-[1px_1px_0_#0f172a] md:drop-shadow-[2px_2px_0_#0f172a] leading-relaxed inline-block">
                  {typedText}<span className={`${typingPhase === 'done' ? 'animate-[pulse_1s_infinite]' : ''}`}>_</span>
                </p>
              </div>
            </div>
            <div className="mt-12 sm:mt-20 md:mt-24 pointer-events-auto">
              <button onClick={handleStartGame} className="px-6 md:px-10 py-3 border-2 md:border-4 border-white text-white font-bold text-base md:text-xl tracking-widest hover:bg-white hover:text-slate-900 transition-colors duration-200 active:scale-95 animate-[pulse_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                Press Start
              </button>
            </div>
          </div>
        </div>
      )}

      {appState === 'loading' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center animate-title-in px-4">
          <p className="text-xl sm:text-2xl md:text-4xl text-yellow-400 tracking-[0.2em] md:tracking-[0.3em] font-bold animate-pulse drop-shadow-[0_0_15px_rgba(250,204,21,0.6)] text-center w-full break-words">
            NOW LOADING...
          </p>
        </div>
      )}

      {appState === 'dashboard' && (
        <div className="relative z-50 w-full h-full max-w-6xl mx-auto flex flex-col animate-title-in pointer-events-auto select-auto px-2">
          
          <div className="w-full relative pointer-events-none z-30">
            {/* The absolute positioned buttons on top right */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2 md:gap-4 pointer-events-auto z-40">
              <button 
                onClick={(e) => { e.stopPropagation(); setAppState('skills'); }}
                className="px-2 md:px-3 py-1.5 md:py-2 border-2 border-white bg-slate-900 text-yellow-400 hover:bg-white hover:text-slate-900 transition-colors text-[8px] md:text-xs tracking-widest flex items-center gap-2"
              >
                <span className="hidden sm:block">[S]</span> SKILLS
              </button>
              <button 
                onClick={handleLogout}
                className="px-2 md:px-3 py-1.5 md:py-2 border-2 border-white bg-black text-white hover:bg-white hover:text-black transition-colors text-[8px] md:text-xs tracking-widest"
              >
                [X] QUIT
              </button>
            </div>
            {/* Title dynamically pushed down so it doesn't overlap the buttons on mobile */}
            <h2 className="text-2xl md:text-4xl text-white font-bold tracking-widest drop-shadow-[3px_3px_0_#0f172a] text-center w-full pt-16 md:pt-10">
              PROJECTS
            </h2>
          </div>

          <div className="relative flex-1 w-full mt-4 md:mt-0 mb-[35vh] md:mb-[30vh]">
            
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-50">
              <polyline 
                points={mapPathPoints} 
                fill="none" 
                stroke="#a5f3fc" 
                strokeWidth="0.5" 
                vectorEffect="non-scaling-stroke"
                strokeDasharray="4,4"
                style={{ animation: 'dash-scroll 2s linear infinite' }} 
              />
            </svg>

            {stages.map((stage, index) => {
              const isActive = activeStage === index;
              return (
                <div 
                  key={stage.id}
                  className="absolute z-10 transition-all duration-300"
                  style={{ left: `${stage.x}%`, top: `${stage.y}%` }}
                >
                  <div className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-map-float" style={{ animationDelay: `${index * 0.5}s` }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setActiveStage(index); }}
                      className="relative flex flex-col items-center justify-center group"
                    >
                      
                      {isActive && (
                        <div className="absolute -top-10 md:-top-16 z-20 animate-player left-1/2">
                          <img src="/assets/sprite_jump.gif" alt="Player Sprite" className="w-6 sm:w-8 md:w-12 pixelated drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]" />
                          <div className="text-[6px] md:text-[10px] text-yellow-400 bg-black border border-white px-1 mt-1 text-center font-bold">P1</div>
                        </div>
                      )}

                      <img 
                        src={stage.img} 
                        className={`
                          pixelated transition-all duration-300 drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]
                          ${stage.size}
                          ${isActive ? 'scale-125 filter brightness-125 saturate-150' : 'scale-100 opacity-80 group-hover:scale-110'}
                        `}
                        style={{ transform: `rotate(${stage.rotate})` }}
                      />
                      
                      <div className={`mt-1 md:mt-2 px-1 md:px-2 py-0.5 md:py-1 border-2 text-[6px] md:text-[10px] font-bold bg-black whitespace-nowrap transition-colors ${isActive ? 'border-fuchsia-500 text-fuchsia-400' : 'border-white text-white'}`}>
                        {stage.id}
                      </div>

                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="absolute bottom-2 md:bottom-8 left-1/2 transform -translate-x-1/2 w-[98%] md:w-[95%] max-w-4xl z-50 pointer-events-auto">
            <div className="bg-black border-2 md:border-4 border-white p-3 md:p-6 shadow-[5px_5px_0_rgba(0,0,0,0.8)] md:shadow-[10px_10px_0_rgba(0,0,0,0.8)] relative">
              
              <div className="absolute -top-3 md:-top-4 left-2 md:left-4 bg-fuchsia-600 border border-white md:border-2 px-2 md:px-3 py-0.5 md:py-1 text-[8px] md:text-xs text-white">
                STAGE {stages[activeStage].id}
              </div>

              <div className="absolute -top-3 md:-top-4 right-2 md:right-4 bg-black border border-white md:border-2 px-2 md:px-3 py-0.5 md:py-1 text-[6px] md:text-[10px] text-yellow-400 animate-pulse">
                {stages[activeStage].status}
              </div>

              <div className="mt-2 flex flex-col md:flex-row gap-2 md:gap-8 items-start">
                <div className="flex-1 w-full">
                  <h3 className="text-cyan-400 text-sm md:text-2xl tracking-widest mb-1 md:mb-3 drop-shadow-[1px_1px_0_#334155] md:drop-shadow-[2px_2px_0_#334155]">
                    {stages[activeStage].title}
                  </h3>
                  
                  <p className="text-white text-[6px] md:text-[10px] leading-[2.5] md:leading-[3] tracking-widest h-[60px] md:h-[90px] overflow-y-auto custom-scrollbar pr-2">
                    {stages[activeStage].desc}
                  </p>
                </div>

                <div className="w-full md:w-1/3 flex flex-row md:flex-col gap-2 md:gap-4 border-t border-slate-700 md:border-t-0 md:border-l-2 pt-2 md:pt-0 md:pl-6">
                  <div className="flex-1">
                    <p className="text-slate-500 text-[6px] md:text-[8px] tracking-widest mb-1 md:mb-2">REQUIRED SKILLS:</p>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {stages[activeStage].tech.map(t => (
                        <span key={t} className="bg-slate-800 text-cyan-200 border border-slate-600 px-1.5 md:px-2 py-0.5 md:py-1 text-[6px] md:text-[8px] tracking-widest">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div 
                    onClick={handleInitiateProject}
                    className="w-auto md:w-full border border-dashed border-slate-500 bg-slate-900/50 p-1 md:p-2 cursor-pointer group flex flex-col items-center justify-center hover:bg-slate-800 transition-colors"
                  >
                    <span className="text-[6px] md:text-[8px] text-slate-400 group-hover:text-white mb-0.5 md:mb-2 transition-colors hidden md:block">ACCESS STAGE</span>
                    <div className="flex items-center gap-1 md:gap-3">
                      <div className="w-4 h-4 md:w-8 md:h-8 rounded-full bg-red-600 border border-white flex items-center justify-center text-white font-bold text-[8px] md:text-xs shadow-[1px_1px_0_#475569] group-hover:bg-red-500">
                        A
                      </div>
                      <span className="text-white text-[8px] md:text-[10px] tracking-widest animate-pulse transition-colors">
                        ACTION
                      </span>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>

        </div>
      )}

      {appState === 'project_transition' && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-slate-950/80 animate-stage-overlay"></div>
          <div className="absolute w-full h-32 md:h-48 bg-fuchsia-900/60 border-y-4 border-fuchsia-400 flex items-center justify-center animate-band-sweep shadow-[0_0_50px_rgba(217,70,239,0.5)]">
            <div className="flex flex-col items-center animate-text-slide">
              <p className="text-white text-[10px] md:text-xs tracking-[0.5em] mb-2 drop-shadow-md">INITIATING STAGE {stages[activeStage].id}</p>
              <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-transparent text-center" style={{ WebkitTextStroke: '2px #22d3ee', textShadow: '4px 4px 0 #0f172a' }}>
                {stages[activeStage].title}
              </h2>
            </div>
          </div>
        </div>
      )}

      {appState === 'project' && (
        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center pointer-events-auto bg-slate-950/95 backdrop-blur-md px-2 md:px-4 py-4 md:py-8 animate-fade-up select-auto overflow-hidden">
          
          {/* Main Container - Allows scrolling internally on mobile */}
          <div className="w-full max-w-5xl bg-black border-2 md:border-4 border-slate-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col h-full max-h-full md:max-h-[90vh]">
            
            <div className="bg-slate-900 border-b-2 md:border-b-4 border-slate-500 p-3 md:p-6 flex justify-between items-center shrink-0">
              <div>
                <p className="text-fuchsia-500 text-[8px] md:text-xs tracking-widest mb-1">MISSION DEBRIEF</p>
                <h2 className="text-lg md:text-3xl text-white drop-shadow-[2px_2px_0_#0f172a]">{stages[activeStage].title}</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setAppState('dashboard'); }}
                className="flex items-center gap-1 md:gap-2 group border border-slate-600 bg-slate-800 p-1.5 md:p-2 hover:bg-slate-700 transition-colors"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-600 border border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-[1px_1px_0_#000] group-hover:bg-red-500 transition-colors">B</div>
                <span className="text-[6px] md:text-[10px] text-slate-300 group-hover:text-white tracking-widest transition-colors hidden sm:block">RETURN</span>
              </button>
            </div>

            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
              <div className="w-full md:w-2/5 p-4 md:p-6 border-b border-slate-700 md:border-b-0 md:border-r-2 flex flex-col gap-4 bg-slate-950 items-center justify-center shrink-0 md:overflow-y-auto">
                <div 
                  className={`w-full aspect-video md:aspect-square bg-slate-900 border-2 border-dashed border-slate-700 flex flex-col items-center justify-center relative group overflow-hidden ${stages[activeStage].screenshot ? 'cursor-pointer border-solid border-cyan-500 hover:border-cyan-300' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (stages[activeStage].screenshot) {
                      setEnlargedImage(stages[activeStage].screenshot);
                    }
                  }}
                >
                  {stages[activeStage].screenshot ? (
                    <>
                      <img 
                        src={stages[activeStage].screenshot} 
                        alt={stages[activeStage].title} 
                        className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity pixelated" 
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <div className="border border-white bg-black/80 px-2 md:px-4 py-1 md:py-2 flex items-center gap-1 md:gap-2 shadow-[2px_2px_0_#000]">
                          <span className="text-white text-[8px] md:text-xs tracking-widest animate-pulse">[+] CLICK TO ENLARGE</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 text-[8px] md:text-[10px] tracking-widest z-10">[ SCREENSHOT_SLOT ]</span>
                      <img src={stages[activeStage].img} className="w-20 h-20 md:w-32 md:h-32 absolute opacity-30 group-hover:opacity-50 transition-opacity pixelated grayscale" />
                    </>
                  )}
                </div>
              </div>

              <div className="w-full md:w-3/5 p-4 md:p-8 md:overflow-y-auto custom-scrollbar bg-black">
                <div className="mb-6 md:mb-8">
                  <h3 className="text-yellow-400 text-[8px] md:text-xs tracking-widest mb-2 md:mb-4 border-b border-slate-700 pb-1 md:pb-2">/ OBJECTIVE</h3>
                  <p className="text-slate-300 font-body text-xs sm:text-sm md:text-base leading-relaxed normal-case">
                    {stages[activeStage].objective}
                  </p>
                </div>
                <div className="mb-6 md:mb-8">
                  <h3 className="text-yellow-400 text-[8px] md:text-xs tracking-widest mb-2 md:mb-4 border-b border-slate-700 pb-1 md:pb-2">/ ACHIEVEMENTS</h3>
                  <ul className="flex flex-col gap-2 md:gap-3">
                    {stages[activeStage].achievements.map((achievement, i) => (
                      <li key={i} className="flex gap-2 items-start">
                        <span className="text-fuchsia-500 mt-0.5 md:mt-1 text-[8px] md:text-[10px]">►</span>
                        <span className="text-slate-200 font-body text-xs sm:text-sm md:text-base normal-case">{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-yellow-400 text-[8px] md:text-xs tracking-widest mb-2 md:mb-4 border-b border-slate-700 pb-1 md:pb-2">/ TECHNOLOGIES SECURED</h3>
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {stages[activeStage].tech.map(t => (
                      <span key={t} className="bg-slate-800 text-white border border-slate-600 px-2 md:px-3 py-1 md:py-1.5 text-[6px] sm:text-[8px] md:text-[10px] tracking-widest">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {enlargedImage && (
        <div 
          className="fixed inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-2 md:p-8 animate-fade-up pointer-events-auto"
          onClick={() => setEnlargedImage(null)} 
        >
          <div className="w-full max-w-6xl max-h-full flex flex-col gap-2 md:gap-4 relative">
            <div className="w-full flex justify-between items-center bg-black border-2 md:border-4 border-white p-2 md:p-3 shrink-0 shadow-[2px_2px_0_#000] md:shadow-[4px_4px_0_#000]">
              <span className="text-cyan-400 text-[8px] md:text-xs tracking-widest">IMAGE_VIEWER.EXE</span>
              <button 
                onClick={(e) => { e.stopPropagation(); setEnlargedImage(null); }}
                className="flex items-center gap-1 md:gap-2 group hover:text-white transition-colors text-slate-400"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-600 border border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-[1px_1px_0_#000] group-hover:bg-red-500">B</div>
                <span className="text-[6px] md:text-[10px] tracking-widest uppercase">CLOSE</span>
              </button>
            </div>
            <div className="w-full flex-1 border-2 md:border-4 border-white bg-black overflow-hidden relative shadow-[0_0_20px_rgba(6,182,212,0.2)] md:shadow-[0_0_40px_rgba(6,182,212,0.2)] p-1 md:p-4 flex items-center justify-center">
              <img 
                src={enlargedImage} 
                alt="Enlarged Project View" 
                className="max-w-full max-h-[85vh] md:max-h-[75vh] object-contain pixelated" 
                onClick={(e) => e.stopPropagation()} 
              />
            </div>
          </div>
        </div>
      )}

      {appState === 'skills' && (
        <div className="relative z-50 w-full h-full flex flex-col items-center justify-center pointer-events-auto bg-slate-950/95 backdrop-blur-md px-2 md:px-4 py-4 md:py-8 animate-fade-up select-auto overflow-hidden">
          
          <div className="w-full max-w-5xl bg-black border-2 md:border-4 border-slate-500 shadow-[0_0_30px_rgba(0,0,0,0.8)] flex flex-col h-full max-h-full md:max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-900 border-b-2 md:border-b-4 border-slate-500 p-3 md:p-6 flex justify-between items-center shrink-0">
              <div>
                <p className="text-yellow-400 text-[8px] md:text-xs tracking-widest mb-1">SYSTEM MENU</p>
                <h2 className="text-lg md:text-3xl text-white drop-shadow-[2px_2px_0_#0f172a]">PLAYER STATUS / SKILLS</h2>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); setAppState('dashboard'); }}
                className="flex items-center gap-1 md:gap-2 group border border-slate-600 bg-slate-800 p-1.5 md:p-2 hover:bg-slate-700 transition-colors"
              >
                <div className="w-4 h-4 md:w-5 md:h-5 rounded-full bg-red-600 border border-white flex items-center justify-center text-[8px] md:text-[10px] font-bold text-white shadow-[1px_1px_0_#000] group-hover:bg-red-500 transition-colors">B</div>
                <span className="text-[6px] md:text-[10px] text-slate-300 group-hover:text-white tracking-widest transition-colors hidden sm:block">RETURN</span>
              </button>
            </div>

            {/* Content Body - Allows natural scrolling on mobile */}
            <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden bg-slate-950">
              
              {/* Left Column: Avatar & Vitals */}
              <div className="w-full md:w-1/3 p-4 md:p-6 border-b border-slate-700 md:border-b-0 md:border-r-4 flex flex-col gap-4 md:gap-6 bg-slate-900 items-center justify-start shrink-0 md:overflow-y-auto custom-scrollbar">
                
                <div className="flex flex-row md:flex-col items-center md:justify-start gap-4 md:gap-6 w-full">
                  {/* Portrait Avatar Box */}
                  <div className="w-20 h-20 md:w-48 md:h-48 bg-black border-2 md:border-4 border-slate-500 flex items-center justify-center relative shadow-[2px_2px_0_#000] md:shadow-[4px_4px_0_#000] group overflow-hidden shrink-0">
                    <div className="absolute inset-0 crt-effect opacity-20 pointer-events-none z-10"></div>
                    <img src="/assets/portrait.png" alt="Avatar" className="w-full h-full object-cover pixelated grayscale group-hover:grayscale-0 transition-all duration-500" />
                    <div className="absolute bottom-0 w-full bg-black/80 text-center py-0.5 md:py-1 z-20 border-t border-slate-500">
                      <span className="text-yellow-400 text-[6px] md:text-[10px] tracking-widest">LVL 99</span>
                    </div>
                  </div>
                  
                  <div className="text-left md:text-center flex-1">
                    <h3 className="text-lg md:text-2xl text-cyan-400 mb-0.5 md:mb-1 drop-shadow-[1px_1px_0_#000] md:drop-shadow-[2px_2px_0_#000]">MANUEL</h3>
                    <p className="text-[8px] md:text-[10px] text-slate-400 tracking-widest">CLASS: DEV_KNIGHT</p>
                  </div>
                </div>

                {/* Vitals & Attributes */}
                <div className="w-full bg-black border border-slate-600 p-3 md:p-4 flex flex-col gap-3 md:gap-4 shadow-[2px_2px_0_#000] md:shadow-[4px_4px_0_#000]">
                  <div>
                    <div className="flex justify-between text-[8px] md:text-[10px] mb-1 tracking-widest">
                      <span className="text-fuchsia-400">HP (MOTIVATION)</span>
                      <span className="text-white">999/999</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-slate-800 border border-slate-600"><div className="w-full h-full bg-fuchsia-500"></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-[8px] md:text-[10px] mb-1 tracking-widest">
                      <span className="text-cyan-400">MP (CAFFEINE)</span>
                      <span className="text-white">850/999</span>
                    </div>
                    <div className="w-full h-1.5 md:h-2 bg-slate-800 border border-slate-600"><div className="w-[85%] h-full bg-cyan-400"></div></div>
                  </div>

                  <div className="border-t border-slate-700 my-1 md:my-2"></div>

                  {/* RPG Attributes */}
                  <div className="flex flex-col gap-1 md:gap-2">
                    {[
                      { label: "INT (LOGIC)", val: 95 },
                      { label: "DEX (SPEED)", val: 82 },
                      { label: "VIT (STAMINA)", val: 88 },
                      { label: "CHA (DESIGN)", val: 90 }
                    ].map(stat => (
                      <div key={stat.label} className="flex justify-between items-center text-[8px] md:text-[10px] tracking-widest">
                        <span className="text-slate-400">{stat.label}</span>
                        <span className="text-yellow-400">{stat.val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Skill Trees */}
              <div className="w-full md:w-2/3 p-4 md:p-8 md:overflow-y-auto custom-scrollbar flex flex-col gap-6 md:gap-8 relative">
                
                {/* Background watermark */}
                <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none text-[80px] md:text-[150px] font-bold leading-none text-slate-500">
                  SKILLS
                </div>

                {skillData.map((category, index) => (
                  <div key={index} className="w-full relative z-10">
                    <h3 className="text-cyan-400 text-xs md:text-sm tracking-widest mb-3 md:mb-4 border-b border-slate-700 pb-1 md:pb-2 flex items-center gap-2">
                      <span className="text-fuchsia-500">►</span> {category.category}
                    </h3>
                    
                    <div className="flex flex-col gap-3 md:gap-4 pl-1 md:pl-6">
                      {category.items.map((skill, sIndex) => (
                        <div key={sIndex} className="flex flex-row items-center justify-between gap-2 group">
                          <span className="text-[8px] sm:text-[10px] md:text-xs text-slate-300 group-hover:text-white transition-colors tracking-widest w-24 sm:w-32 md:w-40 truncate">{skill.name}</span>
                          
                          {/* Segmented Proficiency Bar (Out of 10) - Scaled for mobile */}
                          <div className="flex gap-[1px] md:gap-[2px] p-[1px] md:p-[2px] bg-black border border-slate-700 w-fit group-hover:border-cyan-500 transition-colors">
                            {[...Array(10)].map((_, i) => (
                              <div 
                                key={i} 
                                className={`w-2 h-2 sm:w-3 sm:h-3 md:w-4 md:h-4 transition-all duration-300 ${i < skill.level ? 'bg-cyan-500 group-hover:bg-cyan-400 group-hover:shadow-[0_0_5px_#22d3ee]' : 'bg-slate-900'}`}
                                style={{ transitionDelay: `${i * 30}ms` }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Fake Save Data / Footer info */}
                <div className="mt-auto pt-6 md:pt-8 border-t border-slate-800 flex flex-wrap gap-2 md:gap-4 justify-between text-[6px] sm:text-[8px] md:text-[10px] tracking-widest text-slate-500 relative z-10">
                  <p>LOC: <span className="text-slate-300">MANILA, PH</span></p>
                  <p>TIME: <span className="text-slate-300">999:59</span></p>
                  <p>CREDITS: <span className="text-yellow-400">99,999</span></p>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}