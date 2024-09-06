// src/components/TextCheckbox.tsx

import React from 'react';
import Checkbox from 'rsuite/Checkbox';

interface TextCheckboxProps {
    text: string;
    onChange: (value: any, checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
    style?: React.CSSProperties;
}


const TextCheckbox: React.FC<TextCheckboxProps> = ({ text, onChange, style }) => {
    return (
        <Checkbox onChange={onChange} color="red" style={style}>
            <span style={{ color: 'white', fontSize: '13px' }}>
                {text}
            </span>
        </Checkbox>
    );
};

export default TextCheckbox;