import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  Grid,
  Chip,
  Stack,
  IconButton,
  CircularProgress,
  Icon,
} from '@mui/material';
import KeyboardArrowLeftRoundedIcon from '@mui/icons-material/KeyboardArrowLeftRounded';

import { getAnimeById } from '../../services/api';
import { Anime, SEASONS, weekdayColors } from '../../types/anime';
import useFavoriteList from '../../hooks/useFavouriteList';
import { dateFormater } from '../../services/helper';
import { getEpisodeCount, WEEKDAY_NAMES } from '../../services/animeHelper';

const AnimeDetail: React.FC = () => {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const id = params?.id || '';
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [anime, setAnime] = React.useState<Anime>();
  const { isReady, watch, getEpisodeWatched } = useFavoriteList();
  const [watched, setWatched] = React.useState<number>(0);

  React.useEffect(() => {
    if (!isReady) return;

    const fetchWatched = async () => {
      const episode = getEpisodeWatched(id);
      setLoading(false);
      setWatched(episode);
    };
    fetchWatched();
  }, [isReady]);

  React.useEffect(() => {
    const fetchData = async () => {
      // Fetch anime details
      const resp = await getAnimeById(id);
      if (resp.statusCode === 200) {
        setAnime(resp.anime);
      } else {
        setError(resp.message || 'Failed to fetch anime details');
      }
    };

    fetchData();
  }, [id]);
  const handleEpisodeClick = async (episodeNumber: number) => {
    try {
      const result = await watch(id, episodeNumber);
      console.log(result);
      setWatched(result);
    } catch (error) {
      console.log(error);
    }
  };

  if (!anime || loading) {
    return <CircularProgress />;
  }
  return (
    <>
      <Box>
        <IconButton
          onClick={() => navigate(-1)}
          size="small"
          sx={{
            p: 0,
            color: 'text.primary',
          }}
        >
          <KeyboardArrowLeftRoundedIcon sx={{ fontSize: 30 }} />
        </IconButton>
      </Box>
      <Box sx={{ p: 2 }}>
        <Grid container spacing={3}>
          {/* Anime Cover and Basic Info */}
          <Grid
            size={{ xs: 12, md: 4 }}
            sx={{ display: 'flex', justifyContent: 'center' }}
          >
            <Card
              sx={{
                width: { xs: 'fit-content', md: 1 },
                height: { xs: 300, md: 1 },
              }}
            >
              <Box
                component="img"
                src={anime.cover}
                alt={anime.title}
                width={1}
                height={1}
                sx={{ objectFit: 'cover' }}
              />
            </Card>
          </Grid>

          {/* Anime Details */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Typography variant="h4" gutterBottom>
              {anime.title}
            </Typography>
            <Typography variant="body1" gutterBottom>
              季度： {anime.year}年{' '}
              {SEASONS.find((s) => s.value === anime.season)?.label}
            </Typography>
            <Typography variant="body1" gutterBottom>
              開播日期：{dateFormater(new Date(Number(anime.startDate)))}
            </Typography>
            <Stack direction="row" spacing={1} mb={'0.35em'}>
              <Typography variant="body1" gutterBottom>
                播出星期：
              </Typography>
              <Chip
                size="small"
                label={WEEKDAY_NAMES[anime.weekday]}
                sx={{
                  backgroundColor: weekdayColors[anime.weekday],
                  color: anime.weekday !== 2 ? 'white' : 'text.primary',
                }}
              />
            </Stack>

            <Stack direction="row" spacing={1} flexWrap={'wrap'} mb={'0.35em'}>
              <Typography variant="body1">播放平台：</Typography>
              {anime.platform
                .filter((p) => p.region === 'HK')
                .map((p) => (
                  <Chip
                    key={p.value}
                    label={p.value}
                    component="a"
                    clickable={Boolean(p.href)}
                    {...(p.href && { href: p.href, target: '_blank' })}
                  />
                ))}
            </Stack>

            <Typography variant="body1" sx={{ mb: 3 }}>
              {anime.description}
            </Typography>

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1">集數</Typography>
              <Box display="flex" gap={0.5}>
                {Array.from(
                  { length: getEpisodeCount(anime) },
                  (_, i) => i + 1,
                ).map((episode) => {
                  return (
                    <Chip
                      sx={{ borderRadius: 2 }}
                      label={episode}
                      variant={episode <= watched ? 'filled' : 'outlined'}
                      onClick={() => handleEpisodeClick(episode)}
                      key={episode}
                    />
                  );
                })}
              </Box>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};

export default AnimeDetail;
