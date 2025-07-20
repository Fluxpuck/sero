import { Jobs } from "../../models";

export async function seedJobs(): Promise<{
  success: boolean;
  error?: unknown;
  count?: number;
}> {
  const jobs = [
    {
      emoji: "💉",
      name: "Veterinarian",
      description: "Provides medical care to animals.",
      salary: 65000,
      raise: 2.5,
    },
    {
      name: "Astronaut",
      emoji: "🚀",
      description: "Travels to space for scientific research or exploration.",
      salary: 85000,
      raise: 1.5,
    },
    {
      name: "Lawyer",
      emoji: "⚖️",
      description: "Provides legal advice and representation.",
      salary: 70000,
      raise: 2.0,
    },
    {
      name: "Accountant",
      emoji: "💼",
      description: "Manages financial records and prepares reports.",
      salary: 55000,
      raise: 3.0,
    },
    {
      name: "Developer",
      emoji: "💻",
      description: "Creates software applications and systems.",
      salary: 75000,
      raise: 2.0,
    },
    {
      name: "Teacher",
      emoji: "📏",
      description: "Educates students in various subjects.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Police Officer",
      emoji: "🚓",
      description: "Enforces laws and maintains public order.",
      salary: 50000,
      raise: 3.5,
    },
    {
      name: "Sales Person",
      emoji: "📈",
      description: "Sells products or services to customers.",
      salary: 35000,
      raise: 5.0,
    },
    {
      name: "Travel Agent",
      emoji: "🗺️",
      description: "Assists clients in planning and booking trips.",
      salary: 35000,
      raise: 5.0,
    },
    {
      name: "Athlete",
      emoji: "🏃‍♂️",
      description: "Competes in sports professionally.",
      salary: 40000,
      raise: 4.5,
    },
    {
      name: "Youtuber",
      emoji: "📹",
      description: "Creates and publishes video content on YouTube.",
      salary: 80000,
      raise: 1.5,
    },
    {
      name: "Model",
      emoji: "💄",
      description: "Poses for photoshoots or walks on runways.",
      salary: 40000,
      raise: 4.5,
    },
    {
      name: "Doctor",
      emoji: "🩺",
      description: "Diagnoses and treats medical conditions.",
      salary: 90000,
      raise: 1.0,
    },
    {
      name: "Artist",
      emoji: "🎨",
      description: "Creates visual or performing arts.",
      salary: 35000,
      raise: 5.0,
    },
    {
      name: "Chef",
      emoji: "🍳",
      description: "Prepares and cooks food in restaurants.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Pilot",
      emoji: "✈️",
      description: "Flies aircraft to transport passengers or cargo.",
      salary: 85000,
      raise: 1.5,
    },
    {
      name: "Plumber",
      emoji: "🪠",
      description: "Installs and repairs plumbing systems.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Electrician",
      emoji: "⚡",
      description: "Installs and repairs electrical systems.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Firefighter",
      emoji: "🧑‍🚒",
      description: "Responds to fires and emergency situations.",
      salary: 50000,
      raise: 3.5,
    },
    {
      name: "Nurse",
      emoji: "🏥",
      description: "Provides patient care in hospitals and clinics.",
      salary: 60000,
      raise: 3.0,
    },
    {
      name: "Architect",
      emoji: "🏛️",
      description: "Designs buildings and structures.",
      salary: 70000,
      raise: 2.0,
    },
    {
      name: "Journalist",
      emoji: "📰",
      description: "Reports news and current events.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Photographer",
      emoji: "📸",
      description: "Takes and edits photographs professionally.",
      salary: 40000,
      raise: 4.5,
    },
    {
      name: "Dentist",
      emoji: "🦷",
      description: "Diagnoses and treats dental issues.",
      salary: 85000,
      raise: 1.5,
    },
    {
      name: "Psychologist",
      emoji: "🧠",
      description: "Studies and treats mental health disorders.",
      salary: 75000,
      raise: 2.0,
    },
    {
      name: "Mechanic",
      emoji: "🔧",
      description: "Repairs and maintains vehicles.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Farmer",
      emoji: "🚜",
      description: "Grows crops and raises livestock.",
      salary: 40000,
      raise: 4.5,
    },
    {
      name: "Librarian",
      emoji: "📚",
      description: "Manages library resources and assists patrons.",
      salary: 40000,
      raise: 4.5,
    },
    {
      name: "Pharmacist",
      emoji: "💊",
      description: "Dispenses medications and provides pharmaceutical advice.",
      salary: 80000,
      raise: 1.5,
    },
    {
      name: "Flight Attendant",
      emoji: "🛩️",
      description: "Ensures passenger safety and comfort on flights.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Graphic Designer",
      emoji: "🎭",
      description: "Creates visual content for various media.",
      salary: 50000,
      raise: 3.5,
    },
    {
      name: "Social Worker",
      emoji: "🤝",
      description: "Helps people solve and cope with problems in their lives.",
      salary: 45000,
      raise: 4.0,
    },
    {
      name: "Baker",
      emoji: "🍞",
      description: "Prepares bread, pastries, and desserts.",
      salary: 35000,
      raise: 5.0,
    },
    {
      name: "Translator",
      emoji: "🗣️",
      description: "Converts text or speech from one language to another.",
      salary: 50000,
      raise: 3.5,
    },
    {
      name: "Marine Biologist",
      emoji: "🐠",
      description: "Studies marine organisms and their ecosystems.",
      salary: 60000,
      raise: 3.0,
    },
    {
      name: "Archaeologist",
      emoji: "🏺",
      description: "Studies human history through excavation of sites.",
      salary: 55000,
      raise: 3.0,
    },
    {
      name: "Meteorologist",
      emoji: "🌤️",
      description: "Studies and forecasts weather conditions.",
      salary: 60000,
      raise: 3.0,
    },
  ];

  try {
    await Jobs.bulkCreate(jobs as Jobs[], { individualHooks: true });
    console.log(`${jobs.length} jobs have been processed successfully.`);
    return { success: true, count: jobs.length };
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error(`Error seeding jobs: ${errorMessage}`);
    return { success: false, error };
  }
}
