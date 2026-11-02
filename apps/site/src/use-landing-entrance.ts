import { useCallback, useLayoutEffect, useRef, useState } from 'react';

/** One-shot foreground entry; layout and every failure path remain normal document flow. */
export function useLandingEntrance() {
  const page = useRef<HTMLDivElement>(null), hero = useRef<HTMLDivElement>(null);
  const header = useRef<HTMLElement>(null), card = useRef<HTMLElement>(null);
  const [phase, setPhase] = useState<'visible' | 'pending' | 'enter' | 'shown'>('visible');
  const completed = useRef(false);
  const show = useCallback(() => { completed.current = true; setPhase('shown'); }, []);
  const finish = useCallback(() => { completed.current = true; setPhase('shown'); }, []);
  useLayoutEffect(() => {
    const surface = hero.current, top = header.current, plane = page.current, target = card.current;
    if (!surface || !top || !plane || !target) return;
    const previous = surface.style.getPropertyValue('--entry-intro-offset');
    const previousLayout = surface.getAttribute('data-entry-layout');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const mobile = window.matchMedia('(max-width: 64rem)');
    let observer: IntersectionObserver | undefined, resize: ResizeObserver | undefined, disposed = false;
    const reveal = () => { if (!disposed) { observer?.disconnect(); show(); } };
    const measure = () => {
      const content = surface.parentElement;
      const offset = top.getBoundingClientRect().height + (parseFloat(getComputedStyle(plane).paddingTop) || 0) + (content ? parseFloat(getComputedStyle(content).rowGap) || 0 : 0);
      surface.style.setProperty('--entry-intro-offset', `${offset}px`);
      surface.setAttribute('data-entry-layout', 'measured');
    };
    const adapt = () => { measure(); if (reduced.matches || !mobile.matches || window.scrollY > 0) reveal(); };
    const restored = (event: PageTransitionEvent) => { if (event.persisted || window.scrollY > 0) reveal(); };
    try {
      measure();
      if (typeof ResizeObserver !== 'undefined') { resize = new ResizeObserver(measure); resize.observe(top); }
      if (reduced.matches || window.scrollY > 0 || completed.current) reveal();
      else if (!mobile.matches) setPhase('enter');
      else if (typeof IntersectionObserver === 'undefined') reveal();
      else {
        const initialScroll = window.scrollY;
        observer = new IntersectionObserver(entries => {
          if (!disposed && !completed.current && entries.some(e => e.isIntersecting && e.intersectionRatio >= .08) && window.scrollY > initialScroll) {
            completed.current = true; observer?.disconnect(); setPhase('enter');
          }
        }, { threshold: .08 });
        setPhase('pending'); observer.observe(target);
      }
    } catch { reveal(); }
    window.addEventListener('resize', adapt);
    window.addEventListener('pageshow', restored);
    reduced.addEventListener?.('change', adapt); mobile.addEventListener?.('change', adapt);
    return () => {
      disposed = true; observer?.disconnect(); resize?.disconnect();
      window.removeEventListener('resize', adapt); window.removeEventListener('pageshow', restored);
      reduced.removeEventListener?.('change', adapt); mobile.removeEventListener?.('change', adapt);
      previous ? surface.style.setProperty('--entry-intro-offset', previous) : surface.style.removeProperty('--entry-intro-offset');
      previousLayout === null ? surface.removeAttribute('data-entry-layout') : surface.setAttribute('data-entry-layout', previousLayout);
    };
  }, [show]);
  return { page, hero, header, card, phase, show, finish };
}
