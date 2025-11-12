import React from 'react';
import { Text } from 'react-native';

// Create a simple mock icon component
const createMockIcon = (iconName: string) => {
  const MockIcon = (props: any) => {
    return React.createElement(
      Text,
      {
        ...props,
        testID: iconName,
      },
      iconName
    );
  };
  MockIcon.displayName = iconName;
  return MockIcon;
};

// Export commonly used icons
export const ArrowLeft = createMockIcon('ArrowLeft');
export const Calendar = createMockIcon('Calendar');
export const User = createMockIcon('User');
export const Users = createMockIcon('Users');
export const Mail = createMockIcon('Mail');
export const Lock = createMockIcon('Lock');
export const Eye = createMockIcon('Eye');
export const EyeOff = createMockIcon('EyeOff');
export const Check = createMockIcon('Check');
export const X = createMockIcon('X');
export const Plus = createMockIcon('Plus');
export const Circle = createMockIcon('Circle');
export const Clock = createMockIcon('Clock');
export const Minus = createMockIcon('Minus');
export const Search = createMockIcon('Search');
export const Settings = createMockIcon('Settings');
export const LogOut = createMockIcon('LogOut');
export const Home = createMockIcon('Home');
export const MessageCircle = createMockIcon('MessageCircle');
export const CheckCircle = createMockIcon('CheckCircle');
export const AlertCircle = createMockIcon('AlertCircle');
export const Heart = createMockIcon('Heart');
export const RefreshCw = createMockIcon('RefreshCw');
export const Award = createMockIcon('Award');
export const TrendingUp = createMockIcon('TrendingUp');
export const CheckSquare = createMockIcon('CheckSquare');
export const ListChecks = createMockIcon('ListChecks');
export const Target = createMockIcon('Target');
export const UserMinus = createMockIcon('UserMinus');
export const BookOpen = createMockIcon('BookOpen');
export const ClipboardList = createMockIcon('ClipboardList');

// Export default
export default {
  ArrowLeft,
  Calendar,
  User,
  Users,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Plus,
  Circle,
  Clock,
  Minus,
  Search,
  Settings,
  LogOut,
  Home,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Heart,
  RefreshCw,
  Award,
  TrendingUp,
  CheckSquare,
  ListChecks,
  Target,
  UserMinus,
  BookOpen,
  ClipboardList,
};
