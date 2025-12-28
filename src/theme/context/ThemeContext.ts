import { ThemeContextType } from '@/theme/types';
import { createContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | null>(null);
