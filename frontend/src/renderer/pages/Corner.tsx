import {
  Box,
  Typography,
  IconButton,
  Card,
  Divider,
  Collapse,
  Link,
} from '@mui/material';
import {
  Expand,
  KeyboardArrowDown,
  KeyboardArrowUp,
  Remove,
} from '@mui/icons-material';
import { Anime } from '../types/anime';
import Loading from '..//components/Loading';
import { getAnimeByIds } from '../services/api';
import { getEpisodeCount, getPlatforms } from '../services/animeHelper';
import React, { memo, useMemo } from 'react';
import useFavoriteList from '../hooks/useFavouriteList';

const Corner = () => {
  const { isReady, getEpisodeWatched } = useFavoriteList();

  const [loading, setLoading] = React.useState(true);
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [episodeWated, setEpisodeWated] = React.useState<
    Record<string, number>
  >({});
  const favorIds = useMemo(
    () => JSON.parse(window.localStorage.getItem('favoriteList') || '[]'),
    [],
  );
  const handleClose = () => {
    window.close(); // Close the window
  };

  const AnimeItem = memo(({ anime }: { anime: Anime }) => {
    const [expanded, setExpanded] = React.useState(false);
    const platforms = getPlatforms(anime).filter(
      (item) => item.region === 'HK' && item.href,
    );

    return (
      <>
        <Box
          display="flex"
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Box>
            <Typography
              variant="h6"
              key={anime.id}
              onClick={() => {
                window.electron.ipcRenderer.sendMessage('sendId', anime.id);
              }}
              sx={{
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': { fontWeight: 'bold', cursor: 'pointer' },
              }}
            >
              {anime.title}
            </Typography>{' '}
            <Typography
              component={'span'}
              variant="body1"
              sx={{ mb: '3px', display: 'inline-block' }}
            >
              {episodeWated[anime.id]
                ? '已看 ' +
                  episodeWated[anime.id] +
                  '/' +
                  getEpisodeCount(anime)
                : '未看'}
            </Typography>
          </Box>
          <IconButton
            sx={{ color: 'white' }}
            onClick={() => {
              setExpanded(!expanded);
            }}
          >
            {expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </Box>
        <Collapse in={expanded}>
          {platforms.map((item, i) => {
            return (
              <Box key={i}>
                <Link href={item.href} color="inherit" underline="hover">
                  {item.value}
                </Link>
              </Box>
            );
          })}
        </Collapse>
      </>
    );
  });

  React.useEffect(() => {
    if (!isReady) return;
    if (favorIds.length === 0) {
      setLoading(false);
      return;
    }
    getAnimeByIds(favorIds).then((resp: any) => {
      if (resp.statusCode === 200) {
        const animes: Anime[] = resp.animes;
        let episodeWated: Record<string, number> = {};
        const result = animes.filter((anime: Anime) => {
          const totalEpisodes = Math.min(getEpisodeCount(anime), anime.episode);
          episodeWated[anime.id] = totalEpisodes;
          let watched = getEpisodeWatched(anime.id);
          return watched < totalEpisodes;
        });
        setEpisodeWated(
          animes.reduce((acc: Record<string, number>, anime: Anime) => {
            const totalEpisodes = getEpisodeWatched(anime.id);
            if (totalEpisodes) {
              acc[anime.id] = totalEpisodes;
            }

            return acc;
          }, {}),
        );
        setAnimes(result);
        setLoading(false);
      }
    });
  }, [favorIds, isReady]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100vh',
        backgroundColor: 'rgba(30, 30, 30, 0.8)', // Set background with opacity

        color: 'white',
        overflow: 'hidden',
      }}
    >
      <Box
        id="top-bar"
        bgcolor="pink"
        display={'flex'}
        alignItems={'center'}
        color={'#000'}
      >
        <Box display={'flex'} flex={1} px={2} py={1}>
          關於我的追番日記
        </Box>
        <Box
          component={IconButton}
          onClick={handleClose}
          px={2}
          py={1}
          borderRadius={0}
          sx={{}}
        >
          <Remove />
        </Box>
      </Box>
      <Box p={2}>
        {loading ? (
          <Box p={2} display={'flex'} justifyContent={'center'}>
            <Loading />
          </Box>
        ) : favorIds.length === 0 ? (
          <Typography variant="body1" gutterBottom>
            沒有任何追番
          </Typography>
        ) : animes.length === 0 ? (
          <Typography variant="body1" gutterBottom>
            沒有任何更新
          </Typography>
        ) : (
          animes.map((anime) => (
            <React.Fragment key={anime.id}>
              <AnimeItem anime={anime} />
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.8)' }} />
            </React.Fragment>
          ))
        )}
      </Box>
    </Box>
  );
};
export default Corner;
