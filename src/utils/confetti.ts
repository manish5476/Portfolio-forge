import confetti from 'canvas-confetti';

export type ConfettiPreset = 'save' | 'milestone' | 'tierUp';

/**
 * Triggers canvas-confetti animation effects.
 * @param preset - 'save' for quick save burst, 'milestone' for celebratory explosion, 'tierUp' for fireworks cascade
 */
export function triggerConfetti(preset: ConfettiPreset = 'save') {
  try {
    if (preset === 'save') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ['#06b6d4', '#3b82f6', '#10b981', '#f59e0b', '#ec4899'],
        ticks: 200,
        gravity: 1.1,
        scalar: 0.9,
      });
    } else if (preset === 'milestone') {
      const count = 200;
      const defaults = {
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981', '#f59e0b'],
      };

      const fire = (particleRatio: number, opts: confetti.Options) => {
        confetti({
          ...defaults,
          ...opts,
          particleCount: Math.floor(count * particleRatio),
        });
      };

      fire(0.25, { spread: 26, startVelocity: 55 });
      fire(0.2, { spread: 60 });
      fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
      fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
      fire(0.1, { spread: 120, startVelocity: 45 });
    } else if (preset === 'tierUp') {
      const duration = 2.5 * 1000;
      const animationEnd = Date.now() + duration;

      const interval: ReturnType<typeof setInterval> = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({
          particleCount,
          startVelocity: 30,
          spread: 360,
          ticks: 60,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#06b6d4', '#a855f7', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
        });
      }, 250);
    }
  } catch (err) {
    console.warn('Canvas confetti execution skipped:', err);
  }
}
