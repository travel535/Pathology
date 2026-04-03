import React, { useState, useMemo } from 'react';
import { Microscope, Monitor, Calculator, ArrowRight, Info } from 'lucide-react';
import { 
  Mode, 
  Unit, 
  AreaUnit, 
  MicroscopeSettings, 
  ScreenSettings, 
  CalculationResult 
} from './types';
import { UNIT_TO_MICRON, AREA_UNIT_TO_SQ_MICRON, DEFAULT_GOAL_AREA, DEFAULT_GOAL_UNIT } from './constants';
import Visualizer from './components/Visualizer';
import AIInsights from './components/AIInsights';

const App: React.FC = () => {
  // --- State ---
  const [mode, setMode] = useState<Mode>(Mode.MICROSCOPE);
  
  // Goal Area State
  const [goalArea, setGoalArea] = useState<number>(DEFAULT_GOAL_AREA);
  const [goalUnit, setGoalUnit] = useState<AreaUnit>(DEFAULT_GOAL_UNIT);

  // Microscope State
  const [microSettings, setMicroSettings] = useState<MicroscopeSettings>({
    eyepieceFN: 22,
    objectiveMag: 40,
    useManualDiameter: false,
    manualDiameter: 0.55, // 550 microns defaultish
    manualDiameterUnit: Unit.MM
  });

  // Screen State
  const [screenSettings, setScreenSettings] = useState<ScreenSettings>({
    width: 24,
    height: 14,
    unit: Unit.INCH
  });

  // --- Calculations ---
  
  const result: CalculationResult = useMemo(() => {
    // 1. Convert Goal Area to µm²
    const goalAreaMicrons = goalArea * AREA_UNIT_TO_SQ_MICRON[goalUnit];

    let fovAreaMicrons = 0;

    if (mode === Mode.MICROSCOPE) {
      // Calculate Microscope Field Area
      // Area = PI * r^2
      let diameterMicrons = 0;

      if (microSettings.useManualDiameter) {
        diameterMicrons = microSettings.manualDiameter * UNIT_TO_MICRON[microSettings.manualDiameterUnit];
      } else {
        // Diameter = FN / Objective
        // FN is usually in mm, so convert FN to microns first
        const fnMicrons = microSettings.eyepieceFN * 1000;
        diameterMicrons = fnMicrons / microSettings.objectiveMag;
      }
      
      const radius = diameterMicrons / 2;
      fovAreaMicrons = Math.PI * radius * radius;
    } else {
      // Calculate Screen Area
      // Area = Width * Height
      const wMicrons = screenSettings.width * UNIT_TO_MICRON[screenSettings.unit];
      const hMicrons = screenSettings.height * UNIT_TO_MICRON[screenSettings.unit];
      fovAreaMicrons = wMicrons * hMicrons;
    }

    // Avoid division by zero
    const finalFovArea = fovAreaMicrons > 0 ? fovAreaMicrons : 1;
    const fieldsNeeded = goalAreaMicrons / finalFovArea;

    return {
      fovArea: finalFovArea,
      goalArea: goalAreaMicrons,
      fieldsNeeded: fieldsNeeded,
      coveragePercentage: (finalFovArea / goalAreaMicrons) * 100 // Just for fun, how much 1 field covers
    };

  }, [goalArea, goalUnit, mode, microSettings, screenSettings]);

  // --- Helpers for Display ---
  
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const getFovDisplayString = () => {
    // Convert µm² back to a readable unit depending on size
    if (result.fovArea > 1_000_000) {
      return `${formatNumber(result.fovArea / 1_000_000)} mm²`;
    }
    return `${formatNumber(result.fovArea)} µm²`;
  };

  const getGoalDisplayString = () => {
     return `${goalArea} ${goalUnit}`;
  };

  // --- Handlers ---

  const handleMicroChange = (field: keyof MicroscopeSettings, value: any) => {
    setMicroSettings(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-6 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 text-center md:text-left">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="bg-indigo-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
               <Calculator className="text-white" size={28} />
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              FieldOfView <span className="text-indigo-600">Planner</span>
            </h1>
          </div>
          <p className="text-slate-500 max-w-2xl mt-2 text-lg">
            Calculate the exact number of fields required to cover your target area for microscopy or screen-based analysis.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Mode Selection */}
            <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 flex">
              <button
                onClick={() => setMode(Mode.MICROSCOPE)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === Mode.MICROSCOPE 
                    ? 'bg-indigo-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Microscope size={18} />
                Microscope
              </button>
              <button
                onClick={() => setMode(Mode.SCREEN)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  mode === Mode.SCREEN 
                    ? 'bg-emerald-600 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Monitor size={18} />
                Screen
              </button>
            </div>

            {/* 2. Goal Area Input */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                Target Goal
              </h2>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Goal Area</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    value={goalArea}
                    onChange={(e) => setGoalArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
                <div className="w-1/3">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                  <select
                    value={goalUnit}
                    onChange={(e) => setGoalUnit(e.target.value as AreaUnit)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
                  >
                    {Object.values(AreaUnit).map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* 3. FOV Configuration */}
            <section className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
              <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${mode === Mode.MICROSCOPE ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                {mode === Mode.MICROSCOPE ? 'Optics Configuration' : 'Screen Dimensions'}
              </h2>

              {mode === Mode.MICROSCOPE ? (
                <div className="space-y-4">
                  {/* Mode Toggle for Microscope: FN/Mag vs Manual Diameter */}
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-sm text-slate-600 flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={microSettings.useManualDiameter}
                        onChange={(e) => handleMicroChange('useManualDiameter', e.target.checked)}
                        className="rounded text-indigo-600 focus:ring-indigo-500" 
                      />
                      <span>I know the specific field diameter</span>
                    </label>
                  </div>

                  {microSettings.useManualDiameter ? (
                    <div className="flex gap-4 animate-fadeIn">
                       <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Field Diameter</label>
                        <input
                          type="number"
                          value={microSettings.manualDiameter}
                          onChange={(e) => handleMicroChange('manualDiameter', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div className="w-1/3">
                        <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                        <select
                          value={microSettings.manualDiameterUnit}
                          onChange={(e) => handleMicroChange('manualDiameterUnit', e.target.value)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg outline-none"
                        >
                          {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4 animate-fadeIn">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          <label className="block text-sm font-medium text-slate-700">Eyepiece FN</label>
                          <div className="group relative">
                             <Info size={14} className="text-slate-400 cursor-help" />
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 p-2 bg-slate-800 text-white text-xs rounded z-10">
                               Field Number is usually printed on the eyepiece (e.g., 20, 22, 25).
                             </div>
                          </div>
                        </div>
                        <input
                          type="number"
                          value={microSettings.eyepieceFN}
                          onChange={(e) => handleMicroChange('eyepieceFN', parseFloat(e.target.value) || 0)}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                        <span className="text-xs text-slate-400 mt-1 block">millimeters (mm)</span>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Objective Mag</label>
                        <select
                          value={microSettings.objectiveMag}
                          onChange={(e) => handleMicroChange('objectiveMag', parseFloat(e.target.value))}
                          className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        >
                          {[4, 10, 20, 40, 60, 100].map(mag => (
                            <option key={mag} value={mag}>{mag}x</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                  
                  {!microSettings.useManualDiameter && (
                     <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-600 flex justify-between">
                        <span>Calculated Diameter:</span>
                        <span className="font-semibold text-indigo-600">
                          {((microSettings.eyepieceFN / microSettings.objectiveMag) * 1000).toFixed(0)} µm
                        </span>
                     </div>
                  )}

                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Width</label>
                      <input
                        type="number"
                        value={screenSettings.width}
                        onChange={(e) => setScreenSettings(prev => ({...prev, width: parseFloat(e.target.value) || 0}))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Height</label>
                      <input
                        type="number"
                        value={screenSettings.height}
                        onChange={(e) => setScreenSettings(prev => ({...prev, height: parseFloat(e.target.value) || 0}))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Unit</label>
                     <select
                        value={screenSettings.unit}
                        onChange={(e) => setScreenSettings(prev => ({...prev, unit: e.target.value as Unit}))}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                      >
                         {Object.values(Unit).map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 h-full flex flex-col">
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-1">Analysis Results</h3>
                <p className="text-slate-500 text-sm">Based on your current configuration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className={`p-6 rounded-2xl ${mode === Mode.MICROSCOPE ? 'bg-indigo-50 border-indigo-100' : 'bg-emerald-50 border-emerald-100'} border`}>
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">Fields Required</p>
                  <div className={`text-5xl font-extrabold ${mode === Mode.MICROSCOPE ? 'text-indigo-600' : 'text-emerald-600'}`}>
                    {Math.ceil(result.fieldsNeeded).toLocaleString()}
                  </div>
                  <p className="text-slate-600 mt-2 text-sm">
                    Exact value: <span className="font-mono font-medium">{result.fieldsNeeded.toFixed(2)}</span>
                  </p>
                </div>
                
                <div className="space-y-3">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                     <span className="text-sm text-slate-500">Single Field Area</span>
                     <span className="font-semibold text-slate-800">{getFovDisplayString()}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                     <span className="text-sm text-slate-500">Total Goal Area</span>
                     <span className="font-semibold text-slate-800">{getGoalDisplayString()}</span>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                     <span className="text-sm text-slate-500">Coverage / Field</span>
                     <span className="font-semibold text-slate-800">
                      {result.coveragePercentage < 0.01 
                        ? '< 0.01%' 
                        : `${result.coveragePercentage.toFixed(2)}%`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Visualization */}
              <div className="flex-1 min-h-[300px] flex flex-col">
                 <h4 className="text-sm font-semibold text-slate-700 mb-2">Visual Coverage Map</h4>
                 <Visualizer fieldsNeeded={result.fieldsNeeded} mode={mode} />
              </div>

              {/* AI Section */}
              <AIInsights 
                mode={mode} 
                fieldsNeeded={result.fieldsNeeded} 
                goalAreaStr={getGoalDisplayString()} 
                fovAreaStr={getFovDisplayString()}
              />

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
