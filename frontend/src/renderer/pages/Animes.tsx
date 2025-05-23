import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
} from '@mui/material';
import AnimeCard from '../components/AnimeCard';
import { Anime } from '../types/anime';
import { getAllAnimes } from '../services/api';

// Add constants for years and seasons
const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2014; // Assuming the anime data starts from 2014
const YEARS = Array.from(
  { length: CURRENT_YEAR + 1 - START_YEAR },
  (_, i) => START_YEAR + i,
).reverse();

const SEASONS = [
  { value: 1, label: '冬季' }, // 1-3月
  { value: 4, label: '春季' }, // 4-6月
  { value: 7, label: '夏季' }, // 7-9月
  { value: 10, label: '秋季' }, // 10-12月
];

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  return Math.ceil(month / 3) * 3 - 2;
};

const Animes: React.FC = () => {
  const [loading, setLoading] = React.useState(false);
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [year, setYear] = React.useState<number>(0);
  const [season, setSeason] = React.useState<number>(0);

  const displayAnimes = useMemo(() => {
    if (!year && !season) return animes;

    return animes;
  }, [year, season, animes]);

  React.useEffect(() => {
    getAllAnimes()
      .then((data) => {
        setAnimes(data);
      })
      .catch((error) => {
        // Handle error appropriately, e.g., show a message or set an error state
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography>載入中...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          所有動畫
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          sx={{
            mb: 2,
            width: '100%',
            maxWidth: 400,
          }}
        >
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>年份</InputLabel>
            <Select
              value={year}
              label="年份"
              onChange={(e) => setYear(e.target.value as number)}
            >
              <MenuItem value={0}>-----</MenuItem>
              {YEARS.map((y) => (
                <MenuItem key={y} value={y}>
                  {y}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>季節</InputLabel>
            <Select
              value={season}
              label="季節"
              onChange={(e) => setSeason(e.target.value as number)}
            >
              <MenuItem value={0}>-----</MenuItem>
              {SEASONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {/* Add AnimeList with filtered data */}
        <Grid container spacing={2} columns={{ xs: 4, sm: 8, md: 12 }}>
          {displayAnimes.map((anime) => (
            <Grid size={4} key={anime.id}>
              <AnimeCard anime={anime} variant="grid" />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Box>
  );
};

export default Animes;
