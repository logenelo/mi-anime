import React from 'react';
import { Box, Typography } from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getSeasonAnimes } from '../services/api';
import { Anime } from '../types/anime';
import Loading from '../components/Loading';
const Home: React.FC = () => {
  // 範例動畫資料
  const [animeList, setAnimeList] = React.useState<Anime[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    try {
      getSeasonAnimes()
        .then((resp) => {
          if (resp.statusCode === 200) {
            const date = new Date();
            const currentYear = date.getFullYear();
            const currentSeason = Math.floor(
              (date.getMonth() + 1) / 3,
            ) as number;
            const seasonCode = currentYear * 100 + currentSeason;

            const filteredList = resp.animes
              .map((item: Anime) => {
                const itemDate = new Date(Number(item.startDate));
                const year = itemDate.getFullYear();
                const season = Math.floor(
                  (itemDate.getMonth() + 1) / 3,
                ) as number;
                return year * 100 + season < seasonCode
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
    } catch (error) {
      console.error('Error fetching anime data:', error);
    }
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
