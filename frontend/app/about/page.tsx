import axios from 'axios';
import { useEffect, useState } from 'react';

export default function Home() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        axios
            .get(process.env.NEXT_PUBLIC_API_URL)
            .then((response) => {
                setMessage(response.data.message);
            })
            .catch((error) => {
                console.error('Error fetching data:', error);
            });
    }, []);

    return (
        <div>
            <h1>AI Teaching Platform</h1>
            <p>{message}</p>
        </div>
    );
}
