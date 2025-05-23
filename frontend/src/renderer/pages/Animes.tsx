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
  Card,
  CardMedia,
} from '@mui/material';
import AnimeCard from '../components/AnimeCard';
import { Anime, Season, SEASONS } from '../types/anime';
import { getAllAnimes, getAnimesByYearAndSeason } from '../services/api';
import FavoriteButton from '../components/FavoriteButton';

// Add constants for years and seasons
const CURRENT_YEAR = new Date().getFullYear();
const START_YEAR = 2020;
const YEARS = Array.from(
  { length: CURRENT_YEAR + 1 - START_YEAR },
  (_, i) => START_YEAR + i,
).reverse();

const getCurrentSeason = () => {
  const month = new Date().getMonth() + 1;
  return Math.ceil(month / 3) * 3 - 2;
};

const Animes: React.FC = () => {
  const [loading, setLoading] = React.useState(true);
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [year, setYear] = React.useState<number>(0);
  const [season, setSeason] = React.useState<Season | 0>(0);

  const addAnimes = (year: number, season: Season) => {
    console.log('Getting new animes...');
    getAnimesByYearAndSeason(year, season).then((resp) => {
      console.log(resp);
      if (resp.statusCode === 200) {
        const sortedAnimes = [...animes, ...resp.animes].sort(
          (a: Anime, b: Anime) => b.startDate - a.startDate,
        );
        setAnimes(sortedAnimes);
        setLoading(false);
        return resp.animes;
      }
    });
  };

  const displayAnimes = useMemo(() => {
    if (loading && animes.length === 0) return [];
    if (!year && !season) return animes;

    setLoading(true);
    console.log(animes);
    const filteredAnimes = animes.filter((anime) => {
      return (
        (!year || anime.year === year) && (!season || anime.season === season)
      );
    });
    if (filteredAnimes.length > 0) {
      setLoading(false);
      return filteredAnimes;
    }

    if (year && season) {
      const newAnimes = addAnimes(year, season);
      return filteredAnimes;
    }

    setLoading(false);
    return [];
  }, [year, season, animes]);

  React.useEffect(() => {
    getAllAnimes()
      .then((resp) => {
        if (resp.statusCode === 200) {
          const sortedAnimes = resp.animes.sort(
            (a: Anime, b: Anime) => b.startDate - a.startDate,
          );
          setAnimes(sortedAnimes);
        }
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

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
        </Stack>
        {loading ? (
          <Box sx={{ p: 2 }}>
            <Typography>載入中...</Typography>
          </Box>
        ) : displayAnimes.length == 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography>找不到符合條件的動畫</Typography>
          </Box>
        ) : (
          /* Add AnimeList with filtered data */
          <Grid container spacing={2} columns={{ xs: 2, sm: 6, md: 10 }}>
            {displayAnimes.map((anime) => (
              <Grid size={2} id={anime.id} key={anime.id}>
                <Card
                  elevation={2}
                  sx={{
                    position: 'relative',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: (theme) => theme.shadows[8],
                    },
                  }}
                >
                  <CardMedia
                    component="img"
                    width={1}
                    height={250}
                    image={anime.cover}
                    alt={anime.title}
                    sx={{ objectFit: 'cover' }}
                  />
                  <Box
                    width={1}
                    boxSizing={'border-box'}
                    position={'absolute'}
                    bottom={0}
                    left={0}
                    p={1}
                    bgcolor="rgba(0, 0, 0, 0.5)"
                  >
                    <Typography
                      variant="h6"
                      color="white"
                      sx={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                      }}
                    >
                      {anime.title} <FavoriteButton animeId={anime.id} />
                    </Typography>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Stack>
    </Box>
  );
};

export default Animes;
