/**
 * Convert a color to a rgba color with the given opacity
 * @param color - The color to convert (e.g. #000000)
 * @param opacity - The opacity to apply to the color (0-1)
 * @returns The rgba color (e.g. rgba(0, 0, 0, 0.5))
 */
export const withOpacity = (color: string, opacity: number) => {
  return color.replace('rgb', 'rgba').replace(')', `, ${opacity})`);
};
