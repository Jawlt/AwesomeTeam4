'use client';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import FileUpload from '@/components/FileUpload';
import LinkCard from '@/components/LinkCard';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import * as pdfjsLib from 'pdfjs-dist/webpack';
import mammoth from 'mammoth';

export default function Home() {
    const { user, isLoading } = useUser();
    const router = useRouter();
    const [baseUrl, setBaseUrl] = useState('');
    const [linkCards, setLinkCards] = useState([]);

    // Redirect user to login if not authenticated
    useEffect(() => {
        if (!isLoading && !user) {
            router.push('/login');
        }
    }, [user, isLoading, router]);

    // Call the addUser API after authentication
    useEffect(() => {
        if (user) {
            const addUser = async () => {
                try {
                    const response = await fetch('/api/auth/addUser', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            auth0Id: user.sub,
                            email: user.email,
                            name: user.name,
                            email_verified: user.email_verified,
                        }),
                    });

                    if (!response.ok) {
                        console.error(
                            'Error adding user:',
                            await response.json()
                        );
                    } else {
                        console.log('User added successfully');
                    }
                } catch (err) {
                    console.error('Failed to connect to the server:', err);
                }
            };

            addUser();
        }
    }, [user]);

    // Fetch lectures from the backend after authentication
    useEffect(() => {
        if (user) {
            const fetchLectures = async () => {
                try {
                    const response = await fetch('/api/auth/getLectures', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ auth0Id: user.sub }),
                    });

                    const data = await response.json();
                    if (!response.ok) {
                        console.error('Error fetching lectures:', data.error);
                        return;
                    }

                    // Format lecture data to match linkCards format
                    const formattedLectures = data.lectures.map((lecture) => ({
                        title: lecture.title,
                        link: lecture.url,
                    }));

                    setLinkCards(formattedLectures);
                    console.log(
                        'Lectures fetched successfully:',
                        formattedLectures
                    );
                } catch (err) {
                    console.error('Failed to fetch lectures:', err);
                }
            };

            fetchLectures();
        }
    }, [user]);

    // Set base URL for generating links
    useEffect(() => {
        const url = window.location.origin;
        setBaseUrl(url);
    }, []);

    const handleDeleteLink = async (index) => {
        try {
            const lectureToDelete = linkCards[index];

            const response = await fetch('/api/auth/removeLecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth0Id: user?.sub,
                    title: lectureToDelete.title,
                    url: lectureToDelete.link,
                }),
            });

            if (!response.ok) {
                console.error('Error deleting lecture:', await response.json());
                return;
            }

            console.log('Lecture deleted successfully');
            setLinkCards((prevCards) =>
                prevCards.filter((_, i) => i !== index)
            );
        } catch (error) {
            console.error('Failed to delete lecture:', error);
        }
    };

    // Function to parse PDF or DOCX
    const parseFile = (file, fileType) => {
        return new Promise((resolve, reject) => {
            let text = '';

            // PDF Parsing
            if (fileType === 'pdf') {
                const reader = new FileReader();
                reader.onload = async () => {
                    const pdfData = new Uint8Array(reader.result);
                    try {
                        const pdfDoc = await pdfjsLib.getDocument(pdfData)
                            .promise;
                        let fullText = '';
                        for (
                            let pageNum = 1;
                            pageNum <= pdfDoc.numPages;
                            pageNum++
                        ) {
                            const page = await pdfDoc.getPage(pageNum);
                            const content = await page.getTextContent();
                            content.items.forEach((item) => {
                                fullText += item.str + ' ';
                            });
                        }
                        text = fullText;
                        resolve(text);
                    } catch (error) {
                        reject('Error parsing PDF:', error);
                    }
                };
                reader.onerror = (error) =>
                    reject('File reading error:', error);
                reader.readAsArrayBuffer(file);
            }

            // DOCX Parsing
            else if (fileType === 'docx') {
                const reader = new FileReader();
                reader.onload = async () => {
                    try {
                        const result = await mammoth.extractRawText({
                            arrayBuffer: reader.result,
                        });
                        text = result.value;
                        resolve(text);
                    } catch (error) {
                        reject('Error parsing DOCX:', error);
                    }
                };
                reader.onerror = (error) =>
                    reject('File reading error:', error);
                reader.readAsArrayBuffer(file);
            }
        });
    };

    const handleFilesSubmit = async ({ file, title, keyGoals }) => {
        const newLink = {
            title: title || 'Untitled',
            link: `${baseUrl}/training/${encodeURIComponent(
                title || 'Untitled'
            )}`,
        };

        // Parse the file before sending data
        try {
            let fileType = file.name.split('.').pop().toLowerCase();
            if (!['pdf', 'docx'].includes(fileType)) {
                console.error('Unsupported file type');
                return;
            }

            // Parse the file (PDF or DOCX)
            const parsedText = await parseFile(file, fileType);

            // Log the parsed content (JSON representation of the parsed data)
            const parsedData = {
                title: title,
                keyGoals: keyGoals || '',
                fileContent: parsedText, // The parsed text content
            };
            console.log('data:', parsedData);
            const sendData = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/create_new_presentation`,
                parsedData
            );
            console.log(sendData);
            console.log(sendData.data.presentation_id);

            console.log('Data successfully!');

            // Proceed with sending the parsed data to the backend (optional)
            const response = await fetch('/api/auth/addLecture', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    auth0Id: user?.sub,
                    title: title,
                    url: newLink.link,
                    scripts: sendData.data.scripts,
                    presentationId: sendData.data.presentation_id,
                }),
            });

            if (!response.ok) {
                console.error('Error adding lecture:', await response.json());
                return;
            }

            console.log('Lecture added successfully');
            setLinkCards((prevCards) => [...prevCards, newLink]);
        } catch (error) {
            console.error('Error processing file:', error);
        }
    };

    return (
        <div className='min-h-screen bg-background'>
            <Navbar />
            <main className='max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                    <div>
                        <FileUpload onSubmit={handleFilesSubmit} />
                    </div>
                    <div className='space-y-4'>
                        {linkCards.map((item, index) => (
                            <LinkCard
                                key={index}
                                title={item.title}
                                link={item.link}
                                localLink={item.link.replace(baseUrl, '')}
                                onDelete={() => handleDeleteLink(index)}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
