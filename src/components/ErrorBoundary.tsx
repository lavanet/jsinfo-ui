// src/components/ErrorBoundary.tsx

import React from "react";

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

interface ErrorBoundaryProps {
    children: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.log(error, errorInfo);
    }

    render() {
        if (this.state.hasError && this.state.error) {
            return (
                <div>
                    <p>UI Error: {this.state.error.message}</p>
                </div>
            );
        }

        return (
            <>{this.props.children}</>
        );
    }
}