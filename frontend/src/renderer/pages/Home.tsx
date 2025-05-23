import React from 'react';
import { Box, Typography } from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getSeasonAnimes } from '../services/api';
import { Anime } from '../types/anime';

const Home: React.FC = () => {
  // 範例動畫資料
  const [animeList, setAnimeList] = React.useState<Anime[]>([]);

  React.useEffect(() => {
    try {
      getSeasonAnimes().then((resp) => {
        if (resp.statusCode === 200) {
          setAnimeList(resp.animes);
        } else {
          console.error('Error fetching anime data:', resp.message);
        }
      });
    } catch (error) {
      console.error('Error fetching anime data:', error);
    }
  }, []);

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
