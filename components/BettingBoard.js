'use client';

import React from 'react';
import styles from './BettingBoard.module.css';
import { isRed } from '@/utils/roulette';

// European Roulette Numbers Map
// We need to render them in standard layout
// 3 Rows.
// Row 3: 3, 6, 9...
// Row 2: 2, 5, 8...
// Row 1: 1, 4, 7...
// Note: Usually 3 is at the "top" visually on screen if 0 is left?
// Let's assume standard orientation where 0 is Left.
// Then col 1 has 1,2,3? Or 3,2,1?
// Standard Board:
//      3  6 ... 36
//  0   2  5 ... 35
//      1  4 ... 34
// Actually, numerically 1,2,3 go down or up?
// Usually:
//  3 (Red)
//  2 (Black)
//  1 (Red)
// So 1 is bottom. 3 is top.

const ROWS = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34]
];

export default function BettingBoard({ onPlaceBet }) {

    const handleBet = (type, value) => {
        // onPlaceBet(type, value);
        console.log('Bet placed:', type, value);
    };

    return (
        <div className={styles.boardWrapper}>
            <div className={styles.board}>
                {/* Zero */}
                <div className={`${styles.zero} ${styles.cell}`} onClick={() => handleBet('number', 0)}>
                    <span>0</span>
                </div>

                {/* Numbers Grid */}
                <div className={styles.numbersGrid}>
                    {ROWS.map((row, rowIndex) => (
                        <div key={rowIndex} className={styles.row}>
                            {row.map((num) => (
                                <div
                                    key={num}
                                    className={`${styles.cell} ${styles.numberCell} ${isRed(num) ? styles.red : styles.black}`}
                                    onClick={() => handleBet('number', num)}
                                >
                                    <span className={styles.numText}>{num}</span>
                                </div>
                            ))}
                            {/* 2 to 1 for this row */}
                            <div
                                className={`${styles.cell} ${styles.columnBet}`}
                                onClick={() => handleBet('column', 3 - rowIndex)}
                            >
                                <span>2:1</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Dozens */}
                <div className={styles.dozens}>
                    <div className={`${styles.cell} ${styles.dozen}`} onClick={() => handleBet('dozen', 1)}>1st 12</div>
                    <div className={`${styles.cell} ${styles.dozen}`} onClick={() => handleBet('dozen', 2)}>2nd 12</div>
                    <div className={`${styles.cell} ${styles.dozen}`} onClick={() => handleBet('dozen', 3)}>3rd 12</div>
                </div>

                {/* Bottom Bets */}
                <div className={styles.bottomBets}>
                    <div className={`${styles.cell} ${styles.outside}`} onClick={() => handleBet('half', 'low')}>1-18</div>
                    <div className={`${styles.cell} ${styles.outside}`} onClick={() => handleBet('parity', 'even')}>EVEN</div>
                    <div className={`${styles.cell} ${styles.outside} ${styles.redDiamond}`} onClick={() => handleBet('color', 'red')}>
                        <div className={styles.redDiamondShape}></div>
                    </div>
                    <div className={`${styles.cell} ${styles.outside} ${styles.blackDiamond}`} onClick={() => handleBet('color', 'black')}>
                        <div className={styles.blackDiamondShape}></div>
                    </div>
                    <div className={`${styles.cell} ${styles.outside}`} onClick={() => handleBet('parity', 'odd')}>ODD</div>
                    <div className={`${styles.cell} ${styles.outside}`} onClick={() => handleBet('half', 'high')}>19-36</div>
                </div>
            </div>
        </div>
    );
}
