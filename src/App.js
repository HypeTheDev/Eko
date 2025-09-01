import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import * as CryptoJS from 'crypto-js';
import AlbertCrypto from './ServerlessPeer';
import './App.css';

const App = () => {
  const [peerId, setPeerId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const peerInstance = useRef(null);
  const connInstance = useRef(null);
  const cryptoInstance = useRef(null);
  const privateKeyRef = useRef(null);
  const publicKeyRef = useRef(null);
  const [sharedSecret, setSharedSecret] = useState(null);

  useEffect(() => {
    const peer = new Peer();
    const crypto = new AlbertCrypto();
    cryptoInstance.current = crypto;

    const privateKey = crypto.generatePrivateKey();
    privateKeyRef.current = privateKey;
    const publicKey = crypto.generatePublicKey(privateKey);
    publicKeyRef.current = publicKey;

    peer.on('open', (id) => {
      setPeerId(id);
    });

    peer.on('connection', (conn) => {
      connInstance.current = conn;
      conn.on('open', () => {
        conn.send({ type: 'PUBLIC_KEY', key: publicKeyRef.current.toString() });
      });
      conn.on('data', (data) => {
        if (data.type === 'PUBLIC_KEY') {
          const friendPublicKey = BigInt(data.key);
          const secret = crypto.computeSharedSecret(privateKeyRef.current, friendPublicKey);
          setSharedSecret(secret.toString());
        } else {
          const decryptedMessage = decryptMessage(data);
          setMessages((prevMessages) => [...prevMessages, { text: decryptedMessage, sender: 'friend' }]);
        }
      });
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const encryptMessage = (message) => {
    return CryptoJS.AES.encrypt(message, sharedSecret).toString();
  };

  const decryptMessage = (encryptedMessage) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
    return bytes.toString(CryptoJS.enc.Utf8);
  };

  const connectToFriend = () => {
    const conn = peerInstance.current.connect(friendId);
    connInstance.current = conn;
    conn.on('open', () => {
      conn.send({ type: 'PUBLIC_KEY', key: publicKeyRef.current.toString() });
    });
    conn.on('data', (data) => {
      if (data.type === 'PUBLIC_KEY') {
        const friendPublicKey = BigInt(data.key);
        const secret = cryptoInstance.current.computeSharedSecret(privateKeyRef.current, friendPublicKey);
        setSharedSecret(secret.toString());
      } else {
        const decryptedMessage = decryptMessage(data);
        setMessages((prevMessages) => [...prevMessages, { text: decryptedMessage, sender: 'friend' }]);
      }
    });
  };

  const sendMessage = () => {
    if (connInstance.current) {
      const encryptedMessage = encryptMessage(message);
      connInstance.current.send(encryptedMessage);
      setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'me' }]);
      setMessage('');
    }
  };

  return (
    <div className="App">
      <h1>Encrypted Messenger</h1>
      <p>Your Peer ID: {peerId}</p>
      <input
        type="text"
        value={friendId}
        onChange={(e) => setFriendId(e.target.value)}
        placeholder="Friend's Peer ID"
      />
      <button onClick={connectToFriend}>Connect</button>
      <div className="message-container">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default App;
