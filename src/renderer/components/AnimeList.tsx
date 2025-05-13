import React from 'react';
import AnimeCard from './AnimeCard';
import { Anime } from '../types/anime';

// 星期對應中文
const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

// 將動畫依照 weekday 分組
function groupByWeekday(animeList: Anime[]) {
  const groups: { [key: string]: Anime[] } = {};
  WEEKDAYS.forEach((w) => (groups[w] = []));
  animeList.forEach((anime) => {
    const day = anime.weekday;
    if (groups[day]) {
      groups[day].push(anime);
    } else {
      groups[day] = [anime];
    }
  });
  return groups;
}

type Props = {
  animeList: Anime[];
};

const AnimeList: React.FC<Props> = ({ animeList }) => {
  const grouped = groupByWeekday(animeList);

  return (
    <div>
      {WEEKDAYS.map((weekday) =>
        grouped[weekday] && grouped[weekday].length > 0 ? (
          <div key={weekday} style={{ marginBottom: 32 }}>
            <h2
              style={{
                margin: '16px 0 12px 0',
                color: '#1976d2',
                fontSize: 20,
              }}
            >
              星期{weekday}
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
                gap: 20,
              }}
            >
              {grouped[weekday].map((anime) => (
                <AnimeCard key={anime.id} anime={anime} />
              ))}
            </div>
          </div>
        ) : null,
      )}
    </div>
  );
};

export default AnimeList;
