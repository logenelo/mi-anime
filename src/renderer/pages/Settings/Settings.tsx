import React, { useState, useRef, useCallback } from 'react';
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Alert,
  Stack,
  ImageList,
  IconButton,
  FormControlLabel,
  Divider,
  Slider,
  RadioGroup,
  Radio,
} from '@mui/material';
import { Add } from '@mui/icons-material';
import PaletteIcon from '@mui/icons-material/Palette';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import UploadDialog from '../../components/UploadDialog';
import DefaultBG from '../../../../assets/background/background-1.jpg';
import ImageCard from './components/ImageCard';
import { compressImage } from '../../utils/imageUtils';
import useCustomSetting from '../../hooks/useCustomSetting';
import { UserPreferences } from '../../types/setting';

interface CustomBackground {
  id: string;
  url: string;
  timestamp: number;
}

const Settings: React.FC = () => {
  const [backgrounds, setBackgrounds] = useState<CustomBackground[]>(() => {
    try {
      const stored = localStorage.getItem('custom_backgrounds');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading backgrounds:', error);
      return [];
    }
  });

  const [currentBg, setCurrentBg] = useState<string>(
    () => localStorage.getItem('anime_bg') || DefaultBG,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [preferences, setPreferences] = useCustomSetting();

  const addNewBackground = async (imageData: string) => {
    // Compress image before saving
    const compressed = await compressImage(imageData, 1920, 0.8);
    const newBackground: CustomBackground = {
      id: Date.now().toString(),
      url: compressed,
      timestamp: Date.now(),
    };
    setBackgrounds((prev) => {
      const updated = [...prev, newBackground];
      localStorage.setItem('custom_backgrounds', JSON.stringify(updated));
      return updated;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target;
    console.log('Selected files:', files);
    if (!files || files.length === 0) return;

    let hasLargeFile = false;

    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        hasLargeFile = true;
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        addNewBackground(result);
      };
      reader.readAsDataURL(file);
    });

    if (hasLargeFile) {
      setErrorMsg('圖片大小不能超過 10MB');
    } else {
      setErrorMsg(null);
    }
  };

  const handleUpload = async (filesOrUrl: File[] | string) => {
    if (typeof filesOrUrl === 'string') {
      // Handle URL upload
      try {
        const response = await fetch(filesOrUrl);
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          addNewBackground(result);
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        setErrorMsg('無法載入圖片，請確認網址是否正確');
      }
    } else {
      // Handle file upload
      filesOrUrl.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result as string;
          addNewBackground(result);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSelect = useCallback((bg: string) => {
    setCurrentBg(bg);
    // Debounce localStorage update and event dispatch
    const timeoutId = setTimeout(() => {
      localStorage.setItem('anime_bg', bg);
      window.dispatchEvent(new Event('storage'));
    }, 100);
    return () => clearTimeout(timeoutId);
  }, []);

  const handleDelete = (id: string) => {
    setBackgrounds((prev) => {
      const updated = prev.filter((bg) => bg.id !== id);
      localStorage.setItem('custom_backgrounds', JSON.stringify(updated));
      return updated;
    });

    // If deleted background was selected, reset to default
    if (backgrounds.find((bg) => bg.id === id)?.url === currentBg) {
      handleSelect(DefaultBG);
    }
  };

  const updatePreferences = useCallback((updates: Partial<UserPreferences>) => {
    setPreferences(updates);
  }, []);

  // Add lazy loading for images
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  return (
    <Box sx={{ p: 2 }}>
      {/* Theme Settings */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <PaletteIcon color="primary" />
            <Typography variant="h6">外觀設定</Typography>
          </Stack>

          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                主題設定
              </Typography>
              <RadioGroup
                row
                name="theme"
                aria-label="theme"
                value={preferences.theme}
                onChange={(e) =>
                  updatePreferences({
                    theme: e.target.value as UserPreferences['theme'],
                  })
                }
              >
                <FormControlLabel
                  value="light"
                  control={<Radio size="small" />}
                  label="淺色主題"
                />
                <FormControlLabel
                  value="dark"
                  control={<Radio size="small" />}
                  label="深色主題"
                />
              </RadioGroup>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" gutterBottom>
                背景模糊程度
              </Typography>
              <Box px={1.5}>
                <Slider
                  value={preferences.blurAmount}
                  min={0}
                  max={10}
                  step={0.5}
                  marks
                  valueLabelDisplay="auto"
                  onChange={(_, value) =>
                    updatePreferences({ blurAmount: value as number })
                  }
                />
              </Box>
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
            <ViewModuleIcon color="primary" />
            <Typography variant="h6">背景圖片設定</Typography>
          </Stack>

          <Alert severity="info" sx={{ mb: 3 }}>
            支援 jpg、png 格式，檔案大小不超過 10MB
          </Alert>

          {/* Current Background Preview */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              目前背景
            </Typography>
            <CardMedia
              component="img"
              image={currentBg}
              alt="Current background"
              sx={{
                width: '100%',

                objectFit: 'cover',
                borderRadius: 1,
              }}
            />
          </Box>

          {/* Background List */}
          <Box sx={{ mb: 2 }}>
            <Stack spacing="2px" direction="row" alignItems="center">
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                自訂背景列表
              </Typography>
              <IconButton
                size="small"
                color="primary"
                sx={{ p: 0 }}
                onClick={() => setIsUploadDialogOpen(true)}
              >
                <Add sx={{ fontSize: '1rem' }} />
              </IconButton>
            </Stack>
            <ImageList cols={3} gap={8}>
              <ImageCard
                src={DefaultBG}
                isSelected={currentBg === DefaultBG}
                onSelect={() => handleSelect(DefaultBG)}
              />
              {backgrounds.map((bg) => (
                <ImageCard
                  key={bg.id}
                  src={bg.url}
                  isSelected={currentBg === bg.url}
                  onSelect={() => handleSelect(bg.url)}
                  onDelete={() => handleDelete(bg.id)}
                  isLoaded={loadedImages.has(bg.url)}
                  onLoad={() =>
                    setLoadedImages((prev) => new Set([...prev, bg.url]))
                  }
                />
              ))}
            </ImageList>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            accept="image/*"
            onChange={handleFileChange}
          />
        </CardContent>
      </Card>
      <UploadDialog
        open={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onUpload={handleUpload}
        maxSize={10 * 1024 * 1024}
      />
    </Box>
  );
};

export default Settings;
