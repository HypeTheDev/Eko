import React, { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import * as CryptoJS from 'crypto-js';
import AlbertCrypto from './ServerlessPeer';
import { gamification, ACHIEVEMENTS, DAILY_CHALLENGES, DAILY_ACTIVITY_TYPES, playSound, processEmojiText } from './Gamification';

import WorldNewsBlog from './WorldNewsBlog';
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

const DailyComposer = ({ onClose, username, onShare, selectedType, setSelectedType }) => {
  const [content, setContent] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      const newShare = {
        id: Date.now(),
        type: selectedType,
        content: content.trim(),
        author: username,
        timestamp: new Date(),
        likes: 0,
        liked: false
      };
      onShare(newShare);
      setContent('');
      onClose();
    }
  };

  const currentType = DAILY_ACTIVITY_TYPES[selectedType.toUpperCase()];

  return (
    <div className="daily-composer-overlay" onClick={onClose}>
      <div className="daily-composer" onClick={e => e.stopPropagation()}>
        <h2>Create Daily Share</h2>

        <div className="type-selector">
          {Object.values(DAILY_ACTIVITY_TYPES).map(type => (
            <button
              key={type.id}
              className={`type-button ${selectedType === type.id ? 'active' : ''}`}
              onClick={() => setSelectedType(type.id)}
            >
              <span className="type-icon">{type.icon}</span>
              <span className="type-title">{type.title}</span>
            </button>
          ))}
        </div>

        {currentType && (
          <div className="type-description">
            <h3>{currentType.icon} {currentType.title}</h3>
            <p>{currentType.description}</p>
            <div className="reward-preview">Reward: {currentType.points} points</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share something meaningful..."
            rows={4}
            maxLength={500}
            required
          />
          <div className="composer-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="submit-button" disabled={!content.trim()}>
              Share Daily ({currentType?.points || 0} pts)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const DailyFeed = ({ onClose, dailyShares, onLike, onComposeNew }) => {
  const [shares, setShares] = useState([]);

  useEffect(() => {
    setShares([...dailyShares].reverse()); // Show most recent first
  }, [dailyShares]);

  return (
    <div className="daily-feed-overlay" onClick={onClose}>
      <div className="daily-feed" onClick={e => e.stopPropagation()}>
        <div className="feed-header">
          <h2>🌟 Daily Feed</h2>
          <button className="compose-new" onClick={() => {
            onClose();
            onComposeNew();
          }}>
            ✍️ Share Something
          </button>
        </div>

        <div className="feed-content">
          {shares.length === 0 ? (
            <div className="empty-feed">
              <p>No daily shares yet. Be the first to share something meaningful!</p>
            </div>
          ) : (
            shares.map(share => {
              const typeData = DAILY_ACTIVITY_TYPES[share.type.toUpperCase()] || DAILY_ACTIVITY_TYPES.FACT;
              return (
                <div key={share.id} className="daily-share">
                  <div className="share-header">
                    <div className="share-author">
                      <span className="author-name">{share.author}</span>
                      <span className="share-type">{typeData.icon} {typeData.title}</span>
                    </div>
                    <div className="share-time">
                      {new Date(share.timestamp).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="share-content">
                    <p>{share.content}</p>
                  </div>
                  <div className="share-footer">
                    <button
                      className={`like-button ${share.liked ? 'liked' : ''}`}
                      onClick={() => onLike(share.id)}
                    >
                      ❤️ {share.likes}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <button className="close-feed" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

const DailyDropdownMenu = ({ onClose, onShowFeed, onShowComposer, onShowChallenge }) => {
  return (
    <div className="daily-dropdown" onClick={(e) => e.stopPropagation()}>
      <button className="dropdown-item" onClick={() => {
        onShowFeed();
        onClose();
      }}>
        <span className="dropdown-icon">📚</span>
        <span>View Daily Feed</span>
      </button>
      <button className="dropdown-item" onClick={() => {
        onShowComposer();
        onClose();
      }}>
        <span className="dropdown-icon">✍️</span>
        <span>Create Daily Share</span>
      </button>
      <button className="dropdown-item" onClick={() => {
        onShowChallenge();
        onClose();
      }}>
        <span className="dropdown-icon">🎯</span>
        <span>Daily Challenges</span>
      </button>
    </div>
  );
};

const DailyChallengeModal = ({ onClose }) => {
  const todayChallenge = gamification.getTodaysChallenge();
  const challengeData = DAILY_CHALLENGES[todayChallenge.id];

  // Handle case where challenge data might not exist
  if (!challengeData) {
    return (
      <div className="daily-challenge-modal-overlay" onClick={onClose}>
        <div className="daily-challenge-modal" onClick={e => e.stopPropagation()}>
          <h2>🎯 Daily Challenge</h2>
          <div className="challenge-content">
            <div className="challenge-icon">❌</div>
            <h3>Challenge Unavailable</h3>
            <p>There seems to be an issue loading today's challenge.</p>
          </div>
          <button className="close-button" onClick={onClose}>
            Okay
          </button>
        </div>
      </div>
    );
  }

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

const GifPicker = ({ onGifSelect, onClose }) => {
  const [gifSearch, setGifSearch] = useState('');
  const [trendingGifs, setTrendingGifs] = useState([]);
  const [searchedGifs, setSearchedGifs] = useState([]);
  const [showSearchInput, setShowSearchInput] = useState(false);

  // Predefined popular gifs/animated stickers
  const popularGifs = [
    '🎉', '✨', '💫', '🌈', '🎊', '🎈', '🎆', '🎇',
    '🎵', '🎶', '🎸', '🎹', '🎷', '🥁', '🎺', '🎤',
    '🚀', '⚡', '💥', '🌀', '🌪️', '🔥', '💯', '⭐',
    '🏆', '🎯', '🎪', '🎭', '🎨', '🎭', '🎪', '🎩',
    '🐱', '🐭', '🐶', '🐷', '🦄', '🐝', '🐌', '🦋',
    '🌸', '🌺', '🌻', '🌹', '🌷', '🍀', '🌾', '🐾'
  ];

  // Simulate GIPHY-like trending/popular content
  const getTrendingGifs = () => [
    '😄', '😂', '😍', '❤️', '🔥', '💯', '🚀', '✨',
    '🎉', '💫', '🌟', '⭐', '🎊', '🎈', '🎆', '🎇',
    '🕺', '💃', '🤩', '🥳', '🤗', '🤪', '🥺', '😘',
    '🎵', '🎶', '🎤', '🎹', '🥁', '🎷', '🎺', '🎸',
    '⚡', '💥', '🌀', '🌈', '🔮', '💎', '💐', '🍾'
  ];

  useEffect(() => {
    setTrendingGifs(getTrendingGifs());
  }, []);

  const handleSearch = (searchTerm) => {
    if (!searchTerm.trim()) {
      setSearchedGifs([]);
      return;
    }

    // Simulate search results based on keywords
    const searchResults = [];
    const searchLower = searchTerm.toLowerCase();

    const allPossibleGifs = [
      '👏', '🤝', '👍', '👌', '🙌', '🙏', '👋', '✋',
      '🌟', '⭐', '🌙', '☀️', '🌈', '☁️', '⚡', '🌪️',
      '👍', '👎', '👊', '✌️', '🤞', '👈', '👉', '👆',
      '🎯', '🏀', '⚽', '🏈', '🎮', '🎵', '🎤', '🎬',
      '💝', '💖', '💗', '💓', '💞', '💕', '💌', '💘',
      '🦋', '🐝', '🦄', '🦊', '🐱', '🐶', '🐷', '🐮'
    ];

    if (searchLower.includes('happy') || searchLower.includes('joy')) {
      searchResults.push('😊', '😄', '😀', '🥳', '🤗', '🤩');
    }
    if (searchLower.includes('love') || searchLower.includes('heart')) {
      searchResults.push('❤️', '💕', '💖', '💗', '💓', '💞', '💝', '💘');
    }
    if (searchLower.includes('fire') || searchLower.includes('hot')) {
      searchResults.push('🔥', '💥', '⚡');
    }
    if (searchLower.includes('cool') || searchLower.includes('awesome')) {
      searchResults.push('🥳', '🤩', '💯', '🎉', '✨');
    }

    setSearchedGifs(searchResults.length > 0 ? searchResults : allPossibleGifs.slice(0, 20));
  };

  return (
    <div className="gif-picker-overlay" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.9)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 2000
    }}>
      <div className="gif-picker" onClick={e => e.stopPropagation()} style={{
        background: '#000000',
        border: '1px solid #00ff00',
        padding: '20px',
        maxWidth: '400px',
        width: '90%',
        maxHeight: '500px',
        overflow: 'hidden',
        color: '#00ff00'
      }}>
        <div className="gif-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 style={{ color: '#00ff00', margin: 0 }}>Choose GIF</h3>
          <button onClick={onClose} style={{
            background: '#000000',
            color: '#00ff00',
            border: '1px solid #00ff00',
            padding: '5px 10px',
            cursor: 'pointer'
          }}>
            ✕
          </button>
        </div>

        <div className="gif-tabs" style={{ marginBottom: '15px' }}>
          <button
            onClick={() => setShowSearchInput(false)}
            style={{
              background: showSearchInput ? '#000000' : '#00ff00',
              color: showSearchInput ? '#00ff00' : '#000000',
              border: '1px solid #00ff00',
              padding: '8px 15px',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            Trending
          </button>
          <button
            onClick={() => setShowSearchInput(!showSearchInput)}
            style={{
              background: showSearchInput ? '#00ff00' : '#000000',
              color: showSearchInput ? '#000000' : '#00ff00',
              border: '1px solid #00ff00',
              padding: '8px 15px',
              cursor: 'pointer'
            }}
          >
            {showSearchInput ? 'Cancel' : 'Search'}
          </button>
        </div>

        {showSearchInput && (
          <input
            type="text"
            placeholder="Search GIFs..."
            value={gifSearch}
            onChange={(e) => setGifSearch(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch(gifSearch)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #00ff00',
              background: '#000000',
              color: '#00ff00',
              marginBottom: '10px',
              fontFamily: 'inherit'
            }}
          />
        )}

        <div className="gif-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '8px',
          maxHeight: '300px',
          overflowY: 'auto',
          paddingRight: '5px'
        }}>
          {(gifSearch && searchedGifs.length > 0 ? searchedGifs : trendingGifs).map((gif, index) => (
            <button
              key={index}
              className="gif-button"
              onClick={() => onGifSelect(gif)}
              style={{
                background: '#111111',
                border: '1px solid #333',
                padding: '8px',
                cursor: 'pointer',
                fontSize: '20px',
                borderRadius: '4px',
                transition: 'all 0.2s',
                minHeight: '45px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseOver={(e) => e.target.style.borderColor = '#00ff00'}
              onMouseOut={(e) => e.target.style.borderColor = '#333'}
            >
              {gif}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

const EmojiPicker = ({ onEmojiSelect, onClose }) => {
  const [activeTab, setActiveTab] = useState('emoji');
  const [easterEggMode, setEasterEggMode] = useState(false);

  const emojis = [
    // Faces & Emotions
    '😀', '😂', '🥰', '😊', '🤔', '😉', '😍', '🥺',
    '😎', '🤩', '😢', '😡', '👍', '👎', '❤️', '🔥',
    // Animals & Nature
    '🐱', '🐶', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
    '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🦄',
    // Food & Drinks
    '🍕', '🍔', '🍟', '🌭', '🍿', '🍩', '🍪', '🎂',
    '🍰', '🧁', '🍫', '🍬', '🍭', '🍮', '🍯', '🧃',
    // Activities & Objects
    '⚽', '🏀', '🏈', '🎮', '🎸', '🎹', '🎤', '🎬',
    '📚', '💻', '📱', '💡', '✈️', '🚗', '🚀', '⏰',
    // Symbols & Shapes
    '✨', '⭐', '🌟', '💫', '💯', '🔔', '🔥', '⚡',
    '💦', '❄️', '🌈', '🧲', '💎', '🔮', '🎪', '🎊',
    // More Faces
    '🥳', '🤗', '🤪', '😜', '😝', '🤤', '😴', '🤯',
    '🤗', '🤠', '🥸', '😷', '🤢', '🤮', '🤧', '🥱',
    // Hand Gestures
    '👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏',
    '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆',
    // Travel & Places
    '🌍', '🌎', '🌏', '🌌', '🌙', '☀️', '🌞', '⭐',
    '⛅', '🌤️', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️', '☃️',
    // Vehicles
    '🚗', '🚕', '🚙', '🚎', '🏎️', '🚓', '🚑', '🚒',
    '🚐', '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴',
    // Special Easter Egg Emojis (accessible by clicking header 3x)
    '💩', '🤡', '👻', '🎃', '😈', '👹', '👺', '🎭',
    '🕶️', '🐔', '🦀', '🐠', '🌵', '🍄', '🌚', '🌝'
  ];

  const handleHeaderClick = () => {
    setActiveTab(prev => prev === 'gif' ? 'emoji' : 'gif');
  };

  return (
    <div className="emoji-picker-overlay" onClick={onClose}>
      <div className="emoji-picker" onClick={e => e.stopPropagation()}>
        <div className="emoji-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '15px'
        }}>
          <h3 onClick={handleHeaderClick} style={{
            color: '#00ff00',
            margin: 0,
            cursor: 'pointer',
            fontSize: '1.1rem'
          }}>
            Choose {activeTab === 'emoji' ? 'Emoji' : 'GIF'}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: '#000000',
              color: '#00ff00',
              border: '1px solid #00ff00',
              padding: '5px 10px',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div className="emoji-tabs" style={{ marginBottom: '15px' }}>
          <button
            onClick={() => setActiveTab('emoji')}
            style={{
              background: activeTab === 'emoji' ? '#00ff00' : '#000000',
              color: activeTab === 'emoji' ? '#000000' : '#00ff00',
              border: '1px solid #00ff00',
              padding: '8px 15px',
              cursor: 'pointer',
              marginRight: '5px'
            }}
          >
            😊
          </button>
          <button
            onClick={() => setActiveTab('gif')}
            style={{
              background: activeTab === 'gif' ? '#00ff00' : '#000000',
              color: activeTab === 'gif' ? '#000000' : '#00ff00',
              border: '1px solid #00ff00',
              padding: '8px 15px',
              cursor: 'pointer'
            }}
          >
            GIF
          </button>
        </div>

        {activeTab === 'emoji' && (
          <div className="emoji-grid" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(8, 1fr)',
            gap: '8px',
            maxHeight: '300px',
            overflowY: 'auto',
            paddingRight: '5px'
          }}>
            {emojis.map(emoji => (
              <button
                key={emoji}
                className="emoji-button"
                onClick={() => onEmojiSelect(emoji)}
                style={{
                  background: '#111111',
                  border: '1px solid #333',
                  padding: '8px',
                  cursor: 'pointer',
                  fontSize: '20px',
                  borderRadius: '4px',
                  transition: 'all 0.2s',
                  minHeight: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => e.target.style.borderColor = '#00ff00'}
                onMouseOut={(e) => e.target.style.borderColor = '#333'}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'gif' && (
          <div className="gif-display">
            <GifPicker
              onGifSelect={onEmojiSelect}
              onClose={onClose}
            />
          </div>
        )}
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

const ColorPickerModal = ({ onSelectColor, onClose }) => {
  const rainbowColors = [
    '#ff0000', // Red
    '#ff8000', // Orange
    '#ffff00', // Yellow
    '#00ff00', // Green
    '#0080ff', // Blue
    '#8000ff', // Indigo
    '#ff00ff'  // Violet
  ];

  const handleColorSelect = (color) => {
    onSelectColor(color);
    onClose();
  };

  return (
    <div className="color-picker-modal-overlay">
      <div className="color-picker-modal">
        <h2>Choose Rainbow Color</h2>
        <div className="color-picker-grid">
          {rainbowColors.map((color, index) => (
            <button
              key={index}
              className="color-option"
              style={{ backgroundColor: color }}
              onClick={() => handleColorSelect(color)}
              title={color}
            />
          ))}
        </div>
        <button className="close-button" onClick={onClose}>
          Cancel
        </button>
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
  const [showDailyDropdown, setShowDailyDropdown] = useState(false);
  const [showDailyComposer, setShowDailyComposer] = useState(false);
  const [showDailyFeed, setShowDailyFeed] = useState(false);
  const [dailyShares, setDailyShares] = useState(JSON.parse(localStorage.getItem('daily_shares') || '[]'));
  const [selectedDailyType, setSelectedDailyType] = useState('fact');

  // World news state
  const [showWorldNews, setShowWorldNews] = useState(false);

  // Color theme state
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentColor, setCurrentColor] = useState('#00ff00');

  useEffect(() => {
    // Initialize color theme from localStorage
    const storedColor = localStorage.getItem('theme_color') || '#00ff00';
    setCurrentColor(storedColor);
    document.documentElement.style.setProperty('--primary-color', storedColor);
  }, []);

  // Register Service Worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then((registration) => {
            console.log('🌴 Eko Service Worker registered:', registration);
          })
          .catch((error) => {
            console.log('🌴 Eko Service Worker registration failed:', error);
          });
      });
    }
  }, []);

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
        setTimeout(() => setRecentNotification(null), 4000);
      },
      onChallengeCompleted: (challengeId, challengeData) => {
        playSound('achievement');
        setRecentNotification({
          icon: '🌟',
          title: 'Daily Challenge Completed!',
          description: challengeData.completionMessage
        });
        setTimeout(() => setRecentNotification(null), 6000);
      },
      onAchievementUnlock: (achievementId, achievement) => {
        setUnlockedAchievements(prev => [...prev, achievementId]);
        playSound('achievement');
        setRecentNotification({
          icon: achievement.icon,
          title: 'Achievement Unlocked!',
          description: achievement.title
        });
        setTimeout(() => setRecentNotification(null), 6000);
      }
    });

    // Show welcome challenge on first visit
    const hasCompletedWelcome = localStorage.getItem('welcome_challenge_shown');
    if (!hasCompletedWelcome) {
      setTimeout(() => {
        setShowDailyChallenge(true);
        localStorage.setItem('welcome_challenge_shown', 'true');
      }, 2000);
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
      conn.on('data', (data) => handleIncomingData(data));
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

  const handleIncomingData = (data) => {
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
      } catch (error) {
        console.error('Error during key exchange:', error);
        setMessages((prevMessages) => [...prevMessages, { text: `[ERROR] Key exchange failed: ${error.message}`, sender: 'system' }]);
      }
    } else if (data.type === 'USERNAME') {
      setFriendUsername(data.username);
      setMessages((prevMessages) => [...prevMessages, { text: `${data.username} joined the chat`, sender: 'system', timestamp: new Date() }]);
    } else if (data.type === 'MESSAGE') {
      try {
        const decryptedMessage = JSON.parse(decryptMessage(data.content));
        setMessages((prevMessages) => [...prevMessages, { ...decryptedMessage, sender: 'friend' }]);
      } catch (error) {
        console.error('Failed to parse incoming message:', error);
        setMessages((prevMessages) => [...prevMessages, { text: '[ERROR] Could not decrypt or parse message.', sender: 'system', timestamp: new Date() }]);
      }
    } else {
      const decryptedMessage = decryptMessage(data);
      setMessages((prevMessages) => [...prevMessages, { text: decryptedMessage, sender: 'friend', timestamp: new Date() }]);
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
      handleIncomingData(data);
      // Add gamification points for key exchange when connecting to friend
      if (data.type === 'PUBLIC_KEY') {
        gamification.addPoints(5, 'Secure key exchange completed');
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

  // Daily handlers
  const handleShowDailyDropdown = () => {
    setShowDailyDropdown(!showDailyDropdown);
  };

  const handleShowDailyComposer = () => {
    setShowDailyComposer(true);
    setShowDailyDropdown(false);
  };

  const handleShowDailyFeed = () => {
    setShowDailyFeed(true);
    setShowDailyDropdown(false);
  };

  const handleDailyShare = (newShare) => {
    const updatedShares = [...dailyShares, newShare];
    setDailyShares(updatedShares);
    localStorage.setItem('daily_shares', JSON.stringify(updatedShares));

    // Gamification: Award points for sharing daily content
    const typeData = DAILY_ACTIVITY_TYPES[newShare.type.toUpperCase()];
    if (typeData) {
      gamification.addPoints(typeData.points, `Daily ${typeData.title}`);

      // Track different content types shared for Culture Sharer achievement
      gamification.incrementStat(`daily_${newShare.type}_shared`);
    }

    gamification.updateChallengeProgress('DAILY_PING', 1);
  };

  const handleLikeDailyShare = (shareId) => {
    const updatedShares = dailyShares.map(share =>
      share.id === shareId
        ? { ...share, likes: share.liked ? share.likes - 1 : share.likes + 1, liked: !share.liked }
        : share
    );

    setDailyShares(updatedShares);
    localStorage.setItem('daily_shares', JSON.stringify(updatedShares));

    // Gamification: Award points for receiving likes
    const share = updatedShares.find(s => s.id === shareId);
    if (!share.liked && share.likes === 1) {
      gamification.addPoints(5, 'Daily share got its first like');
    }
  };

  const handleComposeFromFeed = () => {
    setShowDailyFeed(false);
    setShowDailyComposer(true);
  };

  const handleShowDailyChallenge = () => {
    setShowDailyChallenge(true);
    setShowDailyDropdown(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const handleChooseColor = (color) => {
    setCurrentColor(color);
    localStorage.setItem('theme_color', color);
    document.documentElement.style.setProperty('--primary-color', color);
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
          <h1>🌴 Eko</h1>
        </div>
        <div className="user-info">
          <div className="gamification-info">
            <button className="gamification-button points-button" onClick={handleShowDailyChallenge}>
              💰 {gamificationPoints}
            </button>
            <button className="gamification-button achievements-button" onClick={handleShowAchievements}>
              🏆 {unlockedAchievements.length}
            </button>
            <button className="gamification-button" onClick={() => setShowWorldNews(true)}>
              📰 News
            </button>
            <button className="gamification-button color-button" onClick={() => setShowColorPicker(true)}>
              🎨 Theme
            </button>
          </div>
          <span className="username-display">{username}</span>
          <span className={`connection-bubble ${connectionStatus}`}></span>
        </div>
      </div>

      <div className="connection-panel">
        <div className="peer-info">
          <p className="peer-id">{peerId}</p>
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

      {showWorldNews && (
        <div className="news-section">
          <h2>World News Blog</h2>
          <div className="news-grid">
            <div className="news-item">
              <WorldNewsBlog region="Americas" />
            </div>
            <div className="news-item">
              <WorldNewsBlog region="Europe" />
            </div>
            <div className="news-item">
              <WorldNewsBlog region="Asia" />
            </div>
            <div className="news-item">
              <WorldNewsBlog region="Africa & Oceania" />
            </div>
          </div>
          <button className="close-button" onClick={() => setShowWorldNews(false)}>
            Close News
          </button>
        </div>
      )}

      {showColorPicker && (
        <ColorPickerModal
          onSelectColor={handleChooseColor}
          onClose={() => setShowColorPicker(false)}
        />
      )}
    </div>
  );
};

export default App;
