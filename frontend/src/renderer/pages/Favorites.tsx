import React, { useMemo } from 'react';
import {
  Typography,
  Box,
  Alert,
  Grid,
  Card,
  CardMedia,
  CircularProgress,
  Select,
  FormControl,
  InputLabel,
  MenuItem,
  Checkbox,
  ListItemText,
  OutlinedInput,
  Chip,
} from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getAnimeByIds } from '../services/api';
import AnimeCard from '../components/AnimeCard';
import { Anime } from '../types/anime';
import { get } from 'node:http';
import { getEpisodeCount } from '../services/animeHelper';
import useFavoriteList from '../hooks/useFavouriteList';

const Favorites: React.FC = () => {
  const { isReady, getEpisodeWatched } = useFavoriteList();

  // Get favorite anime IDs from localStorage
  const favoriteIds: string[] = useMemo(() => {
    try {
      const stored = localStorage.getItem('favoriteList');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }, []);

  const [loading, setLoading] = React.useState(true);
  const [favoriteAnime, setFavoriteAnime] = React.useState<Anime[]>([]);

  const [seasons, setSeasons] = React.useState<string[]>([]);
  const selectOptions = React.useMemo(() => {
    const options = new Set<string>();
    favoriteAnime.forEach((anime) => {
      const newOption =
        anime.year + '' + anime.season.toString().padStart(2, '0');
      options.add(newOption);
    });
    return Array.from(options);
  }, [favoriteAnime]);

  const filteredAnime = React.useMemo(() => {
    if (seasons.length > 0) {
      return favoriteAnime.filter((anime) => {
        return seasons.includes(
          anime.year + '' + anime.season.toString().padStart(2, '0'),
        );
      });
    }
    return favoriteAnime;
  }, [favoriteAnime, seasons]);

  React.useEffect(() => {
    if (favoriteIds.length === 0) return;
    if (!isReady) return;

    const startSort = async () => {
      const result = await getAnimeByIds(favoriteIds).then(async (resp) => {
        if (resp.statusCode === 200) {
          const animes = resp.animes
            .map((anime: Anime) => {
              const totalEpisodes = Math.min(
                getEpisodeCount(anime),
                anime.episode,
              );

              let watched = getEpisodeWatched(anime.id);
              return {
                ...anime,
                hasNew: watched < totalEpisodes,
              };
            })
            .sort((a: Anime, b: Anime) => {
              if (b.hasNew && !a.hasNew) return 1;
              if (a.hasNew && !b.hasNew) return -1;
              if (b.hasNew && a.hasNew) {
                return b.startDate - a.startDate;
              }
              return 0;
            });

          setFavoriteAnime(animes);
          return animes;
        }
      });

      return result;
    };

    startSort().finally(() => {
      setLoading(false);
    });
  }, [isReady, favoriteIds]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        我的收藏
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {favoriteIds.length === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              還沒有收藏的動畫。點擊動畫卡片上的愛心圖示來添加收藏！
            </Alert>
          )}
          {favoriteIds.length > 0 && favoriteAnime.length === 0 && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              無法載入收藏的動畫。請稍後再試。
            </Alert>
          )}
          {favoriteIds.length > 0 && favoriteAnime.length > 0 && (
            <>
              <FormControl size="small" sx={{ minWidth: 120, mb: 2 }}>
                <InputLabel>季度</InputLabel>
                <Select
                  multiple
                  value={seasons}
                  onChange={(e) => {
                    const { value } = e.target;

                    if (value.includes('all')) {
                      return setSeasons((seasons) => {
                        return seasons.length >= selectOptions.length
                          ? []
                          : selectOptions;
                      });
                    }
                    setSeasons(
                      typeof value === 'string' ? value.split(',') : value,
                    );
                  }}
                  input={<OutlinedInput label="季度" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} color="primary" label={value} />
                      ))}
                    </Box>
                  )}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: 48 * 4.5 + 8,
                      },
                    },
                  }}
                >
                  <MenuItem value="all" sx={{ px: 0 }}>
                    <Checkbox
                      checked={seasons.length === selectOptions.length}
                    />
                    <ListItemText primary="全部" />
                  </MenuItem>
                  {selectOptions.map((value) => (
                    <MenuItem key={value} value={value} sx={{ px: 0 }}>
                      <Checkbox checked={seasons.includes(value)} />
                      <ListItemText primary={value} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Grid container spacing={2} columns={{ xs: 2, sm: 6, md: 10 }}>
                {filteredAnime.map((anime) => (
                  <Grid size={2} id={anime.id} key={anime.id}>
                    <AnimeCard anime={anime} variant="grid" />
                  </Grid>
                ))}
              </Grid>
            </>
          )}
        </>
      )}
    </Box>
  );
};

export default Favorites;
