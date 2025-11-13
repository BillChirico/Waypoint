import React from 'react';
import { View } from 'react-native';

// Create mock components that preserve props for testing
export const Svg = (props: any) => {
  return React.createElement('Svg', props, props.children);
};

export const Path = (props: any) => {
  return React.createElement('Path', props);
};

export const Circle = (props: any) => {
  return React.createElement('Circle', props);
};

export const Rect = (props: any) => {
  return React.createElement('Rect', props);
};

export const G = (props: any) => {
  return React.createElement('G', props, props.children);
};

export default Svg;
