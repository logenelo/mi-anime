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

const PAGE_SIZE = 60;

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
  const [cursor, setCursor] = useState<string>('');
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0);

  const [searchText, setSearchText] = useState<string>('');
  const debouncedSearchText = useDebounce(searchText, 500);

  const [loadingRef, isVisible] = useElementOnScreen({
    threshold: 0.1,
  });
  const [showAll, setShowAll] = useState(false);
  const [page, setPage] = useState(1);

  const addNewAnimes = useCallback(async (year: number, season: Season) => {
    try {
      const resp = await getAnimesByYearAndSeason(year, season);
      if (resp.statusCode === 200) {
        setAnimes((animes) =>
          animes.concat(resp.animes).sort((a: Anime, b: Anime) => {
            if (b.year !== a.year) {
              return b.year - a.year; // Descending order for year
            }
            return b.season - a.season; // Descending order for season
          }),
        );
      }
    } catch (error) {
      console.error('Error fetching animes:', error);
    }
  }, []);

  // Filter
  const displayAnimes = useMemo(() => {
    if (!showAll) return [];
    setPage(1);
    if (!year && !season && !debouncedSearchText) {
      setLoading(false);
      return animes;
    }
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
      addNewAnimes(year, season).then(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
    return filteredAnimes;
  }, [year, season, debouncedSearchText, showAll, animes]);

  const fetchAnimes = async (cursor: string) => {
    const params = {
      cursor,
      limit: 900,
    };

    const resp = await getAllAnimes(params);
    if (resp.statusCode !== 200) {
      return console.error('Error fetching animes:', resp);
    }
    setAnimes((prev) => {
      const newAnimes = prev.concat(resp.animes);
      if (resp.finish) {
        return newAnimes.sort((a: Anime, b: Anime) => {
          if (b.year !== a.year) {
            return b.year - a.year; // Descending order for year
          }
          return b.season - a.season; // Descending order for season
        });
      } else {
        return newAnimes;
      }
    });
    setLastUpdateTime(resp.lastUpdateTime);

    setCursor(resp.cursor);
    if (resp.finish) {
      setShowAll(true);
    }
    setLoading(false);

    return resp;
  };

  //Fetch
  useEffect(() => {
    const getAnimes = async (cursor: string) => {
      let temp = cursor;
      while (1) {
        const resp = await fetchAnimes(temp);
        if (resp.finish) {
          setLoading(false);
          // if (!lastUpdateTime) {
          //   const lastUpdateTime = resp.lastUpdateTime;
          //   const now = DateTime.now();
          //   if (now.toMillis() - lastUpdateTime > 24 * 60 * 60 * 1000) {
          //     const nowSeason = getSeasonCode(now.toJSDate());
          //     const nextMonth = now.plus({ month: 1 });
          //     const nextSeason = getSeasonCode(nextMonth.toJSDate());
          //     animesCrawler(nowSeason[0], nowSeason[1]).then((animes) => {
          //       if (animes && animes.length > 0) {
          //         addAnimes(animes);
          //       }
          //     });

          //     if (
          //       nowSeason[0] !== nextSeason[0] ||
          //       nowSeason[1] !== nextSeason[1]
          //     ) {
          //       animesCrawler(nextSeason[0], nextSeason[1]).then(
          //         (nextAnimes) => {
          //           if (nextAnimes && nextAnimes.length > 0) {
          //             addAnimes(nextAnimes);
          //           }
          //         },
          //       ); //Next Season
          //     }
          //   }
          // }
          return;
        } else {
          temp = resp.cursor;
        }
      }
    };

    if (!showAll) {
      getAnimes(cursor);
    }
  }, []);

  // Debounce searchText
  useEffect(() => {
    if (animes.length === 0) return;
    setLoading(true);
  }, [searchText]);

  // Pagination
  const nextPage = () => {
    setPage((prev) => {
      return prev + 1;
    });
  };

  useEffect(() => {
    if (isVisible) {
      nextPage();
    }
  }, [isVisible]);
  useEffect(() => {
    console.log(animes);
  }, [animes]);

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
          ) : showAll && displayAnimes.length === 0 ? (
            <Typography color="textPrimary">找不到符合條件的動畫</Typography>
          ) : showAll && page * PAGE_SIZE >= displayAnimes.length ? (
            <Typography color="textPrimary">沒有更多了</Typography>
          ) : (
            <Loading />
          )}
        </Box>
      </Stack>
    </Box>
  );
};

export default Animes;
