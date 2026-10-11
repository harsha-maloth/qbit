export interface Program {
  slug: string;
  name: string;
  summary: string;
}

// Single source of truth for the footer and (later) the Programs page.
export const programs: Program[] = [
  { slug: "quantum-systems", name: "Quantum Systems", summary: "Quantum sensing, control, and optimization with near-term product value." },
  { slug: "responsible-ai", name: "Responsible AI", summary: "Human-centered AI built for trust, fairness, and explainability." },
  { slug: "neurotech-sensing", name: "Neurotech & Sensing", summary: "New modalities that deepen human-machine collaboration." },
  { slug: "systems-design", name: "Systems Design", summary: "Design and operations for complex, multidisciplinary ventures." },
];
