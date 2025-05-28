import React from 'react';
import { Drawer, Box, CircularProgress } from '@mui/material';

import { AnimeDetail } from '../pages';
import AnimeDetailContext from '../contexts/AnimeDetailContext';

const AnimeDetailDrawer: React.FC = () => {
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
            borderTopLeftRadius: 4,
            borderTopRightRadius: 4,
          },
        },
      }}
    >
      <AnimeDetail id={animeDetailId} />
    </Drawer>
  );
};

export default AnimeDetailDrawer;
