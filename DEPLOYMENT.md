# 🌴 Eko PWA Installation Guide

## 🚀 Deploy Eko as a Cross-Platform App

Eko is built as a **Progressive Web App (PWA)** that can be installed on all major platforms and browsers!

---

## 📱 Installation Instructions

### Desktop Browsers (Chrome, Edge, Safari)

1. **Open Eko in your browser**: Navigate to your deployed Eko instance
2. **Look for the install prompt**: Modern browsers will show an installation banner
3. **Click the install button** or **"Install Eko"** when prompted
4. **Alternative method**: Click the menu (⋮) or (…):
   - **Chrome**: Click "Install Eko"
   - **Edge**: Click "Apps" → "Install this site as an app"
   - **Safari**: Click "Share" → "Add to Dock"

### Mobile Devices

#### iOS (Safari)
1. **Open Eko in Safari**: Navigate to your deployed instance
2. **Tap the Share button** (⏪)
3. **Scroll down and tap "Add to Home Screen"**
4. **Tap "Add"** to confirm
5. **Tap the new Eko icon** on your home screen

#### Android (Chrome, Samsung Internet)
1. **Open Eko in your browser**: Navigate to the deployed instance
2. **Tap the menu** (⋮) at the top right
3. **Select "Add to Home screen"**
4. **Tap "Add"** or "Install" to confirm
5. **Find Eko on your home screen** and tap to launch

#### Firefox Mobile
1. **Open Eko in Firefox**: Navigate to the deployed instance
2. **Tap the menu** (⋮) at the top right
3. **Select "Install"** or **"Install This Site"**
4. **Tap "Add"** to confirm

---

## 🛠️ Development & Deployment

### Local Development
```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build
```

### Deploy to Hosting Services

Eko can be deployed to any static hosting service:

#### Option 1: Vercel (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Or deploy from your project directory
vercel
```

#### Option 2: Netlify
1. **Login to Netlify**: `netlify login`
2. **Build the app**: `npm run build`
3. **Deploy**: `netlify deploy --prod --dir=build`

#### Option 3: GitHub Pages
1. **Install gh-pages package**: `npm install --save-dev gh-pages`
2. **Add deploy scripts to package.json**:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```
3. **Deploy**: `npm run deploy`

#### Option 4: Firebase Hosting
```bash
# Install Firebase CLI
npm install -g firebase-tools

# Initialize project
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

#### Option 5: AWS S3 + CloudFront
```bash
# Install AWS CLI
pip3 install awscli

# Configure AWS
aws configure

# Build and sync to S3 bucket
npm run build
aws s3 sync build/ s3://your-bucket-name --delete

# Your users can access: https://your-bucket-name.s3.amazonaws.com
```

---

## 📦 Distribution Platforms

### Android

#### Option 1: Google Play Store (Using PWA2APK)
1. **Use PWA2PWA converter** (https://pwa2apk.org/)
2. **Upload your Eko URL**
3. **Convert to APK**
4. **Submit to Google Play Store**

#### Option 2: Google Play Console
```bash
# Use bubblewrap (Google's PWA to TWA converter)
npm install -g @bubblewrap/cli

# Initialize
bubblewrap init --manifest https://yourdomain.com/manifest.json

# Build
bubblewrap build

# Submit the generated APK to Google Play
```

#### Option 3: Direct APK Distribution
```bash
# Build APK using PWABuilder
# Visit https://www.pwabuilder.com
# Enter your PWA URL
# Generate Android package
```

### iOS (App Store)

#### Option 1: PWABuilder
1. **Use PWABuilder**: Visit https://www.pwabuilder.com
2. **Enter your PWA URL**
3. **Generate Swift package**
4. **Use Xcode to customize and submit to App Store**

#### Option 2: Apache Cordova/PhoneGap
```bash
# Install Cordova
npm install -g cordova

# Create iOS project
cordova create eco-ios com.yourdomain.eco "Eko Messenger"
cd eco-ios

# Add iOS platform
cordova platform add ios

# Copy your web app to www/ directory
# Build for iOS
cordova build ios
```

### Windows

#### Option 1: Microsoft Store
```bash
# Use PWABuilder for Windows
# Visit https://www.pwabuilder.com
# Generate Windows application
```

#### Option 2: WinApp SDK
Use Microsoft's PWA Platform to create desktop applications.

### MacOS

#### Option 1: Electron Builder
```bash
# Install Electron Builder
npm install -g electron-builder

# Build Mac app
npm run build
npx cap add electron
npx cap copy electron
npx cap sync electron
npx cap open electron
```

---

## 🔧 Configuration

### Environment Variables
Create `.env` file for configuration:

```env
# PeerJS Server (Optional - uses PeerJS cloud by default)
REACT_APP_PEERJS_HOST=your-peerjs-host.herokuapp.com
REACT_APP_PEERJS_PORT=443
REACT_APP_PEERJS_PATH=/
```

### Custom Domain

1. **Buy a domain** from any registrar (ex: Namecheap, GoDaddy)
2. **Configure DNS** to point to your hosting provider
3. **Add HTTPS** (free SSL certificates via hosting providers)
4. **Test installation** works properly

### Custom Icons & Logos

Replace the existing icons in `public/` directory:
- `logo192.png` - 192x192px (app icon)
- `logo512.png` - 512x512px (high-res icon)
- `favicon.ico` - Multi-size favicon

For even better PWA experience, add the following sizes:
- `icon-72.png` - 72x72px
- `icon-96.png` - 96x96px
- `icon-128.png` - 128x128px
- `icon-144.png` - 144x144px

---

## 📊 PWA Features

Eko comes with full PWA capabilities:

### ✅ Already Implemented
- **App Manifest** - Proper branding and installation
- **Service Worker** - Offline support, caching, push notifications
- **HTTPS Security** - Secure communication channels
- **Responsive Design** - Works on all screen sizes
- **Native App Features** - Runs fullscreen, standalone mode

### 🚀 Future Enhancements (Optional)
- **Push Notifications** - Real-time message notifications
- **Background Sync** - Sync messages when connectivity returns
- **File Handling** - Share images and files
- **Web Share Target** - Accept shared content from other apps

---

## 🧪 Testing PWA Features

### Lighthouse Audit
```bash
# Audits PWA features
npx lighthouse http://localhost:3000 --output=json/html --disable-storage-reset
```

### Browser DevTools
1. **Open DevTools** → **Application** tab
2. **Check Service Worker** is registered
3. **Test clearing storage** to verify caching works
4. **Use Network tab** to test offline functionality

### Mobile Testing
1. **Open in mobile browser**
2. **Check installation prompt** appears
3. **Test on different devices** (iOS Safari, Android Chrome)

---

## 🔗 Direct App Distribution

Sharing Eko is easy:

### For Users
1. **Visit your deployed URL** in any modern browser
2. **Browser will prompt to install** automatically
3. **Click "Install"** and enjoy the app!

### For Distribution
- **Direct URL**: https://yourdomain.com
- **Mobile-friendly**: Works on all phones
- **Zero app store friction**: Direct installation

---

## 🤝 Support

Eko is designed to be **platform-independent** - it works wherever modern web browsers are available!

### Browser Compatibility
- ✅ Chrome (Desktop/Mobile)
- ✅ Edge (Desktop/Mobile)
- ✅ Safari (Desktop/iOS)
- ✅ Firefox (Desktop/Mobile)
- ✅ Samsung Internet (Android)

### Limitations
- **Legacy browsers** (IE 11 and below) not supported
- **Enterprise networks** may block WebRTC connections
- **VPNs** can interfere with peer connections

For issues, check the console for WebRTC connection status and ensure proper SSL/HTTPS configuration.

---

🌴 **Happy Eko-ing!** ✨

*Experience daily affirmations, secure messaging, and gamified positive interactions all in one beautiful, installable app!*
