/**
 * Matching service — discover feed + connection actions.
 * Returns mock data until Supabase is deployed.
 */
import { api } from './apiClient';
import type { UserProfile } from './userService';

export interface FeedCandidate extends UserProfile {
  compatibilityScore: number;
  compatibilityBreakdown: { genre: number; artist: number; audio: number };
}

export interface Connection {
  connectionId: string;
  connectedAt: string;
  user: UserProfile;
  lastMessage?: { text: string; sentAt: string };
  unreadCount: number;
}

export const MOCK_FEED: FeedCandidate[] = [
  {
    id: 'user-2',
    displayName: 'Aanya',
    username: 'aanya.wav',
    age: 21,
    gender: 'Woman',
    pronouns: 'she/her',
    bio: 'Always got AirPods in, always discovering something new.',
    avatarColor: '#EC4899',
    height: "5'4\"",
    job: 'UX Designer',
    school: 'NID Ahmedabad',
    location: 'Delhi, IN',
    photos: [],
    topArtists: ['Frank Ocean', 'SZA', 'Jhene Aiko'],
    topGenres: ['neo-soul', 'r&b', 'alternative'],
    currentTrack: { title: 'Saturn', artist: 'SZA', albumArt: '' },
    prompts: [
      { question: 'The song that changed my life...', answer: 'Pyramids by Frank Ocean. I was never the same after.' },
      { question: "We'll vibe if you listen to...", answer: 'Anything that feels like a late night drive with the windows down.' },
      { question: 'My unpopular music take is...', answer: 'Interludes are the best part of any album. Fight me.' },
    ],
    profileComplete: 95,
    compatibilityScore: 91,
    compatibilityBreakdown: { genre: 0.94, artist: 0.88, audio: 0.91 },
  },
  {
    id: 'user-3',
    displayName: 'Rohan',
    username: 'rohanbeats',
    age: 23,
    gender: 'Man',
    pronouns: 'he/him',
    bio: 'Concert photographer. I shoot the artists you stream.',
    avatarColor: '#3B82F6',
    height: "6'0\"",
    job: 'Photographer',
    school: 'Symbiosis Pune',
    location: 'Bangalore, IN',
    photos: [],
    topArtists: ['Tyler, the Creator', 'Earl Sweatshirt', 'Vince Staples'],
    topGenres: ['hip-hop', 'alternative rap', 'lo-fi'],
    currentTrack: { title: 'SORRY NOT SORRY', artist: 'Tyler, the Creator', albumArt: '' },
    prompts: [
      { question: "My go-to album when I'm sad is...", answer: "IGOR by Tyler. It hits different every time." },
      { question: 'My unpopular music take is...', answer: 'Kendrick peaked with good kid, m.A.A.d city. DAMN. was good not great.' },
      { question: 'The last concert I went to was...', answer: 'Nucleya at Lollapalooza Mumbai. Crowd was unreal.' },
    ],
    profileComplete: 90,
    compatibilityScore: 84,
    compatibilityBreakdown: { genre: 0.82, artist: 0.90, audio: 0.78 },
  },
  {
    id: 'user-4',
    displayName: 'Priya',
    username: 'priya.keys',
    age: 22,
    gender: 'Woman',
    pronouns: 'she/they',
    bio: 'Jazz piano student, indie everything else. Searching for people who appreciate a good chord change.',
    avatarColor: '#F59E0B',
    height: "5'5\"",
    job: 'Music Student',
    school: 'KM Music Conservatory',
    location: 'Mumbai, IN',
    photos: [],
    topArtists: ['Norah Jones', 'Bon Iver', 'Phoebe Bridgers'],
    topGenres: ['jazz', 'indie folk', 'ambient'],
    currentTrack: { title: 'Holocene', artist: 'Bon Iver', albumArt: '' },
    prompts: [
      { question: "My go-to album when I'm sad is...", answer: "Blue by Joni Mitchell. A masterpiece every time." },
      { question: "We'll vibe if you listen to...", answer: 'Music that sounds like it was made in a forest or a rainy café.' },
      { question: 'My guilty pleasure song is...', answer: 'Mr. Brightside. Do not judge me.' },
    ],
    profileComplete: 88,
    compatibilityScore: 78,
    compatibilityBreakdown: { genre: 0.72, artist: 0.80, audio: 0.82 },
  },
  {
    id: 'user-5',
    displayName: 'Arjun',
    username: 'arjun.hz',
    age: 24,
    gender: 'Man',
    pronouns: 'he/him',
    bio: 'Electronic music producer. Making beats that no one asked for but everyone needs.',
    avatarColor: '#10B981',
    height: "5'11\"",
    job: 'Music Producer',
    school: 'IIT Bombay',
    location: 'Pune, IN',
    photos: [],
    topArtists: ['Four Tet', 'Jon Hopkins', 'Floating Points'],
    topGenres: ['electronic', 'ambient', 'techno'],
    currentTrack: { title: 'Cascade', artist: 'Four Tet', albumArt: '' },
    prompts: [
      { question: 'My music taste can be described as...', answer: 'What happens when a computer dreams of nature.' },
      { question: 'The last concert I went to was...', answer: 'Jon Hopkins at Boiler Room Delhi. Changed my life.' },
      { question: 'I go crazy for...', answer: 'A perfectly placed bass drop at 3am.' },
    ],
    profileComplete: 80,
    compatibilityScore: 73,
    compatibilityBreakdown: { genre: 0.70, artist: 0.75, audio: 0.74 },
  },
  {
    id: 'user-6',
    displayName: 'Meera',
    username: 'meeravibes',
    age: 20,
    gender: 'Woman',
    pronouns: 'she/her',
    bio: 'Discovering 3 new songs every day. Certified music nerd.',
    avatarColor: '#8B5CF6',
    height: "5'3\"",
    job: 'College Student',
    school: 'Ashoka University',
    location: 'Delhi, IN',
    photos: [],
    topArtists: ['Childish Gambino', 'Kali Uchis', 'Daniel Caesar'],
    topGenres: ['r&b', 'funk', 'soul'],
    currentTrack: { title: 'After the Storm', artist: 'Kali Uchis', albumArt: '' },
    prompts: [
      { question: "I'll judge you if you don't like...", answer: 'Awaken, My Love! by Childish Gambino. A whole journey.' },
      { question: 'My simple pleasures...', answer: 'Finding a song that perfectly describes exactly how I feel right now.' },
    ],
    profileComplete: 72,
    compatibilityScore: 68,
    compatibilityBreakdown: { genre: 0.65, artist: 0.72, audio: 0.67 },
  },
  {
    id: 'user-7',
    displayName: 'Kabir',
    username: 'kabir.loud',
    age: 25,
    gender: 'Man',
    pronouns: 'he/him',
    bio: 'Bassist. Loud music, quiet person. Venue recommendations welcome.',
    avatarColor: '#EF4444',
    height: "6'1\"",
    job: 'Software Engineer',
    school: 'BITS Pilani',
    location: 'Hyderabad, IN',
    photos: [],
    topArtists: ['Arctic Monkeys', 'The Strokes', 'Radiohead'],
    topGenres: ['indie rock', 'alternative', 'post-punk'],
    currentTrack: { title: 'R U Mine?', artist: 'Arctic Monkeys', albumArt: '' },
    prompts: [
      { question: 'My most controversial opinion is...', answer: 'OK Computer is overrated. The Bends is the real Radiohead peak.' },
      { question: 'The last concert I went to was...', answer: 'Arctic Monkeys in Mumbai 2023. Worth every rupee.' },
      { question: "I'm convinced that...", answer: 'Bass players are the most underappreciated musicians alive.' },
    ],
    profileComplete: 85,
    compatibilityScore: 62,
    compatibilityBreakdown: { genre: 0.60, artist: 0.65, audio: 0.61 },
  },
];

export const MOCK_CONNECTIONS: Connection[] = [
  {
    connectionId: 'conn-1',
    connectedAt: new Date(Date.now() - 86400000).toISOString(),
    user: MOCK_FEED[0],
    lastMessage: { text: 'omg you like Frank Ocean too??', sentAt: new Date(Date.now() - 3600000).toISOString() },
    unreadCount: 1,
  },
  {
    connectionId: 'conn-2',
    connectedAt: new Date(Date.now() - 172800000).toISOString(),
    user: MOCK_FEED[1],
    lastMessage: { text: 'have you heard the new Tyler album?', sentAt: new Date(Date.now() - 7200000).toISOString() },
    unreadCount: 0,
  },
];

export const matchingService = {
  getFeed: async (): Promise<FeedCandidate[]> => {
    // TODO: return (await api.get<FeedCandidate[]>('/matching/feed')).data ?? [];
    return MOCK_FEED;
  },
  sendConnectionRequest: async (targetUserId: string, compliment?: { promptQuestion: string; message: string }): Promise<{ sent: boolean }> => {
    // TODO: api.post('/connections/request', { targetUserId, compliment })
    console.log(`[mock] connection request to ${targetUserId}`, compliment);
    return { sent: true };
  },
  getConnections: async (): Promise<Connection[]> => {
    // TODO: return (await api.get<Connection[]>('/connections')).data ?? [];
    return MOCK_CONNECTIONS;
  },
};
