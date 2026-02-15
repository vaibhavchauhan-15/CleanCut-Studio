/**
 * Navigation Component
 * Top navigation bar with logo and links
 */

import { APP_INFO, LINKS } from '../../config/constants';
import { useImageContext } from '../../contexts/useImageContext';

const Navigation = () => {
  const { isWebGPUActive } = useImageContext();

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-primary/10 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
            <span className="material-icons-round text-background-dark text-xl">
              auto_fix_high
            </span>
          </div>
          <span className="text-xl font-bold tracking-tight">
            {APP_INFO.name.split(' ')[0]}
            <span className="text-accent">{APP_INFO.name.split(' ')[1]}</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          {isWebGPUActive && (
            <div className="hidden md:flex items-center gap-2 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              WebGPU ACTIVE
            </div>
          )}
          <a
            className="flex items-center gap-2 text-sm font-medium hover:text-accent transition-colors"
            href={LINKS.github}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
