
export const NUMBERS = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];

export const isRed = (num) => RED_NUMBERS.includes(num);

export const getNumberColor = (num) => {
    if (num === 0) return 'green';
    return isRed(num) ? 'red' : 'black';
};

export const getNumberColorVar = (num) => {
    if (num === 0) return 'var(--felt-green)';
    return isRed(num) ? 'var(--red-roulette)' : 'var(--black-roulette)';
};

// --- NEW PHYSICS ENGINE ---

// Constants
export const GRAVITY = 9.8; // m/s^2 (scaled for visual)
export const RIM_RADIUS = 180; // approx px
export const POCKET_RADIUS = 135; // approx px
export const DEFLECTOR_RADIUS = 155; // approx px

/**
 * Calculates the decay of velocity based on current speed and air resistance.
 * @param {number} velocity Current angular velocity (degrees/frame)
 * @param {number} dt Time delta (seconds)
 * @returns {number} New velocity
 */
export const calculateDecay = (velocity, dt) => {
    // User Spec: Multiplicative Friction.
    // "Multiply current speed by friction factor (e.g., 0.995) every frame."
    // 100 RPM -> 20 RPM in 18s.
    // 100 * k^(18*60) = 20.  0.2 = k^1080.
    // k = 0.2^(1/1080) approx 0.9985.

    const FRICTION_PER_FRAME = 0.9985;
    const frames = dt * 60; // Approximate frames passed

    // Apply friction 'frames' times
    const decayFactor = Math.pow(FRICTION_PER_FRAME, frames);

    return velocity * decayFactor;
};

/**
 * Checks if the ball should drop from the rim based on velocity and tilt.
 * @param {number} velocity Current angular velocity
 * @param {number} tiltAngle Tilt angle of the wheel (degrees)
 * @returns {boolean} True if ball should drop
 */
export const shouldDrop = (velocity, tiltAngle) => {
    const speed = Math.abs(velocity);
    // Critical velocity depends on tilt. Steeper tilt needs more speed to stay up.
    // Heuristic formula: V_crit = sqrt(g * tan(theta) * r)
    // Simplified for our unit-less visual simulation:
    // User Spec: Drop at 20 RPM = 120 deg/s.
    // Add small tilt factor so higher tilt = earlier drop.
    const criticalThreshold = 120 + (tiltAngle * 5);
    return speed < criticalThreshold;
};

/**
 * Calculates the scatter outcome when hitting a diamond/deflector.
 * @param {number} restitutionCoeff Bounciness (0.0 - 1.0)
 * @param {number} scatterVariance Randomness magnitude
 * @returns {object} { deltaRotation, radialOffset } relative changes
 */
export const calculateScatter = (restitutionCoeff, scatterVariance) => {
    // Random bounce direction (-1 to 1)
    const randomDir = (Math.random() * 2) - 1;

    // Energy lost on impact
    // Bounce velocity is random percentage of impact energy defined by restitution
    const bounceMag = restitutionCoeff * 10; // arbitrary scale for visual kick

    return {
        // Kick the ball forward or backward relative to wheel
        kickRotation: randomDir * scatterVariance * 10,
        // Move ball slightly in/out (radial wobble)
        radialKick: (Math.random() - 0.5) * scatterVariance * 5
    };
};
