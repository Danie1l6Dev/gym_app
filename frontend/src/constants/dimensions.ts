import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const DIMENSIONS = {
  screenWidth: width,
  screenHeight: height,
  contentMaxWidth: 1120,
  tabBarHeight: 76,
  cardMinHeight: 120,
} as const;

