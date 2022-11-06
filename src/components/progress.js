import React from 'react';

export default ({ percentage }) => (
    <div
        style={{
            width: '100%',
            backgroundColor: 'var(--background-modifier-form-field)',
            border: '1px solid var(--background-modifier-border)',
            marginTop: '0.5rem',
        }}
    >
        <div
            style={{
                width: `${percentage}%`,
                paddingTop: '0.5rem',
                paddingBottom: '0.5rem',
                backgroundColor: 'var(--background-modifier-border-hover)',
                fontSize: '0.75rem',
                lineHeight: '1rem',
                fontWeight: 700,
                textAlign: 'center',
            }}
        />
    </div>
);
