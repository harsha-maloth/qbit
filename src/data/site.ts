export const site = {
  name: "Collective Qubits",
  tagline: "Connecting Minds to Systems",
  description:
    "Collective Qubits is a deep-tech incubator for founders, researchers, and hybrid teams building quantum systems, responsible AI, photonics, and neurotech.",
  discord: "https://discord.gg/eg5R8wyKSZ",
} as const;

export interface NavItem {
  label: string;
  href: string;
  external?: boolean;
}

export const nav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Mission", href: "/mission/" },
  { label: "Philosophy", href: "/philosophy/" },
  { label: "Team", href: "/team/" },
  { label: "Programs", href: "/programs/" },
  { label: "Apply", href: "/apply/" },
  { label: "Community", href: site.discord, external: true },
];

/** Extra footer-only links (not in the main nav). */
export const footerLinks: NavItem[] = [
  { label: "FAQ", href: "/faq/" },
  { label: "Privacy", href: "/privacy/" },
  { label: "Terms", href: "/terms/" },
];
