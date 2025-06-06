import React from 'react';
import { Card, CardMedia, Typography, Stack, Box, Chip } from '@mui/material';
import { weekdayColors, type Anime } from '../types/anime';
import FavoriteButton from './FavoriteButton';
import { dateFormater } from '../services/helper';
import AnimeDetailContext from '../contexts/AnimeDetailContext';

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

interface AnimeCardProps {
  anime: Anime;
  variant?: 'grid' | 'list';
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, variant = 'grid' }) => {
  const isGrid = variant === 'grid';

  const { handleOpen } = React.useContext(AnimeDetailContext);
  const startDate = React.useMemo(() => {
    if (!anime.startDate) return '未定';
    const date = new Date(Number(anime.startDate));
    return dateFormater(date);
  }, [anime.startDate]);

  const GridContent = () => {
    return (
      <>
        <CardMedia
          component="img"
          width={1}
          height={250}
          image={anime.cover}
          alt={anime.title}
          loading="lazy"
          sx={{ objectFit: 'cover' }}
        />
        <Box
          width={1}
          zIndex={2}
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
            {anime.title}{' '}
            <Box component="span" display="inline-flex">
              <FavoriteButton animeId={anime.id} />
            </Box>
          </Typography>
        </Box>
      </>
    );
  };
  const ListContent = () => {
    return (
      <>
        <CardMedia
          component="img"
          sx={{
            width: 120,
            height: '100%',
            objectFit: 'cover',
          }}
          loading="lazy"
          image={anime.cover}
          alt={anime.title}
        />
        <Stack
          direction="column"
          sx={{
            flex: 1,
            p: 1,
            position: 'relative',
          }}
        >
          <Stack direction="row" mb={1}>
            <Typography
              variant="h6"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              {anime.title}{' '}
              <Box component="span" display="inline-flex">
                <FavoriteButton animeId={anime.id} />
              </Box>
            </Typography>
          </Stack>
          <Stack>
            <Stack direction="row" alignItems="center">
              <Typography variant="body2">播出時間：</Typography>
              <Chip
                size="small"
                label={WEEKDAY_NAMES[anime.weekday]}
                sx={{
                  backgroundColor: weekdayColors[anime.weekday],
                  color: anime.weekday !== 2 ? 'white' : 'text.primary',
                }}
              />
            </Stack>

            <Typography variant="body2" gutterBottom>
              開播日期：{startDate} {anime?.isContin ? ' 跨季續播' : ''}
            </Typography>

            <Stack direction="row" spacing={1} flexWrap={'wrap'} mb="0.35em">
              <Typography variant="body2">播放平台：</Typography>
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
                    onClick={(e) => e.stopPropagation()}
                    sx={{ pb: '0.35em' }}
                    {...(p.href && { href: p.href, target: '_blank' })}
                  />
                ))}
            </Stack>
          </Stack>
        </Stack>
      </>
    );
  };

  React.useEffect(() => {}, []);

  return (
    <Card
      onClick={() => {
        handleOpen(anime.id);
      }}
      elevation={2}
      sx={{
        display: 'flex',
        position: 'relative',
        borderRadius: 2,
        height: '100%',
        flexDirection: 'row',
        transition: 'all 0.2s ease-in-out',
        contentVisibility: 'auto',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      {anime.hasNew && (
        <Box
          position={'absolute'}
          top={0}
          left={0}
          bgcolor={'primary.main'}
          color="white"
          sx={{
            borderTopLeftRadius: 8,
            borderBottomRightRadius: 8,
          }}
        >
          <Typography py={0.5} px={1.5} fontWeight="bold" fontStyle={'italic'}>
            更新
          </Typography>
        </Box>
      )}
      {isGrid && <GridContent />}
      {!isGrid && <ListContent />}
    </Card>
  );
};

export default React.memo(AnimeCard);
