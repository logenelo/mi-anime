import React, { useMemo, useState } from 'react';
import { Badge, Box, Paper, Typography, useTheme } from '@mui/material';
import {
  DateCalendar,
  LocalizationProvider,
  PickersDay,
  PickersDayProps,
} from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTime } from 'luxon';
import { Circle } from '@mui/icons-material';
import { getAnimeByIds } from '../services/api';
import { Anime } from '../types/anime';
import useFavoriteList from '../hooks/useFavouriteList';
import AnimeDetailContext from '../contexts/AnimeDetailContext';

interface HighlightData {
  id: string;
  title: string;
  episode: number;
  watched: boolean;
}
function ServerDay(props: PickersDayProps & { highlightedDays?: string[] }) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected =
    !props.outsideCurrentMonth &&
    highlightedDays.includes(day.toFormat('yyyy-MM-dd'));

  return (
    <Badge
      key={props.day.toFormat('yyyy-MM-dd')}
      overlap="circular"
      badgeContent={
        isSelected ? (
          <Circle color="primary" sx={{ width: 10, height: 10 }} />
        ) : undefined
      }
    >
      <PickersDay
        {...other}
        outsideCurrentMonth={outsideCurrentMonth}
        day={day}
      />
    </Badge>
  );
}

const Calendar: React.FC = () => {
  const theme = useTheme();
  const { isReady, getEpisodeWatched } = useFavoriteList();
  const { handleOpen } = React.useContext(AnimeDetailContext);

  const [selectedDate, setSelectedDate] = useState(DateTime.now());

  const [highlightData, setHighlightData] = useState<
    Record<string, HighlightData[]>
  >({});
  const highlightedDays = useMemo(() => {
    return Object.keys(highlightData).filter((key) => {
      return highlightData[key].some((data: HighlightData) => !data.watched);
    });
  }, [highlightData]);
  const favoriteIds: string[] = React.useMemo(() => {
    try {
      const stored = localStorage.getItem('favoriteList');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error reading favorites:', error);
      return [];
    }
  }, []);

  const handleDateChange = (date: any) => {
    setSelectedDate(date);
    console.log('Selected date:', date);
  };

  React.useEffect(() => {
    if (!isReady) return;
    getAnimeByIds(favoriteIds)
      .then(async (resp) => {
        if (resp.statusCode === 200) {
          let highlightData: Record<string, any> = {};

          resp.animes.forEach((anime: Anime) => {
            const startDate = DateTime.fromMillis(Number(anime.startDate));
            const endDate = startDate.plus({
              weeks: Number(anime.episode) - 1,
            });

            const watched = getEpisodeWatched(anime.id);
            let i = 1;
            for (
              let date = startDate;
              date <= endDate;
              date = date.plus({ weeks: 1 })
            ) {
              const data = {
                id: anime.id,
                title: anime.title,
                episode: i,
                watched: watched >= i,
              };
              const key = date.toFormat('yyyy-MM-dd');
              if (highlightData[key]) {
                highlightData[key].push(data);
              } else {
                highlightData[key] = [data];
              }
              i++;
            }
          });
          setHighlightData(highlightData);
        }
      })
      .catch((error) => {
        console.error('Error fetching animes:', error);
      });
  }, [favoriteIds, isReady]);

  return (
    <Box p={2}>
      <Typography
        variant="h4"
        color="textPrimary"
        sx={{ fontWeight: 'bold', mb: 2 }}
      >
        日歷
      </Typography>
      <Paper
        elevation={3}
        sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}
      >
        <Box>
          <LocalizationProvider dateAdapter={AdapterLuxon}>
            <DateCalendar
              value={selectedDate}
              showDaysOutsideCurrentMonth
              onChange={handleDateChange}
              slots={{
                day: ServerDay,
              }}
              slotProps={{
                day: {
                  highlightedDays,
                } as any,
              }}
              sx={{
                '& .MuiDayCalendar-weekContainer': {
                  borderTop: '1px solid ' + theme.palette.divider,
                },
              }}
            />
          </LocalizationProvider>
        </Box>
        <Box p={2}>
          <Typography
            variant="h6"
            color="textSecondary"
            fontWeight="600"
            gutterBottom
          >
            {selectedDate.toFormat('yyyy-MM-dd')}
          </Typography>
          {(highlightData?.[selectedDate.toFormat('yyyy-MM-dd')] || []).map(
            (data: any) => (
              <Typography key={data.title + data.episode} variant="body1">
                <Box
                  component={'span'}
                  onClick={() => handleOpen(data.id)}
                  color="primary.main"
                  sx={{ cursor: 'pointer' }}
                >
                  {data.title}
                </Box>{' '}
                第 {data.episode} 集
              </Typography>
            ),
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Calendar;
