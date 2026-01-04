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
