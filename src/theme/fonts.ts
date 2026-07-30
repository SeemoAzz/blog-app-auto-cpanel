// 10 paires de polices (titre + corps). Chargees via Google Fonts (link) selon
// la selection, pour eviter d'embarquer 20 polices dans le bundle.

export type FontPair = {
  id: string;
  name: string;
  heading: string; // nom de famille CSS
  body: string;
  // parametres pour l'URL Google Fonts (family:wght@...)
  googleFamilies: string[];
};

export const FONT_PAIRS: FontPair[] = [
  {
    id: "inter-merriweather",
    name: "Inter + Merriweather",
    heading: "Inter",
    body: "Merriweather",
    googleFamilies: ["Inter:wght@400;600;700;800", "Merriweather:wght@400;700"],
  },
  {
    id: "poppins-inter",
    name: "Poppins + Inter",
    heading: "Poppins",
    body: "Inter",
    googleFamilies: ["Poppins:wght@500;600;700;800", "Inter:wght@400;500;600"],
  },
  {
    id: "playfair-source",
    name: "Playfair Display + Source Sans",
    heading: "Playfair Display",
    body: "Source Sans 3",
    googleFamilies: [
      "Playfair+Display:wght@600;700;800",
      "Source+Sans+3:wght@400;600",
    ],
  },
  {
    id: "montserrat-lora",
    name: "Montserrat + Lora",
    heading: "Montserrat",
    body: "Lora",
    googleFamilies: ["Montserrat:wght@600;700;800", "Lora:wght@400;500;600"],
  },
  {
    id: "roboto-slab-roboto",
    name: "Roboto Slab + Roboto",
    heading: "Roboto Slab",
    body: "Roboto",
    googleFamilies: ["Roboto+Slab:wght@600;700;800", "Roboto:wght@400;500;700"],
  },
  {
    id: "raleway-nunito",
    name: "Raleway + Nunito Sans",
    heading: "Raleway",
    body: "Nunito Sans",
    googleFamilies: ["Raleway:wght@600;700;800", "Nunito+Sans:wght@400;600"],
  },
  {
    id: "space-grotesk-inter",
    name: "Space Grotesk + Inter (tech)",
    heading: "Space Grotesk",
    body: "Inter",
    googleFamilies: ["Space+Grotesk:wght@500;600;700", "Inter:wght@400;500;600"],
  },
  {
    id: "dmserif-dmsans",
    name: "DM Serif Display + DM Sans",
    heading: "DM Serif Display",
    body: "DM Sans",
    googleFamilies: ["DM+Serif+Display", "DM+Sans:wght@400;500;700"],
  },
  {
    id: "oswald-pt",
    name: "Oswald + PT Serif",
    heading: "Oswald",
    body: "PT Serif",
    googleFamilies: ["Oswald:wght@500;600;700", "PT+Serif:wght@400;700"],
  },
  {
    id: "system",
    name: "Systeme (aucune police externe)",
    heading:
      "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    body: "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
    googleFamilies: [],
  },
];

export function getFontPair(id: string): FontPair {
  return FONT_PAIRS.find((f) => f.id === id) ?? FONT_PAIRS[0];
}

export function fontStylesheetHref(id: string): string | null {
  const pair = getFontPair(id);
  if (pair.googleFamilies.length === 0) return null;
  const families = pair.googleFamilies.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

export function fontCssVars(id: string): Record<string, string> {
  const pair = getFontPair(id);
  const quote = (name: string) =>
    name.includes(",") || name.includes("system")
      ? name
      : `"${name}"`;
  return {
    "--font-heading": `${quote(pair.heading)}, ui-sans-serif, system-ui, sans-serif`,
    "--font-body": `${quote(pair.body)}, ui-serif, Georgia, serif`,
  };
}
