import styled from 'styled-components';
import { Text } from "@primer/react";

/**
 * ゴミ箱ビューのスタイル定義
 * インラインスタイルから styled-components への移行
 */

export const Container = styled.div`
  padding-bottom: 16px;
`;

export const EmptyStateContainer = styled.div`
  text-align: center;
  padding-block: 24px;
  border: 1px dashed var(--borderColor-muted);
  border-radius: var(--borderRadius-medium);
  display: flex;
  flex-direction: column;
  gap: 12px;
  justify-content: center;
  align-items: center;
  margin-bottom: 16px;
  color: var(--fgColor-muted);
`;

export const EmptyStateContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const EmptyStateTitle = styled(Text).attrs({ as: 'h2' })`
  font-size: 18px;
  font-weight: 600;
  color: var(--fgColor-default);
`;

export const EmptyStateDescription = styled(Text)`
  color: var(--fgColor-muted);
  font-size: 14px;
`;

export const HeaderContainer = styled.div`
  margin-bottom: 16px;
`;

export const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const HeaderTitle = styled(Text).attrs({ as: 'h2' })`
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const EmptyButtonContent = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const TaskCount = styled.div`
  margin-top: 12px;
  margin-bottom: 12px;
  color: var(--fgColor-muted);
  font-size: 14px;
`;

export const WarningContainer = styled.div`
  margin-bottom: 12px;
`;

export const TaskGrid = styled.div`
  display: grid;
  gap: 12px;
`;

export const TaskItemContainer = styled.div`
  border: 1px solid var(--borderColor-default);
  border-radius: 6px;
  padding: 12px;
  background-color: var(--color-neutral-100);
  opacity: 0.8;
`;

export const TaskHeader = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const TaskTitleContainer = styled.div`
  flex: 1;
`;

export const TaskTitle = styled(Text).attrs({ as: 'h3' })`
  font-size: 14px;
  font-weight: bold;
`;

export const TaskActionsContainer = styled.div`
  display: flex;
  gap: 8px;
`;

export const TaskMetaContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: var(--fgColor-muted);
`;

export const TaskMetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const TaskDescription = styled.div`
  margin-top: 8px;
  background-color: var(--color-canvas-default);
  border-radius: 4px;
`;

export const TaskDescriptionText = styled(Text)`
  font-size: 0;
  color: fg.muted;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;