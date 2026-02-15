/**
 * Footer Component
 * Site footer with links and information
 */

import { APP_INFO, LINKS } from '../../config/constants';

const Footer = () => {
  return (
    <footer className="py-12 px-6 border-t border-primary/10 bg-background-light dark:bg-background-dark text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">
            {APP_INFO.name} v{APP_INFO.version}
          </span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <span className="text-sm">Powered by AI Background Removal</span>
        </div>
        <div className="flex gap-8 text-sm">
          <a className="hover:text-accent transition-colors" href={LINKS.privacy}>
            Privacy Policy
          </a>
          <a className="hover:text-accent transition-colors" href={LINKS.terms}>
            Terms of Use
          </a>
          <a className="hover:text-accent transition-colors" href={LINKS.docs}>
            Documentation
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
