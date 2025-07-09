import React from 'react';
import { Box, Typography } from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getSeasonAnimes } from '../services/api';
import { Anime } from '../types/anime';
import Loading from '../components/Loading';
import { getSeasonCode } from '../services/animeHelper';
const Home: React.FC = () => {
  // 範例動畫資料
  const [animeList, setAnimeList] = React.useState<Anime[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (loading) return;
    setLoading(true);
    getSeasonAnimes()
      .then((resp) => {
        if (resp.statusCode === 200) {
          const date = new Date();
          const [year, season] = getSeasonCode(date);

          const seasonCode = year * 100 + season;

          const filteredList = resp.animes
            .map((item: Anime) => {
              return item.year * 100 + item.season < seasonCode
                ? { ...item, isContin: true }
                : item;
            })
            .sort((a: Anime, b: Anime) => b.startDate - a.startDate);
          setAnimeList(filteredList);
        } else {
          console.error('Error fetching anime data:', resp.message);
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" color="textPrimary" sx={{ fontWeight: 'bold' }}>
        本季度新番列表
      </Typography>
      <AnimeList animeList={animeList} />
      {loading && (
        <Box p={2} display="flex" justifyContent="center">
          <Loading />
        </Box>
      )}
    </Box>
  );
};

export default Home;
