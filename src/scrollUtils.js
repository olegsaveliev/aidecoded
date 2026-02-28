/* Shared scroll-to-top utility for stage-based modules */

function easeOutCubic(t) {
  return 1 - Math.pow(1 - t, 3)
}

function animateScroll(el, from, to, duration, cancelled) {
  const start = performance.now()
  function tick(now) {
    if (cancelled.current) return
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const value = from + (to - from) * easeOutCubic(progress)
    el.scrollTop = value
    if (progress < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

/**
 * Smooth-scroll the page to top and center the active stepper step.
 * Call inside a useEffect([stage]).
 *
 * @param {string} rootSelector  CSS selector for the module's root element (e.g. '.how-llms')
 * @param {React.RefObject} activeStepRef  ref attached to the active stepper step
 * @param {number} [duration=500]  scroll duration in ms
 * @returns {() => void} cleanup function — call in useEffect return to cancel all animations
 */
export function scrollStageToTop(rootSelector, activeStepRef, duration = 500) {
  const cancelled = { current: false }
  const rafId = requestAnimationFrame(() => {
    if (cancelled.current) return
    // Smooth-scroll every scrolled ancestor (but not body/html — window handles those)
    let el = document.querySelector(rootSelector)
    while (el && el !== document.body && el !== document.documentElement) {
      if (el.scrollTop > 0) animateScroll(el, el.scrollTop, 0, duration, cancelled)
      el = el.parentElement
    }
    // Smooth-scroll the viewport
    const scrollY = window.scrollY ?? document.documentElement.scrollTop
    if (scrollY > 0) {
      const start = performance.now()
      function tick(now) {
        if (cancelled.current) return
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const value = scrollY * (1 - easeOutCubic(progress))
        window.scrollTo(0, value)
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }
    // Center active stepper step horizontally
    if (activeStepRef && activeStepRef.current) {
      const step = activeStepRef.current
      const stepper = step.closest('.how-stepper')
      if (stepper) {
        const left = stepper.scrollLeft + step.getBoundingClientRect().left - stepper.getBoundingClientRect().left - stepper.offsetWidth / 2 + step.offsetWidth / 2
        stepper.scrollTo({ left, behavior: 'smooth' })
      }
    }
  })
  return () => {
    cancelled.current = true
    cancelAnimationFrame(rafId)
  }
}
