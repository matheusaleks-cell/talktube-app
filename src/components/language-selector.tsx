'use client';

import * as React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/data.tsx';
import { Globe, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

type LanguageSelectorProps = {
  onLanguageChange: (language: string) => void;
};


export function LanguageSelector({ onLanguageChange }: LanguageSelectorProps) {
  const [selectedLanguage, setSelectedLanguage] = React.useState('Original');
  const [isAnimating, setIsAnimating] = React.useState(false);
  const { toast } = useToast();

  const handleValueChange = (value: string) => {
    setSelectedLanguage(value);
    onLanguageChange(value);
    setIsAnimating(true);
    toast({
        title: `Canal de áudio alterado para ${value}`,
        description: 'Você agora está ouvindo a interpretação neste idioma.',
    })
    setTimeout(() => setIsAnimating(false), 1000);
  };

  return (
    <div className="relative">
      <Select onValueChange={handleValueChange} defaultValue="Original">
        <SelectTrigger className="w-full min-w-[200px]">
            <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Canal de Idioma" />
            </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Original">Original</SelectItem>
          {languages.map((lang) => (
            <SelectItem key={lang} value={lang}>
              {lang}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <div
        className={cn(
          'absolute inset-0 z-10 flex items-center justify-center space-x-2 rounded-md bg-primary text-primary-foreground transition-opacity duration-300 pointer-events-none',
          isAnimating ? 'opacity-100' : 'opacity-0'
        )}
      >
        <CheckCircle className="h-5 w-5" />
        <span className="font-medium">{selectedLanguage}</span>
      </div>
    </div>
  );
}
