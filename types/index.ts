export interface User {
  id: string;
  displayName: string;
  bio: string;
  avatarColor: string;
  city: string;
  createdAt: number;
  publicKey: string;
}

export interface Comrade {
  id: string;
  userId: string;
  comradeId: string;
  addedAt: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  city: string;
  organizationId?: string;
  organizationName?: string;
  isOrgPost: boolean;
  createdAt: number;
  likes: number;
  commentCount: number;
  isLiked: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorAvatarColor: string;
  content: string;
  parentId?: string;
  createdAt: number;
  likes: number;
  isLiked: boolean;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  participantIds: string[];
  participantNames: string[];
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  isEncrypted: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  encryptedContent?: string;
  createdAt: number;
  isRead: boolean;
}

export interface Organization {
  id: string;
  name: string;
  description: string;
  avatarColor: string;
  ownerId: string;
  city: string;
  memberCount: number;
  isPublic: boolean;
  createdAt: number;
}

export interface OrgMembership {
  id: string;
  organizationId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: number;
}

export interface City {
  id: string;
  name: string;
  country: string;
}

export const AVATAR_COLORS = [
  "#8B7355",
  "#D4A373",
  "#6B8E23",
  "#A67B5B",
  "#9CAF88",
  "#B5838D",
];

export const CITIES: City[] = [
  { id: "sf", name: "San Francisco", country: "USA" },
  { id: "nyc", name: "New York", country: "USA" },
  { id: "la", name: "Los Angeles", country: "USA" },
  { id: "chicago", name: "Chicago", country: "USA" },
  { id: "seattle", name: "Seattle", country: "USA" },
  { id: "austin", name: "Austin", country: "USA" },
  { id: "boston", name: "Boston", country: "USA" },
  { id: "denver", name: "Denver", country: "USA" },
  { id: "miami", name: "Miami", country: "USA" },
  { id: "portland", name: "Portland", country: "USA" },
];
