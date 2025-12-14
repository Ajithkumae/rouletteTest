'use client';



import { useState, useEffect } from 'react';
import styles from './page.module.css';
import RouletteWheel from '@/components/RouletteWheel';
import BettingBoard from '@/components/BettingBoard';
import SettingsModal from '@/components/SettingsModal';

import { getNumberColorVar } from '@/utils/roulette';

export default function Home() {
  const [balance, setBalance] = useState(1000);
  const [currentBet, setCurrentBet] = useState(0);
  const [gameStatus, setGameStatus] = useState('IDLE'); // IDLE, SPINNING, RESULT
  const [history, setHistory] = useState([]);
  const [historySort, setHistorySort] = useState('newest'); // 'newest' or 'oldest'

  // Lifted State for Manual Control
  const [wheelRotation, setWheelRotation] = useState(0);
  const [ballRotation, setBallRotation] = useState(0);

  const [physicsConfig, setPhysicsConfig] = useState({
    duration: 5, // seconds
    wheelDirection: -1, // -1 CCW, 1 CW
    ballSpins: 3, // Extra spins relative to wheel
    ballDirection: 1 // 1 CW (opposite to wheel usually), -1 CCW
  });



  const [wheelRPM, setWheelRPM] = useState(20);
  const [ballRPM, setBallRPM] = useState(105);
  const [showSettings, setShowSettings] = useState(false);

  const [selectedSpin, setSelectedSpin] = useState(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('roulette_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('roulette_history', JSON.stringify(history));
    }
  }, [history]);

  const handleSpinComplete = (spinResult) => {
    setGameStatus('RESULT');
    // spinResult includes { outcome, deltaRotation, ... }
    const newEntry = { ...spinResult, timestamp: new Date().toLocaleTimeString() };
    setHistory(prev => [newEntry, ...prev].slice(0, 20)); // Keep last 20
    console.log('Result:', spinResult.outcome);
    // TODO: Calculate winnings
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('roulette_history');
  };

  return (
    <main className={styles.main}>
      {/* <div className={styles.header}>
        <h1>Roulette Royale</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span>Balance</span>
            <span className={styles.value}>${balance}</span>
          </div>
          <div className={styles.statItem}>
            <span>Bet</span>
            <span className={styles.value}>${currentBet}</span>
          </div>
        </div>
      </div> */}



      <div className={styles.gameArea}>
        <div style={{ padding: '10px', textAlign: 'right' }}>
          <button
            onClick={() => setShowSettings(true)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#1a1a1a',
              color: '#daa520',
              border: '1px solid #daa520',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            ⚙ SETTINGS
          </button>
        </div>

        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          wheelRPM={wheelRPM}
          setWheelRPM={setWheelRPM}
          ballRPM={ballRPM}
          setBallRPM={setBallRPM}
        />
        <div className={styles.wheelContainer}>
          <RouletteWheel
            onSpinComplete={handleSpinComplete}
            physicsConfig={{ ...physicsConfig, wheelRPM, ballRPM }}
            rotation={wheelRotation}
            setRotation={setWheelRotation}
            ballRotation={ballRotation}
            setBallRotation={setBallRotation}
          />
        </div>
        {/* <div className={styles.boardContainer}>
          <BettingBoard onPlaceBet={(type, val) => console.log(type, val)} />
        </div> */}
        <div className={styles.historyBar}>
          <div className={styles.historyHeader}>
            <span className={styles.historyLabel}>HISTORY:</span>
            <div className={styles.actionButtons}>
              <button
                className={styles.sortBtn}
                onClick={() => setHistorySort(prev => prev === 'newest' ? 'oldest' : 'newest')}
              >
                {historySort === 'newest' ? '⬇ New' : '⬆ Old'}
              </button>
              {history.length > 0 && (
                <button className={styles.clearBtn} onClick={clearHistory}>Clear</button>
              )}
            </div>
          </div>
          <div className={styles.historyList}>
            {history.length === 0 && <span className={styles.emptyHistory}>-</span>}
            {/* Sort and Map */}
            {(historySort === 'newest' ? history : [...history].reverse()).map((entry, i) => (
              <div
                key={i}
                className={styles.historyItem}
                style={{
                  backgroundColor: getNumberColorVar(entry.outcome),
                  opacity: 1 // No fade, user wants to click old ones
                }}
                onClick={() => setSelectedSpin(entry)}
              >
                {entry.outcome}
              </div>
            ))}
          </div>
        </div>

        {/* Details Modal */}
        {selectedSpin && (
          <div className={styles.modalOverlay} onClick={() => setSelectedSpin(null)}>
            <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
              <h3>Spin Details</h3>
              <div className={styles.detailRow}>
                <span>Result:</span> <strong>{selectedSpin.outcome}</strong>
              </div>
              <div className={styles.detailRow}>
                <span>Time:</span> <span>{selectedSpin.timestamp}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Duration:</span> <span>{selectedSpin.duration}s</span>
              </div>
              <div className={styles.detailRow}>
                <span>Wheel Rotation:</span> <span>{selectedSpin.deltaRotation.toFixed(0)}°</span>
              </div>
              <div className={styles.detailRow}>
                <span>Ball Rotation:</span> <span>{selectedSpin.ballRotation.toFixed(0)}°</span>
              </div>
              <div className={styles.detailRow}>
                <span>Wheel Dir:</span> <span>{selectedSpin.wheelDir === 1 ? 'CW' : 'CCW'}</span>
              </div>
              <div className={styles.detailRow}>
                <span>Ball Dir:</span> <span>{selectedSpin.ballDir === 1 ? 'CW' : 'CCW'}</span>
              </div>
              <button className={styles.closeBtn} onClick={() => setSelectedSpin(null)}>Close</button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
