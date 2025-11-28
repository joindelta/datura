import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import {
  Post,
  Comment,
  Conversation,
  Message,
  Organization,
  OrgMembership,
  Comrade,
} from "@/types";
import {
  getPosts,
  createPost as createPostStorage,
  togglePostLike as togglePostLikeStorage,
  getComments,
  createComment as createCommentStorage,
  getConversations,
  createConversation as createConversationStorage,
  getMessages,
  sendMessage as sendMessageStorage,
  getOrganizations,
  createOrganization as createOrgStorage,
  getMemberships,
  getUserMemberships,
  getOrgMemberships,
  addMembership as addMembershipStorage,
  getComrades,
  addComrade as addComradeStorage,
  getSelectedCity,
  setSelectedCity as setSelectedCityStorage,
  getUser,
} from "@/utils/storage";
import { useAuth } from "./AuthContext";

interface DataContextType {
  posts: Post[];
  conversations: Conversation[];
  organizations: Organization[];
  userMemberships: OrgMembership[];
  comrades: Comrade[];
  selectedCity: string;
  isLoading: boolean;
  refreshPosts: () => Promise<void>;
  createPost: (content: string, orgId?: string, orgName?: string) => Promise<Post>;
  togglePostLike: (postId: string) => Promise<void>;
  getPostComments: (postId: string) => Promise<Comment[]>;
  createComment: (postId: string, content: string, parentId?: string) => Promise<Comment>;
  refreshConversations: () => Promise<void>;
  createConversation: (participantIds: string[], participantNames: string[], type?: "direct" | "group") => Promise<Conversation>;
  getConversationMessages: (conversationId: string) => Promise<Message[]>;
  sendMessage: (conversationId: string, content: string) => Promise<Message>;
  refreshOrganizations: () => Promise<void>;
  createOrganization: (name: string, description: string, isPublic?: boolean) => Promise<Organization>;
  joinOrganization: (orgId: string) => Promise<void>;
  getOrganizationMembers: (orgId: string) => Promise<OrgMembership[]>;
  refreshComrades: () => Promise<void>;
  addComrade: (comradeUserId: string) => Promise<Comrade>;
  setSelectedCity: (cityId: string) => Promise<void>;
  getCityName: (cityId: string) => string;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [userMemberships, setUserMemberships] = useState<OrgMembership[]>([]);
  const [comrades, setComrades] = useState<Comrade[]>([]);
  const [selectedCity, setSelectedCityState] = useState<string>("sf");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  async function loadAllData() {
    setIsLoading(true);
    try {
      await Promise.all([
        refreshPosts(),
        refreshConversations(),
        refreshOrganizations(),
        refreshComrades(),
        loadSelectedCity(),
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadSelectedCity() {
    const city = await getSelectedCity();
    setSelectedCityState(city);
  }

  const refreshPosts = useCallback(async () => {
    const allPosts = await getPosts();
    setPosts(allPosts);
  }, []);

  async function createPost(content: string, orgId?: string, orgName?: string): Promise<Post> {
    const post = await createPostStorage(content, selectedCity, orgId, orgName);
    await refreshPosts();
    return post;
  }

  async function togglePostLike(postId: string) {
    await togglePostLikeStorage(postId);
    await refreshPosts();
  }

  async function getPostComments(postId: string): Promise<Comment[]> {
    return getComments(postId);
  }

  async function createComment(postId: string, content: string, parentId?: string): Promise<Comment> {
    const comment = await createCommentStorage(postId, content, parentId);
    await refreshPosts();
    return comment;
  }

  const refreshConversations = useCallback(async () => {
    const allConversations = await getConversations();
    setConversations(allConversations);
  }, []);

  async function createConversation(
    participantIds: string[],
    participantNames: string[],
    type: "direct" | "group" = "direct"
  ): Promise<Conversation> {
    const conversation = await createConversationStorage(participantIds, participantNames, type);
    await refreshConversations();
    return conversation;
  }

  async function getConversationMessages(conversationId: string): Promise<Message[]> {
    return getMessages(conversationId);
  }

  async function sendMessage(conversationId: string, content: string): Promise<Message> {
    const message = await sendMessageStorage(conversationId, content);
    await refreshConversations();
    return message;
  }

  const refreshOrganizations = useCallback(async () => {
    const [allOrgs, allMemberships] = await Promise.all([
      getOrganizations(),
      getMemberships(),
    ]);
    setOrganizations(allOrgs);
    
    const currentUser = await getUser();
    if (currentUser) {
      const userMems = allMemberships.filter((m) => m.userId === currentUser.id);
      setUserMemberships(userMems);
    }
  }, []);

  async function createOrganization(
    name: string,
    description: string,
    isPublic: boolean = true
  ): Promise<Organization> {
    const org = await createOrgStorage(name, description, selectedCity, isPublic);
    await refreshOrganizations();
    return org;
  }

  async function joinOrganization(orgId: string) {
    const currentUser = await getUser();
    if (!currentUser) return;
    await addMembershipStorage(orgId, currentUser.id, "member");
    await refreshOrganizations();
  }

  async function getOrganizationMembers(orgId: string): Promise<OrgMembership[]> {
    return getOrgMemberships(orgId);
  }

  const refreshComrades = useCallback(async () => {
    const allComrades = await getComrades();
    setComrades(allComrades);
  }, []);

  async function addComrade(comradeUserId: string): Promise<Comrade> {
    const comrade = await addComradeStorage(comradeUserId);
    await refreshComrades();
    return comrade;
  }

  async function setSelectedCity(cityId: string) {
    await setSelectedCityStorage(cityId);
    setSelectedCityState(cityId);
  }

  function getCityName(cityName: string): string {
    return cityName || "Unknown";
  }

  return (
    <DataContext.Provider
      value={{
        posts,
        conversations,
        organizations,
        userMemberships,
        comrades,
        selectedCity,
        isLoading,
        refreshPosts,
        createPost,
        togglePostLike,
        getPostComments,
        createComment,
        refreshConversations,
        createConversation,
        getConversationMessages,
        sendMessage,
        refreshOrganizations,
        createOrganization,
        joinOrganization,
        getOrganizationMembers,
        refreshComrades,
        addComrade,
        setSelectedCity,
        getCityName,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
