import { Message, Thread, Comment, Contact, Platform } from '../types/messaging';

const mockContacts: Contact[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@example.com',
    username: '@sarahj_official',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    platform: 'instagram'
  },
  {
    id: '2',
    name: 'Mark Thompson',
    email: 'mark.thompson@company.com',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    platform: 'email'
  },
  {
    id: '3',
    name: 'Emily Chen',
    username: '@emilychen',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    platform: 'twitter'
  },
  {
    id: '4',
    name: 'Alex Rodriguez',
    username: 'alex.rodriguez',
    avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150',
    platform: 'linkedin'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    threadId: 'thread-1',
    platform: 'instagram',
    type: 'dm',
    content: 'Hi! I love your recent post about sustainable fashion. Could you share more tips on eco-friendly brands?',
    sender: mockContacts[0],
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 mins ago
    status: 'unread',
    isRead: false,
    campaignId: 'sustainable-fashion-2024'
  },
  {
    id: '2',
    threadId: 'thread-2',
    platform: 'email',
    type: 'email',
    content: 'Thank you for considering our collaboration proposal. We believe your audience would love our new product line. When would be a good time to discuss this further?',
    sender: mockContacts[1],
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    status: 'read',
    isRead: true,
    campaignId: 'brand-collaborations-q1'
  },
  {
    id: '3',
    threadId: 'thread-3',
    platform: 'twitter',
    type: 'mention',
    content: '@yourusername Your latest video was incredibly inspiring! How do you stay motivated during challenging times?',
    sender: mockContacts[2],
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    status: 'unread',
    isRead: false
  },
  {
    id: '4',
    threadId: 'thread-4',
    platform: 'linkedin',
    type: 'dm',
    content: 'I saw your post about digital marketing trends. Would you be interested in guest speaking at our upcoming conference?',
    sender: mockContacts[3],
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    status: 'replied',
    isRead: true
  },
  {
    id: '5',
    threadId: 'thread-5',
    platform: 'instagram',
    type: 'comment',
    content: 'This is exactly what I needed to hear today! Thank you for sharing your journey with us.',
    sender: {
      id: '5',
      name: 'Jessica Williams',
      username: '@jessicaw',
      avatar: 'https://images.pexels.com/photos/1542085/pexels-photo-1542085.jpeg?auto=compress&cs=tinysrgb&w=150',
      platform: 'instagram'
    },
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    status: 'unread',
    isRead: false
  }
];

export const mockComments: Comment[] = [
  {
    id: 'comment-1',
    platform: 'instagram',
    postId: 'post-123',
    postTitle: 'Morning routine for productivity',
    content: 'This morning routine changed my life! Thank you for sharing these amazing tips. Do you have any recommendations for evening routines too?',
    author: {
      id: '6',
      name: 'David Kim',
      username: '@davidkim_fit',
      avatar: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=150',
      platform: 'instagram'
    },
    timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
    replied: false,
    likes: 12
  },
  {
    id: 'comment-2',
    platform: 'youtube',
    postId: 'video-456',
    postTitle: 'How to Start Your Influencer Journey',
    content: 'Great video! I\'ve been struggling with content consistency. Your tips on batch creating content are gold!',
    author: {
      id: '7',
      name: 'Maria Santos',
      username: '@mariasantos',
      avatar: 'https://images.pexels.com/photos/1674752/pexels-photo-1674752.jpeg?auto=compress&cs=tinysrgb&w=150',
      platform: 'youtube'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    replied: true,
    likes: 8,
    replies: [
      {
        id: 'reply-1',
        platform: 'youtube',
        postId: 'video-456',
        postTitle: 'How to Start Your Influencer Journey',
        content: 'Thank you so much! I\'m glad the tips helped. Consistency is definitely key - you\'ve got this!',
        author: {
          id: 'me',
          name: 'You',
          username: '@yourusername',
          avatar: 'https://images.pexels.com/photos/1680172/pexels-photo-1680172.jpeg?auto=compress&cs=tinysrgb&w=150',
          platform: 'youtube'
        },
        timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
        replied: false
      }
    ]
  }
];

export const mockThreads: Thread[] = [
  {
    id: 'thread-1',
    platform: 'instagram',
    participants: [mockContacts[0]],
    messages: [mockMessages[0]],
    lastUpdated: mockMessages[0].timestamp,
    isRead: false,
    subject: 'Sustainable Fashion Tips'
  },
  {
    id: 'thread-2',
    platform: 'email',
    participants: [mockContacts[1]],
    messages: [mockMessages[1]],
    lastUpdated: mockMessages[1].timestamp,
    isRead: true,
    subject: 'Collaboration Proposal - Spring Collection'
  }
];