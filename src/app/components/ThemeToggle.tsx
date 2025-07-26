import {Moon, Sun} from 'lucide-react';
import {Button} from './ui/button';
import {useTheme} from '../contexts/ThemeContext';

export function ThemeToggle() {
	const {theme, toggleTheme} = useTheme();

	return (
		<Button
			variant="outline"
			size="icon"
			onClick={toggleTheme}
			aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
		>
			{theme === 'light' ? <Moon className="h-[1.2rem] w-[1.2rem]" /> : <Sun className="h-[1.2rem] w-[1.2rem]" />}
			<span className="sr-only">Toggle theme</span>
		</Button>
	);
}
