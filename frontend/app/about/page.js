'use client';
import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('');
    

    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
        if (!apiUrl) {
            console.error('NEXT_PUBLIC_BACKEND_URL is not defined');
            return;
        }

        axios
            .get(`${apiUrl}/api`)
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1 className='font-bold bg-slate-600'>AI Teaching Platform</h1>
            <p>{message}</p>
        </div>
    );
}
