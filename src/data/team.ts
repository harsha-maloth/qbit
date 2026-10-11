export interface TeamMember {
  name: string;
  role: string;
  /** Path under /public or src/assets once real photos are supplied. */
  photo?: string;
  /** Leave empty until the real bio is provided; the UI hides it. */
  bio?: string;
}

// Names and roles come from legacy/TEAM.html. Seven members shared one copied bio; it was dropped
// on purpose. Add a real `bio` and `photo` per person when supplied (docs/PROJECT_CONTEXT.md).
export const team: TeamMember[] = [
  {
    name: "Saatwik Chatkara",
    role: "Founder & CEO",
    bio: "Leads strategy for founder journeys, program design, and product-market readiness across science-forward ventures.",
  },
  {
    name: "Advait M Dhola",
    role: "Technical Advisor",
    bio: "Supports complex systems development in quantum, photonics, AI-enabled hardware, and next-gen computational platforms.",
  },
  { name: "Mohamed Armoon Shaliq", role: "Community & Operations" },
  { name: "Disha Parasu", role: "Community & Operations" },
  { name: "Sudhi Sharma", role: "Community & Operations" },
  { name: "Asmita Nama", role: "Community & Operations" },
  { name: "Sukesh Nasina", role: "Community & Operations" },
  { name: "Priyanshu Kumar", role: "Community & Operations" },
  { name: "Aaryan Sharma", role: "Community & Operations" },
];
