export interface SeedEvent {
  title: string;
  description: string;
  eventType: string;
  thumbnail: string;
  location: string;
  eventDate: Date;
  targetVolunteers: number;
  creatorEmail: string;
  creatorName: string;
  creatorPhoto: string;
  attendeesCount: number;
}

const now = new Date();
const addDays = (days: number) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  d.setHours(10, 0, 0, 0);
  return d;
};

export const sampleEvents: SeedEvent[] = [
  {
    title: "Winter Clothes Distribution – Mirpur 10, Dhaka",
    description: "Join us in bringing warmth to underprivileged families and street dwellers across Mirpur 10. We will sort, pack, and distribute winter jackets, thermal sweaters, and woolen caps. Every volunteer will be assigned to a designated zone with a team coordinator.",
    eventType: "Donation",
    thumbnail: "https://images.unsplash.com/photo-1578357078586-491adf1aa5ba?auto=format&fit=crop&w=1200&q=80",
    location: "Mirpur 10 Roundabout, Dhaka",
    eventDate: addDays(4),
    targetVolunteers: 60,
    creatorEmail: "organizer@civicpulse.org",
    creatorName: "Tahmina Rahman",
    creatorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 28,
  },
  {
    title: "Blanket Distribution for the Needy – Mohammadpur, Dhaka",
    description: "A community drive to distribute 1,000 thick winter blankets to impoverished rickshaw pullers, elderly citizens, and pavement dwellers around Mohammadpur Town Hall and Geneva Camp area. Volunteers assist with logistics, distribution tokens, and safe night-time handoffs.",
    eventType: "Donation",
    thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80",
    location: "Mohammadpur Town Hall Ground, Dhaka",
    eventDate: addDays(7),
    targetVolunteers: 45,
    creatorEmail: "fahim.ahmed@civicpulse.org",
    creatorName: "Fahim Ahmed",
    creatorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 35,
  },
  {
    title: "Clean Hatirjheel Mega Waterfront Cleanup – Dhaka",
    description: "Help clean and restore the Hatirjheel lake walkways and shoreline. We will collect single-use plastics, install community recycling bins, and raise awareness among park visitors about urban biodiversity conservation. Protective gloves, bags, and refreshments are provided.",
    eventType: "Cleanup",
    thumbnail: "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=1200&q=80",
    location: "Hatirjheel Amphitheatre Promenade, Dhaka",
    eventDate: addDays(11),
    targetVolunteers: 80,
    creatorEmail: "green.earth@civicpulse.org",
    creatorName: "Sadia Chowdhury",
    creatorPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 52,
  },
  {
    title: "Urban Tree Plantation & Green Canopy Drive – Uttara Sector 11",
    description: "Planting 500 indigenous fruit-bearing and shade trees along school perimeters, park verges, and neighborhood avenues in Uttara. Volunteers will dig sapling pits, plant neem, bokul, and mahogany saplings, and install protective bamboo tree guards.",
    eventType: "Plantation",
    thumbnail: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1200&q=80",
    location: "Sector 11 Lake Park & Avenue 3, Uttara, Dhaka",
    eventDate: addDays(14),
    targetVolunteers: 50,
    creatorEmail: "organizer@civicpulse.org",
    creatorName: "Tahmina Rahman",
    creatorPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 41,
  },
  {
    title: "Free Healthcare & Eye Screening Camp – Korail Community Center",
    description: "Collaborating with volunteer doctors to provide general medical consultations, pediatric screenings, diabetes tests, and free prescription glasses for residents of Korail. Volunteers help with patient registration, crowd management, and medicine dispensary support.",
    eventType: "Healthcare",
    thumbnail: "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=1200&q=80",
    location: "Korail Community Health Center, Mohakhali, Dhaka",
    eventDate: addDays(18),
    targetVolunteers: 40,
    creatorEmail: "dr.kazi@civicpulse.org",
    creatorName: "Dr. Kazi Ariful Islam",
    creatorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 22,
  },
  {
    title: "Street Children Literacy Drive & Book Distribution – Farmgate",
    description: "Promoting joyful learning and basic literacy for working and street-connected youth. We will distribute colorful notebooks, storybooks, stationery pouches, and host an interactive storytelling and drawing workshop for over 150 children.",
    eventType: "Education",
    thumbnail: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=1200&q=80",
    location: "Ananda Cinema Hall Plaza & Overbridge, Farmgate, Dhaka",
    eventDate: addDays(22),
    targetVolunteers: 35,
    creatorEmail: "fahim.ahmed@civicpulse.org",
    creatorName: "Fahim Ahmed",
    creatorPhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 19,
  },
  {
    title: "Nutritious Food Packets for Daily Wage Earners – Old Dhaka",
    description: "Preparing and handing out 800 freshly prepared warm meal packets and clean bottled water to daily wage laborers, rickshaw pullers, and destitute seniors across Sadarghat, Victoria Park, and Chawkbazar.",
    eventType: "Donation",
    thumbnail: "https://images.unsplash.com/photo-1593113598332-cd288d649433?auto=format&fit=crop&w=1200&q=80",
    location: "Bahadur Shah Park, Sadarghat, Old Dhaka",
    eventDate: addDays(26),
    targetVolunteers: 40,
    creatorEmail: "green.earth@civicpulse.org",
    creatorName: "Sadia Chowdhury",
    creatorPhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 31,
  },
  {
    title: "Emergency Flood Preparedness & First-Aid Workshop – Sylhet",
    description: "Community training session on flood rescue preparedness, clean water purification tablet distribution, and basic emergency CPR. Open to college students and local youth leaders to build first-responder resilience.",
    eventType: "Relief Aid",
    thumbnail: "https://images.unsplash.com/photo-1547471080-7cc2caa01a7e?auto=format&fit=crop&w=1200&q=80",
    location: "Sylhet Town Community Hall, Zindabazar, Sylhet",
    eventDate: addDays(30),
    targetVolunteers: 50,
    creatorEmail: "dr.kazi@civicpulse.org",
    creatorName: "Dr. Kazi Ariful Islam",
    creatorPhoto: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80",
    attendeesCount: 26,
  }
];
