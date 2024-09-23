// src/components/helpers/NoSsrComponent.tsx

import dynamic from 'next/dynamic';
import React from 'react';

const NoSsr = (props: { children: any }) => (
    <React.Fragment>{props.children}</React.Fragment>
)

function loadNoSsrDynamically() {
    return dynamic(() => Promise.resolve(NoSsr), {
        ssr: false,
    });
}

export const NoSsrComponent = loadNoSsrDynamically();