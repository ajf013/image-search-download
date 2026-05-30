# ImgSearch Pro PWA

[![Netlify Status](https://api.netlify.com/api/v1/badges/a15db3b9-1f9f-4318-971c-f230f40d7c71/deploy-status)](https://app.netlify.com/sites/googlepexels/deploys)  

[![Live Site](https://img.shields.io/badge/Live%20Site-googlepexels.netlify.app-00C7B7?style=flat-square&logo=netlify)](https://googlepexels.netlify.app/)

ImgSearch Pro is a Progressive Web Application (PWA) built with React 18 and styled with glassmorphism aesthetics. It allows users to search for high-resolution graphics and photographs via the Pexels API, preview them in-app via an immersive lightbox, choose custom file formats (JPEG, PNG, WEBP), crop them to their specific screen size as device wallpapers, and run completely offline when installed.

---

## 🚀 Key Features

* **Progressive Web App (PWA)**: Fully installable directly onto devices (desktop, Android, iOS) with off-line support.
* **Custom Install & Update Banners**: Custom-built, sliding glassmorphic prompts that notify users when updates are available or when the app can be installed.
* **Local Push Notifications**: Full integration with the browser's native `Notification` API to alert users when the app is installed or updated in the background.
* **Image Lightbox (Quick View)**: View high-resolution photos on the app itself using an interactive overlay preview with backdrop blur.
* **Client-Side Format Picker**: Prompt for file formats (**JPEG, PNG, WEBP**) upon download. Image format conversion is performed on-the-fly client-side using the HTML5 Canvas API.
* **Aspect Fill Wallpaper Cropper**: Automatically calculates screen dimensions and crop aspect ratios to fit screen sizes perfectly.
* **Rich Aesthetics**: Premium slate-dark theme featuring subtle gradients, glassmorphism card containers, rounded shapes, and fluid micro-animations.
* **Skeleton Loading States**: Smooth animated skeleton cards that animate during API search actions.

---

## 🛠️ Technology Stack & Versions

| Technology | Badge | Version | Description |
| :--- | :--- | :--- | :--- |
| **React** | ![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat-square&logo=react&logoColor=%2361DAFB) | `v18.3.1` | Core UI library & state management |
| **PWA / Workbox** | ![PWA](https://img.shields.io/badge/PWA-5A0FC8?style=flat-square&logo=pwa&logoColor=white) | `v6.6.0` | Caching engines, routes, & service worker |
| **Bootstrap** | ![Bootstrap](https://img.shields.io/badge/bootstrap-%23563D7C.svg?style=flat-square&logo=bootstrap&logoColor=white) | `v5.3.3` | Responsive layout grid system |
| **React-Bootstrap** | ![React-Bootstrap](https://img.shields.io/badge/Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white) | `v2.10.2` | Wrapper framework for React 18 |
| **Semantic UI CSS** | ![SemanticUI](https://img.shields.io/badge/Semantic_UI-35BDB2?style=flat-square&logo=semantic-ui&logoColor=white) | `v2.5.0` | Icons & glyph decorations |
| **Axios** | ![Axios](https://img.shields.io/badge/Axios-5A29E4?style=flat-square&logo=axios&logoColor=white) | `v1.7.2` | REST API request client |
| **Pexels SDK** | ![Pexels](https://img.shields.io/badge/Pexels-05A081?style=flat-square&logo=pexels&logoColor=white) | `v1.4.0` | Developer helper SDK |
| **HTML5 / Canvas** | ![HTML5](https://img.shields.io/badge/HTML5-%23E34F26.svg?style=flat-square&logo=html5&logoColor=white) | `Standard` | Client-side image format processing |

---

## 📐 Architecture Diagram

```mermaid
graph TD
    User([User Client]) <--> UI[React ImgSearch UI]
    UI <--> PM[PWA Prompt Manager / Lightbox]
    UI <--> AX[Axios Client]
    AX <--> PEX[Pexels API Gateway]
    
    UI --> |Fetch Image Blob| CC[Canvas Converter]
    CC --> |toBlob format/resolution| DL[Browser Downloader]
    
    SW[Service Worker] <--> Cache[(Cache Storage)]
    SW -.-> |Updates/Events| UI
    Browser[(Browser Engine)] --> |install / beforeinstallprompt| PM
```

---

## 🔄 Application Flow

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React App
    participant SW as Service Worker
    participant PN as Push Notifications
    participant PX as Pexels API
    participant CV as Canvas Converter

    UI->>SW: Register Service Worker
    Note over SW: Cache-First Assets Loaded
    
    alt SW Update Found
        SW->>UI: Dispatch 'sw-update-available'
        UI->>PN: Display Browser Push Notification
        UI->>User: Display "Reload & Update" Toast
        User->>UI: Click Update
        UI->>SW: Skip Waiting & Reload
    end

    User->>UI: Input search keywords + Qty
    UI->>UI: Display Skeleton Cards
    UI->>PX: GET search query
    PX-->>UI: Return photo array JSON
    UI->>UI: Render Grid with fade-in

    User->>UI: Click on Image or 'Quick View'
    UI->>User: Open Lightbox Modal with details
    
    User->>UI: Click 'Download Image'
    UI->>User: Prompt JPEG, PNG, or WEBP options
    User->>UI: Confirm format Selection
    UI->>CV: Render Blob to Canvas Context
    CV-->>UI: Output formatted Blob
    UI->>User: Trigger direct file download
```

---

## 📂 Project Directory Structure

```text
image-search-download/
├── public/                     # Static assets & PWA files
│   ├── android-chrome-192.png  # PWA app icons (new neon design)
│   ├── favicon.ico             # App Favicon
│   ├── index.html              # HTML shell entrypoint
│   └── manifest.json           # PWA metadata (categories, background, theme colors)
├── scripts/
│   └── fix-semantic-ui.js      # Post-install Semantic UI CSS fix
├── src/                        # React source code
│   ├── assets/
│   │   └── bg.jpg              # Page background image
│   ├── components/
│   │   ├── Footer/
│   │   │   ├── Footer.js       # App footer
│   │   │   └── Footer.css      # Footer styles
│   │   └── PWAPrompt/
│   │       ├── PWAPrompt.js    # PWA install prompt / notification toggles
│   │       └── PWAPrompt.css   # Glassmorphic prompt styles
│   ├── googlePexel.js          # Core application search & canvas converter
│   ├── index.js                # React 18 client entrypoint
│   ├── index.css               # Global glassmorphism theme & variables
│   ├── service-worker.js       # Workbox cache service worker configuration
│   └── serviceWorkerRegistration.js # SW registration handler
├── package.json                # Project configurations & dependency versions
└── README.md                   # Project documentation
```

---

## ⚙️ Installation & Setup

1. **Clone the repository**:
   ```sh
   git clone https://github.com/ajf013/image-search-download.git
   cd image-search-download
   ```

2. **Install dependencies**:
   ```sh
   npm install --legacy-peer-deps
   ```

3. **Start local development server**:
   ```sh
   npm start
   ```
   *The server will start running on [http://localhost:3000](http://localhost:3000)*

4. **Change the Pexels access token (Optional)**:
   Open [googlePexel.js](file:///Users/fcruz/Documents/GitHub/Personal/image-search-download/src/googlePexel.js) and update the `access_token` variable with your credentials if required.

---

## 📬 Contact & Links

Feel free to connect or ask questions!

* **Francis Cruz**: [![Linkedin Badge](https://img.shields.io/badge/linkedin-%230077B5.svg?&style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/ajf013-francis-cruz/)
* **GitHub Profile**: [![Github Badge](https://img.shields.io/badge/github-333?style=flat-square&logo=github&logoColor=white)](https://github.com/ajf013)
* **Email Contact**: [![Mail Badge](https://img.shields.io/badge/email-c14438?style=flat-square&logo=Gmail&logoColor=white)](mailto:cruzmma2021@gmail.com)
* **Twitter/X**: [![Twitter Badge](https://img.shields.io/badge/twitter-1DA1F2?style=flat-square&logo=twitter&logoColor=white)](https://x.com/Itsme_Ajf013)
