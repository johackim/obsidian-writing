import React from 'react';

export default ({ percentage }) => (
    <div
        style={{
            width: '100%',
            backgroundColor: 'var(--text-selection)',
            marginTop: '0.5rem',
        }}
    >
        <div
            style={{
                width: `${percentage}%`,
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                backgroundColor: 'var(--text-normal)',
                fontSize: '0.75rem',
                lineHeight: '1rem',
                fontWeight: 700,
                textAlign: 'center',
            }}
        />
    </div>
);
