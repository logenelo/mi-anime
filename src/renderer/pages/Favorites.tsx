import React, { useMemo } from 'react';
import { Typography, Box, Alert } from '@mui/material';
import AnimeList from '../components/AnimeList';
import { getAllAnime } from '../services/api'; // You'll need to create this

const Favorites: React.FC = () => {
  // Get favorite anime IDs from localStorage
  const favoriteIds = useMemo(() => {
    try {
      const stored = localStorage.getItem('favoriteList');
      return stored ? (JSON.parse(stored) as number[]) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }, []);

  // Filter all anime to get only favorites
  const favoriteAnime = useMemo(() => {
    const allAnime = getAllAnime(); // You'll need to implement this function
    return allAnime.filter((anime) => favoriteIds.includes(anime.id));
  }, [favoriteIds]);

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
        我的收藏
      </Typography>

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
        <AnimeList animeList={favoriteAnime} />
      )}
    </Box>
  );
};

export default Favorites;
