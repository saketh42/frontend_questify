import React, { useState, useEffect } from 'react';
import './shop.css';

const Shop = () => {
  const [userXP, setUserXP] = useState(0);
  const [ownedItems, setOwnedItems] = useState([]);
  const [notification, setNotification] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const xp = parseInt(localStorage.getItem('userXP') || '0');
    const items = JSON.parse(localStorage.getItem('ownedItems') || '[]');
    setUserXP(xp);
    setOwnedItems(items);
  }, []);

  const shopItems = [
    { id: 'avatar_crown', name: '👑 Royal Crown', description: 'Show your dedication with this majestic crown avatar accessory', price: 100, category: 'Avatar', rarity: 'rare' },
    { id: 'theme_dark', name: '🌙 Dark Theme', description: 'Unlock the sleek dark mode for easier evening productivity', price: 150, category: 'Theme', rarity: 'common' },
    { id: 'power_double_xp', name: '⚡ Double XP Boost', description: '2x XP for your next 5 completed tasks or focus sessions', price: 200, category: 'Power-up', rarity: 'epic' },
    { id: 'badge_streak_master', name: '🔥 Streak Master Badge', description: 'Display your commitment with this exclusive streak badge', price: 75, category: 'Badge', rarity: 'common' },
    { id: 'sound_forest', name: '🌲 Forest Sounds Pack', description: 'Relaxing forest ambiance for your focus sessions', price: 125, category: 'Audio', rarity: 'rare' },
    { id: 'sound_rain', name: '🌧️ Rain Sounds Pack', description: 'Calming rain sounds to enhance concentration', price: 125, category: 'Audio', rarity: 'rare' },
    { id: 'avatar_wizard', name: '🧙‍♂️ Wizard Hat', description: 'Channel your inner wisdom with this mystical hat', price: 180, category: 'Avatar', rarity: 'epic' },
    { id: 'power_task_skip', name: '⏭️ Task Skip Token', description: 'Skip one difficult task while keeping your streak alive', price: 250, category: 'Power-up', rarity: 'legendary' },
    { id: 'theme_neon', name: '🌈 Neon Theme', description: 'Vibrant neon colors to energize your productivity', price: 200, category: 'Theme', rarity: 'epic' },
    { id: 'badge_focus_guru', name: '🧘‍♀️ Focus Guru Badge', description: 'Master of concentration - earned through dedication', price: 300, category: 'Badge', rarity: 'legendary' }
  ];

  const categories = ['All', 'Avatar', 'Theme', 'Power-up', 'Badge', 'Audio'];

  const filteredItems = selectedCategory === 'All'
    ? shopItems
    : shopItems.filter(item => item.category === selectedCategory);

  const purchaseItem = (item) => {
    if (ownedItems.includes(item.id)) {
      showNotification('⚠️ You already own this item!');
    } else if (userXP >= item.price) {
      const newXP = userXP - item.price;
      const newOwnedItems = [...ownedItems, item.id];

      setUserXP(newXP);
      setOwnedItems(newOwnedItems);
      localStorage.setItem('userXP', newXP.toString());
      localStorage.setItem('ownedItems', JSON.stringify(newOwnedItems));

      showNotification(`🎉 Successfully purchased ${item.name}!`);
    } else {
      showNotification('❌ Not enough XP to purchase this item!');
    }
  };

  const showNotification = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(''), 3000);
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return '#95a5a6';
      case 'rare': return '#3498db';
      case 'epic': return '#9b59b6';
      case 'legendary': return '#f39c12';
      default: return '#95a5a6';
    }
  };

  const getRarityLabel = (rarity) => rarity.charAt(0).toUpperCase() + rarity.slice(1);

  return (
    <div className="shop">
      <div className="shop-header">
        <h1>🛍️ XP Shop</h1>
        <div className="user-xp">
          <span className="xp-icon">⭐</span>
          <span className="xp-amount">{userXP} XP</span>
        </div>
      </div>

      {notification && (
        <div className="notification">{notification}</div>
      )}

      <div className="category-filter">
        {categories.map(category => (
          <button
            key={category}
            className={selectedCategory === category ? 'active' : ''}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="shop-grid">
        {filteredItems.map(item => (
          <div key={item.id} className="shop-item">
            <div className="item-header">
              <div className="item-name">{item.name}</div>
              <div className="item-rarity" style={{ color: getRarityColor(item.rarity) }}>
                {getRarityLabel(item.rarity)}
              </div>
            </div>
            <div className="item-description">{item.description}</div>
            <div className="item-category">📂 {item.category}</div>
            <div className="item-footer">
              <div className="item-price">
                <span className="price-icon">⭐</span>
                <span>{item.price} XP</span>
              </div>
              <button
                className="buy-button"
                onClick={() => purchaseItem(item)}
                disabled={ownedItems.includes(item.id)}
              >
                {ownedItems.includes(item.id) ? 'Owned' : 'Buy'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="earning-tips">
        <h3>💰 How to Earn XP</h3>
        <ul>
          <li>Complete focus sessions: +50 XP each</li>
          <li>Finish tasks: +25-100 XP based on difficulty</li>
          <li>Maintain streaks: Bonus XP multipliers</li>
          <li>Take short breaks: +10 XP each</li>
          <li>Complete daily challenges: +200 XP</li>
        </ul>
      </div>
    </div>
  );
};

export default Shop;
