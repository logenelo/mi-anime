import React, { useState, useCallback, useMemo } from 'react';
import { IconButton, styled } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

// Styled components for consistent styles
const StyledIconButton = styled(IconButton)({
  padding: 0,
  transition: 'transform 0.2s ease-in-out',
  backgroundColor: 'transparent',
  '&:hover': {
    transform: 'scale(1.1)',
    backgroundColor: 'transparent',
  },
});

const iconStyles = {
  fontSize: '1rem',
  animation: 'heartBeat 0.3s ease-in-out',
  '@keyframes heartBeat': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.3)' },
    '100%': { transform: 'scale(1)' },
  },
};

interface FavoriteButtonProps {
  animeId: number;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({ animeId }) => {
  // Get initial state from localStorage
  const initialState = useMemo(() => {
    try {
      const stored = localStorage.getItem('favoriteList');
      return stored ? JSON.parse(stored).includes(animeId) : false;
    } catch (error) {
      console.error('Error reading favorites:', error);
      return false;
    }
  }, [animeId]);

  const [isFavorite, setIsFavorite] = useState(initialState);

  const handleClick = useCallback(() => {
    const newState = !isFavorite;
    setIsFavorite(newState);

    try {
      const stored = localStorage.getItem('favoriteList');
      const favoriteList = stored ? JSON.parse(stored) : [];
      if (newState) {
        favoriteList.push(animeId);
      } else {
        const index = favoriteList.indexOf(animeId);
        if (index > -1) {
          favoriteList.splice(index, 1);
        }
      }
      localStorage.setItem('favoriteList', JSON.stringify(favoriteList));
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  }, [isFavorite, animeId]);

  return (
    <StyledIconButton onClick={handleClick}>
      {isFavorite ? (
        <FavoriteIcon
          sx={{
            ...iconStyles,
            color: 'error.main',
          }}
        />
      ) : (
        <FavoriteBorderIcon
          sx={{
            ...iconStyles,
            color: 'error.light',
          }}
        />
      )}
    </StyledIconButton>
  );
};

export default FavoriteButton;
