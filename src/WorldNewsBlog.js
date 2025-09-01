import React, { useState, useEffect } from 'react';

// Mock news data generator for world regions
const generateNewsHeadlines = (region) => {
  const newsTemplates = {
    'Americas': [
      "🌎 New climate initiative drives green technology boom in {country}",
      "💼 Economic summit reveals unexpected growth in {country}'s tech sector",
      "🎭 Cultural festival showcases indigenous art revival in {country}",
      "⚡ Renewable energy breakthrough announced in {country}",
      "🏀 Major sports league expansion brings opportunities to {country}"
    ],
    'Europe': [
      "🏛 New EU policy aims to improve digital rights for citizens",
      "🍽 Innovative fusion cuisine trend emerges from {country}",
      "🛩️ Aviation breakthrough reduces climate impact of flights",
      "🏰 Historic preservation project saves medieval landmark in {country}",
      "🎨 Contemporary art exhibit draws international attention in {country}"
    ],
    'Asia': [
      "🏢 Smart city developments transform urban living in {country}",
      "🌾 Agricultural technology revolution boosts food security",
      "🎵 New music genre blends traditional and modern sounds in {country}",
      "🚀 Space program advancements put {country} on lunar timetable",
      "💡 Educational reforms create innovative learning approaches"
    ],
    'Africa & Oceania': [
      "🦁 Wildlife conservation efforts yield remarkable results in {country}",
      "🎯 Sustainable tourism initiatives create economic opportunities",
      "🌊 Marine research reveals new ocean discoveries near {country}",
      "🎭 Traditional festivals blend ancient rituals with modern celebrations",
      "🏭 Green manufacturing initiatives spur industrial growth"
    ]
  };

  const countries = {
    'Americas': ['United States', 'Brazil', 'Canada', 'Mexico', 'Argentina', 'Colombia'],
    'Europe': ['Germany', 'France', 'United Kingdom', 'Italy', 'Spain', 'Netherlands'],
    'Asia': ['Japan', 'China', 'South Korea', 'India', 'Singapore', 'Thailand'],
    'Africa & Oceania': ['South Africa', 'Australia', 'Kenya', 'New Zealand', 'Egypt', 'Morocco']
  };

  const templates = newsTemplates[region] || newsTemplates['Americas'];
  const countryPool = countries[region] || countries['Americas'];

  return templates.map((template, index) => {
    const country = countryPool[Math.floor(Math.random() * countryPool.length)];
    const headline = template.replace('{country}', country);
    const id = Math.random().toString(36).substr(2, 9);
    return { id, headline, timestamp: new Date() };
  });
};

const WorldNewsBlog = ({ region }) => {
  const [headlines, setHeadlines] = useState([]);

  const updateHeadlines = () => {
    const newHeadlines = generateNewsHeadlines(region);
    setHeadlines(newHeadlines);
  };

  useEffect(() => {
    updateHeadlines(); // Initial load
    const interval = setInterval(updateHeadlines, 60000); // Update every minute (60 seconds)
    return () => clearInterval(interval);
  }, [region]);

  return (
    <div className="news-container">
      <div className="news-header">
        <h4>{region} News</h4>
        <span className="update-time">
          Updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
      <div className="headlines-list">
        {headlines.map((news, index) => (
          <div key={news.id} className="headline-item">
            <p className="headline-text">{news.headline}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default WorldNewsBlog;
