export function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function colorChannels(color) {
  if (Array.isArray(color)) {
    return color;
  }

  return color
    .slice(1)
    .match(/.{2}/gu)
    .map((channel) => Number.parseInt(channel, 16));
}

function srgbChannelToLinear(channel) {
  const normalized = channel / 255;
  return normalized <= 0.04045
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(color) {
  const [red, green, blue] = colorChannels(color).map(srgbChannelToLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrastRatio(first, second) {
  const firstLuminance = relativeLuminance(first);
  const secondLuminance = relativeLuminance(second);
  const lighter = Math.max(firstLuminance, secondLuminance);
  const darker = Math.min(firstLuminance, secondLuminance);
  return (lighter + 0.05) / (darker + 0.05);
}

export function compositeColor(foreground, background, opacity) {
  const foregroundChannels = colorChannels(foreground);
  const backgroundChannels = colorChannels(background);

  return foregroundChannels.map(
    (channel, index) =>
      channel * opacity + backgroundChannels[index] * (1 - opacity),
  );
}

export function normalizeCss(value) {
  return value
    .replace(/\s+/gu, " ")
    .replace(/\(\s+/gu, "(")
    .replace(/\s+\)/gu, ")");
}
