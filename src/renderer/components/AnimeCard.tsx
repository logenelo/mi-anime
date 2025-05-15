import React from 'react';
import { Card, CardMedia, Typography, Stack, Box, Chip } from '@mui/material';
import type { Anime } from '../types/anime';
import FavoriteButton from './FavoriteButton';

const WEEKDAY_NAMES = ['日', '一', '二', '三', '四', '五', '六'];

interface AnimeCardProps {
  anime: Anime;
  variant?: 'grid' | 'list';
}

const AnimeCard: React.FC<AnimeCardProps> = ({ anime, variant = 'grid' }) => {
  const isGrid = variant === 'grid';

  return (
    <Card
      elevation={2}
      sx={{
        display: 'flex',
        borderRadius: 2,
        height: '100%',
        flexDirection: isGrid ? 'column' : 'row',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: (theme) => theme.shadows[8],
        },
      }}
    >
      <CardMedia
        component="img"
        sx={{
          width: isGrid ? '100%' : 120,
          height: isGrid ? 160 : '100%',
          objectFit: 'cover',
        }}
        image={anime.cover}
        alt={anime.title}
      />
      <Box sx={{ flex: 1, p: isGrid ? 2 : 1, position: 'relative' }}>
        <Typography
          variant="h6"
          sx={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            mb: 1,
            pr: 4,
          }}
        >
          {anime.title} <FavoriteButton animeId={anime.id} />
        </Typography>
        <Stack>
          <Stack direction="row" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              播出時間：
            </Typography>
            <Chip
              size="small"
              color="primary"
              label={WEEKDAY_NAMES[anime.weekday]}
            />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            開播日期：{anime.startDate}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            播出平台：{anime.platform}
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
};

export default AnimeCard;
