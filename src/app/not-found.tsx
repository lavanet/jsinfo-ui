// src/app/not-found.tsx

import React from 'react';

export default function NotFoundPage() {
    return (
        <div style={{ textAlign: 'center', marginTop: '50px', height: '200px' }}>
            <div style={{ justifyContent: 'center' }}>
                <h1>Oops! Page not found.</h1>
                <p>We can't seem to find the page you're looking for.</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <img src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExa2Q0dWt2bGFmNjNqZTU2bmhmNXFnNnp6MGU4YzBwNWl1OWZpbWtjdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/sU511xfb7ORqw/giphy.webp" alt="Not Found" />
            </div>
        </div>
    );
}