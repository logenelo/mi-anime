import React from 'react';
import { Box, Typography } from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getAllAnime } from '../services/api';

const Home: React.FC = () => {
  // 範例動畫資料
  const animeList = getAllAnime();

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        本季度新番列表
      </Typography>
      <AnimeList animeList={animeList} />
    </Box>
  );
};

export default Home;
