// src/components/TextToggle.tsx

import React, { useEffect } from 'react';
import Toggle from 'rsuite/Toggle';

interface TextToggleProps {
    openText: string;
    closeText: string;
    onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    style?: React.CSSProperties;
}

const isNotPC = () => {
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
    // Simple checks for mobile (Android/iOS) user agents
    return /android|iphone|ipad|ipod/i.test(userAgent);
};

const TextToggle: React.FC<TextToggleProps> = ({ openText, closeText, onChange, style }) => {
    // on iphone this text shows 3px lower for some reason
    useEffect(() => {
        if (isNotPC()) {
            const styleSheet = document.createElement('style');
            styleSheet.type = 'text/css';
            styleSheet.innerHTML = `@media (max-width: 768px) { span.rs-toggle-inner { margin-top: -3px !important; } }`;
            document.head.appendChild(styleSheet);
            return () => {
                document.head.removeChild(styleSheet);
            };
        }
    }, []);

    return (
        <Toggle size="xs" checkedChildren={openText} unCheckedChildren={closeText} onChange={onChange} style={{ ...style, whiteSpace: 'nowrap', paddingTop: '-2px' }} />
    );
};

export default TextToggle;