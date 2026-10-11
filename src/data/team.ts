export interface TeamMember {
  name: string;
  role: string;
  /** Path under /public or src/assets once real photos are supplied. */
  photo?: string;
  /** Leave empty until the real bio is provided; the UI hides it. */
  bio?: string;
}

// Names and roles come from legacy/TEAM.html. Placeholder bios were intentionally dropped.
export const team: TeamMember[] = [
  { name: "Saatwik Chatkara", role: "Founder & CEO" },
  { name: "Advait M Dhola", role: "Technical Advisor" },
  { name: "Mohamed Armoon Shaliq", role: "Community & Operations" },
  { name: "Disha Parasu", role: "Community & Operations" },
  { name: "Sudhi Sharma", role: "Community & Operations" },
  { name: "Asmita Nama", role: "Community & Operations" },
  { name: "Sukesh Nasina", role: "Community & Operations" },
  { name: "Priyanshu Kumar", role: "Community & Operations" },
  { name: "Aaryan Sharma", role: "Community & Operations" },
];
