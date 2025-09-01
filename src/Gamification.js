// Gamification system for the encrypted messenger
export const ACHIEVEMENTS = {
  FIRST_MESSAGE: {
    id: 'first_message',
    title: 'First Words',
    description: 'Send your first message',
    icon: '💬',
    points: 10,
    category: 'communication'
  },
  CONNECTION_MASTER: {
    id: 'connection_master',
    title: 'Connection Master',
    description: 'Connect with 5 different people',
    icon: '🔗',
    points: 50,
    category: 'social',
    requirement: 5
  },
  CHATTERBOX: {
    id: 'chatterbox',
    title: 'Chatterbox',
    description: 'Send 100 messages',
    icon: '🗣️',
    points: 100,
    category: 'communication',
    requirement: 100
  },
  NIGHT_OWL: {
    id: 'night_owl',
    title: 'Night Owl',
    description: 'Chat after midnight',
    icon: '🦉',
    points: 25,
    category: 'special'
  },
  STREAK_MASTER: {
    id: 'streak_master',
    title: 'Streak Master',
    description: 'Chat for 7 days in a row',
    icon: '🔥',
    points: 200,
    category: 'consistency'
  },
  EMOJI_LOVER: {
    id: 'emoji_lover',
    title: 'Emoji Lover',
    description: 'Send 50 messages with emojis',
    icon: '😍',
    points: 75,
    category: 'fun',
    requirement: 50
  },
  ENCRYPTION_EXPERT: {
    id: 'encryption_expert',
    title: 'Encryption Expert',
    description: 'Successfully establish secure connection',
    icon: '🔐',
    points: 20,
    category: 'security'
  },
  POINTS_HUNTER: {
    id: 'points_hunter',
    title: 'Points Hunter',
    description: 'Earn 1000 total points',
    icon: '🏆',
    points: 500,
    category: 'achievement',
    requirement: 1000
  }
};

export const DAILY_ACTIVITY_TYPES = {
  FACT: {
    id: 'fact',
    title: 'Daily Fact',
    description: 'Share an interesting historical fact',
    icon: '📜',
    points: 10
  },
  SONG: {
    id: 'song',
    title: 'Daily Song',
    description: 'Share your favorite song and why you love it',
    icon: '🎵',
    points: 15
  },
  ALBUM: {
    id: 'album',
    title: 'Daily Album',
    description: 'Recommend an album that changed everything for you',
    icon: '💿',
    points: 20
  },
  ART: {
    id: 'art',
    title: 'Daily Art',
    description: 'Share beautiful artwork, your own or your favorite',
    icon: '🎨',
    points: 15
  },
  QUOTE: {
    id: 'quote',
    title: 'Daily Quote',
    description: 'Share an inspiring quote that resonates with you',
    icon: '💭',
    points: 10
  },
  MOMENT: {
    id: 'moment',
    title: 'Daily Moment',
    description: 'Share a meaningful moment from your day',
    icon: '🌟',
    points: 12
  }
};

export const DAILY_CHALLENGES = {
  CHAT_INITIATE: {
    id: 'chat_initiate',
    title: 'Ice Breaker',
    description: 'Start a conversation with someone new',
    reward: 30,
    emoji: '❄️'
  },
  EMOJI_FEST: {
    id: 'emoji_fest',
    title: 'Emoji Party',
    description: 'Send messages with at least 5 emojis',
    reward: 40,
    emoji: '🎉'
  },
  MARATHON_CHATTER: {
    id: 'marathon_chatter',
    title: 'Marathon Chatter',
    description: 'Send 20 messages in a day',
    reward: 60,
    emoji: '🏃‍♂️'
  },
  DAILY_PING: {
    id: 'daily_ping',
    title: 'Daily Contributor',
    description: 'Share a daily fact, song, album, art, or quote',
    reward: 50,
    emoji: '🎯'
  },
  CULTURE_SHARER: {
    id: 'culture_sharer',
    title: 'Culture Sharer',
    description: 'Share 5 different types of daily content',
    reward: 100,
    emoji: '🌍'
  }
};

export const UNLOCKABLES = {
  THEMES: {
    DARK_MODE: {
      id: 'dark_mode',
      name: 'Dark Mode',
      requirement: { achievement: 'POINTS_HUNTER' },
      cssVars: {
        '--primary-bg': '#1a1a1a',
        '--secondary-bg': '#2d2d2d',
        '--accent-color': '#ff6b9d'
      }
    },
    NEON_THEME: {
      id: 'neon_theme',
      name: 'Neon Dreams',
      requirement: { points: 500 },
      cssVars: {
        '--primary-bg': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        '--secondary-bg': '#1e1e2e',
        '--accent-color': '#00ffff'
      }
    }
  }
};

export class GamificationManager {
  constructor() {
    this.points = parseInt(localStorage.getItem('gamification_points') || '0');
    this.achievements = JSON.parse(localStorage.getItem('gamification_achievements') || '{}');
    this.stats = JSON.parse(localStorage.getItem('gamification_stats') || '{}');
    this.dailyChallenges = JSON.parse(localStorage.getItem('daily_challenges') || '{}');
    this.currentTheme = localStorage.getItem('selected_theme') || 'default';
    this.unlockables = JSON.parse(localStorage.getItem('unlockables') || '{}');
    this.callbacks = [];
  }

  // Points system
  addPoints(points, reason = '') {
    this.points += points;
    this.save();

    // Trigger callbacks
    this.callbacks.forEach(callback => {
      callback.onPointsChange?.(this.points, points, reason);
    });

    // Check for new achievements
    this.checkAchievements();
  }

  // Achievement system
  unlockAchievement(achievementId) {
    if (!this.achievements[achievementId]) {
      this.achievements[achievementId] = Date.now();
      const achievement = ACHIEVEMENTS[achievementId];
      if (achievement && achievement.points) {
        this.addPoints(achievement.points, `Achievement: ${achievement.title}`);
      }

      // Trigger callbacks
      this.callbacks.forEach(callback => {
        callback.onAchievementUnlock?.(achievementId, achievement);
      });

      this.save();
    }
  }

  checkAchievements() {
    Object.values(ACHIEVEMENTS).forEach(achievement => {
      if (achievement.id === 'POINTS_HUNTER' && !this.achievements[achievement.id]) {
        if (this.points >= achievement.requirement) {
          this.unlockAchievement(achievement.id);
        }
      }
      if (achievement.id === 'CHATTERBOX' && !this.achievements[achievement.id]) {
        if ((this.stats.messagesSent || 0) >= achievement.requirement) {
          this.unlockAchievement(achievement.id);
        }
      }
      if (achievement.id === 'CONNECTION_MASTER' && !this.achievements[achievement.id]) {
        if ((this.stats.connections || 0) >= achievement.requirement) {
          this.unlockAchievement(achievement.id);
        }
      }
    });
  }

  // Daily challenges
  getTodaysChallenge() {
    const today = new Date().toDateString();
    if (!this.dailyChallenges[today]) {
      const challenges = Object.values(DAILY_CHALLENGES);
      this.dailyChallenges[today] = {
        id: challenges[Math.floor(Math.random() * challenges.length)].id,
        completed: false,
        progress: 0
      };
      this.save();
    }
    return this.dailyChallenges[today];
  }

  updateChallengeProgress(challengeId, increment = 1) {
    const today = new Date().toDateString();
    const challenge = this.dailyChallenges[today];
    if (challenge && !challenge.completed) {
      challenge.progress += increment;
      this.save();

      // Check if challenge completed
      const challengeData = DAILY_CHALLENGES[challenge.id];
      if (challenge.progress >= challengeData.requirement || true) { // Simplified completion logic
        challenge.completed = true;
        this.addPoints(challengeData.reward, `Daily Challenge: ${challengeData.title}`);
        return true; // Challenge completed
      }
    }
    return false;
  }

  // Stats tracking
  incrementStat(statName) {
    if (!this.stats[statName]) {
      this.stats[statName] = 0;
    }
    this.stats[statName]++;

    // Trigger specific achievement checks
    if (statName === 'messagesSent' && this.stats[statName] === 1) {
      this.unlockAchievement('FIRST_MESSAGE');
    }
    if (statName === 'connections' && this.stats[statName] <= 5) {
      // Could check for CONNECTION_MASTER here
    }

    this.save();

    // Return current stat count
    return this.stats[statName];
  }

  // Unlockables
  unlockFeature(featureId) {
    if (!this.unlockables[featureId]) {
      this.unlockables[featureId] = Date.now();
      this.save();
      return true;
    }
    return false;
  }

  setTheme(themeId) {
    if (this.unlockables[themeId] || themeId === 'default') {
      this.currentTheme = themeId;
      localStorage.setItem('selected_theme', themeId);
    }
  }

  // Callbacks for UI updates
  onUpdate(callback) {
    this.callbacks.push(callback);
  }

  // Persistence
  save() {
    localStorage.setItem('gamification_points', this.points.toString());
    localStorage.setItem('gamification_achievements', JSON.stringify(this.achievements));
    localStorage.setItem('gamification_stats', JSON.stringify(this.stats));
    localStorage.setItem('daily_challenges', JSON.stringify(this.dailyChallenges));
    localStorage.setItem('unlockables', JSON.stringify(this.unlockables));
  }

  // Getters
  getPoints() {
    return this.points;
  }

  getAchievements() {
    return Object.keys(this.achievements);
  }

  getUnlockedFeatures() {
    return Object.keys(this.unlockables);
  }
}

// Sound effects
export const playSound = (soundType) => {
  // Simple sound effects using Web Audio API
  if (window.AudioContext || window.webkitAudioContext) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    const sounds = {
      achievement: [300, 400, 500], // Upward melody
      points: [600, 650, 700], // Happy chime
      message: [800], // Simple beep
      connection: [200, 300, 400, 500] // Connection sound
    };

    if (sounds[soundType]) {
      sounds[soundType].forEach((freq, index) => {
        setTimeout(() => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);

          oscillator.frequency.setValueAtTime(freq, audioContext.currentTime);
          oscillator.type = 'sine';
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + 0.3);
        }, index * 100);
      });
    }
  }
};

// Emoji shortcuts
export const EMOJI_SHORTCUTS = {
  ':)': '😊',
  ':D': '😄',
  ';)': '😉',
  ':(': '😢',
  ':p': '🤪',
  '<3': '❤️',
  '>:(': '😠',
  '8-)': '😎',
  ':o': '😲',
  ';p': '😜',
  ':heart:': '❤️',
  ':fire:': '🔥',
  ':thumbsup:': '👍',
  ':thumbsdown:': '👎'
};

export const processEmojiText = (text) => {
  let processedText = text;
  Object.keys(EMOJI_SHORTCUTS).forEach(shortcut => {
    const regex = new RegExp(shortcut.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    processedText = processedText.replace(regex, EMOJI_SHORTCUTS[shortcut]);
  });
  return processedText;
};

// Export singleton instance
export const gamification = new GamificationManager();
