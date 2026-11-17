import Image from "next/image";
import { avatarKleuren, initialen, type Profiel } from "@/lib/profiel";

export default function ProfielAvatar({
  profiel,
  className = "size-12", // de grootte
  tekstKlasse = "text-sm", // de grootte van de initialen
}: {
  profiel: Pick<Profiel, "voornaam" | "achternaam" | "kleur" | "foto">;
  className?: string;
  tekstKlasse?: string;
}) {
  if (profiel.foto) {
    return (
      <Image
        src={profiel.foto}
        alt=""
        width={256}
        height={256}
        unoptimized
        className={`shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold ${avatarKleuren[profiel.kleur].avatar} ${tekstKlasse} ${className}`}
    >
      {initialen(profiel)}
    </span>
  );
}