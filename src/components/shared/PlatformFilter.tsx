import React from 'react';
import { 
  Mail, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  MessageCircle, 
  Youtube, 
  Music 
} from 'lucide-react';
import { Platform } from '../../types';

interface PlatformFilterProps {
  activePlatforms: Platform[];
  onChange: (platforms: Platform[]) => void;
}

const platformOptions: { id: Platform; name: string; icon: any }[] = [
  { id: 'email', name: 'Email', icon: Mail },
  { id: 'instagram', name: 'Instagram', icon: Instagram },
  { id: 'twitter', name: 'Twitter', icon: Twitter },
  { id: 'facebook', name: 'Facebook', icon: Facebook },
  { id: 'linkedin', name: 'LinkedIn', icon: Linkedin },
  { id: 'whatsapp', name: 'WhatsApp', icon: MessageCircle },
  { id: 'youtube', name: 'YouTube', icon: Youtube },
  { id: 'tiktok', name: 'TikTok', icon: Music }
];

export const PlatformFilter: React.FC<PlatformFilterProps> = ({ 
  activePlatforms, 
  onChange 
}) => {
  const togglePlatform = (platform: Platform) => {
    if (activePlatforms.includes(platform)) {
      onChange(activePlatforms.filter(p => p !== platform));
    } else {
      onChange([...activePlatforms, platform]);
    }
  };

  return (
    <div className="flex items-center space-x-2 overflow-x-auto py-1">
      {platformOptions.map((platform) => {
        const Icon = platform.icon;
        const isActive = activePlatforms.includes(platform.id);
        const config = (() => {
          switch (platform.id) {
            case 'email': return { color: 'bg-red-500', lightColor: 'bg-red-100', textColor: 'text-red-600' };
            case 'instagram': return { color: 'bg-pink-500', lightColor: 'bg-pink-100', textColor: 'text-pink-600' };
            case 'twitter': return { color: 'bg-sky-500', lightColor: 'bg-sky-100', textColor: 'text-sky-600' };
            case 'facebook': return { color: 'bg-blue-600', lightColor: 'bg-blue-100', textColor: 'text-blue-600' };
            case 'linkedin': return { color: 'bg-indigo-600', lightColor: 'bg-indigo-100', textColor: 'text-indigo-600' };
            case 'whatsapp': return { color: 'bg-green-500', lightColor: 'bg-green-100', textColor: 'text-green-600' };
            case 'youtube': return { color: 'bg-red-600', lightColor: 'bg-red-100', textColor: 'text-red-600' };
            case 'tiktok': return { color: 'bg-black', lightColor: 'bg-gray-100', textColor: 'text-gray-900' };
            default: return { color: 'bg-gray-500', lightColor: 'bg-gray-100', textColor: 'text-gray-600' };
          }
        })();
        
        return (
          <button
            key={platform.id}
            onClick={() => togglePlatform(platform.id)}
            className={`
              flex items-center space-x-1 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap
              ${isActive 
                ? `${config.lightColor} ${config.textColor} border border-${platform.id === 'tiktok' ? 'gray' : platform.id}-300` 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-transparent'
              }
            `}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{platform.name}</span>
          </button>
        );
      })}
    </div>
  );
};