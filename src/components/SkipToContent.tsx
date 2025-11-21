import { useEffect, useState } from 'react';

export const SkipToContent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleFocus = () => setIsVisible(true);
    const handleBlur = () => setIsVisible(false);

    const skipLink = document.getElementById('skip-to-content');
    skipLink?.addEventListener('focus', handleFocus);
    skipLink?.addEventListener('blur', handleBlur);

    return () => {
      skipLink?.removeEventListener('focus', handleFocus);
      skipLink?.removeEventListener('blur', handleBlur);
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.focus();
      mainContent.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a
      id="skip-to-content"
      href="#main-content"
      onClick={handleClick}
      className={`
        fixed top-4 left-4 z-[100] 
        bg-primary text-primary-foreground 
        px-4 py-2 rounded-md font-medium
        transition-transform duration-200
        focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2
        ${isVisible ? 'translate-y-0' : '-translate-y-20'}
      `}
      aria-label="Skip to main content"
    >
      Skip to content
    </a>
  );
};
