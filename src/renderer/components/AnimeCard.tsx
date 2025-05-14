import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import type { Anime } from '../types/anime';
import { getWeekdayLabel } from '../services/animeHelper';

type AnimeCardProps = {
  anime: Anime;
};

const AnimeCard: React.FC<AnimeCardProps> = ({ anime }) => (
  <Card
    elevation={2}
    sx={{
      display: 'flex',
      borderRadius: 2,
      overflow: 'hidden',
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
        width: 100,
        objectFit: 'cover',
        borderRadius: '8px 0 0 8px',
      }}
      image={anime.cover}
      alt={anime.title}
    />
    <CardContent sx={{ flex: 1, p: 2 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{
          fontSize: '1.1rem',
          fontWeight: 'bold',
          mb: 1,
          lineHeight: 1.2,
        }}
      >
        {anime.title}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: 'flex', gap: 1 }}
        >
          <span>開播日期：</span>
          <span>{anime.startDate}</span>
        </Typography>
        <Typography variant="body2" sx={{ display: 'flex', gap: 1 }}>
          <span>每週播出：</span>
          <Chip
            label={`${getWeekdayLabel(anime.weekday)}`}
            size="small"
            sx={{
              backgroundColor: 'primary.light',
              fontSize: '0.75rem',
            }}
          />
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ display: 'flex', gap: 1 }}
        >
          <span>觀看平台：</span>
          <Chip
            label={anime.platform}
            size="small"
            sx={{
              height: '20px',
              backgroundColor: 'secondary.light',
              color: 'secondary.dark',
              fontSize: '0.75rem',
            }}
          />
        </Typography>
      </Box>
    </CardContent>
  </Card>
);

export default AnimeCard;
