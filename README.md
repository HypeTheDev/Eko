# 🛡️ Eko - Encrypted P2P Messenger

An end-to-end encrypted peer-to-peer messaging application built with React, WebRTC, and custom cryptographic primitives.

## 🌟 Features

- **End-to-End Encryption**: Custom Diffie-Hellman key exchange with AES-256 encryption
- **P2P Communication**: Using PeerJS with support for custom servers
- **Real-time Messaging**: Direct browser-to-browser communication
- **Cryptographically Secure**: Uses `crypto.getRandomValues()` for secure random generation
- **Error Handling**: Comprehensive validation and error handling for security and reliability
- **Self-hosted Server**: Avoid PeerJS free tier limitations with your own server

## 🔒 Security Features

- **Secure Key Generation**: Cryptographically secure random number generation (not `Math.random()`)
- **Key Validation**: Validates received public keys are within valid Diffie-Hellman parameters
- **Error-resistant Cryptography**: Handles key exchange failures and encryption errors gracefully
- **Input Validation**: Protects against malformed keys and messages
- **RFC 3526 Compliance**: Uses standardized 2048-bit MODP groups

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/HypeTheDev/Eko.git
cd Eko
npm install
```

### Basic Usage (with PeerJS limitations)

```bash
npm start
```

Open `http://localhost:3000` in your browser.

### Full Usage - No Restrictions

For unlimited peer-to-peer connections with no PeerJS server limitations:

#### Option 1: Simple Full Stack (Recommended)

```bash
# Start both the PeerJS server and React app in parallel
npm run dev:full
```

This starts:
- PeerJS signaling server on `http://localhost:9000`
- React app on `http://localhost:3000`

#### Option 2: Manual Setup

**Terminal 1: Start PeerJS Server**
```bash
npm run peer-server
```

**Terminal 2: Start React App**
```bash
npm start
```

#### Option 3: Production Deployment

1. **Deploy PeerJS server:**
   ```bash
   docker run -p 80:80 -d peerjs/peerjs-server
   ```

2. **Configure environment:**
   ```bash
   # Copy and modify .env.local
   cp .env.local .env.production.local
   # Edit .env.production.local with your server URLs
   ```

3. **Build and deploy:**
   ```bash
   npm run build
   # Deploy build/ folder to your web server
   ```

### Configuration Options

- **Local Development:** Uses `.env.local` (automatically detected by React)
- **Production:** Use `.env.production.local`
- **Custom Servers:** Edit the environment variables in `.env.local` file

### Using Custom PeerJS Server

To avoid PeerJS free tier limitations, set up your own PeerJS server:

1. **Install peerjs server globally:**
   ```bash
   npm install -g peer
   ```

2. **Start your PeerJS server:**
   ```bash
   peerjs --port 9000 --key peerjs
   ```
   Or with a custom path:
   ```bash
   peerjs --port 9000 --key peerjs --path /myapp
   ```

3. **Configure environment variables:**
   Create a `.env` file:
   ```
   REACT_APP_PEERJS_HOST=your-server.domain.com
   REACT_APP_PEERJS_PORT=9000
   REACT_APP_PEERJS_PATH=/myapp
   ```

4. **Restart the application:**
   ```bash
   npm start
   ```

## 🏗️ Architecture Overview

### Cryptographic Implementation

The application uses a custom Diffie-Hellman key exchange with:

1. **Alice generates private key** `a ∈ [1, p-1]` using `crypto.getRandomValues()`
2. **Alice computes public key** `A = g^a mod p`
3. **Bob does the same** to get `b` and `B = g^b mod p`
4. **Key exchange:** Alice sends `A` to Bob, Bob sends `B` to Alice
5. **Shared secret:** Alice computes `s = B^a mod p`, Bob computes `s = A^b mod p`
6. **Messages encrypted** with AES using derived key from shared secret

### Network Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│   Browser   │────▶│   PeerJS Server  │◂────│   Browser   │
│   (Alice)   │     │                 │     │   (Bob)     │
└─────────────┘     └─────────────────┘     └─────────────┘
       ▲                    ▲                    ▲
       │                    │                    │
   ┌───────┐          ┌─────┴─────┐          ┌───────┐
   │DH Key │          │WebRTC    │          │DH Key │
   │Exchange│          │Signaling │          │Exchange│
   └───────┘          └──────────┘          └───────┘
```

## ⚙️ Configuration

### Environment Variables

Edit the `.env.local` file in the project root to configure your environment:

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_USE_LOCAL_PEER_SERVER` | Use local PeerJS server | `false` |
| `REACT_APP_PEERJS_HOST` | Custom PeerJS server hostname | PeerJS public server |
| `REACT_APP_PEERJS_PORT` | Server port | 443 |
| `REACT_APP_PEERJS_PATH` | Server path | `/signaling` |
| `REACT_APP_PEERJS_KEY` | Server authentication key | `peerjs` |
| `REACT_APP_PEERJS_DEBUG` | Enable detailed connection logging | `false` |
| `REACT_APP_DEFAULT_THEME` | Default theme color | `#00ff00` |
| `REACT_APP_MATRIX_WATERFALL` | Enable Matrix waterfall effect | `true` |

### Configuration Examples

**Local Development (No Restrictions):**
```
REACT_APP_USE_LOCAL_PEER_SERVER=true
# No other configuration needed - uses localhost:9000 automatically
```

**Custom Local Server:**
```
REACT_APP_USE_LOCAL_PEER_SERVER=true
REACT_APP_PEERJS_HOST=localhost
REACT_APP_PEERJS_PORT=8080
REACT_APP_PEERJS_PATH=/my-signaling
```

**Production Hosted Server:**
```
REACT_APP_PEERJS_HOST=p2p.yourdomain.com
REACT_APP_PEERJS_PORT=443
REACT_APP_PEERJS_PATH=/signaling
REACT_APP_PEERJS_KEY=your-secret-key
```

**Debug Mode:**
```
REACT_APP_PEERJS_DEBUG=true
```

## 🔧 Deployment

### For Development
```bash
npm install
npm start
```

### For Production
```bash
npm run build
# Deploy the build/ directory to your web server
```

### PeerJS Server Deployment

**Using Docker:**
```bash
docker run -p 9000:9000 -d peerjs/peerjs-server
```

**Using npm:**
```bash
# Install globally
npm install -g peer

# Run server
peerjs --port 9000 --key your-secret-key --sslkey key.pem --sslcert cert.pem
```

### Deploying Both Components

For production, you'll need to deploy:
1. The React application (build/ folder)
2. Your PeerJS server (accessible from outside your network)

## 🛠️ API Documentation

### AlbertCrypto Class

Custom cryptographic implementation with modular arithmetic:

```javascript
const crypto = new AlbertCrypto();

// Generate secure private key
const privateKey = crypto.generatePrivateKey();

// Compute public key
const publicKey = crypto.generatePublicKey(privateKey);

// Compute shared secret
const sharedSecret = crypto.computeSharedSecret(privateKey, otherPublicKey);
```

### Security Considerations

⚠️ **Important Security Notes:**

- Keys are generated per session and never stored
- Messages are encrypted end-to-end before transmission
- Uses cryptographically secure random number generation
- Validates mathematical parameters for Diffie-Hellman
- Handles cryptographic errors without exposing sensitive information

⛔ **Known Limitations:**

- This implementation is for educational purposes
- Required additional security audits for production use
- No man-in-the-middle protection (add SSL and certificate validation)
- No perfect forward secrecy (can be added with ephemeral keys)

## 📊 Development

### Project Structure

```
eko/
├── src/
│   ├── App.js              # Main React component
│   ├── App.css             # Styling
│   ├── ServerlessPeer.js   # Custom crypto implementation
│   └── index.js            # React entry point
├── public/
│   └── ...                 # Static assets
├── .env.example            # Environment variables template
└── package.json            # Dependencies
```

### Key Files

- **`src/App.js`**: Main application component with PeerJS and crypto integration
- **`src/ServerlessPeer.js`**: Custom Diffie-Hellman and AES implementation
- **`.env.example`**: Template for PeerJS server configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## ⚠️ Disclaimer

This application demonstrates cryptographic concepts but should undergo thorough security review before production use. The authors are not responsible for any misuse or security vulnerabilities.
