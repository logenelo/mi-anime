import React, { useMemo } from 'react';
import { Box, Typography, Card, Chip, Stack, Grid, Alert } from '@mui/material';
import { getAnimeById } from '../../services/api';
import { Anime, SEASONS, weekdayColors } from '../../types/anime';
import useFavoriteList from '../../hooks/useFavouriteList';
import { dateFormater } from '../../services/helper';
import { getEpisodeCount, WEEKDAY_NAMES } from '../../services/animeHelper';
import Loading from '../../components/Loading';

const AnimeDetail: React.FC<{ id: string }> = ({ id }) => {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [anime, setAnime] = React.useState<Anime>();
  const { isReady, watch, getEpisodeWatched } = useFavoriteList();
  const [watched, setWatched] = React.useState<number>(0);

  const startDate = useMemo(() => {
    if (!anime) return '';
    if (!anime.startDate) return '未定';
    const date = new Date(Number(anime.startDate));
    return dateFormater(date);
  }, [anime?.startDate]);

  React.useEffect(() => {
    if (!isReady || !id) return;

    const fetchWatched = async () => {
      const episode = getEpisodeWatched(id);
      setLoading(false);
      setWatched(episode);
    };
    fetchWatched();
  }, [isReady, id]);

  React.useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      // Fetch anime details
      const resp = await getAnimeById(id);
      if (resp?.statusCode === 200) {
        setAnime(resp.anime);
      } else {
        setError(resp || '錯誤：無法獲取動畫資料');
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

  if (error) {
    return (
      <Box p={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }
  if (!anime || loading) {
    return (
      <Box p={2} display={'flex'} justifyContent={'center'}>
        <Loading />
      </Box>
    );
  }
  return (
    <>
      <Grid container>
        <Grid size={'auto'} sx={{ position: 'relative' }}>
          <Card
            sx={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              left: 0,
              width: 300,
            }}
          >
            <Box
              component="img"
              src={anime.cover}
              alt={anime.title}
              width={1}
              sx={{ objectFit: 'contain' }}
            />
          </Card>
        </Grid>
        <Grid size={'grow'} p={2}>
          <Typography variant="h4" gutterBottom>
            {anime.title}
          </Typography>
          <Typography variant="body1" gutterBottom>
            季度： {anime.year}年{' '}
            {SEASONS.find((s) => s.value === anime.season)?.label}
          </Typography>
          <Typography variant="body1" gutterBottom>
            開播日期：{startDate}
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

          <Stack direction="row" spacing={1} flexWrap={'wrap'}>
            <Typography variant="body1" sx={{ pb: '0.35em' }}>
              播放平台：
            </Typography>
            {[
              ...anime.platform,
              {
                value: '其他',
                href: 'https://anime1.cc/search?q=' + anime.title,
                region: 'HK',
              },
            ]
              .filter((p) => p.region === 'HK')
              .map((p) => (
                <Chip
                  size="small"
                  key={p.value}
                  label={p.value}
                  component="a"
                  clickable={Boolean(p.href)}
                  sx={{ pb: '0.35em' }}
                  {...(p.href && { href: p.href, target: '_blank' })}
                />
              ))}
          </Stack>

          <Typography variant="body1" sx={{ mb: 3, mt: 2 }}>
            {anime.description}
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1">集數</Typography>
            <Box display="flex" gap={0.5} flexWrap="wrap">
              {Array.from(
                { length: getEpisodeCount(anime) },
                (_, i) => i + 1,
              ).map((episode) => {
                return (
                  <Chip
                    sx={{ borderRadius: 2, minWidth: 39 }}
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
    </>
  );
};

export default AnimeDetail;
