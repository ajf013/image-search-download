import React, { useState, useEffect } from 'react';
import { Icon, Button } from 'semantic-ui-react';
import './PWAPrompt.css';

const PWAPrompt = () => {
  const [installPrompt, setInstallPrompt] = useState(null);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  useEffect(() => {
    // 1. Capture PWA install prompt
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 2. Capture custom SW update event from index.js
    const handleSWUpdate = (e) => {
      const registration = e.detail;
      setUpdateRegistration(registration);

      // Trigger system notification if permission is granted
      if (Notification.permission === 'granted') {
        try {
          const notification = new Notification("App Update Available", {
            body: "A new version of the app is ready. Click to update now.",
            icon: "/logo192.png",
            tag: "app-update"
          });
          notification.onclick = () => {
            window.focus();
            handleUpdateApp(registration);
          };
        } catch (err) {
          console.error("Failed to show update notification:", err);
        }
      }
    };

    window.addEventListener('sw-update-available', handleSWUpdate);

    // 3. Capture successful app installation
    const handleAppInstalled = () => {
      setInstallPrompt(null);
      setShowInstallBanner(false);

      if (Notification.permission === 'granted') {
        try {
          new Notification("App Installed!", {
            body: "Image Search & Download PWA has been successfully installed to your device.",
            icon: "/logo192.png"
          });
        } catch (err) {
          console.error("Failed to show install notification:", err);
        }
      }
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // 4. Controllerchange listener to reload the app when SW skips waiting
    const handleControllerChange = () => {
      window.location.reload();
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    }

    // 5. Check current notification permission
    if ('Notification' in window) {
      setNotificationPermission(Notification.permission);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('sw-update-available', handleSWUpdate);
      window.removeEventListener('appinstalled', handleAppInstalled);
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert("This browser does not support desktop notifications.");
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      if (permission === 'granted') {
        new Notification("Notifications Enabled", {
          body: "You will now receive alerts for app updates and installations.",
          icon: "/logo192.png"
        });
      }
    } catch (error) {
      console.error("Error requesting notification permission:", error);
    }
  };

  const handleInstallApp = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User response to install prompt: ${outcome}`);
    setInstallPrompt(null);
    setShowInstallBanner(false);
  };

  const handleUpdateApp = (registration) => {
    const reg = registration || updateRegistration;
    if (reg && reg.waiting) {
      reg.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  return (
    <div className="pwa-prompts-container">
      {/* Install Banner */}
      {showInstallBanner && installPrompt && (
        <div className="pwa-banner install-banner fade-in">
          <div className="pwa-banner-content">
            <div className="pwa-icon-container">
              <Icon name="cloud download" size="large" className="glowing-icon" />
            </div>
            <div className="pwa-text">
              <h4>Install App</h4>
              <p>Add to your home screen for quick offline access and immersive layout.</p>
            </div>
          </div>
          <div className="pwa-actions">
            <Button size="tiny" className="btn-pwa-dismiss" onClick={() => setShowInstallBanner(false)}>
              Later
            </Button>
            <Button size="tiny" primary className="btn-pwa-install" onClick={handleInstallApp}>
              Install
            </Button>
          </div>
        </div>
      )}

      {/* Update Toast */}
      {updateRegistration && (
        <div className="pwa-banner update-banner slide-up">
          <div className="pwa-banner-content">
            <div className="pwa-icon-container update-icon">
              <Icon name="refresh" size="large" loading className="glowing-icon" />
            </div>
            <div className="pwa-text">
              <h4>Update Available</h4>
              <p>A new version of the app is ready with improvements.</p>
            </div>
          </div>
          <div className="pwa-actions">
            <Button size="tiny" primary className="btn-pwa-update" onClick={() => handleUpdateApp()}>
              Reload & Update
            </Button>
          </div>
        </div>
      )}

      {/* Notification Permission Request Toast in UI */}
      {notificationPermission === 'default' && (
        <div className="pwa-notification-request fade-in">
          <span>
            <Icon name="bell outline" /> Enable notifications to stay updated with new features and app installs.
          </span>
          <button className="notification-btn-grant" onClick={requestNotificationPermission}>
            Enable
          </button>
        </div>
      )}
    </div>
  );
};

export default PWAPrompt;
