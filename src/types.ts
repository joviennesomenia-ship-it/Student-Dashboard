export interface Link { label: string; url: string }
export interface Subject { id: string; name: string; emoji: string; color: string }
export interface Task {
  id: string; title: string; description?: string; subjectId: string; dueAt: string
  priority?: 'Low' | 'Medium' | 'High'; rubric?: string; links?: Link[]
}
export interface FileRef { name: string; url: string; size?: string; uploadedAt?: string }
export type Term = 'Term 1' | 'Term 2' | 'Term 3'
export interface Reviewer {
  id: string; title: string; description?: string; subjectId: string; term?: Term; tag?: string
  files?: FileRef[]; links?: Link[]
}
export interface EventItem { id: string; title: string; startsAt: string; location?: string; description?: string }
export interface Announcement { id: string; title: string; body: string; pinned?: boolean; createdAt: string }
export interface Data {
  subjects: Subject[]; tasks: Task[]; performanceTasks: Task[]
  reviewers: Reviewer[]; events: EventItem[]; announcements: Announcement[]
}
