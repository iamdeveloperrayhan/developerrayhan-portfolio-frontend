import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import clsx from 'clsx'

export default function ThemeToggle({ className }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <button
      onClick={toggleTheme}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
      className={clsx(
        'grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted transition-colors hover:text-accent',
        className
      )}
    >
      {isDark ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
