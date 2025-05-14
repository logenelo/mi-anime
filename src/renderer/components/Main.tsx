import React, { useEffect, useRef, useState } from 'react';
import { Box, Container } from '@mui/material';
import BottomNavBar from './BottomNavBar';
import DefaultBG from '../../../assets/background/background-1.jpg';

type MainProps = {
  children: React.ReactNode;
};

const Main: React.FC<MainProps> = ({ children }) => {
  const [bgUrl, setBgUrl] = useState<string>(() => {
    return localStorage.getItem('anime_bg') || DefaultBG;
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
    let x = 0,
      y = 0;
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
    const moveSpeed = 0.04; // 動畫速度
    const minDelta = 0.5; // 最小移動閾值，單位: px
    const animate = () => {
      const current = currentRef.current;
      const dx = targetTransform[0] - current[0];
      const dy = targetTransform[1] - current[1];
      // 若移動距離很小則直接停止動畫
      if (Math.abs(dx) < minDelta && Math.abs(dy) < minDelta) {
        current[0] = targetTransform[0];
        current[1] = targetTransform[1];
        setBgTransform(`translate(${current[0]}px, ${current[1]}px)`);
        animationRef.current && cancelAnimationFrame(animationRef.current);
        return;
      }
      current[0] += dx * moveSpeed;
      current[1] += dy * moveSpeed;
      setBgTransform(`translate(${current[0]}px, ${current[1]}px)`);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      animationRef.current && cancelAnimationFrame(animationRef.current);
    };
    // eslint-disable-next-line
  }, [targetTransform]);

  useEffect(() => {
    // 根據滑鼠位置移動背景
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const xPercent = (e.clientX / innerWidth - 0.5) * 2; // -1 ~ 1
      const yPercent = (e.clientY / innerHeight - 0.5) * 2; // -1 ~ 1
      const maxOffset = 75;
      setTargetTransform([xPercent * maxOffset, yPercent * maxOffset]);
      // 記錄滑鼠位置供初始化用
      (window as any).mouseX = e.clientX;
      (window as any).mouseY = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '120vw',
          height: '120vh',
          left: '-10vw',
          top: '-10vh',
          background: `url('${bgUrl}') center center / cover no-repeat`,
          transition: 'background-image 0.5s ease-in-out',
          transform: bgTransform,
        }}
      />
      <Box
        sx={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          bgcolor: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <Container
          maxWidth="lg"
          sx={{
            flex: 1,
            overflowY: 'auto',
            pb: 8,
            pt: 2,
            px: 2,
          }}
        >
          {children}
        </Container>
        <BottomNavBar />
      </Box>
    </Box>
  );
};

export default Main;
