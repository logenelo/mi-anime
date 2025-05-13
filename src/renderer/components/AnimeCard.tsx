import React from 'react';
import { Anime } from '../types/anime';

type AnimeCardProps = {
  anime: Anime;
};

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'flex-start',
      border: '1px solid #e0e0e0',
      borderRadius: 14,
      background: '#fff',
      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
      maxWidth: 480,
      transition: 'box-shadow 0.2s',
      overflow: 'hidden',
    }}
  >
    <img
      src={anime.cover}
      alt={anime.title}
      width={120}
      height={'100%'}
      style={{
        minHeight: '100%',
        marginRight: 0,
        objectFit: 'cover',
        boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
        background: '#f0f0f0',
      }}
    />
    <div style={{ flex: 1, padding: 16 }}>
      <h2 style={{ margin: '0 0 10px 0', fontSize: 22, color: '#222' }}>
        {anime.title}
      </h2>
      <div style={{ marginBottom: 6, color: '#666', fontSize: 15 }}>
        <span style={{ fontWeight: 500 }}>開播日期：</span>
        {anime.startDate}
      </div>
      <div style={{ marginBottom: 6, color: '#666', fontSize: 15 }}>
        <span style={{ fontWeight: 500 }}>每週播出：</span>
        <span
          style={{
            background: '#e3f2fd',
            borderRadius: 4,
            padding: '2px 8px',
            marginLeft: 4,
          }}
        >
          {anime.weekday}
        </span>
      </div>
      <div style={{ color: '#666', fontSize: 15 }}>
        <span style={{ fontWeight: 500 }}>觀看平台：</span>
        <span
          style={{
            background: '#fffde7',
            borderRadius: 4,
            padding: '2px 8px',
            marginLeft: 4,
          }}
        >
          {anime.platform}
        </span>
      </div>
    </div>
  </div>
);

export default AnimeCard;
