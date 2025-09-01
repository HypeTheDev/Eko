import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import * as CryptoJS from 'crypto-js';
import AlbertCrypto from './ServerlessPeer';
import { gamification, ACHIEVEMENTS, DAILY_CHALLENGES, playSound, processEmojiText } from './Gamification';
import './App.css';

const AchievementModal = ({ unlockedAchievements, onClose }) => {
  const categories = ['all', 'communication', 'social', 'special', 'consistency', 'fun', 'security', 'achievement'];

  const [selectedCategory, setSelectedCategory] = useState('all');

  const getFilteredAchievements = () => {
    if (selectedCategory === 'all') {
      return Object.values(ACHIEVEMENTS);
    }
    return Object.values(ACHIEVEMENTS).filter(achievement => achievement.category === selectedCategory);
  };

  return (
    <div className="achievement-modal-overlay" onClick={onClose}>
      <div className="achievement-modal" onClick={e => e.stopPropagation()}>
        <h2>🏆 Achievements</h2>
        <div className="category-filter">
          {categories.map(category => (
            <button
              key={category}
              className={`category-button ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
        <div className="achievements-list">
          {getFilteredAchievements().map(achievement => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return (
              <div key={achievement.id} className={`achievement-item ${isUnlocked ? 'unlocked' : 'locked'}`}>
                <div className="achievement-icon">{isUnlocked ? achievement.icon : '❓'}</div>
                <div className="achievement-content">
                  <h3>{achievement.title}</h3>
                  <p>{achievement.description}</p>
                  {isUnlocked && <div className="achievement-points">+{achievement.points}pts</div>}
                </div>
              </div>
            );
          })}
        </div>
        <button className="close-button" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const DailyChallengeModal = ({ onClose }) => {
  const todayChallenge = gamification.getTodaysChallenge();
  const challengeData = DAILY_CHALLENGES[todayChallenge.id];

  return (
    <div className="daily-challenge-modal-overlay" onClick={onClose}>
      <div className="daily-challenge-modal" onClick={e => e.stopPropagation()}>
        <h2>🎯 Daily Challenge</h2>
        <div className="challenge-content">
          <div className="challenge-icon">{challengeData.emoji}</div>
          <h3>{challengeData.title}</h3>
          <p>{challengeData.description}</p>
          <div className="challenge-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${Math.min((todayChallenge.progress / 1) * 100, 100)}%` }} // Simplified, would need proper requirement
              ></div>
            </div>
            <span className="progress-text">{todayChallenge.progress}/1</span>
          </div>
          <div className="reward-info">
            <span>Reward: {challengeData.reward} points</span>
          </div>
        </div>
        <button className="close-button" onClick={onClose}>
          Got it!
        </button>
      </div>
    </div>
  );
};

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const emojis = [
    '😀', '😂', '🥰', '😊', '🤔', '😉', '😍', '🥺',
    '😎', '🤩', '😢', '😡', '👍', '👎', '❤️', '🔥',
    '✨', '⭐', '🌟', '💯', '😏', '🤤', '🤑', '🤗',
    '😈', '👻', '💀', '🙈', '🙉', '🙊', '🦊', '🐱'
  ];

  return (
    <div className="emoji-picker-overlay" onClick={onClose}>
      <div className="emoji-picker" onClick={e => e.stopPropagation()}>
        <h3>Choose an emoji</h3>
        <div className="emoji-grid">
          {emojis.map(emoji => (
            <button
              key={emoji}
              className="emoji-button"
              onClick={() => onEmojiSelect(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const GamificationNotification = ({ notification, onClose }) => {
  if (!notification) return null;

  return (
    <div className="gamification-notification" onClick={onClose}>
      <div className="notification-content">
        <span className="notification-icon">{notification.icon}</span>
        <div className="notification-text">
          <strong>{notification.title}</strong>
          <p>{notification.description}</p>
        </div>
      </div>
    </div>
  );
};

const UsernameModal = ({ username, setUsername, onClose }) => {
  const [tempUsername, setTempUsername] = useState(username || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (tempUsername.trim()) {
      setUsername(tempUsername.trim());
      localStorage.setItem('username', tempUsername.trim());
      onClose();
    }
  };

  return (
    <div className="username-modal-overlay">
      <div className="username-modal">
        <h2>Set Your Username</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={tempUsername}
            onChange={(e) => setTempUsername(e.target.value)}
            placeholder="Enter your username"
            maxLength="20"
            autoFocus
            required
          />
          <div className="modal-buttons">
            <button type="submit" className="primary-button">
              Save Username
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const App = () => {
  const [peerId, setPeerId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [username, setUsername] = useState('');
  const [friendUsername, setFriendUsername] = useState('');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'disconnected', 'connecting', 'connected'
  const [isInitializing, setIsInitializing] = useState(true);
  const peerInstance = useRef(null);
  const connInstance = useRef(null);
  const cryptoInstance = useRef(null);
  const privateKeyRef = useRef(null);
  const publicKeyRef = useRef(null);
  const [sharedSecret, setSharedSecret] = useState(null);

  // Gamification state
  const [showAchievements, setShowAchievements] = useState(false);
  const [showDailyChallenge, setShowDailyChallenge] = useState(false);
  const [recentNotification, setRecentNotification] = useState(null);
  const [gamificationPoints, setGamificationPoints] = useState(gamification.getPoints());
  const [unlockedAchievements, setUnlockedAchievements] = useState(gamification.getAchievements());
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedEmoji, setSelectedEmoji] = useState('');

  useEffect(() => {
    // Initialize username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      setShowUsernameModal(true);
    }
    setIsInitializing(false);
  }, []);

  // Gamification callbacks
  useEffect(() => {
    gamification.onUpdate({
      onPointsChange: (points, addedPoints, reason) => {
        setGamificationPoints(points);
        playSound('points');
        setRecentNotification({
          icon: '💰',
          title: `+${addedPoints} Points!`,
          description: reason
        });
        setTimeout(() => setRecentNotification(null), 3000);
      },
      onAchievementUnlock: (achievementId, achievement) => {
        setUnlockedAchievements(prev => [...prev, achievementId]);
        playSound('achievement');
        setRecentNotification({
          icon: achievement.icon,
          title: 'Achievement Unlocked!',
          description: achievement.title
        });
        setTimeout(() => setRecentNotification(null), 5000);
      }
    });

    // Check for daily challenge on load
    if (!gamification.getTodaysChallenge().completed) {
      setTimeout(() => setShowDailyChallenge(true), 1000);
    }
  }, []);

  useEffect(() => {
    const peerOptions = {};
    if (process.env.REACT_APP_PEERJS_HOST) {
      peerOptions.host = process.env.REACT_APP_PEERJS_HOST;
    }
    if (process.env.REACT_APP_PEERJS_PORT) {
      peerOptions.port = parseInt(process.env.REACT_APP_PEERJS_PORT);
    }
    if (process.env.REACT_APP_PEERJS_PATH) {
      peerOptions.path = process.env.REACT_APP_PEERJS_PATH;
    }

    const peer = new Peer(peerOptions);
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
      setConnectionStatus('connecting');
      conn.on('open', () => {
        // Send both public key and username
        conn.send({ type: 'PUBLIC_KEY', key: publicKeyRef.current.toString() });
        conn.send({ type: 'USERNAME', username: username });
        setConnectionStatus('connected');
      });
        conn.on('data', (data) => {
        if (data.type === 'PUBLIC_KEY') {
          try {
            const friendPublicKey = BigInt(data.key);
            // Validate public key is within valid range
            if (!crypto.validatePublicKey(friendPublicKey)) {
              console.error('Invalid public key received');
              setMessages((prevMessages) => [...prevMessages, { text: '[ERROR] Invalid public key from peer', sender: 'system' }]);
              return;
            }
            const secret = crypto.computeSharedSecret(privateKeyRef.current, friendPublicKey);
            setSharedSecret(secret.toString());
          } catch (error) {
            console.error('Error during key exchange:', error);
            setMessages((prevMessages) => [...prevMessages, { text: `[ERROR] Key exchange failed: ${error.message}`, sender: 'system' }]);
          }
        } else if (data.type === 'USERNAME') {
          setFriendUsername(data.username);
          setMessages((prevMessages) => [...prevMessages, { text: `${data.username} joined the chat`, sender: 'system', timestamp: new Date() }]);
        } else if (data.type === 'MESSAGE') {
          const decryptedMessage = JSON.parse(decryptMessage(data.content));
          setMessages((prevMessages) => [...prevMessages, { ...decryptedMessage, sender: 'friend' }]);
        } else {
          const decryptedMessage = decryptMessage(data);
          setMessages((prevMessages) => [...prevMessages, { text: decryptedMessage, sender: 'friend', timestamp: new Date() }]);
        }
      });
    });

    // Handle disconnection
    peer.on('disconnected', () => {
      setConnectionStatus('disconnected');
      setSharedSecret(null);
      setFriendUsername('');
      setMessages((prevMessages) => [...prevMessages, { text: 'Connection lost', sender: 'system', timestamp: new Date() }]);
    });

    peerInstance.current = peer;

    return () => {
      peer.destroy();
    };
  }, []);

  const encryptMessage = (message) => {
    try {
      if (!sharedSecret) {
        throw new Error('No shared secret available for encryption');
      }
      return CryptoJS.AES.encrypt(message, sharedSecret).toString();
    } catch (error) {
      console.error('Encryption error:', error);
      throw error;
    }
  };

  const decryptMessage = (encryptedMessage) => {
    try {
      if (!sharedSecret) {
        throw new Error('No shared secret available for decryption');
      }
      const bytes = CryptoJS.AES.decrypt(encryptedMessage, sharedSecret);
      const decryptedText = bytes.toString(CryptoJS.enc.Utf8);
      if (!decryptedText) {
        throw new Error('Decryption failed or resulted in empty message');
      }
      return decryptedText;
    } catch (error) {
      console.error('Decryption error:', error);
      return '[DECRYPTION ERROR]';
    }
  };

  const connectToFriend = () => {
    const conn = peerInstance.current.connect(friendId);
    connInstance.current = conn;
    setConnectionStatus('connecting');
    conn.on('open', () => {
      conn.send({ type: 'PUBLIC_KEY', key: publicKeyRef.current.toString() });
      conn.send({ type: 'USERNAME', username: username });
      setConnectionStatus('connected');

      // Gamification: Award points for successful connection
      gamification.incrementStat('connections');
      gamification.addPoints(5, 'New connection established');

      // Check for encryption expert achievement
      setTimeout(() => gamification.unlockAchievement('ENCRYPTION_EXPERT'), 1000);
    });
    conn.on('data', (data) => {
      if (data.type === 'PUBLIC_KEY') {
        try {
          const friendPublicKey = BigInt(data.key);
          // Validate public key is within valid range
          if (!cryptoInstance.current.validatePublicKey(friendPublicKey)) {
            console.error('Invalid public key received');
            setMessages((prevMessages) => [...prevMessages, { text: '[ERROR] Invalid public key from peer', sender: 'system' }]);
            return;
          }
          const secret = cryptoInstance.current.computeSharedSecret(privateKeyRef.current, friendPublicKey);
          setSharedSecret(secret.toString());

          // Gamification: Successful key exchange
          gamification.addPoints(5, 'Secure key exchange completed');
        } catch (error) {
          console.error('Error during key exchange:', error);
          setMessages((prevMessages) => [...prevMessages, { text: `[ERROR] Key exchange failed: ${error.message}`, sender: 'system' }]);
        }
      } else if (data.type === 'USERNAME') {
        setFriendUsername(data.username);
        setMessages((prevMessages) => [...prevMessages, { text: `Connected to ${data.username}`, sender: 'system', timestamp: new Date() }]);
      } else if (data.type === 'MESSAGE') {
        const decryptedMessage = JSON.parse(decryptMessage(data.content));
        setMessages((prevMessages) => [...prevMessages, { ...decryptedMessage, sender: 'friend' }]);
      } else {
        const decryptedMessage = decryptMessage(data);
        setMessages((prevMessages) => [...prevMessages, { text: decryptedMessage, sender: 'friend', timestamp: new Date() }]);
      }
    });
  };

  const sendMessage = () => {
    if (!connInstance.current || !message.trim()) {
      return;
    }
    try {
      if (!sharedSecret) {
        setMessages((prevMessages) => [...prevMessages, { text: '[ERROR] Secure connection not established', sender: 'system', timestamp: new Date() }]);
        return;
      }

      // Process emoji shortcuts before sending
      const processedMessage = processEmojiText(message.trim());

      // Check if message contains emojis for achievement
      const hasEmojis = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|\u{2700}-\u{27BF}|\u{1f926}-\u{1f937}|\u{10000}-\u{10FFFF}/u.test(processedMessage);

      const messageData = {
        text: processedMessage,
        username: username,
        timestamp: new Date(),
        hasEmojis: hasEmojis
      };

      const encryptedMessageData = encryptMessage(JSON.stringify(messageData));
      connInstance.current.send({ type: 'MESSAGE', content: encryptedMessageData });
      setMessages((prevMessages) => [...prevMessages, { ...messageData, sender: 'me' }]);

      // Gamification: Message sent
      gamification.incrementStat('messagesSent');
      gamification.addPoints(1, 'Message sent');

      // Check for emoji lover achievement
      if (hasEmojis) {
        gamification.incrementStat('emojiMessagesSent');
      }

      // Check for night owl achievement
      const hour = new Date().getHours();
      if (hour >= 23 || hour <= 5) {
        gamification.unlockAchievement('NIGHT_OWL');
      }

      // Play message sound
      playSound('message');

      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages((prevMessages) => [...prevMessages, { text: `[ERROR] ${error.message}`, sender: 'system', timestamp: new Date() }]);
    }
  };

  // Gamification event handlers
  const handleEmojiSelect = (emoji) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const handleShowAchievements = () => {
    setShowAchievements(true);
  };

  const handleShowDailyChallenge = () => {
    setShowDailyChallenge(true);
    // Update daily challenge progress based on current activity
    gamification.updateChallengeProgress('CHAT_INITIATE', 1); // Simplified
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return timestamp ? new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  };

  if (isInitializing) {
    return (
      <div className="App">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      {showUsernameModal && (
        <UsernameModal
          username={username}
          setUsername={setUsername}
          onClose={() => setShowUsernameModal(false)}
        />
      )}

      {showAchievements && (
        <AchievementModal
          unlockedAchievements={unlockedAchievements}
          onClose={() => setShowAchievements(false)}
        />
      )}

      {showDailyChallenge && (
        <DailyChallengeModal
          onClose={() => setShowDailyChallenge(false)}
        />
      )}

      {showEmojiPicker && (
        <EmojiPicker
          onEmojiSelect={handleEmojiSelect}
          onClose={() => setShowEmojiPicker(false)}
        />
      )}

      <GamificationNotification
        notification={recentNotification}
        onClose={() => setRecentNotification(null)}
      />

      <div className="chat-header">
        <div className="chat-title">
          <h1>🔒 Encrypted Messenger</h1>
        </div>
        <div className="user-info">
          <div className="gamification-info">
            <button className="gamification-button points-button" onClick={handleShowDailyChallenge}>
              💰 {gamificationPoints}
            </button>
            <button className="gamification-button achievements-button" onClick={handleShowAchievements}>
              🏆 {unlockedAchievements.length}
            </button>
          </div>
          <span className="username-display">{username}</span>
          <span className={`connection-bubble ${connectionStatus}`}></span>
        </div>
      </div>

      <div className="connection-panel">
        <div className="peer-info">
          <p className="peer-id">ID: {peerId}</p>
          {friendUsername && (
            <p className="friend-name">Connected to: {friendUsername}</p>
          )}
        </div>

        {!connInstance.current && (
          <div className="connect-section">
            <input
              type="text"
              value={friendId}
              onChange={(e) => setFriendId(e.target.value)}
              placeholder="Enter friend's Peer ID"
              className="peer-input"
            />
            <button
              onClick={connectToFriend}
              disabled={!friendId.trim()}
              className="connect-button"
            >
              Connect
            </button>
          </div>
        )}
      </div>

      <div className="messages-area">
        <div className="message-container" ref={(el) => {
          if (el) el.scrollTop = el.scrollHeight;
        }}>
          {messages.length === 0 ? (
            <div className="empty-chat">
              <p>No messages yet. Connect with a friend to start chatting!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message ${msg.sender}`}>
                {msg.sender === 'system' ? (
                  <div className="system-message">
                    <span className="message-text">{msg.text}</span>
                    {msg.timestamp && (
                      <span className="message-time">{formatTime(msg.timestamp)}</span>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="message-header">
                      <span className="message-username">
                        {msg.sender === 'me' ? username : (msg.username || friendUsername || 'Friend')}
                      </span>
                      {msg.timestamp && (
                        <span className="message-time">{formatTime(msg.timestamp)}</span>
                      )}
                    </div>
                    <div className="message-bubble">
                      <span className="message-text">{msg.text}</span>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="input-area">
          <button
            className="emoji-button"
            onClick={() => setShowEmojiPicker(true)}
            disabled={!connInstance.current}
            title="Add emoji"
          >
            😊
          </button>
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={connInstance.current ? "Type a message (try :D or <3)..." : "Connect first to send messages"}
            className="message-input"
            disabled={!connInstance.current}
          />
          <button
            onClick={sendMessage}
            disabled={!message.trim() || !connInstance.current}
            className="send-button"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
