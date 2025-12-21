import Dexie, { type Table } from 'dexie';
import type {
  Content,
  InterviewSession,
  Memo,
  Connection,
  Tag,
  Reflection,
  UserProfile,
} from '@/types';

// ============================================
// MOSAIC Database
// ============================================

export class MosaicDB extends Dexie {
  contents!: Table<Content>;
  interviews!: Table<InterviewSession>;
  memos!: Table<Memo>;
  connections!: Table<Connection>;
  tags!: Table<Tag>;
  reflections!: Table<Reflection>;
  userProfile!: Table<UserProfile>;

  constructor() {
    super('MosaicDB');

    this.version(1).stores({
      contents: 'id, type, status, createdAt, *tags',
      interviews: 'id, contentId, createdAt',
      memos: 'id, contentId, sessionId, organized, createdAt, *tags',
      connections: 'id, sourceId, targetId, sourceType, targetType, createdAt',
      tags: 'id, name, category',
      reflections: 'id, type, createdAt',
      userProfile: 'id',
    });
  }
}

export const db = new MosaicDB();

// ============================================
// Database Helpers
// ============================================

// Initialize default user profile if not exists
export async function initializeUserProfile(): Promise<void> {
  const existing = await db.userProfile.get('default');
  if (!existing) {
    await db.userProfile.add({
      id: 'default',
      interests: [],
      learningPatterns: [],
      biases: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }
}

// Get user profile
export async function getUserProfile(): Promise<UserProfile | undefined> {
  return db.userProfile.get('default');
}

// Update user profile
export async function updateUserProfile(
  updates: Partial<UserProfile>
): Promise<void> {
  await db.userProfile.update('default', {
    ...updates,
    updatedAt: new Date(),
  });
}

// ============================================
// Content Operations
// ============================================

export async function addContent(content: Content): Promise<string> {
  return db.contents.add(content);
}

export async function getContent(id: string): Promise<Content | undefined> {
  return db.contents.get(id);
}

export async function getContentsByStatus(
  status: Content['status']
): Promise<Content[]> {
  return db.contents.where('status').equals(status).toArray();
}

export async function updateContent(
  id: string,
  updates: Partial<Content>
): Promise<void> {
  await db.contents.update(id, updates);
}

export async function deleteContent(id: string): Promise<void> {
  await db.contents.delete(id);
}

// ============================================
// Interview Operations
// ============================================

export async function addInterview(
  interview: InterviewSession
): Promise<string> {
  return db.interviews.add(interview);
}

export async function getInterview(
  id: string
): Promise<InterviewSession | undefined> {
  return db.interviews.get(id);
}

export async function getInterviewsByContent(
  contentId: string
): Promise<InterviewSession[]> {
  return db.interviews.where('contentId').equals(contentId).toArray();
}

export async function updateInterview(
  id: string,
  updates: Partial<InterviewSession>
): Promise<void> {
  await db.interviews.update(id, updates);
}

// ============================================
// Memo Operations
// ============================================

export async function addMemo(memo: Memo): Promise<string> {
  return db.memos.add(memo);
}

export async function getMemo(id: string): Promise<Memo | undefined> {
  return db.memos.get(id);
}

export async function getMemosByContent(contentId: string): Promise<Memo[]> {
  return db.memos.where('contentId').equals(contentId).toArray();
}

export async function getUnorganizedMemos(): Promise<Memo[]> {
  return db.memos.where('organized').equals(0).toArray();
}

export async function updateMemo(
  id: string,
  updates: Partial<Memo>
): Promise<void> {
  await db.memos.update(id, updates);
}

// ============================================
// Tag Operations
// ============================================

export async function addTag(tag: Tag): Promise<string> {
  return db.tags.add(tag);
}

export async function getTag(id: string): Promise<Tag | undefined> {
  return db.tags.get(id);
}

export async function getTagByName(name: string): Promise<Tag | undefined> {
  return db.tags.where('name').equals(name).first();
}

export async function getAllTags(): Promise<Tag[]> {
  return db.tags.toArray();
}

export async function incrementTagCount(id: string): Promise<void> {
  const tag = await db.tags.get(id);
  if (tag) {
    await db.tags.update(id, { count: tag.count + 1 });
  }
}

// ============================================
// Connection Operations
// ============================================

export async function addConnection(connection: Connection): Promise<string> {
  return db.connections.add(connection);
}

export async function getConnectionsBySource(
  sourceId: string
): Promise<Connection[]> {
  return db.connections.where('sourceId').equals(sourceId).toArray();
}

export async function getConnectionsByTarget(
  targetId: string
): Promise<Connection[]> {
  return db.connections.where('targetId').equals(targetId).toArray();
}

export async function getAllConnections(): Promise<Connection[]> {
  return db.connections.toArray();
}

// ============================================
// Reflection Operations
// ============================================

export async function addReflection(reflection: Reflection): Promise<string> {
  return db.reflections.add(reflection);
}

export async function getReflection(
  id: string
): Promise<Reflection | undefined> {
  return db.reflections.get(id);
}

export async function getReflectionsByType(
  type: Reflection['type']
): Promise<Reflection[]> {
  return db.reflections.where('type').equals(type).toArray();
}

export async function getAllReflections(): Promise<Reflection[]> {
  return db.reflections.orderBy('createdAt').reverse().toArray();
}

// ============================================
// Statistics
// ============================================

export async function getStats() {
  const [contents, interviews, memos, connections] = await Promise.all([
    db.contents.count(),
    db.interviews.count(),
    db.memos.count(),
    db.connections.count(),
  ]);

  const completed = await db.contents
    .where('status')
    .equals('completed')
    .count();
  const queued = await db.contents.where('status').equals('queued').count();
  const learning = await db.contents
    .where('status')
    .equals('learning')
    .count();

  return {
    totalContents: contents,
    completedContents: completed,
    queuedContents: queued,
    learningContents: learning,
    totalInterviews: interviews,
    totalMemos: memos,
    totalConnections: connections,
  };
}
