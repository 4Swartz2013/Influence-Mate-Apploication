import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Filter, 
  X, 
  ChevronDown,
  Instagram,
  Mail,
  Twitter,
  Linkedin,
  Facebook,
  MessageCircle,
  Youtube,
  Music
} from 'lucide-react';
import { useCommunications } from '../hooks/useCommunications';
import { Platform } from '../types/communications';

const platformIcons = {
  email: Mail,
  instagram: Instagram,
  twitter: Twitter,
  linkedin: Linkedin,
  facebook: Facebook,
  whatsapp: MessageCircle,
  youtube: Youtube,
  tiktok: Music
};

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-500' },
  { value: 'replied', label: 'Replied', color: 'bg-green-500' },
  { value: 'ignored', label: 'Ignored', color: 'bg-gray-500' },
  { value: 'scheduled', label: 'Scheduled', color: 'bg-blue-500' }
];

export const FilterBar: React.FC = () => {
  const { filters, setFilters } = useCommunications();
  const [showPlatforms, setShowPlatforms] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  const togglePlatform = (platform: Platform) => {
    const newPlatforms = filters.platforms.includes(platform)
      ? filters.platforms.filter(p => p !== platform)
      : [...filters.platforms, platform];
    setFilters({ platforms: newPlatforms });
  };

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter(s => s !== status)
      : [...filters.status, status];
    setFilters({ status: newStatus });
  };

  const clearFilters = () => {
    setFilters({ platforms: [], status: [], search: '' });
  };

  const hasActiveFilters = filters.platforms.length > 0 || filters.status.length > 0;

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Platform Filter */}
          <div className="relative">
            <button
              onClick={() => setShowPlatforms(!showPlatforms)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                Platforms {filters.platforms.length > 0 && `(${filters.platforms.length})`}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showPlatforms && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20"
                >
                  <h3 className="font-medium text-gray-900 mb-3">Filter by Platform</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(platformIcons).map(([platform, Icon]) => (
                      <button
                        key={platform}
                        onClick={() => togglePlatform(platform as Platform)}
                        className={`
                          flex items-center space-x-2 p-2 rounded-lg text-sm transition-colors
                          ${filters.platforms.includes(platform as Platform)
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="capitalize">{platform}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <button
              onClick={() => setShowStatus(!showStatus)}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-sm font-medium">
                Status {filters.status.length > 0 && `(${filters.status.length})`}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showStatus && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-20"
                >
                  <h3 className="font-medium text-gray-900 mb-3">Filter by Status</h3>
                  <div className="space-y-2">
                    {statusOptions.map((status) => (
                      <button
                        key={status.value}
                        onClick={() => toggleStatus(status.value)}
                        className={`
                          flex items-center space-x-2 w-full p-2 rounded-lg text-sm transition-colors text-left
                          ${filters.status.includes(status.value)
                            ? 'bg-blue-50 text-blue-700'
                            : 'hover:bg-gray-50'
                          }
                        `}
                      >
                        <div className={`w-3 h-3 rounded-full ${status.color}`} />
                        <span>{status.label}</span>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Active Filters & Clear */}
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2"
          >
            <div className="flex items-center space-x-2">
              {filters.platforms.map((platform) => {
                const Icon = platformIcons[platform];
                return (
                  <span
                    key={platform}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    <Icon className="w-3 h-3" />
                    <span className="capitalize">{platform}</span>
                    <button
                      onClick={() => togglePlatform(platform)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </span>
                );
              })}

              {filters.status.map((status) => {
                const statusConfig = statusOptions.find(s => s.value === status);
                return (
                  <span
                    key={status}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                  >
                    <div className={`w-2 h-2 rounded-full ${statusConfig?.color}`} />
                    <span>{statusConfig?.label}</span>
                    <button
                      onClick={() => toggleStatus(status)}
                      className="ml-1 hover:bg-blue-200 rounded-full p-0.5"
                    >
                      <X className="w-2 h-2" />
                    </button>
                  </span>
                );
              })}
            </div>

            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear all
            </button>
          </motion.div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(showPlatforms || showStatus) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setShowPlatforms(false);
            setShowStatus(false);
          }}
        />
      )}
    </div>
  );
};