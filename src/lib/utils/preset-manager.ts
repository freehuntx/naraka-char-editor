import { schema } from './naraka/facedata';
import type { ParsedNarakaData } from './naraka/char-editor';

/**
 * Interface for a saved preset
 */
export interface Preset {
  id: string;
  name: string;
  data: ParsedNarakaData;
  createdAt: number;
}

/**
 * Helper to safely get nested value by path string (e.g. "ParamData/Eyes/Right")
 */
function getValueByPath(obj: any, path: string): any {
  const parts = path.split('/');
  let current = obj;
  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }
  return current;
}

/**
 * Helper to safely set nested value by path string
 */
function setValueByPath(obj: any, path: string, value: any): void {
  const parts = path.split('/');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part]) current[part] = {};
    current = current[part];
  }
  current[parts[parts.length - 1]] = value;
}

/**
 * Applies a preset to the current data using "Smart Apply" logic.
 * - Iterates through the face schema.
 * - Copies values from source (preset) to target (current).
 * - ONLY if value is number, 0 <= value <= 100.
 * - IGNORES 'HeroID', 'Version'.
 * - IGNORES hairData entirely.
 * 
 * @param current The current editor state (target)
 * @param preset The preset to apply (source)
 * @returns A new deep copy of the applied state
 */
export function applySmartPreset(current: ParsedNarakaData, preset: ParsedNarakaData): ParsedNarakaData {
  // Deep clone current state to avoid mutation
  const newState = JSON.parse(JSON.stringify(current));

  // If new state doesn't have faceData (e.g. initial empty state), initialize it
  if (!newState.faceData) newState.faceData = {};

  for (const entry of schema) {
    const path = entry.path;
    
    if (path === 'HeroID' || path === 'Version') continue;

    const presetValue = getValueByPath(preset.faceData, path);

    if (typeof presetValue !== 'number') continue
    if (presetValue > 100) continue
    setValueByPath(newState.faceData, path, presetValue);
  }

  return newState;
}

/**
 * Randomizes the face data within strict 0-100 bounds for valid sliders only.
 */
export function randomizeParsedData(current: ParsedNarakaData): ParsedNarakaData {
  const newState = JSON.parse(JSON.stringify(current));
  if (!newState.faceData) newState.faceData = {};

  for (const entry of schema) {
    const path = entry.path;
    if (path === 'HeroID' || path === 'Version') continue;

    const currentValue = getValueByPath(newState.faceData, path);
    if (currentValue > 100) continue; // Ignore non-slider values

    const randomVal = Math.floor(Math.random() * 101); // 0-100
    setValueByPath(newState.faceData, path, randomVal);
  }
  return newState;
}

/**
 * Nullifies (sets to 0) the face data.
 */
export function nullifyParsedData(current: ParsedNarakaData): ParsedNarakaData {
  const newState = JSON.parse(JSON.stringify(current));
  if (!newState.faceData) newState.faceData = {};

  for (const entry of schema) {
    const path = entry.path;
    if (path === 'HeroID' || path === 'Version') continue;

    const currentValue = getValueByPath(newState.faceData, path);
    if (currentValue > 100) continue; // Ignore non-slider values

    setValueByPath(newState.faceData, path, 0);
  }
  return newState;
}
