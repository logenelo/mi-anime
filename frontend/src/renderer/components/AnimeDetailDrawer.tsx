import React from 'react';
import { Drawer, Box, CircularProgress, useTheme } from '@mui/material';

import { AnimeDetail } from '../pages';
import AnimeDetailContext from '../contexts/AnimeDetailContext';

const AnimeDetailDrawer: React.FC = () => {
  const theme = useTheme();
  const { animeDetailId, open, handleClose } =
    React.useContext(AnimeDetailContext);

  return (
    <Drawer
      variant="temporary"
      anchor="bottom"
      open={open}
      onClose={handleClose}
      ModalProps={{
        keepMounted: false,
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: '80%',
            borderTopLeftRadius: 8,
            borderTopRightRadius: 8,
          },
        },
      }}
      sx={{
        zIndex: 1100,
        scrollbarColor: `${theme.palette.primary.dark} ${theme.palette.background.default} `,
      }}
    >
      <AnimeDetail id={animeDetailId} />
    </Drawer>
  );
};

export default AnimeDetailDrawer;
