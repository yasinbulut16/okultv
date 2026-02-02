export interface LessonSlot { label: string; start: string; end: string; }
export interface DutySection { sectionName: string; teachers: string; }
export interface SchoolData {
  name: string; motto: string; startTime: string; endTime: string;
  slots: LessonSlot[]; announcements: any[]; dutyTeachers: { [day: string]: DutySection[] };
  specialDays: any[];
}
export interface BoardConfig { morning: SchoolData; afternoon: SchoolData; course: SchoolData; }