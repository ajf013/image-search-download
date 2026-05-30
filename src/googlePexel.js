import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Icon } from 'semantic-ui-react';
import Footer from './components/Footer/Footer';
import PWAPrompt from './components/PWAPrompt/PWAPrompt';

function GooglePexel() {
    const [search, setSearch] = useState("");
    const [perPage, setPerPage] = useState("12"); // default to 12
    const [result, setResult] = useState([]);
    const [orientation, setOrientation] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchedOnce, setSearchedOnce] = useState(false);
    const [notificationPermission, setNotificationPermission] = useState("default");
    const [downloadModalData, setDownloadModalData] = useState(null); // { imageUrl, id, isWallpaper }
    const [selectedFormat, setSelectedFormat] = useState("image/jpeg");
    const [downloadingFormat, setDownloadingFormat] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    useEffect(() => {
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
        }
    }, []);

    function handleChange(event) {
        setSearch(event.target.value);
    }
    function noOfPics(event) {
        setPerPage(event.target.value);
    }
    function handleOrientationChange(event) {
        setOrientation(event.target.value);
    }

    function handleSubmit(event) {
        event.preventDefault();
        if (!search.trim()) return;

        setLoading(true);
        setSearchedOnce(true);

        let url = `https://api.pexels.com/v1/search?query=${search}&per_page=${perPage}`;
        if (orientation) {
            url += `&orientation=${orientation}`;
        }

        const access_token = '563492ad6f91700001000001a7f96507d83d455db06d06709929e930';
        axios.get(url, {
            headers: {
                'Authorization': `${access_token}`
            }
        }).then(data => {
            console.log(data);
            setResult(data.data.photos);
            setLoading(false);
        }).catch(err => {
            console.error(err);
            setLoading(false);
            alert("Error fetching images: " + err.message);
        });
    }

    async function downloadImage(imageUrl, id, format = "image/jpeg") {
        try {
            const response = await fetch(imageUrl);
            const originalBlob = await response.blob();
            const imgBitmap = await createImageBitmap(originalBlob);

            const canvas = document.createElement('canvas');
            canvas.width = imgBitmap.width;
            canvas.height = imgBitmap.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(imgBitmap, 0, 0);

            canvas.toBlob((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
                link.download = `pexel-image-${id || 'download'}.${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, format, 0.95);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download image. ' + error.message);
        }
    }

    async function downloadWallpaper(imageUrl, id, format = "image/jpeg") {
        try {
            const response = await fetch(imageUrl);
            const originalBlob = await response.blob();
            const imgBitmap = await createImageBitmap(originalBlob);

            const targetW = window.screen.width || 1920;
            const targetH = window.screen.height || 1080;

            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');

            const imgRatio = imgBitmap.width / imgBitmap.height;
            const targetRatio = targetW / targetH;

            let renderW, renderH, offsetX, offsetY;

            if (imgRatio > targetRatio) {
                renderH = targetH;
                renderW = imgBitmap.width * (targetH / imgBitmap.height);
                offsetX = (targetW - renderW) / 2;
                offsetY = 0;
            } else {
                renderW = targetW;
                renderH = imgBitmap.height * (targetW / imgBitmap.width);
                offsetX = 0;
                offsetY = (targetH - renderH) / 2;
            }

            ctx.drawImage(imgBitmap, offsetX, offsetY, renderW, renderH);

            canvas.toBlob((blob) => {
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                const ext = format === 'image/png' ? 'png' : format === 'image/webp' ? 'webp' : 'jpg';
                link.download = `wallpaper-${id || 'download'}.${ext}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(url);
            }, format, 0.95);

        } catch (error) {
            console.error('Wallpaper download failed:', error);
            alert('Failed to download wallpaper: ' + error.message);
        }
    }

    async function handleModalDownload() {
        if (!downloadModalData) return;
        setDownloadingFormat(true);
        if (downloadModalData.isWallpaper) {
            await downloadWallpaper(downloadModalData.imageUrl, downloadModalData.id, selectedFormat);
        } else {
            await downloadImage(downloadModalData.imageUrl, downloadModalData.id, selectedFormat);
        }
        setDownloadingFormat(false);
        setDownloadModalData(null);
    }

    const requestPermission = async () => {
        if ('Notification' in window) {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            {/* Header section */}
            <div className="header-gradient" style={{ textAlign: 'center', padding: '40px 20px 20px 20px' }}>
                <h1 style={{ 
                    fontFamily: 'var(--font-heading)', 
                    fontSize: '2.5rem', 
                    fontWeight: '800', 
                    background: 'linear-gradient(135deg, #ffffff 30%, var(--accent-cyan) 70%, var(--accent-purple))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: '10px'
                }}>
                    📸 ImgSearch Pro 🖼️
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxW: '600px', margin: '0 auto 20px auto' }}>
                    Discover and download stunning, high-resolution graphics and customized wallpapers.
                </p>

                {/* Notifications Status Badge */}
                {notificationPermission !== 'granted' && (
                    <div style={{ display: 'inline-flex', alignItems: 'center', background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: '20px', fontSize: '0.85rem', border: '1px solid rgba(255,255,255,0.08)' }}>
                        <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>Push Notifications disabled</span>
                        <button onClick={requestPermission} style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', fontWeight: '600', cursor: 'pointer', outline: 'none' }}>
                            <Icon name="bell" /> Enable
                        </button>
                    </div>
                )}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0 20px' }}>
                {/* Search Form Card (Glass Panel) */}
                <div className="container" style={{ maxWidth: '960px', marginBottom: '30px' }}>
                    <form onSubmit={handleSubmit} className="glass-panel" style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}>
                        {/* Decorative glow inside card */}
                        <div style={{ position: 'absolute', top: '-100px', left: '-100px', width: '200px', height: '200px', background: 'rgba(0, 180, 216, 0.15)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>
                        <div style={{ position: 'absolute', bottom: '-100px', right: '-100px', width: '200px', height: '200px', background: 'rgba(139, 92, 246, 0.15)', filter: 'blur(50px)', borderRadius: '50%', pointerEvents: 'none' }}></div>

                        <div className="row g-3" style={{ position: 'relative', zIndex: 1 }}>
                            <div className="col-12 col-md-4">
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500' }}>Search Images</label>
                                <div style={{ position: 'relative' }}>
                                    <input 
                                        style={{ 
                                            background: 'rgba(255, 255, 255, 0.04)', 
                                            border: '1px solid rgba(255, 255, 255, 0.1)', 
                                            color: '#ffffff', 
                                            borderRadius: '10px', 
                                            padding: '10px 14px 10px 36px',
                                            width: '100%',
                                            transition: 'border-color 0.2s',
                                            outline: 'none'
                                        }} 
                                        onChange={handleChange} 
                                        className="form-input" 
                                        placeholder="Space, nature, abstract..." 
                                        type="text" 
                                        value={search}
                                    />
                                    <Icon name="search" style={{ position: 'absolute', left: '12px', top: '13px', color: 'var(--text-secondary)' }} />
                                </div>
                            </div>
                            <div className="col-12 col-md-2">
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500' }}>Quantity</label>
                                <input 
                                    style={{ 
                                        background: 'rgba(255, 255, 255, 0.04)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        color: '#ffffff', 
                                        borderRadius: '10px', 
                                        padding: '10px 14px',
                                        width: '100%',
                                        outline: 'none'
                                    }} 
                                    onChange={noOfPics} 
                                    placeholder="Qty"
                                    type="number" 
                                    min="1"
                                    max="80"
                                    value={perPage}
                                />
                            </div>
                            <div className="col-12 col-md-3">
                                <label style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '500' }}>Orientation</label>
                                <select
                                    style={{ 
                                        background: 'rgba(15, 23, 42, 0.9)', 
                                        border: '1px solid rgba(255, 255, 255, 0.1)', 
                                        color: '#ffffff', 
                                        borderRadius: '10px', 
                                        padding: '10px 14px',
                                        width: '100%',
                                        outline: 'none',
                                        cursor: 'pointer'
                                    }}
                                    onChange={handleOrientationChange}
                                    value={orientation}
                                >
                                    <option value="">All Orientations</option>
                                    <option value="portrait">Portrait 📱</option>
                                    <option value="landscape">Landscape 🖥️</option>
                                    <option value="square">Square ⬜</option>
                                </select>
                            </div>
                            <div className="col-12 col-md-3" style={{ display: 'flex', alignItems: 'flex-end' }}>
                                <button 
                                    type="submit" 
                                    style={{ 
                                        width: '100%', 
                                        padding: '11px', 
                                        border: 'none', 
                                        borderRadius: '10px', 
                                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))', 
                                        color: '#ffffff', 
                                        fontWeight: '700', 
                                        boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease'
                                    }}
                                    onMouseOver={(e) => e.target.style.boxShadow = '0 6px 20px rgba(139, 92, 246, 0.5)'}
                                    onMouseOut={(e) => e.target.style.boxShadow = '0 4px 15px rgba(0, 180, 216, 0.3)'}
                                >
                                    <Icon name="search" /> Search
                                </button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Content Section */}
                <div className="container" style={{ maxWidth: '1200px', flex: 1, paddingBottom: '40px' }}>
                    {loading ? (
                        /* Skeleton loaders while loading */
                        <div className="row g-4">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div className="col-12 col-sm-6 col-md-4" key={i}>
                                    <div className="glass-panel" style={{ overflow: 'hidden', padding: '0 0 15px 0' }}>
                                        <div className="skeleton skeleton-image"></div>
                                        <div style={{ padding: '0 15px' }}>
                                            <div className="skeleton skeleton-text"></div>
                                            <div className="skeleton skeleton-btn"></div>
                                            <div className="skeleton skeleton-btn" style={{ height: '32px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : result.length > 0 ? (
                        /* Images grid */
                        <div className="row g-4">
                            {result.map((photo, index) => (
                                <div className="col-12 col-sm-6 col-md-4" key={photo.id || index}>
                                    <div className="glass-panel" style={{ 
                                        overflow: 'hidden', 
                                        height: '100%', 
                                        display: 'flex', 
                                        flexDirection: 'column',
                                        borderRadius: '16px'
                                    }}>
                                        {/* Image Container with zoom hover */}
                                        <div 
                                            onClick={() => setPreviewImage(photo)}
                                            style={{ overflow: 'hidden', position: 'relative', height: '240px', background: '#121826', cursor: 'pointer' }}
                                        >
                                            <img 
                                                src={photo.src.large} 
                                                alt={photo.alt || `Photo by ${photo.photographer}`} 
                                                style={{ 
                                                    width: '100%', 
                                                    height: '100%', 
                                                    objectFit: 'cover',
                                                    transition: 'transform 0.5s ease'
                                                }}
                                                className="img-hover"
                                                onMouseOver={(e) => e.target.style.transform = 'scale(1.08)'}
                                                onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                            />
                                            {/* Photo Creator Badge */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: '10px',
                                                left: '10px',
                                                background: 'rgba(15, 23, 42, 0.75)',
                                                backdropFilter: 'blur(4px)',
                                                padding: '4px 10px',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                border: '1px solid rgba(255, 255, 255, 0.1)',
                                                color: '#ffffff'
                                            }}>
                                                👤 {photo.photographer}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
                                            <div style={{ marginBottom: '12px' }}>
                                                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: 0, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                                    {photo.alt || "Beautiful Pexels capture"}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                <button
                                                    onClick={() => setDownloadModalData({ imageUrl: photo.src.original, id: photo.id, isWallpaper: false })}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: '#ffffff',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = 'var(--accent-cyan)';
                                                        e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    }}
                                                >
                                                    <Icon name="download" /> Download Image
                                                </button>

                                                <button
                                                    onClick={() => setPreviewImage(photo)}
                                                    style={{
                                                        background: 'rgba(255,255,255,0.06)',
                                                        border: '1px solid rgba(255,255,255,0.1)',
                                                        color: '#ffffff',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.background = 'var(--accent-purple)';
                                                        e.currentTarget.style.borderColor = 'var(--accent-purple)';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                                                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                                    }}
                                                >
                                                    <Icon name="eye" /> Quick View
                                                </button>
                                                
                                                <button
                                                    onClick={() => setDownloadModalData({ imageUrl: photo.src.original, id: photo.id, isWallpaper: true })}
                                                    style={{
                                                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.8), rgba(109, 40, 217, 0.8))',
                                                        border: 'none',
                                                        color: '#ffffff',
                                                        padding: '8px 16px',
                                                        borderRadius: '8px',
                                                        fontWeight: '600',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        gap: '8px'
                                                    }}
                                                    onMouseOver={(e) => {
                                                        e.currentTarget.style.opacity = '0.9';
                                                    }}
                                                    onMouseOut={(e) => {
                                                        e.currentTarget.style.opacity = '1';
                                                    }}
                                                >
                                                    <Icon name="mobile alternate" /> Fit Mobile/Desktop
                                                </button>

                                                {/* View on Pexels removed */}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : searchedOnce ? (
                        /* No search results fallback */
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                            <Icon name="image outline" size="massive" style={{ opacity: 0.3, marginBottom: '20px' }} />
                            <h3>No results found</h3>
                            <p>We couldn't find any images matching "{search}". Try searching for something else!</p>
                        </div>
                    ) : (
                        /* Initial landing state */
                        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary)' }}>
                            <Icon name="picture" size="massive" style={{ opacity: 0.3, marginBottom: '20px', color: 'var(--accent-cyan)' }} />
                            <h3>Discover Awesome Images</h3>
                            <p>Enter keywords like "Neon", "Cyberpunk", or "Nature" above to start searching.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Choose Format Modal */}
            {downloadModalData && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(5, 8, 15, 0.8)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 12000
                }}>
                    <div className="glass-panel" style={{
                        padding: '30px',
                        width: '90%',
                        maxWidth: '420px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '20px',
                        color: '#fff',
                        position: 'relative',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                        pointerEvents: 'auto'
                    }}>
                        {/* Close button */}
                        <button 
                            type="button"
                            onClick={() => setDownloadModalData(null)}
                            style={{
                                position: 'absolute',
                                top: '15px',
                                right: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '1.2rem',
                                cursor: 'pointer',
                                transition: 'color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.color = '#fff'}
                            onMouseOut={(e) => e.target.style.color = 'var(--text-secondary)'}
                        >
                            <Icon name="close" />
                        </button>

                        <div style={{ textAlign: 'center' }}>
                            <Icon name="cloud download" size="huge" style={{ color: 'var(--accent-cyan)', marginBottom: '10px', textShadow: '0 0 15px rgba(0, 180, 216, 0.4)' }} />
                            <h3 style={{ fontFamily: 'var(--font-heading)', margin: '0 0 5px 0', fontSize: '1.5rem', fontWeight: '700' }}>
                                Download Options
                            </h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', margin: 0 }}>
                                {downloadModalData.isWallpaper ? "Fit to Device Screen (Aspect Fill crop)" : "Download Original Image"}
                            </p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)' }}>Select Image Format:</span>
                            
                            {/* Option Cards */}
                            {[
                                { id: 'image/jpeg', name: 'JPEG (.jpg)', desc: 'High compatibility, optimized size' },
                                { id: 'image/png', name: 'PNG (.png)', desc: 'Lossless quality (larger file size)' },
                                { id: 'image/webp', name: 'WEBP (.webp)', desc: 'Modern, highly compressed format' }
                            ].map((opt) => (
                                <div 
                                    key={opt.id}
                                    onClick={() => setSelectedFormat(opt.id)}
                                    style={{
                                        background: selectedFormat === opt.id ? 'rgba(0, 180, 216, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                                        border: selectedFormat === opt.id ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.08)',
                                        borderRadius: '10px',
                                        padding: '12px',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: '2px'
                                    }}
                                >
                                    <span style={{ 
                                        fontWeight: '700', 
                                        fontSize: '0.95rem',
                                        color: selectedFormat === opt.id ? 'var(--accent-cyan)' : '#fff' 
                                    }}>
                                        {opt.name}
                                    </span>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {opt.desc}
                                    </span>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            onClick={handleModalDownload}
                            disabled={downloadingFormat}
                            style={{
                                background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))',
                                border: 'none',
                                color: '#fff',
                                padding: '12px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                cursor: 'pointer',
                                transition: 'all 0.3s',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px',
                                marginTop: '10px',
                                boxShadow: '0 4px 15px rgba(0, 180, 216, 0.3)'
                            }}
                        >
                            {downloadingFormat ? (
                                <>
                                    <Icon name="spinner" loading /> Converting Image...
                                </>
                            ) : (
                                <>
                                    <Icon name="download" /> Download Now
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* Image Preview Lightbox Modal */}
            {previewImage && (
                <div 
                    onClick={() => setPreviewImage(null)}
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'rgba(5, 8, 15, 0.9)',
                        backdropFilter: 'blur(15px)',
                        WebkitBackdropFilter: 'blur(15px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 13000,
                        padding: '20px',
                        animation: 'fadeIn 0.25s ease'
                    }}
                >
                    {/* Close button */}
                    <button 
                        type="button"
                        onClick={() => setPreviewImage(null)}
                        style={{
                            position: 'absolute',
                            top: '20px',
                            right: '20px',
                            background: 'rgba(255,255,255,0.06)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '50%',
                            width: '44px',
                            height: '44px',
                            color: '#fff',
                            fontSize: '1.2rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s',
                            zIndex: 13001
                        }}
                        onMouseOver={(e) => {
                            e.currentTarget.style.background = 'var(--accent-cyan)';
                            e.currentTarget.style.borderColor = 'var(--accent-cyan)';
                        }}
                        onMouseOut={(e) => {
                            e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                        }}
                    >
                        <Icon name="close" style={{ margin: 0 }} />
                    </button>

                    {/* Lightbox content container */}
                    <div 
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            position: 'relative',
                            maxWidth: '95vw',
                            maxHeight: '85vh',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '16px'
                        }}
                    >
                        <img 
                            src={previewImage.src.large2x || previewImage.src.original} 
                            alt={previewImage.alt || `Photo by ${previewImage.photographer}`} 
                            style={{
                                maxWidth: '100%',
                                maxHeight: '70vh',
                                objectFit: 'contain',
                                borderRadius: '16px',
                                border: '1px solid rgba(255,255,255,0.12)',
                                boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
                            }}
                        />

                        {/* Image details info bar */}
                        <div className="glass-panel" style={{
                            padding: '12px 24px',
                            borderRadius: '30px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '24px',
                            maxWidth: '600px',
                            width: '100%',
                            border: '1px solid rgba(255,255,255,0.1)',
                            pointerEvents: 'auto'
                        }}>
                            <div style={{ minWidth: 0, flex: 1 }}>
                                <p style={{ margin: 0, fontWeight: '700', fontSize: '0.95rem', color: '#fff', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                                    {previewImage.alt || "Pexels Capture"}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    👤 Photographer: <strong>{previewImage.photographer}</strong>
                                </p>
                            </div>

                            <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setPreviewImage(null);
                                        setDownloadModalData({ imageUrl: previewImage.src.original, id: previewImage.id, isWallpaper: false });
                                    }}
                                    style={{
                                        background: 'linear-gradient(135deg, var(--accent-cyan), var(--accent-blue))',
                                        border: 'none',
                                        color: '#fff',
                                        padding: '8px 16px',
                                        borderRadius: '20px',
                                        fontWeight: '700',
                                        fontSize: '0.85rem',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        transition: 'transform 0.2s'
                                    }}
                                    onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                                    onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                                >
                                    <Icon name="download" /> Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom PWAPrompts */}
            <PWAPrompt />

            <Footer />
        </div>
    );
}

export default GooglePexel;
