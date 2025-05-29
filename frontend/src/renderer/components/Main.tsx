import React, { useEffect, useRef, useState } from 'react';
import { Box, Container, useTheme } from '@mui/material';
import BottomNavBar from './BottomNavBar';
import DefaultBG from '../../../assets/background/background-1.jpg';
import AnimeDetailDrawer from './AnimeDetailDrawer';

type MainProps = {
  children: React.ReactNode;
};

const Main: React.FC<MainProps> = ({ children }) => {
  const theme = useTheme();
  const { mode } = theme.palette;

  const [bgUrl, setBgUrl] = useState<string>(() => {
    return localStorage.getItem('anime_bg') || DefaultBG;
  });
  const [blur, setBlur] = useState<number>(() => {
    return parseInt(localStorage.getItem('blur_amount') || '0', 10);
  });
  const [targetTransform, setTargetTransform] = useState<[number, number]>([
    0, 0,
  ]);
  const [bgTransform, setBgTransform] = useState<string>('translate(0px, 0px)');
  const animationRef = useRef<number>();
  const currentRef = useRef<[number, number]>([0, 0]);

  // 初始化 currentRef 為滑鼠初始位置
  useEffect(() => {
    const { innerWidth, innerHeight } = window;
    // 預設為畫面中央
    let x = 0;
    let y = 0;
    if (typeof window !== 'undefined') {
      // 取得目前滑鼠位置，若無則為中央
      x = (window as any).mouseX ?? innerWidth / 2;
      y = (window as any).mouseY ?? innerHeight / 2;
    }
    const xPercent = (x / innerWidth - 0.5) * 2;
    const yPercent = (y / innerHeight - 0.5) * 2;
    const maxOffset = 75;
    const initPos: [number, number] = [
      xPercent * maxOffset,
      yPercent * maxOffset,
    ];
    currentRef.current = [...initPos];
    setTargetTransform(initPos);
    setBgTransform(`translate(${initPos[0]}px, ${initPos[1]}px)`);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // 監聽設定頁面可能變更背景
    const onStorage = () => {
      setBgUrl(localStorage.getItem('anime_bg') || DefaultBG);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // 監聽設定頁面可能變更模糊度
    const onStorage = () => {
      const stored = localStorage.getItem('user_preferences');
      let blurAmount = 0;
      if (stored) {
        const prefs = JSON.parse(stored);
        blurAmount = prefs.blurAmount || 0;
      }
      setBlur(blurAmount);
    };
    window.addEventListener('storagePreferences', onStorage);
    return () => window.removeEventListener('storagePreferences', onStorage);
  }, []);

  useEffect(() => {
    const moveSpeed = 0.04; // 動畫速度
    const minDelta = 0.5; // 最小移動閾值，單位: px
    const animate = () => {
      const { current } = currentRef;
      const dx = targetTransform[0] - current[0];
      const dy = targetTransform[1] - current[1];
      // 若移動距離很小則直接停止動畫
      if (Math.abs(dx) < minDelta && Math.abs(dy) < minDelta) {
        [current[0], current[1]] = targetTransform;
        setBgTransform(`translate(${current[0]}px, ${current[1]}px)`);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        return;
      }
      current[0] += dx * moveSpeed;
      current[1] += dy * moveSpeed;
      setBgTransform(`translate(${current[0]}px, ${current[1]}px)`);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line
  }, [targetTransform]);

  useEffect(() => {
    // 根據滑鼠位置移動背景
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;

      // Calculate the maximum offset to prevent empty space
      const maxOffsetX = (innerWidth * 0.2) / 2;
      const maxOffsetY = (innerHeight * 0.2) / 2;

      // Calculate the percentage offset based on mouse position
      const xPercent = (e.clientX / innerWidth - 0.5) * 2; // -1 to 1
      const yPercent = (e.clientY / innerHeight - 0.5) * 2; // -1 to 1

      // Apply the calculated offsets
      setTargetTransform([xPercent * maxOffsetX, yPercent * maxOffsetY]);

      // Record mouse position for initialization
      (window as any).mouseX = e.clientX;
      (window as any).mouseY = e.clientY;
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <>
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: '100vh',
          overflow: 'hidden',

          scrollbarColor: `${theme.palette.primary.dark} ${theme.palette.background.default} `,
        }}
      >
        <Box
          id="background"
          sx={{
            position: 'absolute',
            top: '-10vh',
            left: '-10vw',
            width: '120vw',
            height: '120vh',
            backgroundImage: `url(${bgUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: 'background-image 0.5s ease-in-out',
            zIndex: 0,
          }}
          style={{ transform: bgTransform }}
        />

        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: '100vh',
            bgcolor:
              mode === 'dark' ? 'rgba(0,0,0,0.70)' : 'rgba(255,255,255,0.70)',
            backdropFilter: `blur(${blur}px)`,
            WebkitBackdropFilter: `blur(${blur}px)`,
            transition: 'backdrop-filter 0.3s ease-in-out',
          }}
        >
          <Box
            className="titlebar"
            sx={{
              height: 32,
              background: theme.palette.background.default,
              color: theme.palette.primary.dark,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              appRegion: 'drag',
            }}
          >
            MiAnime
          </Box>
          <Box
            width={1}
            flex={1}
            display="flex"
            mb={8}
            sx={{ overflowY: 'auto', WebkitOverflowScrolling: 'touch' }}
          >
            <Container
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                pb: 8,
                pt: 2,
                px: { xs: 1, sm: 2 },
              }}
            >
              {children}
            </Container>
          </Box>

          <BottomNavBar />
        </Box>
      </Box>
      <AnimeDetailDrawer />
    </>
  );
};

export default Main;
