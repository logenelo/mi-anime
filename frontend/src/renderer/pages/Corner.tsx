import { Box, Typography, IconButton, Card, Divider } from '@mui/material';
import { KeyboardArrowDown, Remove } from '@mui/icons-material';
import { Anime } from '../types/anime';
import Loading from '..//components/Loading';
import { getAnimeByIds } from '../services/api';
import { getEpisodeCount } from '../services/animeHelper';
import React from 'react';
import useFavoriteList from '../hooks/useFavouriteList';

const Corner = () => {
  const { isReady, getEpisodeWatched } = useFavoriteList();

  const [loading, setLoading] = React.useState(true);
  const [animes, setAnimes] = React.useState<Anime[]>([]);
  const [episodeWated, setEpisodeWated] = React.useState<
    Record<string, number>
  >({});
  const favorIds = JSON.parse(
    window.localStorage.getItem('favoriteList') || '[]',
  );
  const handleClose = () => {
    window.close(); // Close the window
  };

  React.useEffect(() => {
    console.log(isReady);
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
          MiAnime
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
        <Typography variant="h4" gutterBottom>
          我的追番日記
        </Typography>
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
              <Box
                display="flex"
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                  <Typography
                    component="a"
                    href={anime.platform[0].href}
                    variant="h6"
                    key={anime.id}
                    sx={{
                      textDecoration: 'none',
                      color: 'inherit',
                      '&:hover': { fontWeight: 'bold' },
                    }}
                  >
                    {anime.title}
                  </Typography>
                  <Typography variant="body1" sx={{ mb: '3px' }}>
                    {episodeWated[anime.id]
                      ? '已看 ' +
                        episodeWated[anime.id] +
                        '/' +
                        getEpisodeCount(anime)
                      : '未看'}
                  </Typography>
                </Box>
                <IconButton sx={{ color: 'white' }}>
                  <KeyboardArrowDown />
                </IconButton>
              </Box>
              <Divider sx={{ borderColor: 'rgba(255, 255, 255, 0.8)' }} />
            </React.Fragment>
          ))
        )}
      </Box>
    </Box>
  );
};
export default Corner;
