import { useCallback, useEffect, useRef, useState } from 'react';

interface ResizableSidebarProps {
  children: React.ReactNode;
  /** Initial width in px */
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

/**
 * Wraps sidebar children in a container whose width the user can drag.
 * The drag handle is a 4px vertical strip rendered at the right edge.
 */
export function ResizableSidebar({
  children,
  defaultWidth = 280,
  minWidth = 200,
  maxWidth = 480,
}: ResizableSidebarProps) {
  const [width, setWidth] = useState(defaultWidth);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startWidth = useRef(defaultWidth);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    startX.current = e.clientX;
    startWidth.current = width;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [width]);

  const onPointerMove = useCallback((e: PointerEvent) => {
    if (!dragging) return;
    const delta = e.clientX - startX.current;
    const next = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta));
    setWidth(next);
  }, [dragging, minWidth, maxWidth]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener('pointermove', onPointerMove);
      window.addEventListener('pointerup', onPointerUp);
    }
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
    };
  }, [dragging, onPointerMove, onPointerUp]);

  return (
    <div
      className="hidden md:flex h-full flex-shrink-0"
      style={{ width, minWidth: width, maxWidth: width }}
    >
      {/* Sidebar content */}
      <div className="flex-1 overflow-hidden h-full">{children}</div>

      {/* Drag handle */}
      <div
        id="sidebar-resize-handle"
        className={`sp-resize-handle${dragging ? ' dragging' : ''}`}
        onPointerDown={onPointerDown}
        title="Drag to resize sidebar"
        style={{ cursor: 'col-resize' }}
      />
    </div>
  );
}
