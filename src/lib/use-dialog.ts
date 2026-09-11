"use client";

import { useLayoutEffect, type RefObject } from "react";
import { useLenis } from "lenis/react";
import type Lenis from "lenis";

const locks = new Set<symbol>();
let savedOverflow = "";
const lenisLocks = new WeakMap<Lenis, { count: number; stopped: boolean }>();

const focusable = 'a[href],button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

/** Isolate the dialog's sibling branches, preserving existing inert/scroll state. */
export function useDialog(open: boolean, ref: RefObject<HTMLElement | null>, close: () => void, returnFocus?: RefObject<HTMLElement | null>) {
  const lenis = useLenis();
  useLayoutEffect(() => {
    const panel = ref.current;
    if (!open || !panel) return;
    const previousFocus = returnFocus?.current || document.activeElement as HTMLElement | null;
    const token = Symbol('dialog');
    if (!locks.size) savedOverflow = document.body.style.overflow;
    locks.add(token);
    document.body.style.overflow = 'hidden';
    if (lenis) {
      const state = lenisLocks.get(lenis) || { count: 0, stopped: lenis.isStopped };
      state.count++;
      lenisLocks.set(lenis, state);
      lenis.stop();
    }
    const hadPrevent = panel.hasAttribute('data-lenis-prevent');
    panel.setAttribute('data-lenis-prevent', '');
    const isolated: [HTMLElement, boolean][] = [];
    let branch: HTMLElement = panel;
    while (branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling !== branch && sibling instanceof HTMLElement) {
          isolated.push([sibling, sibling.inert]);
          sibling.setAttribute('inert', '');
        }
      }
      if (branch.parentElement === document.body) break;
      branch = branch.parentElement;
    }
    const controls = () => [...panel.querySelectorAll<HTMLElement>(focusable)].filter(el => el.tabIndex >= 0 && el.getClientRects().length && getComputedStyle(el).visibility !== 'hidden' && !el.closest('[inert]'));
    let frame = 0;
    const focusWhenVisible = () => {
      if (getComputedStyle(panel).visibility === 'hidden') {
        frame = requestAnimationFrame(focusWhenVisible);
        return;
      }
      (controls()[0] || panel).focus({ preventScroll: true });
    };
    frame = requestAnimationFrame(focusWhenVisible);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !event.defaultPrevented) { event.preventDefault(); close(); }
      if (event.key !== 'Tab') return;
      const elements = controls();
      event.preventDefault();
      const index = elements.indexOf(document.activeElement as HTMLElement);
      const next = event.shiftKey ? (index <= 0 ? elements.length - 1 : index - 1) : (index + 1) % elements.length;
      (elements[next] || panel).focus({ preventScroll: true });
    };
    const onFocus = (event: FocusEvent) => { if (!panel.contains(event.target as Node) && getComputedStyle(panel).visibility !== 'hidden') (controls()[0] || panel).focus({ preventScroll: true }); };
    document.addEventListener('focusin', onFocus);
    document.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('focusin', onFocus);
      isolated.forEach(([element, inert]) => { element.inert = inert; });
      locks.delete(token);
      if (!locks.size) document.body.style.overflow = savedOverflow;
      if (!hadPrevent) panel.removeAttribute('data-lenis-prevent');
      if (lenis) {
        const state = lenisLocks.get(lenis);
        if (state && --state.count === 0) {
          if (!state.stopped) lenis.start();
          lenisLocks.delete(lenis);
        }
      }
      if (previousFocus?.isConnected && !previousFocus.closest('[inert]')) previousFocus.focus({ preventScroll: true });
    };
  }, [open, ref, close, lenis, returnFocus]);
}
