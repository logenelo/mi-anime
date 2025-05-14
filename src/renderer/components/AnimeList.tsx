import React from 'react';
import { Box, Typography, Grid, Divider } from '@mui/material';
import AnimeCard from './AnimeCard';
import type { Anime } from '../types/anime';

type Props = {
  animeList: Anime[];
};

// 用數字表示星期，0-6 代表週日到週六
const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'] as const;

const groupByWeekday = (animes: Anime[]) => {
  const groups: Record<string, Anime[]> = {};
  // 初始化所有星期的空陣列
  WEEKDAY_NAMES.forEach((_, index) => {
    groups[index] = [];
  });
  // 將動畫按照星期分組
  animes.forEach((anime) => {
    const weekday = anime.weekday;
    if (groups[weekday]) {
      groups[weekday].push(anime);
    }
  });
  return groups;
};

const AnimeList: React.FC<Props> = ({ animeList }) => {
  const groupedAnime = groupByWeekday(animeList);

  return (
    <Box sx={{ py: 2 }}>
      {WEEKDAY_NAMES.map((weekdayName, index) => {
        const animes = groupedAnime[index];
        if (!animes?.length) return null;

        return (
          <Box key={index} sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: 'primary.main',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              星期{weekdayName}
            </Typography>
            <Grid container spacing={1}>
              {animes.map((anime) => (
                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={anime.id}>
                  <AnimeCard anime={anime} />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default AnimeList;
