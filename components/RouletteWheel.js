'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './RouletteWheel.module.css';
import { NUMBERS, getNumberColorVar } from '@/utils/roulette';

// Map numbers back to their index for easier angle calculation
const NUMBER_TO_INDEX = NUMBERS.reduce((acc, num, idx) => {
    acc[num] = idx;
    return acc;
}, {});

const SINGLE_ANGLE = 360 / 37;

export default function RouletteWheel({
    onSpinComplete,
    physicsConfig = {},
    rotation,
    setRotation,
    ballRotation,
    setBallRotation
}) {
    const [spinning, setSpinning] = useState(false);
    // Internal state moved to props
    const wheelRef = useRef(null);

    // Defaults if config not passed (though it should be)
    const duration = physicsConfig.duration || 5;
    const wheelDir = physicsConfig.wheelDirection || -1; // -1 for CCW (Standard)
    const ballDir = physicsConfig.ballDirection || 1; // 1 for CW
    const extraBallSpins = physicsConfig.ballSpins || 3;

    const spinCheck = () => {
        if (spinning) return;
        setSpinning(true);

        // Pick a random number 0-36
        const outcome = Math.floor(Math.random() * 37);
        const outcomeIndex = NUMBER_TO_INDEX[outcome];
        const indexAngle = outcomeIndex * SINGLE_ANGLE;

        // --- WHEEL PHYSICS ---
        const wheelSpins = 5 + Math.floor(Math.random() * 3);
        const randomOffset = (Math.random() * 8) - 4; // +/- 4deg randomness

        // Calculate current position of the target pocket in World Space
        // Wheel Rotation is negative for CCW usually.
        // Normalized Rotation (0-360 positive)
        const currentWheelMod = (rotation % 360 + 360) % 360;
        // Current world angle of Index 0 is currentWheelMod.
        // Current world angle of Target Pocket is (currentWheelMod + indexAngle) % 360.
        const currentPocketWorld = (currentWheelMod + indexAngle) % 360;

        let wheelDelta = 0;
        if (wheelDir === 1) { // CW
            // We want to bring Pocket to 0 (Top).
            // Distance to travel CW: (360 - currentPocketWorld) % 360.
            // Add full spins.
            const dist = (360 - currentPocketWorld) % 360;
            wheelDelta = (wheelSpins * 360) + dist + randomOffset;
        } else { // CCW (-1)
            // Distance to travel CCW: -currentPocketWorld.
            // Add full spins (negative).
            const dist = -currentPocketWorld;
            wheelDelta = -(wheelSpins * 360) + dist + randomOffset;
        }

        const finalRotation = rotation + wheelDelta;

        // --- BALL PHYSICS ---
        // Ball needs to land on the Target Pocket.
        // Ball is child of Wheel. Position is relative to Wheel.
        // Target Ball Angle (Relative) = indexAngle.
        // We want ballRotation % 360 === indexAngle.

        const ballSpins = wheelSpins + extraBallSpins + Math.floor(Math.random() * 2);
        const currentBallMod = (ballRotation % 360 + 360) % 360;

        let ballDelta = 0;
        if (ballDir === 1) { // CW
            // Target is indexAngle.
            // Dist = (target - current + 360) % 360.
            const dist = (indexAngle - currentBallMod + 360) % 360;
            ballDelta = (ballSpins * 360) + dist;
        } else { // CCW
            // Dist = -((current - target + 360) % 360)
            const dist = -((currentBallMod - indexAngle + 360) % 360);
            ballDelta = -(ballSpins * 360) + dist;
        }

        // Ball does NOT get randomOffset? 
        // If Wheel gets randomOffset, the Pocket moves. 
        // Ball is relative to Wheel. If Ball lands exactly on IndexAngle, it lands on the Pocket.
        // So Ball moves WITH the randomOffset automatically because it is a child.
        // So we DON'T add randomOffset to ballRotation.

        const nextBallRotation = ballRotation + ballDelta;

        setRotation(finalRotation);
        setBallRotation(nextBallRotation);

        // Wait for animation to finish
        setTimeout(() => {
            setSpinning(false);
            onSpinComplete({
                outcome,
                deltaRotation: wheelDelta,
                totalRotation: finalRotation,
                ballRotation: nextBallRotation,
                duration,
                wheelDir,
                ballDir
            });
        }, duration * 1000);
    };



    return (
        <div className={styles.wheelContainer}>
            <div className={styles.pointer}></div>
            <div
                className={styles.wheel}
                style={{
                    transform: `rotate(${wheelDir * rotation}deg)`,
                    transition: spinning ? `transform ${duration}s cubic-bezier(0.2, 0.0, 0.2, 1)` : 'none'
                }}
            >
                <div
                    className={styles.ballTrack}
                    style={{
                        transform: `rotate(${ballRotation}deg)`,
                        transition: spinning ? `transform ${duration}s cubic-bezier(0.2, 0.0, 0.2, 1)` : 'none'
                        // Using same easing for now, but really ball should decelerate differently.
                        // For simple visuals, locking them together at the end is smoother.
                    }}
                >
                    <div className={styles.ball}></div>
                </div>
                <div className={styles.rim}>
                    {NUMBERS.map((num, i) => (
                        <div
                            key={num}
                            className={styles.pocket}
                            style={{
                                transform: `rotate(${i * SINGLE_ANGLE}deg)`,
                                color: 'white' // Text color
                            }}
                        >
                            {/* Wedge Background using a pseudo-element style or border trick could go here, 
                                but for now we rely on the parent conic-gradient? 
                                Actually, let's put the color HERE to be controlled by JS.
                                We can make this div the wedge.
                            */}
                            <div
                                className={styles.wedge}
                                style={{ backgroundColor: getNumberColorVar(num) }}
                            ></div>
                            <span className={styles.number} style={{ transform: `rotate(${0}deg)` }}>{num}</span>
                        </div>
                    ))}
                    {/* Inner rings for decoration */}
                    <div className={styles.innerRing}></div>
                    <div className={styles.centerKnob}></div>
                </div>
            </div>
            <button className={styles.spinBtn} onClick={spinCheck} disabled={spinning}>
                {spinning ? '...' : 'SPIN'}
            </button>
        </div>
    );
}
