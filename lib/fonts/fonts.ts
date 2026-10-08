import { Bricolage_Grotesque, Instrument_Sans } from "next/font/google";

// Display font for headings, clean UI font for everything else.
// `variable` exposes --font-display, which the components pick up.
export const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const body = Instrument_Sans({
  subsets: ["latin"],
  display: "swap",
});
