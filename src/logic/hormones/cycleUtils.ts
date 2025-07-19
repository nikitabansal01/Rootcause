/**
 * Cycle Phase Calculation Utilities
 * Handles menstrual cycle phase calculations based on user data
 */

export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal' | 'unknown';
export type PhaseConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export interface CyclePhaseResult {
  cycleDay: number;
  phase: CyclePhase;
  phaseConfidence: PhaseConfidence;
  useEstimatedCycle: boolean;
  ovulationDay: number;
  daysUntilNextPeriod: number;
}

/**
 * Calculate menstrual cycle phase with confidence levels
 * @param lastPeriodStartDate - Date string of last period start
 * @param cycleLength - User's cycle length in days (optional)
 * @param fallbackToDefault - Whether to use 28-day default if cycle length not provided
 * @returns CyclePhaseResult with detailed phase information
 */
export function calculateCyclePhase(
  lastPeriodStartDate: string,
  cycleLength?: number,
  fallbackToDefault: boolean = true
): CyclePhaseResult {
  // Validate input
  if (!lastPeriodStartDate) {
    return {
      cycleDay: 0,
      phase: 'unknown',
      phaseConfidence: 'LOW',
      useEstimatedCycle: true,
      ovulationDay: 0,
      daysUntilNextPeriod: 0
    };
  }

  const lastPeriod = new Date(lastPeriodStartDate);
  const today = new Date();
  
  // Calculate days since last period started
  const timeDiff = today.getTime() - lastPeriod.getTime();
  const daysSincePeriod = Math.floor(timeDiff / (1000 * 3600 * 24));
  
  // Determine if using estimated cycle length
  const useEstimatedCycle = !cycleLength && fallbackToDefault;
  const effectiveCycleLength = cycleLength || 28;
  
  // Calculate current cycle day
  const cycleDay = (daysSincePeriod % effectiveCycleLength) + 1;
  
  // Calculate ovulation day (typically 14 days before next period)
  const ovulationDay = Math.floor(effectiveCycleLength / 2);
  
  // Calculate days until next period
  const daysUntilNextPeriod = effectiveCycleLength - cycleDay + 1;
  
  // Determine cycle phase with more precise boundaries
  let phase: CyclePhase;
  let phaseConfidence: PhaseConfidence;
  
  if (cycleDay >= 1 && cycleDay <= 5) {
    phase = 'menstrual';
    phaseConfidence = useEstimatedCycle ? 'MEDIUM' : 'HIGH';
  } else if (cycleDay >= 6 && cycleDay <= ovulationDay - 2) {
    phase = 'follicular';
    phaseConfidence = useEstimatedCycle ? 'MEDIUM' : 'HIGH';
  } else if (cycleDay >= ovulationDay - 1 && cycleDay <= ovulationDay + 1) {
    phase = 'ovulatory';
    phaseConfidence = useEstimatedCycle ? 'LOW' : 'MEDIUM';
  } else if (cycleDay >= ovulationDay + 2 && cycleDay <= effectiveCycleLength) {
    phase = 'luteal';
    phaseConfidence = useEstimatedCycle ? 'MEDIUM' : 'HIGH';
  } else {
    phase = 'unknown';
    phaseConfidence = 'LOW';
  }
  
  // Adjust confidence based on cycle regularity indicators
  if (useEstimatedCycle) {
    phaseConfidence = phaseConfidence === 'HIGH' ? 'MEDIUM' : 'LOW';
  }
  
  // Log cycle phase calculation for debugging
  console.log(`Cycle Phase Calculation:`, {
    lastPeriodStartDate,
    cycleLength: cycleLength || 'estimated',
    effectiveCycleLength,
    cycleDay,
    ovulationDay,
    phase,
    phaseConfidence,
    useEstimatedCycle
  });

  return {
    cycleDay,
    phase,
    phaseConfidence,
    useEstimatedCycle,
    ovulationDay,
    daysUntilNextPeriod
  };
}

/**
 * Get cycle phase display name
 * @param phase - Cycle phase
 * @returns Human-readable cycle phase name
 */
export function getCyclePhaseDisplayName(phase: CyclePhase): string {
  const names: Record<CyclePhase, string> = {
    menstrual: 'Menstrual',
    follicular: 'Follicular',
    ovulatory: 'Ovulatory',
    luteal: 'Luteal',
    unknown: 'Unknown'
  };
  return names[phase];
}

/**
 * Get cycle phase description
 * @param phase - Cycle phase
 * @returns Description of what happens during this phase
 */
export function getCyclePhaseDescription(phase: CyclePhase): string {
  const descriptions: Record<CyclePhase, string> = {
    menstrual: 'Period phase - estrogen and progesterone are low',
    follicular: 'Pre-ovulation phase - estrogen rises, preparing for ovulation',
    ovulatory: 'Ovulation occurs - egg is released, estrogen peaks',
    luteal: 'Post-ovulation phase - progesterone rises, preparing for potential pregnancy',
    unknown: 'Unable to determine cycle phase'
  };
  return descriptions[phase];
}

/**
 * Check if a symptom is normal for a given cycle phase
 * @param symptom - Symptom to check
 * @param phase - Current cycle phase
 * @returns True if symptom is normal for this phase
 */
export function isSymptomNormalForPhase(symptom: string, phase: CyclePhase): boolean {
  const normalSymptoms: Record<CyclePhase, string[]> = {
    menstrual: ['cramps', 'fatigue', 'mood changes', 'back pain'],
    follicular: ['increased energy', 'clear skin'],
    ovulatory: ['mid-cycle pain', 'increased libido', 'cervical mucus changes'],
    luteal: ['bloating', 'breast tenderness', 'mood swings', 'cravings', 'acne', 'irritability'],
    unknown: []
  };
  
  return normalSymptoms[phase]?.includes(symptom.toLowerCase()) || false;
}

/**
 * Get hormone levels expected during each cycle phase
 * @param phase - Cycle phase
 * @returns Object describing expected hormone levels
 */
export function getExpectedHormoneLevels(phase: CyclePhase): {
  estrogen: 'low' | 'rising' | 'high' | 'falling';
  progesterone: 'low' | 'rising' | 'high' | 'falling';
  lh: 'low' | 'rising' | 'high' | 'falling';
  fsh: 'low' | 'rising' | 'high' | 'falling';
} {
  const hormoneLevels: Record<CyclePhase, any> = {
    menstrual: {
      estrogen: 'low',
      progesterone: 'low',
      lh: 'low',
      fsh: 'rising'
    },
    follicular: {
      estrogen: 'rising',
      progesterone: 'low',
      lh: 'low',
      fsh: 'low'
    },
    ovulatory: {
      estrogen: 'high',
      progesterone: 'low',
      lh: 'high',
      fsh: 'high'
    },
    luteal: {
      estrogen: 'falling',
      progesterone: 'rising',
      lh: 'low',
      fsh: 'low'
    },
    unknown: {
      estrogen: 'unknown',
      progesterone: 'unknown',
      lh: 'unknown',
      fsh: 'unknown'
    }
  };
  
  return hormoneLevels[phase];
}

/**
 * Adjust symptom scoring based on cycle phase and confidence
 * @param symptom - Symptom name
 * @param phase - Current cycle phase
 * @param phaseConfidence - Confidence in phase calculation
 * @param baseScore - Base score for the symptom
 * @returns Adjusted score considering cycle phase context
 */
export function adjustSymptomScoreForPhase(
  symptom: string,
  phase: CyclePhase,
  phaseConfidence: PhaseConfidence,
  baseScore: number
): number {
  // If phase confidence is low, reduce scores for cycle-sensitive symptoms
  if (phaseConfidence === 'LOW') {
    const cycleSensitiveSymptoms = [
      'bloating', 'breast tenderness', 'mood swings', 'cravings',
      'acne', 'irritability', 'fatigue', 'cramps'
    ];
    
    if (cycleSensitiveSymptoms.includes(symptom.toLowerCase())) {
      return Math.floor(baseScore * 0.5); // Reduce score by 50%
    }
  }
  
  // If symptom is normal for current phase, reduce score
  if (isSymptomNormalForPhase(symptom, phase)) {
    return Math.floor(baseScore * 0.3); // Reduce score by 70%
  }
  
  return baseScore;
}

/**
 * Legacy function for backward compatibility
 * @deprecated Use calculateCyclePhase instead
 */
export function getCyclePhase(
  lastPeriodDate: string, 
  isRegular: boolean, 
  cycleLength: number = 28
): CyclePhase {
  if (!lastPeriodDate || !isRegular) {
    return 'unknown';
  }

  const result = calculateCyclePhase(lastPeriodDate, cycleLength);
  return result.phase;
} 