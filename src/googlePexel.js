import React, { useState } from "react";
import axios from 'axios';
import { Card } from 'react-bootstrap';
import Footer from './components/Footer/Footer';

function GooglePexel() {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState("");
    const [result, setResult] = useState([]);

    function handleChange(event) {
        const search = event.target.value;
        setSearch(search);
    }
    function noOfPics(event) {
        const perPage = event.target.value;
        setPerPage(perPage);
    }

    function handleSubmit(event) {
        event.preventDefault();
        const url = "https://api.pexels.com/v1/search?query=" + search + "&per_page=" + perPage;
        const access_token = '563492ad6f91700001000001a7f96507d83d455db06d06709929e930';
        axios.get(url, {
            headers: {
                'Authorization': `${access_token}`
            }
        }).then(data => {
            console.log(data);
            setResult(data.data.photos);
        })

    }

    async function downloadImage(imageUrl) {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();

            // Try to use the File System Access API to ask for a path
            if (window.showSaveFilePicker) {
                try {
                    const handle = await window.showSaveFilePicker({
                        suggestedName: 'image.jpg',
                        types: [
                            {
                                description: 'JPEG Image',
                                accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
                            },
                            {
                                description: 'PNG Image',
                                accept: { 'image/png': ['.png'] },
                            },
                        ],
                    });

                    const writable = await handle.createWritable();

                    // Convert if necessary
                    let blobToWrite = blob;
                    const name = handle.name.toLowerCase();

                    if (name.endsWith('.png') && blob.type !== 'image/png') {
                        blobToWrite = await convertBlobToPng(blob);
                    }
                    // Note: Pexels images are JPEGs. If user saves as JPEG, we use original blob.
                    // If we implemented other formats like WebP, we'd enable conversion there too.

                    await writable.write(blobToWrite);
                    await writable.close();
                } catch (err) {
                    if (err.name !== 'AbortError') {
                        console.error('File picker error:', err);
                        alert('File save failed: ' + err.message);
                    }
                }
            } else {
                // Fallback for browsers that don't support File System Access API
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'image.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. ' + error.message);
        }
    }

    // Helper to convert images using Canvas
    async function convertBlobToPng(sourceBlob) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((pngBlob) => {
                    resolve(pngBlob);
                }, 'image/png');
            };
            img.onerror = reject;
            img.src = URL.createObjectURL(sourceBlob);
        });
    }
    return (
        <form onSubmit={handleSubmit} style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ textAlign: 'center', color: 'white', marginTop: '20px', marginBottom: '20px', textShadow: '2px 2px 4px #000000', fontWeight: 'bold' }}>
                📸 Search the Image and Download (JPEG or PNG) 🖼️
            </h1>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: result.length === 0 ? 'center' : 'flex-start' }}>
                <div className="card-header main-search" style={{ border: 'none', background: 'transparent' }}>
                    <div className="row justify-content-center">
                        <div className="col-12 col-md-3 col-xl-3">
                            <input style={{ 'marginTop': '10px' }} onChange={handleChange} className="AutoFocus form-control" placeholder="Type something..." type="text" />
                        </div>
                        <div className="col-12 col-md-3 col-xl-3">
                            <input style={{ 'marginTop': '10px' }} onChange={noOfPics} name="deliveryNumber" className="AutoFocus form-control" placeholder="No of Images"
                                type="text" />
                        </div>
                        <div className="col-12 col-md-3 col-xl-3">
                            <input style={{ 'marginTop': '10px' }} type="submit" value="Search" className="btn btn-primary search-btn" />
                        </div>
                    </div>
                </div>
                <div className="container">
                    <div className="row">
                        {result.map((search, index) => (
                            <div className="col-sm-4" key={index}>
                                <Card style={{ 'marginTop': '20px' }}>
                                    <Card.Img variant="top" src={search.src.landscape} alt={search.photographer} />
                                    <button
                                        className="btn btn-secondary"
                                        style={{ marginTop: '10px', width: '100%' }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            downloadImage(search.src.original);
                                        }}
                                    >
                                        Download
                                    </button>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <Footer />
        </form>
    )
}

export default GooglePexel;
