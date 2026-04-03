export enum Mode {
  MICROSCOPE = 'MICROSCOPE',
  SCREEN = 'SCREEN'
}

export enum Unit {
  MM = 'mm',
  UM = 'µm',
  CM = 'cm',
  INCH = 'in'
}

export enum AreaUnit {
  SQ_MM = 'mm²',
  SQ_UM = 'µm²',
  SQ_CM = 'cm²',
  SQ_INCH = 'in²'
}

export interface CalculationResult {
  fovArea: number; // in square micrometers (µm²)
  goalArea: number; // in square micrometers (µm²)
  fieldsNeeded: number;
  coveragePercentage: number;
}

export interface MicroscopeSettings {
  eyepieceFN: number; // Field Number in mm
  objectiveMag: number; // Magnification (e.g., 10, 20, 40)
  useManualDiameter: boolean;
  manualDiameter: number; // value in selected Unit
  manualDiameterUnit: Unit;
}

export interface ScreenSettings {
  width: number;
  height: number;
  unit: Unit;
}
