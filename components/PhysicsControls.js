'use client';

import styles from './PhysicsControls.module.css';

export default function PhysicsControls({ config, onConfigChange, onManualRotate }) {

    const handleChange = (key, value) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <div className={styles.controlsPanel}>
            <h3>Settings</h3>

            <div className={styles.controlGroup}>
                <label>Wheel Duration (s)</label>
                <div className={styles.inputRow}>
                    <input
                        type="range"
                        min="2"
                        max="10"
                        step="0.5"
                        value={config.duration}
                        onChange={(e) => handleChange('duration', parseFloat(e.target.value))}
                    />
                    <span>{config.duration}s</span>
                </div>
            </div>

            <div className={styles.controlGroup}>
                <label>Wheel Direction</label>
                <div className={styles.toggleRow}>
                    <button
                        className={config.wheelDirection === 1 ? styles.active : ''}
                        onClick={() => handleChange('wheelDirection', 1)}
                    >CW</button>
                    <button
                        className={config.wheelDirection === -1 ? styles.active : ''}
                        onClick={() => handleChange('wheelDirection', -1)}
                    >CCW</button>
                </div>
            </div>

            <div className={styles.controlGroup}>
                <label>Ball Extra Spins</label>
                <div className={styles.inputRow}>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        step="1"
                        value={config.ballSpins}
                        onChange={(e) => handleChange('ballSpins', parseInt(e.target.value))}
                    />
                    <span>{config.ballSpins}</span>
                </div>
            </div>

            <div className={styles.controlGroup}>
                <label>Ball Direction (Relative)</label>
                <div className={styles.toggleRow}>
                    <button
                        className={config.ballDirection === 1 ? styles.active : ''}
                        onClick={() => handleChange('ballDirection', 1)}
                    >CW</button>
                    <button
                        className={config.ballDirection === -1 ? styles.active : ''}
                        onClick={() => handleChange('ballDirection', -1)}
                    >CCW</button>
                </div>
            </div>

            <div className={styles.controlGroup}>
                <label>Manual Align</label>
                <div className={styles.toggleRow}>
                    <button onClick={() => onManualRotate(-10, 0)}>Wheel &lt;</button>
                    <button onClick={() => onManualRotate(10, 0)}>Wheel &gt;</button>
                </div>
                <div className={styles.toggleRow} style={{ marginTop: '5px' }}>
                    <button onClick={() => onManualRotate(0, -10)}>Ball &lt;</button>
                    <button onClick={() => onManualRotate(0, 10)}>Ball &gt;</button>
                </div>
            </div>

        </div>
    );
}
