import { Unit, AreaUnit } from './types';

// Base unit is Micrometer (µm)
export const UNIT_TO_MICRON: Record<Unit, number> = {
  [Unit.MM]: 1000,
  [Unit.UM]: 1,
  [Unit.CM]: 10000,
  [Unit.INCH]: 25400,
};

// Base unit is Square Micrometer (µm²)
export const AREA_UNIT_TO_SQ_MICRON: Record<AreaUnit, number> = {
  [AreaUnit.SQ_MM]: 1_000_000,
  [AreaUnit.SQ_UM]: 1,
  [AreaUnit.SQ_CM]: 100_000_000,
  [AreaUnit.SQ_INCH]: 645_160_000,
};

export const DEFAULT_GOAL_AREA = 2;
export const DEFAULT_GOAL_UNIT = AreaUnit.SQ_MM;
