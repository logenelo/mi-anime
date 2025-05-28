import React from 'react';
import { Card, CardMedia, Typography, Stack, Box, Chip } from '@mui/material';
import { weekdayColors, type Anime } from '../types/anime';
import FavoriteButton from './FavoriteButton';
import { dateFormater } from '../services/helper';
import { useNavigate } from 'react-router-dom';
import AnimeDetailContext from '../contexts/AnimeDetailContext';

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

interface AnimeCardProps {
  anime: Anime;
  variant?: 'grid' | 'list';
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, variant = 'grid' }) => {
  const isGrid = variant === 'grid';

  const navigate = useNavigate();
  const { handleOpen } = React.useContext(AnimeDetailContext);
  const startDate = React.useMemo(() => {
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
            {anime.title} <FavoriteButton animeId={anime.id} />
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
          <Stack direction="row" spacing="2px" mb={1} alignItems="flex-start">
            <Typography
              variant="h6"
              textAlign="justify"
              sx={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
              }}
            >
              {anime.title}
            </Typography>
            <Box mt={1}>
              <FavoriteButton animeId={anime.id} />
            </Box>
          </Stack>
          <Stack>
            <Stack direction="row" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                播出時間：
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

            <Typography variant="body2" color="text.secondary">
              開播日期：{startDate} {anime?.isContin ? ' 跨季續播' : ''}
            </Typography>

            <Typography variant="body2" color="text.secondary">
              播出平台：
              {anime.platform
                .filter((platform) => platform.region === 'HK')
                .map((platform) => platform.value)
                .join(', ')}
            </Typography>
          </Stack>
        </Stack>
      </>
    );
  };

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
