const MAX_DECIMAL_PLACES = 12;
const EPSILON_MULTIPLIER = 16;

export type SliderRange = {
  max: number;
  min: number;
  step: number;
};

function decimalPlaces(value: number) {
  const [coefficient, exponentText = "0"] = String(value)
    .toLowerCase()
    .split("e");
  const exponent = Number(exponentText);
  const fractionLength = coefficient.split(".")[1]?.length ?? 0;
  return Math.max(0, fractionLength - exponent);
}

function precisionForRange({ max, min, step }: SliderRange) {
  return Math.max(decimalPlaces(min), decimalPlaces(max), decimalPlaces(step));
}

function toleranceFor(value: number) {
  return Number.EPSILON * EPSILON_MULTIPLIER * Math.max(1, Math.abs(value));
}

type ScaledSliderRange = SliderRange & {
  maxInteger: number;
  minInteger: number;
  scale: number;
  stepInteger: number;
};

function integerFor(value: number, scale: number, name: string) {
  const scaled = value * scale;
  const integer = Math.round(scaled);
  if (
    !Number.isSafeInteger(integer) ||
    Math.abs(scaled - integer) > toleranceFor(scaled)
  ) {
    throw new RangeError(
      `Slider ${name} is outside the supported decimal arithmetic envelope.`,
    );
  }
  return integer;
}

function scaledRange(range: SliderRange): ScaledSliderRange {
  const precision = precisionForRange(range);
  if (precision > MAX_DECIMAL_PLACES) {
    throw new RangeError(
      `Slider supports at most ${MAX_DECIMAL_PLACES} decimal places.`,
    );
  }

  const scale = 10 ** precision;
  const minInteger = integerFor(range.min, scale, "min");
  const maxInteger = integerFor(range.max, scale, "max");
  const stepInteger = integerFor(range.step, scale, "step");
  if (stepInteger < 1) {
    throw new RangeError(
      "Slider step is outside the supported decimal arithmetic envelope.",
    );
  }

  return { ...range, maxInteger, minInteger, scale, stepInteger };
}

export function assertSliderRange(range: SliderRange) {
  if (
    !Number.isFinite(range.min) ||
    !Number.isFinite(range.max) ||
    !Number.isFinite(range.step) ||
    range.min >= range.max ||
    range.step <= 0
  ) {
    throw new RangeError(
      "Slider requires finite min < max and a finite positive step.",
    );
  }
  scaledRange(range);
}

function lastGridIndex(range: ScaledSliderRange) {
  return Math.floor((range.maxInteger - range.minInteger) / range.stepInteger);
}

function gridInteger(index: number, range: ScaledSliderRange) {
  return range.minInteger + index * range.stepInteger;
}

function maxIsOnGrid(range: ScaledSliderRange) {
  return gridInteger(lastGridIndex(range), range) === range.maxInteger;
}

export function isLegalSliderValue(value: number, range: SliderRange) {
  assertSliderRange(range);
  if (!Number.isFinite(value) || value < range.min || value > range.max) {
    return false;
  }
  const scaled = scaledRange(range);
  let valueInteger: number;
  try {
    valueInteger = integerFor(value, scaled.scale, "value");
  } catch {
    return false;
  }
  if (
    valueInteger === scaled.minInteger ||
    valueInteger === scaled.maxInteger
  ) {
    return true;
  }
  return (valueInteger - scaled.minInteger) % scaled.stepInteger === 0;
}

export function assertLegalSliderValue(
  value: number,
  range: SliderRange,
  name = "value",
) {
  if (!isLegalSliderValue(value, range)) {
    throw new RangeError(
      `Slider ${name} must be min, max, or a finite min-aligned step value.`,
    );
  }
}

export function quantizeSliderValue(rawValue: number, range: SliderRange) {
  assertSliderRange(range);
  const bounded = Math.min(range.max, Math.max(range.min, rawValue));
  if (bounded === range.min) return range.min;
  if (bounded === range.max) return range.max;

  const scaled = scaledRange(range);
  const boundedInteger = bounded * scaled.scale;
  const quotient = (boundedInteger - scaled.minInteger) / scaled.stepInteger;
  const lowerIndex = Math.max(0, Math.floor(quotient));
  const lower = gridInteger(lowerIndex, scaled);
  const nextGrid = gridInteger(lowerIndex + 1, scaled);
  const upper = Math.min(nextGrid, scaled.maxInteger);
  const lowerDistance = boundedInteger - lower;
  const upperDistance = upper - boundedInteger;
  const midpointNoise = Math.max(
    toleranceFor(boundedInteger),
    toleranceFor(lowerDistance),
    toleranceFor(upperDistance),
  );
  const nearest = lowerDistance < upperDistance - midpointNoise ? lower : upper;

  return nearest / scaled.scale;
}

export function stepSliderValue(
  value: number,
  direction: -1 | 1,
  range: SliderRange,
  stepCount = 1,
) {
  assertSliderRange(range);
  assertLegalSliderValue(value, range);

  const scaled = scaledRange(range);
  const finalGridIndex = lastGridIndex(scaled);
  const endpointIndex = finalGridIndex + (maxIsOnGrid(scaled) ? 0 : 1);
  const valueInteger = integerFor(value, scaled.scale, "value");
  const currentIndex =
    valueInteger === scaled.maxInteger
      ? endpointIndex
      : (valueInteger - scaled.minInteger) / scaled.stepInteger;
  const nextIndex = Math.min(
    endpointIndex,
    Math.max(0, currentIndex + direction * Math.max(1, stepCount)),
  );

  if (nextIndex === endpointIndex) return range.max;
  return gridInteger(nextIndex, scaled) / scaled.scale;
}

export function sliderValuePercent(value: number, range: SliderRange) {
  return ((value - range.min) / (range.max - range.min)) * 100;
}

/** Continuous values use six decimal places; endpoints must share that envelope. */
export const SLIDER_CONTINUOUS_PRECISION = 6;

export function continuousSliderRange(min: number, max: number): SliderRange {
  if (
    decimalPlaces(min) > SLIDER_CONTINUOUS_PRECISION ||
    decimalPlaces(max) > SLIDER_CONTINUOUS_PRECISION
  ) {
    throw new RangeError(
      "Continuous Slider endpoints support at most 6 decimal places.",
    );
  }
  const range = { min, max, step: 10 ** -SLIDER_CONTINUOUS_PRECISION };
  assertSliderRange(range);
  return range;
}

/** One arrow increment is 1% of the span, rounded to the reporting quantum. */
export function continuousSliderKeySteps(range: SliderRange) {
  return Math.max(1, Math.round((range.max - range.min) / 100 / range.step));
}
