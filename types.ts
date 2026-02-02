export interface LessonSlot {
  label: string;
  start: string;
  end: string;
}

export interface SpecialDay {
  name: string;
  date: string;
  type: 'Doğum Günü' | 'Özel Gün';
}

export interface Announcement {
  id: string;
  text: string;
}

export interface DutySection {
  sectionName: string;
  teachers: string;
}

export interface SchoolData {
  name: string;
  motto: string;
  startTime: string; // Yeni eklenen alan
  endTime: string;   // Yeni eklenen alan
  slots: LessonSlot[];
  announcements: Announcement[];
  dutyTeachers: { [day: string]: DutySection[] };
  specialDays: SpecialDay[];
}

export interface BoardConfig {
  morning: SchoolData;
  afternoon: SchoolData;
  course: SchoolData; // Kurs merkezi için eklenen alan
}
