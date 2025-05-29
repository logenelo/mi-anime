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

function ServerDay(props: PickersDayProps & { highlightedDays?: string[] }) {
  const { highlightedDays = [], day, outsideCurrentMonth, ...other } = props;
  const isSelected =
    !props.outsideCurrentMonth && highlightedDays.includes(day.toString());

  console.log(
    !props.outsideCurrentMonth,
    highlightedDays.includes(day.toString()),
  );
  return (
    <Badge
      key={props.day.toString()}
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

  const [selectedDate, setSelectedDate] = useState(DateTime.now());

  const [highlightData, setHighlightData] = useState<Record<string, any>>([]);
  const highlightedDays = useMemo(() => {
    return Object.keys(highlightData);
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
    getAnimeByIds(favoriteIds)
      .then(async (resp) => {
        if (resp.statusCode === 200) {
          let highlightData: Record<string, any> = {};

          resp.animes.forEach((anime: Anime) => {
            const startDate = DateTime.fromMillis(Number(anime.startDate));
            const endDate = startDate.plus({
              weeks: Number(anime.episode) - 1,
            });
            let i = 1;
            for (
              let date = startDate;
              date <= endDate;
              date = date.plus({ weeks: 1 })
            ) {
              const data = { title: anime.title, episode: i };
              if (highlightData[date.toString()]) {
                highlightData[date.toString()].push(data);
              } else {
                highlightData[date.toString()] = [data];
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
  }, [favoriteIds]);

  return (
    <Box p={2}>
      <Typography
        variant="h4"
        color="textPrimary"
        sx={{ fontWeight: 'bold', mb: 2 }}
      >
        日歷
      </Typography>
      <Paper elevation={3}>
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
      </Paper>
      {selectedDate && (
        <Typography variant="body1" color="textSecondary" sx={{ mt: 2 }}>
          選擇的日期是：{selectedDate.toFormat('yyyy-MM-dd')}
        </Typography>
      )}
    </Box>
  );
};

export default Calendar;
