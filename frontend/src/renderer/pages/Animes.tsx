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
import {
  addAnimes,
  getAllAnimes,
  getAnimesByYearAndSeason,
} from '../services/api';
import { Search } from '@mui/icons-material';
import Loading from '../components/Loading';
import useElementOnScreen from '../hooks/useElementOnScreen';
import useDebounce from '../hooks/useDebounce';
import { animesCrawler, getSeasonCode } from '../services/animeHelper';
import { DateTime } from 'luxon';

const PAGE_SIZE = 50;

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
  const debouncedSearchText = useDebounce(searchText, 300);

  const [loadingRef, isVisible] = useElementOnScreen({
    threshold: 0.1,
  });
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  const addNewAnimes = useCallback(
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

  // Filter
  const displayAnimes = useMemo(() => {
    //reset page
    setPage(1);
    setShowAll(false);

    if (!year && !season && !debouncedSearchText) return animes;
    setLoading(true);

    const filteredAnimes = animes.filter((anime) => {
      return (
        (!year || anime.year === year) &&
        (!season || anime.season === season) &&
        (!debouncedSearchText ||
          anime?.title
            .toLowerCase()
            .includes(debouncedSearchText.toLowerCase()))
      );
    });

    if (filteredAnimes.length === 0 && year && season) {
      addNewAnimes(year, season);
    }
    setLoading(false);
    return filteredAnimes;
  }, [year, season, debouncedSearchText, animes]);

  // Fetch animes
  useEffect(() => {
    const fetchAnimes = async () => {
      try {
        const resp = await getAllAnimes();
        if (resp.statusCode === 200) {
          const sortedAnimes = resp.animes.sort(
            (a: Anime, b: Anime) => b.startDate - a.startDate,
          );
          setAnimes(sortedAnimes);
          setLoading(false);

          const lastUpdateTime = resp.lastUpdateTime;
          const now = DateTime.now();
          if (now.toMillis() - lastUpdateTime > 24 * 60 * 60 * 1000) {
            const nowSeason = getSeasonCode(now.toJSDate());
            const nextMonth = now.plus({ month: 1 });
            const nextSeason = getSeasonCode(nextMonth.toJSDate());
            const animes = await animesCrawler(nowSeason[0], nowSeason[1]);
            if (animes && animes.length > 0) {
              addAnimes(animes);
            }

            if (
              nowSeason[0] !== nextSeason[0] ||
              nowSeason[1] !== nextSeason[1]
            ) {
              const nextAnimes = await animesCrawler(
                nextSeason[0],
                nextSeason[1],
              ); //Next Season
              if (nextAnimes && nextAnimes.length > 0) {
                addAnimes(nextAnimes);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching animes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, []);

  // Debounce searchText
  useEffect(() => {
    if (animes.length === 0) return;
    setLoading(true);
  }, [searchText]);
  useEffect(() => {
    if (animes.length === 0) return;
    setLoading(false);
  }, [debouncedSearchText]);

  // Pagination
  const nextPage = () => {
    setPage((prev) => {
      return prev + 1;
    });
  };
  useEffect(() => {
    if (page * PAGE_SIZE >= displayAnimes.length) {
      setShowAll(true);
    }
  }, [page]);
  useEffect(() => {
    if (isVisible) {
      nextPage();
    }
  }, [isVisible]);

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
        {!loading && (
          <Grid container spacing={2} columns={{ xs: 2, sm: 6, md: 10 }}>
            {displayAnimes.slice(0, page * PAGE_SIZE).map((anime) => (
              <Grid size={2} key={anime.id}>
                <AnimeCard anime={anime} variant="grid" />
              </Grid>
            ))}
            <Grid size={{ xs: 2, sm: 6, md: 10 }}></Grid>
          </Grid>
        )}
        <Box ref={loadingRef} p={2} display="flex" justifyContent="center">
          {loading ? (
            <Loading />
          ) : displayAnimes.length === 0 ? (
            <Typography color="textPrimary">找不到符合條件的動畫</Typography>
          ) : showAll ? (
            '沒有更多了'
          ) : (
            <Loading />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Animes;
