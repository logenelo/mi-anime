import { CheckRounded, Delete } from '@mui/icons-material';
import {
  Box,
  CircularProgress,
  IconButton,
  ImageListItem,
  Fade,
} from '@mui/material';
import React, { useState } from 'react';

interface ImageCardProps {
  src: string;
  isSelected: boolean;
  onSelect: () => void;
  onDelete?: () => void;
  isLoaded?: boolean;
  onLoad?: () => void;
}

const ImageCard: React.FC<ImageCardProps> = ({
  src,
  isSelected,
  onSelect,
  onDelete,
  isLoaded,
  onLoad,
}) => {
  const [loading, setLoading] = useState(!isLoaded);
  const [isHovered, setIsHovered] = useState(false);

  const getOpacity = () => {
    if (loading) return 0;
    if (isSelected) return 1;
    return isHovered ? 0.9 : 0.7;
  };

  return (
    <ImageListItem
      sx={{
        position: 'relative',
        borderRadius: 2,
        overflow: 'hidden',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        transition: 'transform 0.2s ease-in-out',
        boxShadow: isSelected ? 4 : 1,
      }}
      onClick={onSelect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Fade in={loading}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: 'action.hover',
            backdropFilter: 'blur(4px)',
          }}
        >
          <CircularProgress size={28} />
        </Box>
      </Fade>

      <Box
        component="img"
        src={src}
        alt="Background option"
        loading="lazy"
        onLoad={() => {
          setLoading(false);
          onLoad?.();
        }}
        sx={{
          width: '100%',
          aspectRatio: '16/9',
          objectFit: 'cover',
          cursor: 'pointer',
          opacity: getOpacity(),
          transition: 'all 0.2s ease-in-out',
        }}
      />

      <Fade in={isSelected || isHovered}>
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            background: isSelected
              ? 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0) 50%)'
              : 'none',
          }}
        >
          {isSelected && (
            <CheckRounded
              sx={{
                position: 'absolute',
                bottom: 8,
                right: 8,
                color: 'common.white',
                filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.2))',
                transition: 'transform 0.2s ease-in-out',
                transform: isHovered ? 'scale(1.1)' : 'scale(1)',
              }}
            />
          )}

          {onDelete && (
            <Fade in={isHovered}>
              <IconButton
                size="small"
                sx={{
                  position: 'absolute',
                  width: 24,
                  height: 24,
                  top: 8,
                  right: 8,
                  bgcolor: 'error.main',
                  backdropFilter: 'blur(4px)',
                  '&:hover': {
                    bgcolor: 'error.light',
                    '& .MuiSvgIcon-root': {
                      color: 'common.white',
                    },
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                <Delete
                  sx={{
                    width: 16,
                    height: 16,
                    color: 'white',
                    transition: 'color 0.2s ease-in-out',
                  }}
                />
              </IconButton>
            </Fade>
          )}
        </Box>
      </Fade>
    </ImageListItem>
  );
};

export default React.memo(ImageCard);
