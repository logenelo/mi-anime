import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  OutlinedInput,
  InputAdornment,
} from '@mui/material';
import AnimeCard from '../components/AnimeCard';
import { Anime, Season, SEASONS } from '../types/anime';
import { getAllAnimes, getAnimesByYearAndSeason } from '../services/api';
import { Search } from '@mui/icons-material';

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2020;
const YEARS = Array.from(
  { length: CURRENT_YEAR + 1 - START_YEAR },
  (_, i) => START_YEAR + i,
).reverse();

const Animes: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [animes, setAnimes] = useState<Anime[]>([]);
  const [year, setYear] = useState<number>(0);
  const [season, setSeason] = useState<Season | 0>(0);
  const [searchText, setSearchText] = useState<string>('');
  const [debouncedSearchText, setDebouncedSearchText] = useState<string>('');

  // Debounce searchText
  useEffect(() => {
    if (animes.length === 0) return;
    setLoading(true);
    const handler = setTimeout(() => {
      setDebouncedSearchText(searchText);
      setLoading(false);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchText]);

  const addAnimes = useCallback(
    async (year: number, season: Season) => {
      try {
        setLoading(true);
        const resp = await getAnimesByYearAndSeason(year, season);
        if (resp.statusCode === 200) {
          const sortedAnimes = animes
            .concat(resp.animes)
            .sort((a: Anime, b: Anime) => b.startDate - a.startDate);
          setAnimes(sortedAnimes);
        }
      } catch (error) {
        console.error('Error fetching animes:', error);
      } finally {
        setLoading(false);
      }
    },
    [animes],
  );

  const displayAnimes = useMemo(() => {
    if (!year && !season && !debouncedSearchText) return animes;
    setLoading(true);
    const filteredAnimes = animes.filter((anime) => {
      return (
        (!year || anime.year === year) &&
        (!season || anime.season === season) &&
        (!debouncedSearchText ||
          anime.title.toLowerCase().includes(debouncedSearchText.toLowerCase()))
      );
    });

    if (filteredAnimes.length === 0 && year && season) {
      addAnimes(year, season);
    }
    setLoading(false);
    return filteredAnimes;
  }, [year, season, debouncedSearchText, addAnimes]);

  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const resp = await getAllAnimes();
        if (resp.statusCode === 200) {
          const sortedAnimes = resp.animes.sort(
            (a: Anime, b: Anime) => b.startDate - a.startDate,
          );
          setAnimes(sortedAnimes);
        }
      } catch (error) {
        console.error('Error fetching animes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography
          variant="h4"
          color="textPrimary"
          sx={{ fontWeight: 'bold' }}
        >
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
              onChange={(e) => setSeason(e.target.value as Season)}
            >
              <MenuItem value={0}>-----</MenuItem>
              {SEASONS.map(({ value, label }) => (
                <MenuItem key={value} value={value}>
                  {label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 300 }}>
            <OutlinedInput
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              startAdornment={
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              }
            />
          </FormControl>
        </Stack>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Typography color="textPrimary">載入中...</Typography>
          </Box>
        ) : displayAnimes.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography color="textPrimary">找不到符合條件的動畫</Typography>
          </Box>
        ) : (
          <Grid container spacing={2} columns={{ xs: 2, sm: 6, md: 10 }}>
            {displayAnimes.map((anime) => (
              <Grid size={2} key={anime.id}>
                <AnimeCard anime={anime} variant="grid" />
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default Animes;
