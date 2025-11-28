import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  User,
  Comrade,
  Post,
  Comment,
  Conversation,
  Message,
  Organization,
  OrgMembership,
  AVATAR_COLORS,
} from "@/types";

const KEYS = {
  USER: "comrade_user",
  COMRADES: "comrade_comrades",
  POSTS: "comrade_posts",
  COMMENTS: "comrade_comments",
  CONVERSATIONS: "comrade_conversations",
  MESSAGES: "comrade_messages",
  ORGANIZATIONS: "comrade_organizations",
  MEMBERSHIPS: "comrade_memberships",
  BIOMETRIC_ENABLED: "comrade_biometric_enabled",
  SELECTED_CITY: "comrade_selected_city",
};

export async function getUser(): Promise<User | null> {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export async function saveUser(user: User): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
}

export async function createUser(displayName: string, city: string): Promise<User> {
  const user: User = {
    id: generateId(),
    displayName,
    bio: "",
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    city,
    createdAt: Date.now(),
    publicKey: generateId(),
  };
  await saveUser(user);
  return user;
}

export async function clearUser(): Promise<void> {
  await AsyncStorage.removeItem(KEYS.USER);
}

export async function getComrades(): Promise<Comrade[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMRADES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveComrades(comrades: Comrade[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMRADES, JSON.stringify(comrades));
}

export async function addComrade(comradeUserId: string): Promise<Comrade> {
  const user = await getUser();
  if (!user) throw new Error("No user logged in");
  
  const comrades = await getComrades();
  const comrade: Comrade = {
    id: generateId(),
    userId: user.id,
    comradeId: comradeUserId,
    addedAt: Date.now(),
  };
  comrades.push(comrade);
  await saveComrades(comrades);
  return comrade;
}

export async function getPosts(): Promise<Post[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function savePosts(posts: Post[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.POSTS, JSON.stringify(posts));
}

export async function createPost(
  content: string,
  city: string,
  organizationId?: string,
  organizationName?: string
): Promise<Post> {
  const user = await getUser();
  if (!user) throw new Error("No user logged in");
  
  const posts = await getPosts();
  const post: Post = {
    id: generateId(),
    authorId: user.id,
    authorName: user.displayName,
    authorAvatarColor: user.avatarColor,
    content,
    city,
    organizationId,
    organizationName,
    isOrgPost: !!organizationId,
    createdAt: Date.now(),
    likes: 0,
    commentCount: 0,
    isLiked: false,
  };
  posts.unshift(post);
  await savePosts(posts);
  return post;
}

export async function togglePostLike(postId: string): Promise<void> {
  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.isLiked = !post.isLiked;
    post.likes += post.isLiked ? 1 : -1;
    await savePosts(posts);
  }
}

export async function getComments(postId: string): Promise<Comment[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.COMMENTS);
    const allComments: Comment[] = data ? JSON.parse(data) : [];
    return allComments.filter((c) => c.postId === postId);
  } catch {
    return [];
  }
}

export async function saveAllComments(comments: Comment[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.COMMENTS, JSON.stringify(comments));
}

export async function createComment(
  postId: string,
  content: string,
  parentId?: string
): Promise<Comment> {
  const user = await getUser();
  if (!user) throw new Error("No user logged in");
  
  const data = await AsyncStorage.getItem(KEYS.COMMENTS);
  const allComments: Comment[] = data ? JSON.parse(data) : [];
  
  const comment: Comment = {
    id: generateId(),
    postId,
    authorId: user.id,
    authorName: user.displayName,
    authorAvatarColor: user.avatarColor,
    content,
    parentId,
    createdAt: Date.now(),
    likes: 0,
    isLiked: false,
  };
  allComments.push(comment);
  await saveAllComments(allComments);
  
  const posts = await getPosts();
  const post = posts.find((p) => p.id === postId);
  if (post) {
    post.commentCount += 1;
    await savePosts(posts);
  }
  
  return comment;
}

export async function getConversations(): Promise<Conversation[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveConversations(conversations: Conversation[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.CONVERSATIONS, JSON.stringify(conversations));
}

export async function createConversation(
  participantIds: string[],
  participantNames: string[],
  type: "direct" | "group" = "direct"
): Promise<Conversation> {
  const conversations = await getConversations();
  const conversation: Conversation = {
    id: generateId(),
    type,
    participantIds,
    participantNames,
    unreadCount: 0,
    isEncrypted: true,
  };
  conversations.unshift(conversation);
  await saveConversations(conversations);
  return conversation;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MESSAGES);
    const allMessages: Message[] = data ? JSON.parse(data) : [];
    return allMessages.filter((m) => m.conversationId === conversationId);
  } catch {
    return [];
  }
}

export async function saveAllMessages(messages: Message[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MESSAGES, JSON.stringify(messages));
}

export async function sendMessage(
  conversationId: string,
  content: string
): Promise<Message> {
  const user = await getUser();
  if (!user) throw new Error("No user logged in");
  
  const data = await AsyncStorage.getItem(KEYS.MESSAGES);
  const allMessages: Message[] = data ? JSON.parse(data) : [];
  
  const message: Message = {
    id: generateId(),
    conversationId,
    senderId: user.id,
    senderName: user.displayName,
    content,
    createdAt: Date.now(),
    isRead: false,
  };
  allMessages.push(message);
  await saveAllMessages(allMessages);
  
  const conversations = await getConversations();
  const conversation = conversations.find((c) => c.id === conversationId);
  if (conversation) {
    conversation.lastMessage = content;
    conversation.lastMessageAt = Date.now();
    await saveConversations(conversations);
  }
  
  return message;
}

export async function getOrganizations(): Promise<Organization[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.ORGANIZATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveOrganizations(orgs: Organization[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.ORGANIZATIONS, JSON.stringify(orgs));
}

export async function createOrganization(
  name: string,
  description: string,
  city: string,
  isPublic: boolean = true
): Promise<Organization> {
  const user = await getUser();
  if (!user) throw new Error("No user logged in");
  
  const orgs = await getOrganizations();
  const org: Organization = {
    id: generateId(),
    name,
    description,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
    ownerId: user.id,
    city,
    memberCount: 1,
    isPublic,
    createdAt: Date.now(),
  };
  orgs.push(org);
  await saveOrganizations(orgs);
  
  await addMembership(org.id, user.id, "owner");
  
  return org;
}

export async function getMemberships(): Promise<OrgMembership[]> {
  try {
    const data = await AsyncStorage.getItem(KEYS.MEMBERSHIPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function saveMemberships(memberships: OrgMembership[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.MEMBERSHIPS, JSON.stringify(memberships));
}

export async function addMembership(
  organizationId: string,
  userId: string,
  role: "owner" | "admin" | "member" = "member"
): Promise<OrgMembership> {
  const memberships = await getMemberships();
  const membership: OrgMembership = {
    id: generateId(),
    organizationId,
    userId,
    role,
    joinedAt: Date.now(),
  };
  memberships.push(membership);
  await saveMemberships(memberships);
  return membership;
}

export async function getUserMemberships(userId: string): Promise<OrgMembership[]> {
  const memberships = await getMemberships();
  return memberships.filter((m) => m.userId === userId);
}

export async function getOrgMemberships(orgId: string): Promise<OrgMembership[]> {
  const memberships = await getMemberships();
  return memberships.filter((m) => m.organizationId === orgId);
}

export async function getBiometricEnabled(): Promise<boolean> {
  try {
    const data = await AsyncStorage.getItem(KEYS.BIOMETRIC_ENABLED);
    return data === "true";
  } catch {
    return false;
  }
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.BIOMETRIC_ENABLED, enabled ? "true" : "false");
}

export async function getSelectedCity(): Promise<string> {
  try {
    const data = await AsyncStorage.getItem(KEYS.SELECTED_CITY);
    return data || "sf";
  } catch {
    return "sf";
  }
}

export async function setSelectedCity(cityId: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.SELECTED_CITY, cityId);
}

export async function clearAllData(): Promise<void> {
  await AsyncStorage.multiRemove(Object.values(KEYS));
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}
