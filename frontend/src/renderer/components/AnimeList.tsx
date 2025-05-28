import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Typography,
  Grid,
  Chip,
  Stack,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import AnimeCard from './AnimeCard';
import { type Anime } from '../types/anime';
import { WEEKDAY_NAMES } from '../services/animeHelper';
import useCustomSetting from '../hooks/useCustomSetting';
import { Layout } from '../types/setting';

type Props = {
  animeList: Anime[];
};

// 用數字表示星期，0-6 代表週日到週六

const toggleButtonStyles = {
  borderColor: 'primary.main',
  color: 'primary.main',
  '&.Mui-selected': {
    bgcolor: 'primary.main',
    color: 'primary.contrastText',
    '&:hover': {
      bgcolor: 'primary.dark',
    },
  },
};

// 每個星期的顏色

const AnimeList: React.FC<Props> = ({ animeList }) => {
  const [selectedWeekday, setSelectedWeekday] = useState<number | null>(null);
  const [userPreferences, setUserPreferences] = useCustomSetting();

  const filteredAnimeList = useMemo(() => {
    if (selectedWeekday === null) return animeList;

    // 過濾動畫列表，僅保留選擇的星期
    return animeList.filter((anime) => {
      if (anime.weekday !== selectedWeekday) return false;
      return true;
    });
  }, [animeList, selectedWeekday]);

  const groupByWeekday = (animes: Anime[]) => {
    const groups: Record<string, Anime[]> = {};
    const stored = JSON.parse(localStorage.getItem('favoriteList') || '[]');

    // 初始化所有星期的空陣列
    WEEKDAY_NAMES.forEach((_, index) => {
      groups[index] = [];
    });
    // 將動畫按照星期分組
    animes.forEach((anime) => {
      const { weekday } = anime;
      if (groups[weekday]) {
        groups[weekday].push(anime);
      }
    });

    // 將收藏的動畫放在最前面
    Object.keys(groups).forEach((weekday) => {
      groups[weekday] = groups[weekday].sort((a, b) => {
        const aIndex = stored.indexOf(a.id);
        const bIndex = stored.indexOf(b.id);
        if (aIndex > -1 && bIndex === -1) return -1; // a 在收藏中，b 不在
        if (bIndex > -1 && aIndex === -1) return 1; // b 在收藏中，a 不在
        return 0; // 都在或都不在
      });
    });
    return groups;
  };

  const groupedAnime = useMemo(
    () => groupByWeekday(filteredAnimeList),
    [filteredAnimeList],
  );

  // 重新排序星期，從今天開始
  const reorderedWeekdays = useMemo(() => {
    const today = new Date().getDay();
    return [...WEEKDAY_NAMES.slice(today), ...WEEKDAY_NAMES.slice(0, today)];
  }, []);

  const handleWeekdayChange = (newWeekday: number | null) => {
    setSelectedWeekday(newWeekday === selectedWeekday ? null : newWeekday);
  };

  const handleLayoutChange = (newLayout: Layout | null) => {
    if (newLayout !== null) {
      setUserPreferences({ cardLayout: newLayout });
    }
  };

  return (
    <Box sx={{ py: 2 }}>
      {/* Filter and Layout Controls */}
      <Stack direction="column" spacing={2} sx={{ mb: 2 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-end"
        >
          <ToggleButtonGroup
            value={selectedWeekday}
            exclusive
            onChange={(event, value) => handleWeekdayChange(value)}
            aria-label="週間篩選"
            size="small"
          >
            {WEEKDAY_NAMES.map((name, index) => (
              <ToggleButton
                key={index}
                value={index}
                color="primary"
                sx={{
                  minWidth: 40,
                  fontWeight: 'bold',
                  ...toggleButtonStyles,
                }}
              >
                {name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={userPreferences.cardLayout}
            exclusive
            onChange={(event, value) => handleLayoutChange(value)}
            aria-label="顯示方式"
            size="small"
          >
            <ToggleButton
              value="grid"
              aria-label="網格檢視"
              color="primary"
              sx={{
                ...toggleButtonStyles,
              }}
            >
              <GridViewIcon />
            </ToggleButton>
            <ToggleButton
              value="list"
              aria-label="列表檢視"
              color="primary"
              sx={{
                ...toggleButtonStyles,
              }}
            >
              <ViewListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Stack>

      {/* Anime List */}
      {reorderedWeekdays.map((weekdayName, i) => {
        const originalIndex = WEEKDAY_NAMES.indexOf(weekdayName);
        const animes = groupedAnime[originalIndex];
        if (!animes?.length) return null;

        return (
          <Box key={originalIndex} sx={{ mb: 4 }}>
            <Typography
              variant="h6"
              color="textPrimary"
              sx={{
                mb: 2,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              星期{weekdayName}
              {i === 0 && (
                <Chip
                  label="今天"
                  size="small"
                  color="primary"
                  sx={{
                    ml: 1,
                  }}
                />
              )}
            </Typography>
            <Grid
              container
              spacing={userPreferences.cardLayout === 'grid' ? 2 : 1}
              columns={{ xs: 4, sm: 8, md: 12 }}
            >
              {animes.map((anime) => (
                <Grid
                  size={userPreferences.cardLayout === 'grid' ? 4 : 12}
                  key={anime.id}
                >
                  <AnimeCard
                    anime={anime}
                    variant={userPreferences.cardLayout}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        );
      })}
    </Box>
  );
};

export default AnimeList;
