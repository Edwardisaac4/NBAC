import { EventDetails, Speaker, EventSession, SessionCategory } from "@/types";
import { SPEAKERS as SPEAKERS_ARRAY } from "../data/speakers";
import { SESSIONS } from "../data/sessions";

// Map array to Record for backward compatibility
export const SPEAKERS: Record<string, Speaker> = {};

const avatarMap: Record<string, string> = {
  'segun-demuren': '/images/SD ! NBAC.jpg',
  'erica-tlg': '/images/Ann umeh NBAC.jpg',
};

SPEAKERS_ARRAY.forEach((s) => {
  const speakerKey = s.id.replace(/-/g, '_');
  SPEAKERS[speakerKey] = {
    ...s,
    avatar_url: avatarMap[s.id] || undefined,
  };
});

// Helper functions for mapping SESSIONS to MOCK_EVENTS
const getSessionTimes = (sessionsList: typeof SESSIONS, index: number, current: typeof SESSIONS[0]) => {
  const start_time = current.time;
  let end_time = '';
  // Find the next session on the same day
  const nextSession = sessionsList.slice(index + 1).find(s => s.day === current.day);
  if (nextSession) {
    end_time = nextSession.time;
  } else {
    // If it's the last session of the day
    if (current.day === 'day_1') {
      end_time = '22:00'; // Gala ends at 22:00
    } else {
      end_time = '18:00'; // Closing / Cocktail ends at 18:00
    }
  }
  return { start_time, end_time };
};

const mapFormatToCategory = (format: string): SessionCategory => {
  switch (format) {
    case 'panel':
      return 'panel';
    case 'keynote':
    case 'presentation':
    case 'fireside':
      return 'keynote';
    case 'hackathon':
    case 'ceremony':
      return 'workshop';
    case 'dinner':
    case 'networking':
      return 'networking';
    case 'break':
    default:
      return 'break';
  }
};

const getSessionSpeakers = (session: typeof SESSIONS[0]): Speaker[] => {
  if (!session.panellists) return [];
  return session.panellists.map((p, i) => {
    const matched = SPEAKERS_ARRAY.find(s => 
      s.name.toLowerCase() === p.name.toLowerCase() ||
      s.id.toLowerCase() === p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')
    );
    if (matched) {
      return {
        ...matched,
        avatar_url: avatarMap[matched.id] || undefined,
      };
    }
    return {
      id: `temp-${p.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${i}`,
      name: p.name,
      title: p.role || 'Panellist',
      organisation: p.organisation || '',
      company: p.organisation || '',
    };
  });
};

const buildAbstract = (session: typeof SESSIONS[0]): string => {
  let parts = [session.subtitle || ''];
  if (session.keyAreas && session.keyAreas.length > 0) {
    parts.push('\n\nKey Areas:\n' + session.keyAreas.map(k => `• ${k}`).join('\n'));
  }
  if (session.questions && session.questions.length > 0) {
    parts.push('\n\nDiscussion Questions:\n' + session.questions.map((q, idx) => `${idx + 1}. ${q}`).join('\n'));
  }
  if (session.notes) {
    parts.push(`\n\nNote: ${session.notes}`);
  }
  return parts.join('\n').trim();
};

const day1List = SESSIONS.filter(s => s.day === 'day_1');
const day1Sessions: EventSession[] = day1List.map((s, index) => {
  const { start_time, end_time } = getSessionTimes(day1List, index, s);
  return {
    id: s.id,
    day: 'day_1',
    start_time,
    end_time,
    category: mapFormatToCategory(s.format),
    title: s.title,
    abstract: buildAbstract(s),
    speakers: getSessionSpeakers(s),
    location: 'Marriott Hotel, Ikeja, Lagos',
  };
});

const day2List = SESSIONS.filter(s => s.day === 'day_2');
const day2Sessions: EventSession[] = day2List.map((s, index) => {
  const { start_time, end_time } = getSessionTimes(day2List, index, s);
  return {
    id: s.id,
    day: 'day_2',
    start_time,
    end_time,
    category: mapFormatToCategory(s.format),
    title: s.title,
    abstract: buildAbstract(s),
    speakers: getSessionSpeakers(s),
    location: 'Marriott Hotel, Ikeja, Lagos (TBC)',
  };
});

export const MOCK_EVENTS: EventDetails[] = [
  {
    id: "nbac-2027-day-1",
    title: "NBAC 2027 Conference — Day 1",
    subtitle: "West Africa's Premier Aviation Assembly",
    date: "May 4, 2027",
    location: "Marriott Hotel, Ikeja, Lagos",
    description: "Day 1 of the flagship summit focusing on industry dialogue, regulatory frameworks, infrastructure ops, and financial structures in African aviation.",
    image_url: "/images/private_jet_runway_dusk.png",
    status: "featured",
    sessions: day1Sessions,
  },
  {
    id: "nbac-2027-day-2",
    title: "NBAC 2027 Conference — Day 2",
    subtitle: "Innovation, Sustainability & Leadership",
    date: "May 5, 2027",
    location: "Grand Ballroom, Marriott Hotel, Ikeja, Lagos",
    description: "Day 2 of the flagship summit focusing on ecosystem scale, sustainability, women leadership in aviation, innovation & tech, and speed networking.",
    image_url: "/images/interior_cabin.jpg",
    status: "featured",
    sessions: day2Sessions,
  }
];