
export interface Announcement {
  id: string;
  text: string;
}

export interface DutySection {
  sectionName: string;
  teachers: string;
}

export interface LessonSlot {
  label: string;
  start: string;
  end: string;
}

export interface SpecialDay {
  name: string;
  date: string; // GG.AA
  type: 'Doğum Günü' | 'Özel Gün';
}

export interface SchoolData {
  name: string;
  motto: string;
  slots: LessonSlot[];
  announcements: Announcement[];
  dutyTeachers: { [day: string]: DutySection[] };
  specialDays: SpecialDay[];
}

export interface BoardConfig {
  morning: SchoolData;
  afternoon: SchoolData;
}
