import React from 'react';
import { Typography } from '@mui/material';
import AnimeList from '../components/AnimeList';
import Main from '../components/Main';

const Home: React.FC = () => {
  // 範例動畫資料
  const animeList = [
    {
      id: 1,
      title: '進擊的巨人',
      startDate: '2025-04-01',
      weekday: 0, // 週日
      platform: 'Crunchyroll',
      cover: 'https://via.placeholder.com/100x140?text=AoT',
    },
    {
      id: 2,
      title: '我的英雄學院',
      startDate: '2025-04-05',
      weekday: 0,
      platform: 'Funimation',
      cover: 'https://via.placeholder.com/100x140?text=MHA',
    },
    {
      id: 3,
      title: '咒術迴戰',
      startDate: '2025-04-04',
      weekday: 0,
      platform: 'Netflix',
      cover: 'https://via.placeholder.com/100x140?text=JJK',
    },
    {
      id: 4,
      title: '間諜家家酒',
      startDate: '2025-04-06',
      weekday: 0,
      platform: 'Crunchyroll',
      cover: 'https://via.placeholder.com/100x140?text=SPY',
    },
    {
      id: 5,
      title: '藍色監獄',
      startDate: '2025-04-02',
      weekday: 1,
      platform: 'Netflix',
      cover: 'https://via.placeholder.com/100x140?text=BP',
    },
    {
      id: 6,
      title: '葬送的芙莉蓮',
      startDate: '2025-04-03',
      weekday: 1,
      platform: 'Crunchyroll',
      cover: 'https://via.placeholder.com/100x140?text=SOF',
    },
  ];

  return (
    <>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        本季度新番列表
      </Typography>
      <AnimeList animeList={animeList} />
    </>
  );
};

export default Home;
