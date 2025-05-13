import React from 'react';
import AnimeList from '../components/AnimeList';
import Main from '../components/Main';

const Home: React.FC = () => {
  // 範例動畫資料
  const animeList = [
    {
      id: 1,
      title: '進擊的巨人',
      startDate: '2025-04-01',
      weekday: '日',
      platform: 'Crunchyroll',
      cover: 'https://via.placeholder.com/100x140?text=AoT',
    },
    {
      id: 2,
      title: '我的英雄學院',
      startDate: '2025-04-03',
      weekday: '五',
      platform: 'Funimation',
      cover: 'https://via.placeholder.com/100x140?text=MHA',
    },
  ];

  return (
    <Main>
      <h1>本季度新番列表</h1>
      <AnimeList animeList={animeList} />
    </Main>
  );
};

export default Home;
