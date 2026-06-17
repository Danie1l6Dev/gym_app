import { Platform, type ViewStyle } from 'react-native';

type ShadowOptions = {
  color: string;
  opacity?: number;
  radius: number;
  offsetX?: number;
  offsetY?: number;
  elevation?: number;
};

type ShadowStyle = {
  boxShadow?: string;
  elevation?: ViewStyle['elevation'];
  shadowColor?: ViewStyle['shadowColor'];
  shadowOpacity?: ViewStyle['shadowOpacity'];
  shadowRadius?: ViewStyle['shadowRadius'];
  shadowOffset?: ViewStyle['shadowOffset'];
};

function clampAlpha(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function hexToRgb(hex: string) {
  const normalized = hex.replace('#', '');

  if (normalized.length === 3) {
    return {
      red: parseInt(normalized[0] + normalized[0], 16),
      green: parseInt(normalized[1] + normalized[1], 16),
      blue: parseInt(normalized[2] + normalized[2], 16),
      alpha: 1,
    };
  }

  if (normalized.length === 6 || normalized.length === 8) {
    return {
      red: parseInt(normalized.slice(0, 2), 16),
      green: parseInt(normalized.slice(2, 4), 16),
      blue: parseInt(normalized.slice(4, 6), 16),
      alpha: normalized.length === 8 ? parseInt(normalized.slice(6, 8), 16) / 255 : 1,
    };
  }

  return null;
}

function toShadowColor(color: string, opacity: number): string {
  if (color === 'transparent') {
    return 'transparent';
  }

  const hexColor = hexToRgb(color);

  if (hexColor) {
    const alpha = clampAlpha(hexColor.alpha * opacity);
    return `rgba(${hexColor.red}, ${hexColor.green}, ${hexColor.blue}, ${alpha})`;
  }

  const rgbaMatch = color.match(/^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([.\d]+)\)$/i);
  if (rgbaMatch) {
    const [, red, green, blue, alpha] = rgbaMatch;
    return `rgba(${red}, ${green}, ${blue}, ${clampAlpha(Number(alpha) * opacity)})`;
  }

  const rgbMatch = color.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/i);
  if (rgbMatch) {
    const [, red, green, blue] = rgbMatch;
    return `rgba(${red}, ${green}, ${blue}, ${clampAlpha(opacity)})`;
  }

  return color;
}

export function shadowStyle({
  color,
  opacity = 1,
  radius,
  offsetX = 0,
  offsetY = 0,
  elevation = 0,
}: ShadowOptions): ShadowStyle {
  if (Platform.OS === 'web') {
    return {
      boxShadow: `${offsetX}px ${offsetY}px ${radius}px ${toShadowColor(color, opacity)}`,
    };
  }

  return {
    shadowColor: color,
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: offsetX, height: offsetY },
    elevation,
  };
}
