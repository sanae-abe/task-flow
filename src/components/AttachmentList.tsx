import { XIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React from 'react';

import type { FileAttachment } from '../types';
import { formatFileSize, getFileIcon } from '../utils/fileUtils';

interface AttachmentListProps {
  attachments: FileAttachment[];
  onRemoveAttachment: (attachmentId: string) => void;
}

const AttachmentList: React.FC<AttachmentListProps> = ({
  attachments,
  onRemoveAttachment
}) => {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Text sx={{ fontSize: 1, fontWeight: '700', color: 'fg.muted' }}>
        添付ファイル ({attachments.length})
      </Text>
      {attachments.map((attachment) => (
        <Box
          key={attachment.id}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            bg: 'canvas.subtle',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'border.default'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 0 }}>
            {getFileIcon(attachment.type)}
            <Box sx={{ 
              minWidth: 0, 
              flex: 1, 
              display: 'flex', 
              flexDirection: 'column',
              gap: 1
            }}>
              <Text sx={{ 
                fontSize: 1, 
                fontWeight: '700', 
                wordBreak: 'break-word',
                lineHeight: 1.2
              }}>
                {attachment.name}
              </Text>
              <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                {formatFileSize(attachment.size)}
              </Text>
            </Box>
          </Box>
          <Button
            variant="invisible"
            size="small"
            onClick={() => onRemoveAttachment(attachment.id)}
            sx={{ 
              p: 1, 
              color: 'danger.fg',
              '&:hover': {
                color: 'danger.emphasis'
              }
            }}
            aria-label="ファイルを削除"
          >
            <XIcon size={16} />
          </Button>
        </Box>
      ))}
    </Box>
  );
};

export default AttachmentList;