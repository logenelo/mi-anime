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
import Loading from '../components/Loading';
import useElementOnScreen from '../hooks/useElementOnScreen';
import useDebounce from '../hooks/useDebounce';
import { start } from 'node:repl';
import { dateFormater } from '../services/helper';

const PAGE_SIZE = 60;

const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2017;
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
      let errorAnimes: any = {};
      if (resp.finish) {
        const sortedAnimes = newAnimes.sort((a: Anime, b: Anime) => {
          const aCode = a.year * 100 + a.season || 0;
          const bCode = b.year * 100 + b.season || 0;
          if (aCode === 0) {
            errorAnimes[a.id] = {
              id: a.id,
              title: a.title,
              startDate: dateFormater(new Date(a.startDate)),
            };
          }

          return bCode - aCode;
        });
        console.log(errorAnimes);
        return sortedAnimes;
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
          columnGap={2}
          rowGap={1}
          flexWrap="wrap"
          sx={{
            mb: 2,
            width: '100%',
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
          <FormControl
            size="small"
            fullWidth
            sx={{ minWidth: 240, maxWidth: 300 }}
          >
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

/* Error
{
    "842": {
        "id": "842",
        "title": "魔物獵人 物語  RIDE ON",
        "startDate": "2016-10-02"
    },
    "1414": {
        "id": "1414",
        "title": "ALL OUT!!",
        "startDate": "2016-10-06"
    },
    "1415": {
        "id": "1415",
        "title": "TRICKSTER – 江戶川亂步『少年偵探團』",
        "startDate": "2016-10-04"
    },
    "1416": {
        "id": "1416",
        "title": "救難小英雄 24",
        "startDate": "2016-10-01"
    },
    "1417": {
        "id": "1417",
        "title": "機動戰士GUNDAM 鐵血的孤兒 第二季",
        "startDate": "2016-10-02"
    },
    "1419": {
        "id": "1419",
        "title": "Classicaloid",
        "startDate": "2016-10-08"
    },
    "1420": {
        "id": "1420",
        "title": "三月的獅子",
        "startDate": "2016-10-08"
    }
}
*/
