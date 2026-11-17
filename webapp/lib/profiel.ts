// Types, constanten en hulpfuncties voor het profiel.
// Bewust GEEN "use client": zo kun je dit overal importeren.

export const avatarKleuren = {
  oranje: { naam: "Oranje", avatar: "bg-fire-orange/15 text-fire-orange", swatch: "bg-fire-orange" },
  blauw: { naam: "Blauw", avatar: "bg-tangy-blue/15 text-tangy-blue", swatch: "bg-tangy-blue" },
  navy: { naam: "Donkerblauw", avatar: "bg-habico-navy/15 text-habico-navy", swatch: "bg-habico-navy" },
  rood: { naam: "Rood", avatar: "bg-habico-orange-red/15 text-habico-orange-red", swatch: "bg-habico-orange-red" },
} as const;

export type AvatarKleur = keyof typeof avatarKleuren;
export const kleurSleutels = Object.keys(avatarKleuren) as AvatarKleur[];

export type Profiel = {
  voornaam: string;
  achternaam: string;
  kamer: string;
  bio: string;
  kleur: AvatarKleur; // kleur van de initialen zolang er geen foto is
  foto: string | null; // de verkleinde foto als tekst (data-URL), of null
};

export const MAX_BIO = 160;
export const MAX_FOTO_BYTES = 8 * 1024 * 1024; // 8 MB
export const TOEGESTANE_TYPES = ["image/jpeg", "image/png", "image/webp"];

export const standaardProfiel: Profiel = {
  voornaam: "Marvin",
  achternaam: "Verspeek",
  kamer: "",
  bio: "",
  kleur: "oranje",
  foto: null,
};

export const volledigeNaam = (p: Pick<Profiel, "voornaam" | "achternaam">) =>
  `${p.voornaam} ${p.achternaam}`.trim();

export const initialen = (p: Pick<Profiel, "voornaam" | "achternaam">) =>
  `${p.voornaam.charAt(0)}${p.achternaam.charAt(0)}`.toUpperCase() || "?";

// Maakt van elke foto een vierkante 256x256 JPEG. Alleen in de browser te gebruiken.
export function verkleinFoto(bestand: File, formaat = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(bestand);
    const img = new window.Image();

    img.onload = () => {
      URL.revokeObjectURL(url);

      // Het grootste vierkant uit het midden van de foto
      const kant = Math.min(img.width, img.height);
      const sx = (img.width - kant) / 2;
      const sy = (img.height - kant) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = formaat;
      canvas.height = formaat;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas niet beschikbaar"));

      // Witte achtergrond: JPEG kent geen transparantie (anders wordt die zwart)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, formaat, formaat);
      ctx.drawImage(img, sx, sy, kant, kant, 0, 0, formaat, formaat);

      resolve(canvas.toDataURL("image/jpeg", 0.85));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Kon de foto niet lezen"));
    };

    img.src = url;
  });
}