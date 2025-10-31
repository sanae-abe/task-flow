import { useState, useEffect } from 'react';

const FIRST_TIME_USER_KEY = 'taskflow-first-time-user';

interface FirstTimeUserState {
  isFirstTimeUser: boolean;
  hasShownHint: boolean;
  isLoading: boolean;
}

export const useFirstTimeUser = () => {
  const [state, setState] = useState<FirstTimeUserState>({
    isFirstTimeUser: false,
    hasShownHint: false,
    isLoading: true,
  });

  useEffect(() => {
    try {
      const savedValue = localStorage.getItem(FIRST_TIME_USER_KEY);
      const isFirstTime = !savedValue;

      setState({
        isFirstTimeUser: isFirstTime,
        hasShownHint: false,
        isLoading: false,
      });
    } catch (_error) {
      // LocalStorage エラーの場合は初回ユーザーとして扱わない
      setState({
        isFirstTimeUser: false,
        hasShownHint: false,
        isLoading: false,
      });
    }
  }, []);

  const markAsExistingUser = () => {
    try {
      localStorage.setItem(FIRST_TIME_USER_KEY, 'false');
      setState(prev => ({
        ...prev,
        isFirstTimeUser: false,
      }));
    } catch (_error) {
      // LocalStorage エラーの場合は何もしない
    }
  };

  const markHintAsShown = () => {
    setState(prev => ({
      ...prev,
      hasShownHint: true,
    }));
  };

  const shouldShowHint =
    state.isFirstTimeUser && !state.hasShownHint && !state.isLoading;

  return {
    isFirstTimeUser: state.isFirstTimeUser,
    isLoading: state.isLoading,
    shouldShowHint,
    markAsExistingUser,
    markHintAsShown,
  };
};
