import React from 'react';
import Kindle from '../images/kindle.png';

export default ({ children }) => (
    <div style={{ display: 'flex' }}>
        <div style={{ position: 'relative' }}>
            <div
                dangerouslySetInnerHTML={{ __html: children }}
                style={{
                    color: 'black',
                    fontSize: '12px',
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    overflowY: 'auto',
                    zIndex: 0,
                    padding: '1em',
                    margin: '8% 22% 11% 8%',
                    backgroundColor: '#d9e0db',
                }}
            />
            <img src={Kindle} alt="preview" />
        </div>
    </div>
);
