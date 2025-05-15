import React, { useCallback, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  TextField,
  Typography,
  Divider,
  Stack,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import LinkIcon from '@mui/icons-material/Link';

interface UploadDialogProps {
  open: boolean;
  onClose: () => void;
  onUpload: (files: File[] | string) => void;

  maxSize?: number;
}

const UploadDialog: React.FC<UploadDialogProps> = ({
  open,
  onClose,
  onUpload,
  maxSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejectedFiles: any[]) => {
      if (rejectedFiles.length > 0) {
        setError('檔案大小不能超過 10MB');
        return;
      }
      onUpload(acceptedFiles);
      onClose();
    },
    [onUpload, onClose],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxSize,
    multiple: true,
  });

  const handleUrlUpload = () => {
    if (!url) {
      setError('請輸入圖片網址');
      return;
    }
    onUpload(url);
    onClose();
    setUrl('');
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>上傳背景圖片</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {/* Dropzone Area */}
          <Box
            {...getRootProps()}
            sx={{
              border: '2px dashed',
              borderColor: isDragActive ? 'primary.main' : 'grey.300',
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              cursor: 'pointer',
              bgcolor: isDragActive ? 'action.hover' : 'background.paper',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <input {...getInputProps()} />
            <CloudUploadIcon
              sx={{ fontSize: 40, color: 'primary.main', mb: 1 }}
            />
            <Typography>
              {isDragActive ? '放開以上傳圖片' : '拖曳圖片至此或點擊上傳'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              支援 jpg、png、gif 格式，檔案大小不超過 10MB
            </Typography>
          </Box>

          <Divider>或</Divider>

          {/* URL Input */}
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              從網址上傳
            </Typography>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                placeholder="輸入圖片網址"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                error={!!error}
                helperText={error}
                size="small"
              />
              <Button
                variant="contained"
                onClick={handleUrlUpload}
                startIcon={<LinkIcon />}
              >
                上傳
              </Button>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>取消</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
