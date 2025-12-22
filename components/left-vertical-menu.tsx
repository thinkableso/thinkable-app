'use client'

// Left vertical menu - calendar and quiz buttons with collapse pill on sidebar right edge
import { useState, useEffect, useRef, useCallback } from 'react'
import { Calendar, HelpCircle } from 'lucide-react'
import { Button } from './ui/button'
import { cn } from '@/lib/utils'

interface LeftVerticalMenuProps {
  studySetId?: string
  conversationId?: string
}

export function LeftVerticalMenu({ studySetId, conversationId }: LeftVerticalMenuProps) {
  const [isHidden, setIsHidden] = useState(false) // Track if menu is hidden
  const [isHovering, setIsHovering] = useState(false) // Track if mouse is hovering over pill
  const [isHoveringMenu, setIsHoveringMenu] = useState(false) // Track if mouse is hovering over menu
  const [isHoveringPill, setIsHoveringPill] = useState(false) // Track if mouse is hovering over pill
  const [menuMode, setMenuMode] = useState<'shown' | 'hidden' | 'hover'>('hover') // Menu visibility mode
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track hide timeout
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Track hover timeout
  const isHoveringRef = useRef(false) // Ref to track hover state for reliable checking
  const menuRef = useRef<HTMLDivElement | null>(null) // Ref to menu element
  const pillRef = useRef<HTMLDivElement | null>(null) // Ref to pill element

  // Load menu mode from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('thinkable-left-menu-mode')
      if (saved === 'shown' || saved === 'hidden' || saved === 'hover') {
        setMenuMode(saved)
        if (saved === 'hidden') {
          setIsHidden(true)
        } else if (saved === 'shown') {
          setIsHidden(false)
        }
      }
    }
  }, [])

  // Save menu mode to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('thinkable-left-menu-mode', menuMode)
    }
  }, [menuMode])

  // Sync menu visibility with mode
  useEffect(() => {
    if (menuMode === 'shown') {
      setIsHidden(false)
    } else if (menuMode === 'hidden') {
      setIsHidden(true)
    } else {
      // Hover mode - show on hover, hide otherwise
      if (!isHovering && !isHoveringMenu && !isHoveringPill) {
        setIsHidden(true)
      }
    }
  }, [menuMode, isHovering, isHoveringMenu, isHoveringPill])

  // Function to check if menu should be hidden
  const checkAndHideMenu = useCallback((relatedTarget?: HTMLElement | null) => {
    // Don't hide if mode is 'shown' or 'hidden' (only hide in 'hover' mode)
    if (menuMode !== 'hover') {
      return
    }

    // Clear any existing hide timeout
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current)
      hideTimeoutRef.current = null
    }

    // Check if relatedTarget is still in menu or pill area
    if (relatedTarget && relatedTarget instanceof HTMLElement) {
      const menuElement = relatedTarget.closest('[data-left-menu-context]')
      const pillElement = relatedTarget.closest('[data-left-menu-pill-context]')
      
      // If moving to another related area, don't hide
      if (menuElement || pillElement) {
        return
      }
    }

    // Small delay to allow transition between areas
    hideTimeoutRef.current = setTimeout(() => {
      // Re-check ref at timeout execution time
      const isInAnyArea = isHoveringRef.current
      
      // If menu is shown and we're not in any related area, hide it
      if (!isHidden && !isInAnyArea && menuMode === 'hover') {
        setIsHidden(true)
      }
    }, 200) // Slight delay to allow moving between areas
  }, [menuMode, isHidden])

  // Keep ref in sync with state
  useEffect(() => {
    isHoveringRef.current = isHovering || isHoveringMenu || isHoveringPill
  }, [isHovering, isHoveringMenu, isHoveringPill])

  // Calculate sidebar width to position menu - get actual sidebar right edge position
  const [sidebarRightEdge, setSidebarRightEdge] = useState(256) // Default expanded sidebar width (w-64 = 256px)
  
  useEffect(() => {
    const updateSidebarRightEdge = () => {
      // Find the actual sidebar element and get its right edge position
      const sidebarElement = document.querySelector('[class*="w-16"], [class*="w-64"]') as HTMLElement
      if (sidebarElement) {
        const rect = sidebarElement.getBoundingClientRect()
        const reactFlowElement = document.querySelector('.react-flow') as HTMLElement
        if (reactFlowElement) {
          const reactFlowRect = reactFlowElement.getBoundingClientRect()
          // Calculate sidebar right edge relative to React Flow container
          const rightEdge = rect.right - reactFlowRect.left
          setSidebarRightEdge(rightEdge)
        } else {
          // Fallback: use class-based calculation
          const isExpanded = sidebarElement.classList.contains('w-64')
          setSidebarRightEdge(isExpanded ? 256 : 64)
        }
      }
    }

    updateSidebarRightEdge()
    window.addEventListener('resize', updateSidebarRightEdge)
    
    // Watch for sidebar state changes
    const sidebarElement = document.querySelector('[class*="w-16"], [class*="w-64"]') as HTMLElement
    const sidebarObserver = sidebarElement ? new MutationObserver(() => {
      updateSidebarRightEdge()
    }) : null
    
    if (sidebarObserver && sidebarElement) {
      sidebarObserver.observe(sidebarElement, {
        attributes: true,
        attributeFilter: ['class']
      })
    }
    
    // Also use ResizeObserver for more accurate tracking
    const resizeObserver = sidebarElement ? new ResizeObserver(() => {
      updateSidebarRightEdge()
    }) : null
    
    if (resizeObserver && sidebarElement) {
      resizeObserver.observe(sidebarElement)
    }
    
    return () => {
      window.removeEventListener('resize', updateSidebarRightEdge)
      if (sidebarObserver) sidebarObserver.disconnect()
      if (resizeObserver) resizeObserver.disconnect()
    }
  }, [])

  // Handle calendar button click
  const handleCalendarClick = () => {
    // TODO: Implement calendar functionality
    console.log('Calendar clicked')
  }

  // Handle quiz button click
  const handleQuizClick = () => {
    // TODO: Implement quiz functionality
    console.log('Quiz clicked')
  }

  const menuWidth = 52 // Same as input box height
  const menuItemSize = 40 // Size of each button
  const menuGap = 8 // Gap between buttons
  const menuTop = 64 // Position below top bar (top bar is 52px + 12px gap)
  const menuTotalHeight = menuItemSize * 2 + menuGap // Total height of menu (2 buttons + gap)
  const pillHeight = 48 // Pill height matches edit menu pill width (w-12 = 48px)
  
  // Calculate pill position to center it vertically in the window
  const [windowHeight, setWindowHeight] = useState(typeof window !== 'undefined' ? window.innerHeight : 800)
  
  useEffect(() => {
    const updateWindowHeight = () => {
      setWindowHeight(window.innerHeight)
    }
    
    updateWindowHeight()
    window.addEventListener('resize', updateWindowHeight)
    
    return () => {
      window.removeEventListener('resize', updateWindowHeight)
    }
  }, [])
  
  // Center pill vertically in window: (window height / 2) - (pill height / 2)
  const pillTop = (windowHeight / 2) - (pillHeight / 2)

  return (
    <>
      {/* Vertical menu - positioned on left side, aligned with sidebar right edge */}
      <div
        ref={menuRef}
        data-left-menu-context
        className={cn(
          'absolute z-20 transition-opacity duration-200 flex flex-col gap-2',
          isHidden ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        )}
        style={{
          left: `${sidebarRightEdge}px`, // Position at sidebar right edge
          top: `${menuTop}px`, // Position below top bar
          width: `${menuWidth}px`,
        }}
        onMouseEnter={() => {
          setIsHoveringMenu(true)
          isHoveringRef.current = true
          // Cancel any pending hide timeout
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
          }
        }}
        onMouseLeave={(e) => {
          setIsHoveringMenu(false)
          // Check if menu should hide after leaving menu
          checkAndHideMenu(e.relatedTarget as HTMLElement)
        }}
      >
        {/* Calendar button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCalendarClick}
          className={cn(
            'w-10 h-10 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#2f2f2f] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors',
            'flex items-center justify-center'
          )}
          title="Calendar"
        >
          <Calendar className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>

        {/* Quiz button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleQuizClick}
          className={cn(
            'w-10 h-10 rounded-lg bg-white dark:bg-[#1f1f1f] border border-gray-200 dark:border-[#2f2f2f] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors',
            'flex items-center justify-center'
          )}
          title="Quiz"
        >
          <HelpCircle className="h-5 w-5 text-gray-700 dark:text-gray-300" />
        </Button>
      </div>

      {/* Collapse pill on sidebar right edge - vertical pill, centered on edge */}
      <div
        ref={pillRef}
        data-left-menu-pill-context
        onClick={() => {
          // Toggle between 'shown' and 'hover' modes
          if (menuMode === 'shown') {
            setMenuMode('hover')
          } else if (menuMode === 'hover') {
            setMenuMode('shown')
          } else {
            // If mode is 'hidden', switch to 'shown' and immediately show menu
            setMenuMode('shown')
            setIsHidden(false)
          }
        }}
        onMouseEnter={() => {
          setIsHoveringPill(true)
          isHoveringRef.current = true
          // Cancel any pending hide timeout
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
          }
          // If menu is hidden and mode is 'hover', show it after a short delay
          if (isHidden && menuMode === 'hover') {
            hoverTimeoutRef.current = setTimeout(() => {
              if (isHidden && menuMode === 'hover') {
                setIsHidden(false)
              }
            }, 100) // 100ms delay - quick response
          }
        }}
        onMouseLeave={(e) => {
          setIsHoveringPill(false)
          // Clear any pending timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
          }
          // Check if menu should hide after leaving pill
          checkAndHideMenu(e.relatedTarget as HTMLElement)
        }}
        className={cn(
          'absolute z-30 w-1.5 rounded-full cursor-pointer transition-all duration-200 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500',
          // Show pill when hovering on it, or always show if menu is hidden (so user can restore it)
          (isHoveringPill || isHidden) ? 'opacity-100' : 'opacity-0'
        )}
        style={{
          left: `${sidebarRightEdge}px`, // Position at sidebar right edge (exact edge position)
          top: `${pillTop}px`, // Center pill vertically in window
          height: `${pillHeight}px`, // Height to span both buttons + gap (matches menu height = 88px)
          transform: 'translateX(-50%)', // Center the pill horizontally on the sidebar edge (pill width is 1.5px, so this centers it perfectly on the edge)
        }}
        title={isHidden ? 'Show menu' : 'Hide menu'}
      />

      {/* Hover zone on sidebar right edge - triggers menu visibility, centered on edge */}
      <div
        className="absolute pointer-events-auto"
        style={{
          left: `${sidebarRightEdge}px`, // Start at sidebar right edge
          top: `${pillTop}px`, // Match pill vertical position
          width: '20px', // Hover zone width (extends 20px to the right of sidebar edge)
          height: `${pillHeight}px`, // Match pill height
          zIndex: 15, // Below pill to allow clicks through
        }}
        onMouseEnter={() => {
          setIsHovering(true)
          isHoveringRef.current = true
          // Clear any pending hide timeout
          if (hideTimeoutRef.current) {
            clearTimeout(hideTimeoutRef.current)
            hideTimeoutRef.current = null
          }
          // If menu is hidden and mode is 'hover', show it after a short delay
          if (isHidden && menuMode === 'hover') {
            hoverTimeoutRef.current = setTimeout(() => {
              if (isHidden && menuMode === 'hover') {
                setIsHidden(false)
              }
            }, 100) // 100ms delay - quick response
          }
        }}
        onMouseLeave={(e) => {
          setIsHovering(false)
          // Clear any pending timeout
          if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current)
            hoverTimeoutRef.current = null
          }
          // Check if menu should hide after leaving hover zone
          checkAndHideMenu(e.relatedTarget as HTMLElement)
        }}
      />
    </>
  )
}

