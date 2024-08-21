// src/components/RadioToggle.tsx

import React, { useEffect } from 'react';
import Radio from 'rsuite/Radio';
import RadioGroup from 'rsuite/RadioGroup';

interface RadioToggleProps {
    options: string[];
    onChange: (value: any) => void;
    style?: React.CSSProperties;
    className?: string;
}

const RadioToggle: React.FC<RadioToggleProps> = ({ options, onChange, style, className }) => {
    return (
        <span className={className}>
            <RadioGroup onChange={onChange} style={{ ...style }} inline={true}>
                {options.map((option, index) => (
                    <Radio color="red" key={index} value={option} style={{ whiteSpace: 'nowrap' }}>{option}</Radio>
                ))
                }
            </RadioGroup >
        </span>
    );
};

export default RadioToggle;