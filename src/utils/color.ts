/**
 * Convert a color string to a color string with the given opacity
 * @eg: withOpacity('#000000', 0.5) => '#00000050'
 */
export const withOpacity = (color: string, opacity: number) => {
  return color.startsWith('#')
    ? `#${color.slice(1)}${Math.round(opacity * 255).toString(16)}`
    : color;
};
