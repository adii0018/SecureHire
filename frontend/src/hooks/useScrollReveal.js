import { useEffect, useRef } from 'react';

export default function useScrollReveal(options = {}) {
  const elementRef = useRef(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Set initial state
    element.style.opacity = '0';
    element.style.transform = 'translateY(24px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            
            // Stagger children if they exist
            const children = entry.target.children;
            Array.from(children).forEach((child, index) => {
              child.style.transitionDelay = `${index * 0.08}s`;
            });
          }
        });
      },
      {
        threshold: 0.1,
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return elementRef;
}
