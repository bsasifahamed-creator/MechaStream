
'use client';

import React, { useMemo, useState } from 'react';
import styles from './page.module.css';

type CSSVars = React.CSSProperties & Record<`--${string}`, string>;

const wishes = [
  'May your year sparkle with success, joy, and unforgettable adventures.',
  'Wishing you endless laughter, beautiful memories, and all the happiness you deserve.',
  'May every dream you hold today become a bright reality tomorrow.',
  'Happy Birthday Zeeshan Farhath! Keep shining, inspiring, and celebrating life in style.',
];

const sparkleDots = Array.from({ length: 44 }, (_, index) => ({
  id: `spark-${index}`,
  left: `${(index * 37 + 11) % 100}%`,
  top: `${(index * 19 + 7) % 100}%`,
  size: 2 + (index % 3),
  duration: 2.1 + (index % 5) * 0.7,
  delay: (index % 7) * 0.35,
  opacity: 0.38 + (index % 4) * 0.14,
}));

const lightBeams = [
  { id: 'beam-1', left: '8%', hue: 10, delay: '0s' },
  { id: 'beam-2', left: '24%', hue: 60, delay: '0.7s' },
  { id: 'beam-3', left: '49%', hue: 145, delay: '1.1s' },
  { id: 'beam-4', left: '71%', hue: 245, delay: '0.3s' },
  { id: 'beam-5', left: '88%', hue: 320, delay: '1.5s' },
];

const balloons = [
  { id: 'balloon-1', x: '8%', y: '20%', z: '160px', color: '#ff5f9e', delay: '0s', duration: '7.1s' },
  { id: 'balloon-2', x: '21%', y: '13%', z: '120px', color: '#60a5fa', delay: '1.1s', duration: '6.5s' },
  { id: 'balloon-3', x: '34%', y: '23%', z: '60px', color: '#fbbf24', delay: '0.5s', duration: '8s' },
  { id: 'balloon-4', x: '63%', y: '11%', z: '90px', color: '#a78bfa', delay: '1.8s', duration: '7.3s' },
  { id: 'balloon-5', x: '78%', y: '18%', z: '140px', color: '#34d399', delay: '0.8s', duration: '7.8s' },
  { id: 'balloon-6', x: '92%', y: '24%', z: '40px', color: '#fb7185', delay: '1.4s', duration: '6.9s' },
];

const gifts = [
  { id: 'gift-1', left: '14%', rotate: '-18deg', colorA: '#6d28d9', colorB: '#4c1d95', ribbon: '#fef08a', delay: '0.4s' },
  { id: 'gift-2', left: '30%', rotate: '12deg', colorA: '#be185d', colorB: '#831843', ribbon: '#fde68a', delay: '1.1s' },
  { id: 'gift-3', left: '70%', rotate: '-14deg', colorA: '#0f766e', colorB: '#134e4a', ribbon: '#fef3c7', delay: '0.6s' },
  { id: 'gift-4', left: '86%', rotate: '15deg', colorA: '#1d4ed8', colorB: '#1e3a8a', ribbon: '#fff7ed', delay: '1.5s' },
];

const cakeLayers = [
  { id: 'layer-bottom', width: 272, height: 92, bottom: 0, colorA: '#5b21b6', colorB: '#312e81' },
  { id: 'layer-middle', width: 224, height: 78, bottom: 66, colorA: '#7c3aed', colorB: '#4c1d95' },
  { id: 'layer-top', width: 176, height: 64, bottom: 124, colorA: '#a855f7', colorB: '#6d28d9' },
];

const confettiPalette = ['#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#6366f1', '#ec4899', '#f8fafc'];

const pseudoRandom = (seed: number): number => {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export default function HomePage() {
  const [partyMode, setPartyMode] = useState(false);
  const [wishIndex, setWishIndex] = useState(0);
  const [burstSeed, setBurstSeed] = useState(1);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const confettiPieces = useMemo(() => {
    if (!partyMode) return [];

    return Array.from({ length: 120 }, (_, index) => {
      const seed = burstSeed * 200 + index * 17;

      return {
        id: `${burstSeed}-${index}`,
        left: `${Math.round(pseudoRandom(seed) * 100)}%`,
        delay: `${(pseudoRandom(seed + 1) * 0.5).toFixed(2)}s`,
        fallDuration: `${(2.8 + pseudoRandom(seed + 2) * 2.1).toFixed(2)}s`,
        spinDuration: `${(1 + pseudoRandom(seed + 3) * 1.8).toFixed(2)}s`,
        drift: `${Math.round(pseudoRandom(seed + 4) * 240 - 120)}px`,
        rotation: `${Math.round(pseudoRandom(seed + 5) * 720 - 360)}deg`,
        color: confettiPalette[index % confettiPalette.length],
      };
    });
  }, [burstSeed, partyMode]);

  const launchSurprise = () => {
    setPartyMode(true);
    setBurstSeed((value) => value + 1);
    setWishIndex((value) => (value + 1) % wishes.length);
  };

  const showNextWish = () => {
    setWishIndex((value) => (value + 1) % wishes.length);
    if (!partyMode) setPartyMode(true);
  };

  const handleSceneMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const relativeX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const relativeY = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({
      x: Number((-relativeY * 10).toFixed(2)),
      y: Number((relativeX * 14).toFixed(2)),
    });
  };

  const resetTilt = () => setTilt({ x: 0, y: 0 });

  return (
    <div className={`${styles.page} ${partyMode ? styles.partyOn : ''}`}>
      <div className={styles.aurora} />
      <div className={styles.mesh} />

      <div className={styles.sparkleLayer} aria-hidden="true">
        {sparkleDots.map((dot) => (
          <span
            key={dot.id}
            className={styles.sparkle}
            style={{
              left: dot.left,
              top: dot.top,
              width: dot.size,
              height: dot.size,
              animationDuration: `${dot.duration}s`,
              animationDelay: `${dot.delay}s`,
              opacity: dot.opacity,
            }}
          />
        ))}
      </div>

      {partyMode && (
        <div className={styles.confettiLayer} aria-hidden="true">
          {confettiPieces.map((piece) => {
            const style: CSSVars = {
              left: piece.left,
              '--piece-color': piece.color,
              '--delay': piece.delay,
              '--fall-duration': piece.fallDuration,
              '--spin-duration': piece.spinDuration,
              '--drift': piece.drift,
              '--rotation': piece.rotation,
            };
            return <span key={piece.id} className={styles.confettiPiece} style={style} />;
          })}
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.hero}>
          <p className={styles.badge}>Immersive 3D Birthday Celebration</p>
          <h1 className={styles.title}>
            Happy Birthday <span className={styles.name}>Zeeshan Farhath</span>
          </h1>
          <p className={styles.subtitle}>
            A fun and surprising birthday world with lights, depth, floating balloons, a glowing cake,
            and interactive celebration effects. Move your pointer on the scene to feel the 3D tilt.
          </p>

          <div className={styles.buttonRow}>
            <button type="button" className={styles.primaryButton} onClick={launchSurprise}>
              {partyMode ? 'Launch bigger surprise' : 'Launch surprise'}
            </button>
            <button type="button" className={styles.secondaryButton} onClick={showNextWish}>
              Show next birthday wish
            </button>
          </div>

          <article className={styles.wishCard} aria-live="polite">
            <p className={styles.wishLabel}>Live birthday wish</p>
            <p className={styles.wishText}>{wishes[wishIndex]}</p>
            <div className={`${styles.equalizer} ${partyMode ? styles.equalizerActive : ''}`} aria-hidden="true">
              {Array.from({ length: 12 }, (_, index) => (
                <span
                  key={`bar-${index}`}
                  className={styles.equalizerBar}
                  style={{ animationDelay: `${index * 0.08}s` }}
                />
              ))}
            </div>
          </article>
        </section>

        <section className={styles.sceneSection}>
          <div className={styles.sceneViewport} onPointerMove={handleSceneMove} onPointerLeave={resetTilt}>
            <div className={styles.scene} style={{ transform: `rotateX(${18 + tilt.x}deg) rotateY(${tilt.y}deg)` }}>
              <div className={styles.floorGlow} />

              <div className={styles.lightBeamLayer} aria-hidden="true">
                {lightBeams.map((beam) => (
                  <span
                    key={beam.id}
                    className={styles.lightBeam}
                    style={{
                      left: beam.left,
                      animationDelay: beam.delay,
                      filter: `hue-rotate(${beam.hue}deg)`,
                    }}
                  />
                ))}
              </div>

              <div className={styles.balloonLayer} aria-hidden="true">
                {balloons.map((balloon) => {
                  const style: CSSVars = {
                    '--balloon-color': balloon.color,
                    '--balloon-x': balloon.x,
                    '--balloon-y': balloon.y,
                    '--balloon-z': balloon.z,
                    '--balloon-delay': balloon.delay,
                    '--balloon-duration': balloon.duration,
                  };

                  return (
                    <div key={balloon.id} className={styles.balloon} style={style}>
                      <span className={styles.balloonShine} />
                      <span className={styles.balloonKnot} />
                      <span className={styles.balloonString} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.cake}>
                {cakeLayers.map((layer) => {
                  const style: CSSVars = {
                    width: `${layer.width}px`,
                    height: `${layer.height}px`,
                    bottom: `${layer.bottom}px`,
                    '--cake-a': layer.colorA,
                    '--cake-b': layer.colorB,
                  };

                  return <div key={layer.id} className={styles.cakeLayer} style={style} />;
                })}

                <div className={styles.frosting} aria-hidden="true">
                  {Array.from({ length: 11 }, (_, index) => (
                    <span
                      key={`drop-${index}`}
                      className={styles.frostDrop}
                      style={{
                        left: `${6 + index * 8.4}%`,
                        animationDelay: `${index * 0.12}s`,
                      }}
                    />
                  ))}
                </div>

                <div className={styles.candleRow} aria-hidden="true">
                  {[-64, 0, 64].map((offset, index) => {
                    const style: CSSVars = {
                      '--x': `${offset}px`,
                      '--delay': `${index * 0.18}s`,
                    };

                    return (
                      <div key={`candle-${offset}`} className={styles.candle} style={style}>
                        <span className={styles.flame} />
                      </div>
                    );
                  })}
                </div>

                <div className={styles.cakePlate} />
              </div>

              <div className={styles.giftLayer} aria-hidden="true">
                {gifts.map((gift) => {
                  const style: CSSVars = {
                    left: gift.left,
                    '--gift-a': gift.colorA,
                    '--gift-b': gift.colorB,
                    '--gift-ribbon': gift.ribbon,
                    '--gift-rotate': gift.rotate,
                    animationDelay: gift.delay,
                  };

                  return (
                    <div key={gift.id} className={styles.gift} style={style}>
                      <span className={styles.giftLid} />
                      <span className={styles.giftRibbonVertical} />
                      <span className={styles.giftRibbonHorizontal} />
                    </div>
                  );
                })}
              </div>

              <div className={styles.starRing} aria-hidden="true">
                {Array.from({ length: 18 }, (_, index) => (
                  <span
                    key={`star-${index}`}
                    className={styles.star}
                    style={{ transform: `rotate(${index * 20}deg) translateY(-180px)` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <p className={styles.footerText}>
          Made with joy to celebrate Zeeshan Farhath with a fun and realistic 3D birthday vibe.
        </p>
      </main>
    </div>
  );
}
