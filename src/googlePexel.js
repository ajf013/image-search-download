import React, { useState } from "react";
import axios from 'axios';
import { Card, Modal, Button, Spinner } from 'react-bootstrap';
import Footer from './components/Footer/Footer';

function GooglePexel() {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState("");
    const [result, setResult] = useState([]);

    // New state for download modal
    const [showDownloadModal, setShowDownloadModal] = useState(false);
    const [selectedImageSrc, setSelectedImageSrc] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

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

    // Triggered when user clicks "Download" on a card
    function handleDownloadClick(src) {
        setSelectedImageSrc(src);
        setShowDownloadModal(true);
    }

    // Handle orientation selection
    async function handleDownloadConfirm(orientation) {
        if (!selectedImageSrc) return;
        setIsProcessing(true);
        try {
            await processAndDownload(selectedImageSrc, orientation);
            setShowDownloadModal(false);
        } catch (error) {
            console.error(error);
            alert("Error downloading image: " + error.message);
        } finally {
            setIsProcessing(false);
        }
    }

    async function processAndDownload(imageUrl, orientation) {
        // 1. Fetch the image
        const response = await fetch(imageUrl);
        const originalBlob = await response.blob();

        // 2. Load into an Image object
        const imgBitmap = await createImageBitmap(originalBlob);

        // 3. Determine target dimensions
        // We use window.screen for device physical size
        const screenW = window.screen.width;
        const screenH = window.screen.height;

        let targetW, targetH;

        if (orientation === 'portrait') {
            targetW = Math.min(screenW, screenH);
            targetH = Math.max(screenW, screenH);
        } else {
            // Landscape
            targetW = Math.max(screenW, screenH);
            targetH = Math.min(screenW, screenH);
        }

        // 4. Calculate crop to cover target dimensions (Aspect Fill)
        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        // Calculate scaling
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

        // 5. Convert to Blob
        const processedBlob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));

        // 6. Save
        await saveBlob(processedBlob, `image-${orientation}.jpg`);
    }

    async function saveBlob(blob, suggestedName) {
        // Try to use the File System Access API
        if (window.showSaveFilePicker) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: suggestedName,
                    types: [{
                        description: 'JPEG Image',
                        accept: { 'image/jpeg': ['.jpg', '.jpeg'] },
                    }],
                });
                const writable = await handle.createWritable();
                await writable.write(blob);
                await writable.close();
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.error('File picker error:', err);
                    alert('File save failed: ' + err.message);
                }
            }
        } else {
            // Fallback
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = suggestedName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
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
                                            handleDownloadClick(search.src.original);
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
            <Modal show={showDownloadModal} onHide={() => !isProcessing && setShowDownloadModal(false)} centered>
                <Modal.Header closeButton={!isProcessing}>
                    <Modal.Title>Select Download Format</Modal.Title>
                </Modal.Header>
                <Modal.Body className="text-center">
                    <p>Choose an orientation to fit your device:</p>
                    {isProcessing ? (
                        <Spinner animation="border" role="status">
                            <span className="sr-only">Processing...</span>
                        </Spinner>
                    ) : (
                        <div className="d-flex justify-content-around">
                            <Button variant="primary" onClick={() => handleDownloadConfirm('portrait')}>
                                Portrait (Vertical)
                            </Button>
                            <Button variant="success" onClick={() => handleDownloadConfirm('landscape')}>
                                Landscape (Horizontal)
                            </Button>
                        </div>
                    )}
                </Modal.Body>
            </Modal>

            <Footer />
        </form>
    )
}

export default GooglePexel;
