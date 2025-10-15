import styled from 'styled-components';
import { Text } from "@primer/react";

/**
 * ゴミ箱設定パネルのスタイル定義
 * インラインスタイルから styled-components への移行
 */

export const Container = styled.div`
  padding-bottom: 16px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
`;

export const HeaderTitle = styled(Text).attrs({ as: 'h2' })`
  font-size: 16px;
  font-weight: bold;
  margin: 0;
`;

export const Description = styled(Text)`
  color: var(--fgColor-muted);
  font-size: 14px;
  margin-bottom: 20px;
  display: block;
`;

export const PresetSection = styled.div`
  margin-bottom: 16px;
`;

export const PresetTitle = styled(Text)`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 8px;
  display: block;
`;

export const PresetButtonsContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const RetentionInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const RetentionUnit = styled(Text)`
  color: var(--fgColor-muted);
`;

export const SaveSection = styled.div`
  margin-top: 24px;
`;

export const SaveMessageContainer = styled.div`
  margin-top: 12px;
`;

export const ImportantNote = styled.div`
  margin-top: 20px;
`;