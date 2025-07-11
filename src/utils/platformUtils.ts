import { Platform } from '../types';
import { 
  Mail, 
  Instagram, 
  Facebook, 
  Twitter, 
  Linkedin, 
  MessageCircle, 
  Youtube,
  Music
} from 'lucide-react';

export const platformConfig = {
  email: {
    name: 'Email',
    icon: Mail,
    color: 'bg-red-500',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'bg-gradient-to-r from-purple-500 to-pink-500',
    lightColor: 'bg-pink-50',
    textColor: 'text-pink-600'
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'bg-blue-600',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  twitter: {
    name: 'Twitter',
    icon: Twitter,
    color: 'bg-sky-500',
    lightColor: 'bg-sky-50',
    textColor: 'text-sky-600'
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'bg-indigo-600',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-600'
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-500',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'bg-red-600',
    lightColor: 'bg-red-50',
    textColor: 'text-red-600'
  },
  tiktok: {
    name: 'TikTok',
    icon: Music,
    color: 'bg-black',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-900'
  },
  sms: {
    name: 'SMS',
    icon: MessageCircle,
    color: 'bg-green-600',
    lightColor: 'bg-green-50',
    textColor: 'text-green-600'
  },
  telegram: {
    name: 'Telegram',
    icon: MessageCircle,
    color: 'bg-blue-500',
    lightColor: 'bg-blue-50',
    textColor: 'text-blue-600'
  },
  discord: {
    name: 'Discord',
    icon: MessageCircle,
    color: 'bg-indigo-500',
    lightColor: 'bg-indigo-50',
    textColor: 'text-indigo-600'
  }
} as const;

export const getPlatformConfig = (platform: Platform) => {
  return platformConfig[platform] || {
    name: 'Unknown',
    icon: MessageCircle,
    color: 'bg-gray-500',
    lightColor: 'bg-gray-50',
    textColor: 'text-gray-600'
  };
};

export const formatTimeAgo = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return date.toLocaleDateString();
};