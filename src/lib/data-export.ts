/**
 * @file data-export.ts
 * @description 데이터 내보내기/가져오기 유틸리티
 */

import { db } from './db';
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
// Types
// ============================================

export interface ExportData {
  version: string;
  exportedAt: string;
  data: {
    contents: Content[];
    interviews: InterviewSession[];
    memos: Memo[];
    connections: Connection[];
    tags: Tag[];
    reflections: Reflection[];
    userProfile: UserProfile | null;
  };
  meta: {
    totalContents: number;
    totalMemos: number;
    totalConnections: number;
    totalTags: number;
  };
}

export interface ExportOptions {
  includeContents?: boolean;
  includeInterviews?: boolean;
  includeMemos?: boolean;
  includeConnections?: boolean;
  includeTags?: boolean;
  includeReflections?: boolean;
  includeUserProfile?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  tagFilter?: string[];
}

export interface ImportResult {
  success: boolean;
  imported: {
    contents: number;
    interviews: number;
    memos: number;
    connections: number;
    tags: number;
    reflections: number;
  };
  errors: string[];
}

// ============================================
// Export Functions
// ============================================

/**
 * Export all data to JSON
 */
export async function exportToJSON(
  options: ExportOptions = {}
): Promise<ExportData> {
  const {
    includeContents = true,
    includeInterviews = true,
    includeMemos = true,
    includeConnections = true,
    includeTags = true,
    includeReflections = true,
    includeUserProfile = true,
    dateRange,
    tagFilter,
  } = options;

  // Fetch all data
  let contents: Content[] = [];
  let interviews: InterviewSession[] = [];
  let memos: Memo[] = [];
  let connections: Connection[] = [];
  let tags: Tag[] = [];
  let reflections: Reflection[] = [];
  let userProfile: UserProfile | null = null;

  if (includeContents) {
    contents = await db.contents.toArray();

    // Apply date filter
    if (dateRange) {
      contents = contents.filter(
        (c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end
      );
    }

    // Apply tag filter
    if (tagFilter && tagFilter.length > 0) {
      contents = contents.filter((c) =>
        c.tags.some((t) => tagFilter.includes(t))
      );
    }
  }

  if (includeInterviews) {
    interviews = await db.interviews.toArray();
    if (dateRange) {
      interviews = interviews.filter(
        (s) => s.createdAt >= dateRange.start && s.createdAt <= dateRange.end
      );
    }
  }

  if (includeMemos) {
    memos = await db.memos.toArray();
    if (dateRange) {
      memos = memos.filter(
        (m) => m.createdAt >= dateRange.start && m.createdAt <= dateRange.end
      );
    }
    if (tagFilter && tagFilter.length > 0) {
      memos = memos.filter((m) => m.tags.some((t) => tagFilter.includes(t)));
    }
  }

  if (includeConnections) {
    connections = await db.connections.toArray();
    if (dateRange) {
      connections = connections.filter(
        (c) => c.createdAt >= dateRange.start && c.createdAt <= dateRange.end
      );
    }
  }

  if (includeTags) {
    tags = await db.tags.toArray();
    if (tagFilter && tagFilter.length > 0) {
      tags = tags.filter((t) => tagFilter.includes(t.id));
    }
  }

  if (includeReflections) {
    reflections = await db.reflections.toArray();
    if (dateRange) {
      reflections = reflections.filter(
        (r) => r.createdAt >= dateRange.start && r.createdAt <= dateRange.end
      );
    }
  }

  if (includeUserProfile) {
    userProfile = (await db.userProfile.toArray())[0] || null;
  }

  return {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    data: {
      contents,
      interviews,
      memos,
      connections,
      tags,
      reflections,
      userProfile,
    },
    meta: {
      totalContents: contents.length,
      totalMemos: memos.length,
      totalConnections: connections.length,
      totalTags: tags.length,
    },
  };
}

/**
 * Download data as JSON file
 */
export async function downloadJSON(options: ExportOptions = {}): Promise<void> {
  const data = await exportToJSON(options);
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mosaic-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export to Markdown format
 */
export async function exportToMarkdown(
  options: ExportOptions = {}
): Promise<string> {
  const data = await exportToJSON(options);

  let md = `# Mosaic 학습 기록\n\n`;
  md += `> 내보낸 날짜: ${new Date().toLocaleDateString('ko-KR')}\n\n`;
  md += `---\n\n`;

  // Contents
  if (data.data.contents.length > 0) {
    md += `## 학습 콘텐츠 (${data.data.contents.length}개)\n\n`;

    for (const content of data.data.contents) {
      md += `### ${content.title}\n\n`;
      md += `- **유형**: ${content.type}\n`;
      md += `- **상태**: ${content.status}\n`;
      md += `- **태그**: ${content.tags.join(', ') || '없음'}\n`;
      md += `- **생성일**: ${new Date(content.createdAt).toLocaleDateString('ko-KR')}\n`;

      if (content.url) {
        md += `- **URL**: ${content.url}\n`;
      }

      if (content.body) {
        md += `\n${content.body}\n`;
      }

      if (content.summary) {
        md += `\n**요약**: ${content.summary}\n`;
      }

      if (content.counterpoint) {
        md += `\n**대척점**: ${content.counterpoint}\n`;
      }

      md += `\n---\n\n`;
    }
  }

  // Memos
  if (data.data.memos.length > 0) {
    md += `## 메모 (${data.data.memos.length}개)\n\n`;

    for (const memo of data.data.memos) {
      md += `### 메모 - ${new Date(memo.createdAt).toLocaleDateString('ko-KR')}\n\n`;
      md += `${memo.text}\n\n`;
      if (memo.tags.length > 0) {
        md += `태그: ${memo.tags.join(', ')}\n`;
      }
      md += `\n---\n\n`;
    }
  }

  // Connections
  if (data.data.connections.length > 0) {
    md += `## 발견한 연결 (${data.data.connections.length}개)\n\n`;

    for (const conn of data.data.connections) {
      md += `- **${conn.relationship}** 연결 (강도: ${conn.strength})\n`;
      md += `  - ${conn.sourceType}: ${conn.sourceId} → ${conn.targetType}: ${conn.targetId}\n`;
    }
    md += `\n`;
  }

  // Reflections
  if (data.data.reflections.length > 0) {
    md += `## 회고 (${data.data.reflections.length}개)\n\n`;

    for (const reflection of data.data.reflections) {
      md += `### ${reflection.type} 회고 - ${new Date(reflection.createdAt).toLocaleDateString('ko-KR')}\n\n`;

      if (reflection.report.narrative) {
        md += `${reflection.report.narrative}\n\n`;
      }

      if (reflection.report.patterns && reflection.report.patterns.length > 0) {
        md += `**발견된 패턴**:\n`;
        reflection.report.patterns.forEach((pattern) => {
          md += `- ${pattern.description}\n`;
        });
        md += `\n`;
      }

      md += `**통계**:\n`;
      md += `- 학습 콘텐츠: ${reflection.report.stats.contentsRead}개\n`;
      md += `- 인터뷰 세션: ${reflection.report.stats.interviewSessions}개\n`;
      md += `- 메모: ${reflection.report.stats.memosWritten}개\n`;
      md += `- 연결: ${reflection.report.stats.connectionsFound}개\n`;

      md += `\n---\n\n`;
    }
  }

  return md;
}

/**
 * Download data as Markdown file
 */
export async function downloadMarkdown(
  options: ExportOptions = {}
): Promise<void> {
  const md = await exportToMarkdown(options);
  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `mosaic-export-${new Date().toISOString().split('T')[0]}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ============================================
// Import Functions
// ============================================

/**
 * Validate import data structure
 */
function validateImportData(data: unknown): data is ExportData {
  if (!data || typeof data !== 'object') return false;

  const d = data as Record<string, unknown>;

  if (typeof d.version !== 'string') return false;
  if (!d.data || typeof d.data !== 'object') return false;

  return true;
}

/**
 * Import data from JSON
 */
export async function importFromJSON(
  jsonData: string | ExportData,
  options: {
    merge?: boolean; // If true, merge with existing data. If false, replace.
    skipDuplicates?: boolean;
  } = {}
): Promise<ImportResult> {
  const { merge = true, skipDuplicates = true } = options;

  const result: ImportResult = {
    success: false,
    imported: {
      contents: 0,
      interviews: 0,
      memos: 0,
      connections: 0,
      tags: 0,
      reflections: 0,
    },
    errors: [],
  };

  try {
    // Parse JSON if string
    const data: ExportData =
      typeof jsonData === 'string' ? JSON.parse(jsonData) : jsonData;

    // Validate data structure
    if (!validateImportData(data)) {
      result.errors.push('Invalid data format');
      return result;
    }

    // Clear existing data if not merging
    if (!merge) {
      await db.contents.clear();
      await db.interviews.clear();
      await db.memos.clear();
      await db.connections.clear();
      await db.tags.clear();
      await db.reflections.clear();
    }

    // Get existing IDs to check for duplicates
    const existingContentIds = new Set(
      (await db.contents.toArray()).map((c) => c.id)
    );
    const existingInterviewIds = new Set(
      (await db.interviews.toArray()).map((s) => s.id)
    );
    const existingMemoIds = new Set(
      (await db.memos.toArray()).map((m) => m.id)
    );
    const existingConnectionIds = new Set(
      (await db.connections.toArray()).map((c) => c.id)
    );
    const existingTagIds = new Set((await db.tags.toArray()).map((t) => t.id));
    const existingReflectionIds = new Set(
      (await db.reflections.toArray()).map((r) => r.id)
    );

    // Import tags first (other data may reference them)
    if (data.data.tags) {
      for (const tag of data.data.tags) {
        if (skipDuplicates && existingTagIds.has(tag.id)) continue;

        try {
          // Convert dates
          const tagWithDates = {
            ...tag,
            createdAt: new Date(tag.createdAt),
          };
          await db.tags.put(tagWithDates);
          result.imported.tags++;
        } catch (e) {
          result.errors.push(`Failed to import tag: ${tag.name}`);
        }
      }
    }

    // Import contents
    if (data.data.contents) {
      for (const content of data.data.contents) {
        if (skipDuplicates && existingContentIds.has(content.id)) continue;

        try {
          const contentWithDates = {
            ...content,
            createdAt: new Date(content.createdAt),
            completedAt: content.completedAt ? new Date(content.completedAt) : undefined,
          };
          await db.contents.put(contentWithDates);
          result.imported.contents++;
        } catch (e) {
          result.errors.push(`Failed to import content: ${content.title}`);
        }
      }
    }

    // Import interviews
    if (data.data.interviews) {
      for (const interview of data.data.interviews) {
        if (skipDuplicates && existingInterviewIds.has(interview.id)) continue;

        try {
          const interviewWithDates = {
            ...interview,
            createdAt: new Date(interview.createdAt),
            completedAt: interview.completedAt ? new Date(interview.completedAt) : undefined,
            exchanges: interview.exchanges.map((e) => ({
              ...e,
              timestamp: new Date(e.timestamp),
            })),
          };
          await db.interviews.put(interviewWithDates);
          result.imported.interviews++;
        } catch (e) {
          result.errors.push(`Failed to import interview: ${interview.id}`);
        }
      }
    }

    // Import memos
    if (data.data.memos) {
      for (const memo of data.data.memos) {
        if (skipDuplicates && existingMemoIds.has(memo.id)) continue;

        try {
          const memoWithDates = {
            ...memo,
            createdAt: new Date(memo.createdAt),
          };
          await db.memos.put(memoWithDates);
          result.imported.memos++;
        } catch (e) {
          result.errors.push(`Failed to import memo: ${memo.id}`);
        }
      }
    }

    // Import connections
    if (data.data.connections) {
      for (const connection of data.data.connections) {
        if (skipDuplicates && existingConnectionIds.has(connection.id)) continue;

        try {
          const connWithDates = {
            ...connection,
            createdAt: new Date(connection.createdAt),
          };
          await db.connections.put(connWithDates);
          result.imported.connections++;
        } catch (e) {
          result.errors.push(`Failed to import connection: ${connection.id}`);
        }
      }
    }

    // Import reflections
    if (data.data.reflections) {
      for (const reflection of data.data.reflections) {
        if (skipDuplicates && existingReflectionIds.has(reflection.id)) continue;

        try {
          const reflectionWithDates = {
            ...reflection,
            createdAt: new Date(reflection.createdAt),
            period: {
              start: new Date(reflection.period.start),
              end: new Date(reflection.period.end),
            },
          };
          await db.reflections.put(reflectionWithDates);
          result.imported.reflections++;
        } catch (e) {
          result.errors.push(`Failed to import reflection: ${reflection.id}`);
        }
      }
    }

    // Import user profile
    if (data.data.userProfile) {
      try {
        const profileWithDates: UserProfile = {
          ...data.data.userProfile,
          createdAt: new Date(data.data.userProfile.createdAt),
          updatedAt: new Date(data.data.userProfile.updatedAt),
        };
        await db.userProfile.put(profileWithDates);
      } catch (e) {
        result.errors.push('Failed to import user profile');
      }
    }

    result.success = result.errors.length === 0;
  } catch (e) {
    result.errors.push(`Import failed: ${(e as Error).message}`);
  }

  return result;
}

/**
 * Import from file
 */
export async function importFromFile(file: File): Promise<ImportResult> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const jsonData = e.target?.result as string;
        const result = await importFromJSON(jsonData);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsText(file);
  });
}

// ============================================
// Storage Info
// ============================================

export interface StorageInfo {
  used: number;
  quota: number;
  usedFormatted: string;
  quotaFormatted: string;
  percentUsed: number;
}

/**
 * Get storage usage info
 */
export async function getStorageInfo(): Promise<StorageInfo | null> {
  if (!navigator.storage || !navigator.storage.estimate) {
    return null;
  }

  try {
    const estimate = await navigator.storage.estimate();
    const used = estimate.usage || 0;
    const quota = estimate.quota || 0;

    const formatBytes = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    return {
      used,
      quota,
      usedFormatted: formatBytes(used),
      quotaFormatted: formatBytes(quota),
      percentUsed: quota > 0 ? Math.round((used / quota) * 100) : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Clear all data (factory reset)
 */
export async function clearAllData(): Promise<void> {
  await db.contents.clear();
  await db.interviews.clear();
  await db.memos.clear();
  await db.connections.clear();
  await db.tags.clear();
  await db.reflections.clear();
  await db.userProfile.clear();
}
