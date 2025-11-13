import React from 'react';
import { render } from '@testing-library/react-native';
import { GoogleLogo, FacebookLogo, AppleLogo } from '../SocialLogos';

describe('GoogleLogo', () => {
  it('renders with default size', () => {
    const { UNSAFE_getByType } = render(<GoogleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(20);
  });

  it('renders with custom size', () => {
    const { UNSAFE_getByType } = render(<GoogleLogo size={32} />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it('has correct margin for spacing', () => {
    const { UNSAFE_getByType } = render(<GoogleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.style).toEqual({ marginRight: 12 });
  });
});

describe('FacebookLogo', () => {
  it('renders with default size', () => {
    const { UNSAFE_getByType } = render(<FacebookLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(20);
  });

  it('renders with custom size', () => {
    const { UNSAFE_getByType } = render(<FacebookLogo size={32} />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it('has correct margin for spacing', () => {
    const { UNSAFE_getByType } = render(<FacebookLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.style).toEqual({ marginRight: 12 });
  });
});

describe('AppleLogo', () => {
  it('renders with default size', () => {
    const { UNSAFE_getByType } = render(<AppleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(20);
    expect(svg.props.height).toBe(20);
  });

  it('renders with custom size', () => {
    const { UNSAFE_getByType } = render(<AppleLogo size={32} />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.width).toBe(32);
    expect(svg.props.height).toBe(32);
  });

  it('has correct margin for spacing', () => {
    const { UNSAFE_getByType } = render(<AppleLogo />);
    const svg = UNSAFE_getByType('Svg');
    expect(svg.props.style).toEqual({ marginRight: 12 });
  });
});
