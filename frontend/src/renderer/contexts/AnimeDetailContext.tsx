import React from 'react';

interface AnimeDetailContextType {
  animeDetailId: string;
  setAnimeDetailId: React.Dispatch<React.SetStateAction<string>>;
  open: boolean;
  handleOpen: (id: string) => void;
  handleClose: () => void;
}
const AnimeDetailContext = React.createContext<AnimeDetailContextType>(
  {} as any,
);

export const DetailProvider = ({ children }: { children: React.ReactNode }) => {
  const [animeDetailId, setAnimeDetailId] = React.useState<string>('');
  const [open, setOpen] = React.useState<boolean>(false);
  const handleOpen = (id: string) => {
    setAnimeDetailId(id);
    setOpen(true);
  };
  const handleClose = () => {
    setOpen(false);
    setAnimeDetailId('');
  };
  return (
    <AnimeDetailContext.Provider
      value={{
        animeDetailId,
        setAnimeDetailId,
        open,
        handleOpen,
        handleClose,
      }}
    >
      {children}
    </AnimeDetailContext.Provider>
  );
};

export default AnimeDetailContext;
