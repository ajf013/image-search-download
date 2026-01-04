import React, { useState } from "react";
import axios from 'axios';
import { Card } from 'react-bootstrap';
import Footer from './components/Footer/Footer';

function GooglePexel() {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState("");
    const [result, setResult] = useState([]);
    const [orientation, setOrientation] = useState(""); // New state for orientation

    function handleChange(event) {
        const search = event.target.value;
        setSearch(search);
    }
    function noOfPics(event) {
        const perPage = event.target.value;
        setPerPage(perPage);
    }

    function handleOrientationChange(event) {
        setOrientation(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        let url = "https://api.pexels.com/v1/search?query=" + search + "&per_page=" + perPage;
        if (orientation) {
            url += "&orientation=" + orientation;
        }

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
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'image.jpg';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. ' + error.message);
        }
    }

    async function downloadWallpaper(imageUrl) {
        try {
            // 1. Fetch the image
            const response = await fetch(imageUrl);
            const originalBlob = await response.blob();

            // 2. Load into an ImageBitmap
            const imgBitmap = await createImageBitmap(originalBlob);

            // 3. Determine target dimensions (screen size)
            const targetW = window.screen.width;
            const targetH = window.screen.height;

            // 4. Create canvas
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            // 5. Calculate "Aspect Fill" crop
            const imgRatio = imgBitmap.width / imgBitmap.height;
            const targetRatio = targetW / targetH;

            let renderW, renderH, offsetX, offsetY;

            if (imgRatio > targetRatio) {
                // Image is wider than target
                renderH = targetH;
                renderW = imgBitmap.width * (targetH / imgBitmap.height);
                offsetX = (targetW - renderW) / 2;
                offsetY = 0;
            } else {
                // Image is taller than target
                renderW = targetW;
                renderH = imgBitmap.height * (targetW / imgBitmap.width);
                offsetX = 0;
                offsetY = (targetH - renderH) / 2;
            }

            ctx.drawImage(imgBitmap, offsetX, offsetY, renderW, renderH);

            // 6. Convert to Blob and save
            canvas.toBlob((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'wallpaper.jpg';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, 'image/jpeg', 0.95);

        } catch (error) {
            console.error('Wallpaper download failed:', error);
            alert('Failed to download wallpaper. ' + error.message);
        }
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
                            <select
                                style={{ 'marginTop': '10px' }}
                                onChange={handleOrientationChange}
                                className="form-control"
                                value={orientation}
                            >
                                <option value="">All Orientations</option>
                                <option value="portrait">Portrait</option>
                                <option value="landscape">Landscape</option>
                                <option value="square">Square</option>
                            </select>
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
                                    <Card.Body>
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
                                        <button
                                            className="btn btn-dark"
                                            style={{ marginTop: '5px', width: '100%', fontSize: '0.9rem' }}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                downloadWallpaper(search.src.original);
                                            }}
                                        >
                                            Download Wallpaper
                                        </button>
                                        <a href={search.src.original} target="_blank" rel="noreferrer" className="btn btn-outline-secondary" style={{ marginTop: '5px', width: '100%', fontSize: '0.9rem' }}>View Original</a>
                                    </Card.Body>
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
