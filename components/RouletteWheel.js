'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './RouletteWheel.module.css';
import { NUMBERS, getNumberColorVar, calculateDecay, shouldDrop, calculateScatter, GRAVITY, RIM_RADIUS, POCKET_RADIUS } from '@/utils/roulette';

const SINGLE_ANGLE = 360 / 37;

export default function RouletteWheel({
    onSpinComplete,
    physicsConfig = {},
    rotation: initialRotation,
    setRotation: setParentRotation,
    ballRotation: initialBallRotation,
    setBallRotation: setParentBallRotation
}) {
    const [spinning, setSpinning] = useState(false);
    const [isAuto, setIsAuto] = useState(false); // Auto-spin state

    // Refs for DOM access to avoid re-renders during animation
    const wheelRef = useRef(null);
    const ballTrackRef = useRef(null);
    const ballRef = useRef(null);

    // Animation Loop Ref
    const requestRef = useRef();
    const startTimeRef = useRef();
    const previousTimeRef = useRef();

    // Auto Spin Timer Ref
    const autoTimerRef = useRef();

    // Physics State Refs
    const state = useRef({
        wheelAngle: initialRotation || 0,
        ballAngle: initialBallRotation || 0,
        ballVelocity: 0,
        wheelVelocity: 0,
        ballRadius: RIM_RADIUS, // Starting on rim
        radialVelocity: 0,
        phase: 'idle', // idle, spinning, dropping, settled
        tiltAngle: 0
    });

    const directionToggleRef = useRef(1); // 1 = CW, -1 = CCW. Starts CW.

    // ... (useEffect for props sync remains same)

    const animate = (time) => {
        // ... (animate function logic remains same, just need to ensure finishSpin access state)
        if (!previousTimeRef.current) previousTimeRef.current = time;
        const dt = Math.min((time - previousTimeRef.current) / 1000, 0.1);
        previousTimeRef.current = time;

        const s = state.current;
        const config = physicsConfig;

        if (s.phase !== 'idle') {
            s.wheelVelocity *= 0.999;
            s.wheelAngle += s.wheelVelocity * dt * (s.spinDir || -1);
        }

        if (s.phase === 'spinning') {
            s.ballVelocity = calculateDecay(s.ballVelocity, dt);
            s.ballAngle += s.ballVelocity * dt * (config.ballDirection || 1);
            if (shouldDrop(s.ballVelocity, config.tiltAngle || 0)) {
                s.phase = 'dropping';
            }
        } else if (s.phase === 'dropping') {
            const dropSpeed = 200 * dt;
            s.ballRadius -= dropSpeed;
            s.ballVelocity *= 0.98;
            s.ballAngle += s.ballVelocity * dt * (config.ballDirection || 1);

            if (s.ballRadius < 155 && s.ballRadius > 135) {
                const currentRelAngle = (s.ballAngle % 360 + 360) % 360;
                const currentWorldAngle = ((s.wheelAngle + s.ballAngle) % 360 + 360) % 360;
                const anyClose = [0, 45, 90, 135, 180, 225, 270, 315].some(d => Math.abs(d - currentWorldAngle) < 5);

                if (anyClose) {
                    const { kickRotation, radialKick } = calculateScatter(
                        config.restitution || 0.5,
                        config.scatter || 0.5
                    );
                    s.ballAngle += kickRotation;
                    if (Math.random() > 0.5) s.ballRadius += 5;
                }
            }

            if (s.ballRadius <= POCKET_RADIUS) {
                s.ballRadius = POCKET_RADIUS;
                const { kickRotation } = calculateScatter(config.restitution || 0.5, config.scatter || 0.5);
                s.ballAngle += kickRotation;
                s.phase = 'settling';
            }

        } else if (s.phase === 'settling') {
            s.ballVelocity *= 0.90;
            s.ballAngle += s.ballVelocity * dt * (config.ballDirection || 1);

            if (Math.abs(s.ballVelocity) < 10) {
                s.ballVelocity = 0;
                s.phase = 'idle';
                finishSpin();
                return;
            }
        }

        if (wheelRef.current) wheelRef.current.style.transform = `rotate(${s.wheelAngle}deg)`;
        if (ballTrackRef.current) ballTrackRef.current.style.transform = `rotate(${s.ballAngle}deg)`;
        if (ballRef.current) ballRef.current.style.top = `${200 - s.ballRadius}px`;

        requestRef.current = requestAnimationFrame(animate);
    };

    const finishSpin = () => {
        setSpinning(false);
        const s = state.current;

        const normalizedBall = (s.ballAngle % 360 + 360) % 360;
        const winningIndex = Math.round(normalizedBall / SINGLE_ANGLE) % 37;
        const winningNumber = NUMBERS[winningIndex];

        if (onSpinComplete) {
            onSpinComplete({
                outcome: winningNumber,
                deltaRotation: 0,
                totalRotation: s.wheelAngle,
                ballRotation: s.ballAngle,
                duration: physicsConfig.duration,
                wheelDir: -1,
                ballDir: 1
            });
        }

        setParentRotation(s.wheelAngle);
        setParentBallRotation(s.ballAngle);

        // AUTO-SPIN LOGIC
        // Using a ref to check current value of isAuto inside closure if needed, 
        // but since finishSpin is re-created every render? No, it's inside component. 
        // Wait, finishSpin is called from animate loop. Animate loop is a closure over state at creation time? 
        // No, `animate` is created every render? No, `animate` is defined in render scope.
        // `requestAnimationFrame(animate)` uses the `animate` from the scope when it was called?
        // Actually, `animate` function is recreated every render, but requestAnimationFrame callback might hold onto old one if not careful.
        // BUT, we are calling `requestAnimationFrame(animate)` inside `animate`.
        // If `animate` is redefined, the recursive call uses the NEW `animate`? No, it uses the variable name `animate` from scope.
        // To be safe, let's use a Ref for `isAuto` if we want to read it inside the loop reliably without dependency issues, 
        // OR just rely on state if `finishSpin` is called at end.
        // Let's rely on looking up `isAuto` from a Ref to be 100% sure we get latest value.
        // Actually, let's just use `setIsAuto` setter logic or an effect?
        // Simplest: Check the state variable. Since `finishSpin` is called at the end, and the component re-renders while spinning... 
        // `animate` closes over strict values? 
        // Be careful: `animate` definition closes over values from the render where `spinCheck` was called?
        // NO, `animate` is defined in the body. If `spinCheck` starts the loop, it enters the loop.
        // The loop calls `requestAnimationFrame(animate)`. `animate` refers to the function.
        // If we use `useCallback` or just function, it might be stale.
        // Ideally we use a Ref for `isAuto` to avoid stale closures.
    };

    // Helper to access state in closure
    const isAutoRef = useRef(isAuto);
    useEffect(() => { isAutoRef.current = isAuto; }, [isAuto]);

    // Re-bind finishSpin to use Ref
    const finishSpinSafe = () => {
        setSpinning(false);
        const s = state.current;
        const normalizedBall = (s.ballAngle % 360 + 360) % 360;
        const winningIndex = Math.round(normalizedBall / SINGLE_ANGLE) % 37;
        const winningNumber = NUMBERS[winningIndex];

        if (onSpinComplete) {
            onSpinComplete({ outcome: winningNumber });
        }

        setParentRotation(s.wheelAngle);
        setParentBallRotation(s.ballAngle);

        // AUTO SPIN CHECK
        if (isAutoRef.current) {
            console.log("Auto Spin: Restarting immediately...");
            autoTimerRef.current = setTimeout(() => {
                if (isAutoRef.current) {
                    spinCheck();
                }
            }, 500);
        }
    };

    // Need to update `animate` to call `finishSpinSafe` instead of `finishSpin`.
    // And remove old `finishSpin`.

    const animateSafe = (time) => {
        if (!previousTimeRef.current) previousTimeRef.current = time;
        const dt = Math.min((time - previousTimeRef.current) / 1000, 0.1);
        previousTimeRef.current = time;

        const s = state.current;
        const config = physicsConfig;

        if (s.phase !== 'idle') {
            s.wheelVelocity *= 0.999;
            s.wheelAngle += s.wheelVelocity * dt * (s.spinDir || -1);
        }

        if (s.phase === 'spinning') {
            s.ballVelocity = calculateDecay(s.ballVelocity, dt);
            s.ballAngle += s.ballVelocity * dt * s.ballDir;
            if (shouldDrop(s.ballVelocity, config.tiltAngle || 0)) {
                s.phase = 'dropping';
            }
        } else if (s.phase === 'dropping') {
            // Gravity acceleration (Linear approximation for visual flow)
            s.radialVelocity += 150 * dt; // Gravity pulling down
            s.ballRadius -= s.radialVelocity * dt;

            s.ballVelocity *= 0.99; // Slightly less friction in air
            s.ballAngle += s.ballVelocity * dt * s.ballDir;

            // Deflector interactions range
            if (s.ballRadius < 155 && s.ballRadius > 135) {
                const currentRelAngle = (s.ballAngle % 360 + 360) % 360;
                const currentWorldAngle = ((s.wheelAngle + s.ballAngle) % 360 + 360) % 360;
                // Check if near a diamond (every 45 degrees)
                const anyClose = [0, 45, 90, 135, 180, 225, 270, 315].some(d => Math.abs(d - currentWorldAngle) < 5);

                if (anyClose) {
                    const { kickRotation, radialKick } = calculateScatter(config.restitution || 0.6, config.scatter || 0.5);

                    // Bounce!
                    if (Math.random() > 0.3) {
                        s.radialVelocity = -s.radialVelocity * 0.5; // Bounce back up
                        s.ballAngle += kickRotation * 0.5;
                        // Add some visual chaos
                    }
                }
            }
            if (s.ballRadius <= POCKET_RADIUS) {
                s.ballRadius = POCKET_RADIUS;
                const { kickRotation } = calculateScatter(config.restitution || 0.5, config.scatter || 0.5);
                s.ballAngle += kickRotation;
                s.phase = 'settling';
            }
        } else if (s.phase === 'settling') {
            s.ballVelocity *= 0.90;
            s.ballAngle += s.ballVelocity * dt * s.ballDir;

            if (Math.abs(s.ballVelocity) < 10) {
                s.ballVelocity = 0;
                s.phase = 'idle';
                finishSpinSafe(); // Call the safe version
                return;
            }
        }

        if (wheelRef.current) wheelRef.current.style.transform = `rotate(${s.wheelAngle}deg)`;
        if (ballTrackRef.current) ballTrackRef.current.style.transform = `rotate(${s.ballAngle}deg)`;
        if (ballRef.current) ballRef.current.style.top = `${200 - s.ballRadius}px`;

        requestRef.current = requestAnimationFrame(animateSafe);
    };

    const spinCheck = () => {
        if (spinning) return;
        setSpinning(true);
        state.current.phase = 'spinning';
        state.current.ballRadius = RIM_RADIUS;
        state.current.radialVelocity = 0;

        // RPM to degrees/sec: RPM * 360 / 60 = RPM * 6
        state.current.ballVelocity = (physicsConfig.ballRPM || 105) * 6;
        // RPM to degrees/sec: RPM * 360 / 60 = RPM * 6
        state.current.wheelVelocity = (physicsConfig.wheelRPM || 20) * 6;

        // Alternating logic
        state.current.spinDir = directionToggleRef.current;
        state.current.ballDir = -state.current.spinDir; // Ball always opposite to wheel
        directionToggleRef.current *= -1; // Toggle for next time

        state.current.tiltAngle = physicsConfig.tiltAngle || 0;

        previousTimeRef.current = null;
        requestRef.current = requestAnimationFrame(animateSafe);
    };

    const toggleAuto = () => {
        const newVal = !isAuto;
        setIsAuto(newVal);
        isAutoRef.current = newVal; // Update ref immediately for any pending timeouts

        if (newVal) {
            // Started Auto
            if (!spinning && state.current.phase === 'idle') {
                spinCheck();
            }
        } else {
            // Stopped Auto
            if (autoTimerRef.current) {
                clearTimeout(autoTimerRef.current);
            }
        }
    };

    // Cleanup
    useEffect(() => {
        return () => {
            cancelAnimationFrame(requestRef.current);
            if (autoTimerRef.current) clearTimeout(autoTimerRef.current);
        };
    }, []);

    return (
        <div className={styles.wheelContainer}>
            {/* ... (Visuals remain same) ... */}
            <div className={styles.pointer}></div>
            <div className={styles.wheel} ref={wheelRef} style={{ transform: `rotate(${initialRotation}deg)` }}>
                <div className={styles.ballTrack} ref={ballTrackRef} style={{ transform: `rotate(${initialBallRotation}deg)` }}>
                    <div className={styles.ball} ref={ballRef}></div>
                </div>
                <div className={styles.rim}>
                    {NUMBERS.map((num, i) => (
                        <div key={num} className={styles.pocket} style={{ transform: `rotate(${i * SINGLE_ANGLE}deg)`, color: 'white' }}>
                            <div className={styles.wedge} style={{ backgroundColor: getNumberColorVar(num) }}></div>
                            <span className={styles.number} style={{ transform: `rotate(${0}deg)` }}>{num}</span>
                        </div>
                    ))}
                    <div className={styles.goldRing} style={{ width: '70%', height: '70%' }}></div>
                    <div className={styles.goldRing} style={{ width: '40%', height: '40%' }}></div>
                    <div className={styles.turretContainer}>
                        <div className={styles.turretArm} style={{ transform: 'translate(-50%, -50%) rotate(0deg)' }}></div>
                        <div className={styles.turretArm} style={{ transform: 'translate(-50%, -50%) rotate(90deg)' }}></div>
                        <div className={styles.turretBase}></div>
                        <div className={styles.turretCap}></div>
                    </div>
                </div>
            </div>

            <div className={styles.controls}>
                <button
                    className={styles.spinBtn}
                    onClick={toggleAuto}
                    style={{
                        margin: '0 auto', // Center it
                        background: isAuto ? '#d10046' : 'var(--gold-dim)', // Red to stop, Gold to start
                        minWidth: '200px'
                    }}
                >
                    {isAuto ? 'STOP GAME' : 'START GAME'}
                </button>
            </div>
        </div >
    );

}
