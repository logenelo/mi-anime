import React from 'react';
import { useIndexedDB } from 'react-indexed-db-hook';

const STORE_NAME = 'favorites';

type Data = {
  id: string;
  episode: number;
};
const useFavoriteList = () => {
  const db = useIndexedDB(STORE_NAME);
  const [favouriteData, setFavouriteData] = React.useState<
    Record<string, number>
  >({});

  const isReady = React.useMemo(() => {
    return Object.keys(favouriteData).length > 0;
  }, [favouriteData]);

  React.useEffect(() => {
    db.getAll().then((data) => {
      const result = data.reduce((acc, item) => {
        return { ...acc, [item.id]: item.episode };
      }, {});

      setFavouriteData(result);
    });
  }, []);

  const addData = (data: Data) => {
    setFavouriteData((prev) => {
      return { ...prev, [data.id]: data.episode };
    });
    db.add(data);
  };
  const updateData = (data: any) => {
    setFavouriteData((prev) => {
      return { ...prev, [data.id]: data.episode };
    });
    db.update(data);
  };
  const deleteData = (id: string) => {
    setFavouriteData((prev) => {
      const newData = { ...prev };
      delete newData[id];
      return newData;
    });
    db.deleteRecord(id);
  };
  const watch = async (id: string, episode: number): Promise<number> => {
    const data = await db.getByID(id);

    if (!data) {
      addData({ id, episode });
      return episode;
    }
    const newData = { ...data };
    if (newData.episode === episode) {
      if (newData.episode === 1) {
        deleteData(id);

        return 0;
      } else {
        newData.episode -= 1;
        updateData(newData);
        return newData.episode;
      }
    } else {
      newData.episode = episode;
      updateData(newData);
      return newData.episode;
    }
  };

  const getEpisodeWatched = (id: string): number => {
    return favouriteData[id] || 0;
  };

  return {
    db,
    isReady,
    favouriteData,
    watch,
    getEpisodeWatched,
  };
};

export default useFavoriteList;
