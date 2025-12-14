import React from 'react';

export default function SettingsModal({
    isOpen,
    onClose,
    wheelRPM,
    setWheelRPM,
    ballRPM,
    setBallRPM
}) {
    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#1a1a1a',
                padding: '30px',
                borderRadius: '10px',
                border: '2px solid #daa520',
                color: '#daa520',
                minWidth: '300px',
                display: 'flex',
                flexDirection: 'column',
                gap: '20px'
            }}>
                <h2 style={{ textAlign: 'center', margin: 0, borderBottom: '1px solid #333', paddingBottom: '10px' }}>Settings</h2>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '1.1rem' }}>Wheel RPM:</label>
                    <input
                        type="number"
                        value={wheelRPM}
                        onChange={(e) => setWheelRPM(Number(e.target.value))}
                        style={{
                            padding: '8px',
                            fontSize: '1.1rem',
                            borderRadius: '5px',
                            border: '1px solid #444',
                            background: '#000',
                            color: '#fff',
                            width: '100px',
                            textAlign: 'center'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <label style={{ fontSize: '1.1rem' }}>Ball RPM:</label>
                    <input
                        type="number"
                        value={ballRPM}
                        onChange={(e) => setBallRPM(Number(e.target.value))}
                        style={{
                            padding: '8px',
                            fontSize: '1.1rem',
                            borderRadius: '5px',
                            border: '1px solid #444',
                            background: '#000',
                            color: '#fff',
                            width: '100px',
                            textAlign: 'center'
                        }}
                    />
                </div>

                <button
                    onClick={onClose}
                    style={{
                        marginTop: '10px',
                        padding: '10px',
                        backgroundColor: '#daa520',
                        color: '#000',
                        border: 'none',
                        borderRadius: '5px',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        cursor: 'pointer'
                    }}
                >
                    Close
                </button>
            </div>
        </div>
    );
}
