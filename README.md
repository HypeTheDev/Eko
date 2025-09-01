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

### Basic Usage

```bash
npm start
```

Open `http://localhost:3000` in your browser.

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

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_PEERJS_HOST` | Custom PeerJS server hostname | PeerJS public server |
| `REACT_APP_PEERJS_PORT` | Server port | 443 |
| `REACT_APP_PEERJS_PATH` | Server path | `/myapp` |

### Example Configurations

**Local Development:**
```
REACT_APP_PEERJS_HOST=localhost
REACT_APP_PEERJS_PORT=9000
REACT_APP_PEERJS_PATH=/myapp
```

**Production Server:**
```
REACT_APP_PEERJS_HOST=p2p.mydomain.com
REACT_APP_PEERJS_PORT=80
REACT_APP_PEERJS_PATH=
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
