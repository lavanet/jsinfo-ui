// src/components/TextToggle.tsx

import React from 'react';
import Toggle from 'rsuite/Toggle';

export const revalidate = 0;
export const fetchCache = 'force-no-store';
export const dynamic = 'force-dynamic'
interface TextToggleProps {
    openText: string;
    closeText: string;
    onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    style?: React.CSSProperties;
}

const TextToggle: React.FC<TextToggleProps> = ({ openText, closeText, onChange, style }) => (
    <Toggle size="xs" checkedChildren={openText} unCheckedChildren={closeText} onChange={onChange} style={style} />
);

export default TextToggle;
