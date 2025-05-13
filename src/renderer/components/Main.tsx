import React, { useEffect, useRef, useState } from 'react';
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

  useEffect(() => {
    // 監聽設定頁面可能變更背景
    const onStorage = () => {
      setBgUrl(localStorage.getItem('anime_bg') || DefaultBG);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    // 動畫平滑過渡
    let current = [0, 0];
    const maxOffset = 32;
    const animate = () => {
      // 緩動到目標位置
      current[0] += (targetTransform[0] - current[0]) * 0.08;
      current[1] += (targetTransform[1] - current[1]) * 0.08;
      setBgTransform(`translate(${current[0]}px, ${current[1]}px)`);
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current !== undefined) {
        cancelAnimationFrame(animationRef.current);
      }
    };
    // eslint-disable-next-line
  }, [targetTransform[0], targetTransform[1]]);

  useEffect(() => {
    // 根據滑鼠位置移動背景
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      // 計算滑鼠在畫面中的百分比
      const xPercent = (e.clientX / innerWidth - 0.5) * 2; // -1 ~ 1
      const yPercent = (e.clientY / innerHeight - 0.5) * 2; // -1 ~ 1
      // 最大偏移量
      const maxOffset = 32;
      setBgTransform(
        `translate(${xPercent * maxOffset}px, ${yPercent * maxOffset}px)`,
      );
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100vh',
        overflow: 'hidden',
      }}
    >
      {/* 背景圖層，含模糊與滑鼠位移效果 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 0,
          width: '120vw',
          height: '120vh',
          left: '-10vw',
          top: '-10vh',
          background: `url('${bgUrl}') center center / cover no-repeat`,
          transition: 'background-image 0.5s',
          transform: bgTransform,
          transitionTimingFunction: 'ease-in-out',
        }}
      />
      {/* 前景內容層 */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: '100vh',
          background: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(2px)',
        }}
      >
        <div
          style={{ flex: 1, overflowY: 'auto', paddingBottom: 60, padding: 8 }}
        >
          {children}
        </div>
        <BottomNavBar />
      </div>
    </div>
  );
};

export default Main;
