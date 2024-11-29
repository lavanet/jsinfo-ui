import React from 'react';

interface VerifyComponentProps {
    children: React.ReactNode; // Accepts any valid React node
    keyName: string; // A key name for identification or logging
}

const VerifyComponent: React.FC<VerifyComponentProps> = ({ children, keyName }) => {
    // Function to check if a child is a valid React element
    const isValidReactElement = (child: React.ReactNode): boolean => {
        return React.isValidElement(child);
    };

    // Check each child and collect invalid ones
    const invalidChildren = React.Children.toArray(children).filter(child => !isValidReactElement(child));

    // If there are invalid children, log them or handle accordingly
    if (invalidChildren.length > 0) {
        console.error(`Invalid children found in ${keyName}:`, invalidChildren);
        return <div>Some components are not valid.</div>; // Render a fallback UI
    }

    // If all children are valid, render them
    return <>{children}</>;
};

export default VerifyComponent; 