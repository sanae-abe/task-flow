import React from 'react';
import { Languages, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLanguage, type Language } from '@/contexts/LanguageContext';

interface LanguageOption {
  value: Language;
  label: string;
  nativeLabel: string;
}

const LANGUAGE_OPTIONS: LanguageOption[] = [
  { value: 'ja', label: 'Japanese', nativeLabel: '日本語' },
  { value: 'en', label: 'English', nativeLabel: 'English' },
];

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const currentLanguageLabel =
    LANGUAGE_OPTIONS.find(option => option.value === language)?.nativeLabel ||
    '日本語';

  const handleLanguageChange = (value: string) => {
    if (value === 'ja' || value === 'en') {
      setLanguage(value);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='sm'
          className='flex items-center gap-2'
          aria-label='言語切り替え'
        >
          <Languages size={16} />
          <span className='text-sm'>{currentLanguageLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuRadioGroup
          value={language}
          onValueChange={handleLanguageChange}
        >
          {LANGUAGE_OPTIONS.map(option => (
            <DropdownMenuRadioItem
              key={option.value}
              value={option.value}
              className='flex items-center justify-between cursor-pointer'
            >
              <span>{option.nativeLabel}</span>
              {language === option.value && <Check size={16} />}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
