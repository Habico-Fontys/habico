import Image from 'next/image';

export function Logo() {
  return (
    <Image
      src="/brand/Habico_Logo.svg"
      alt="Habico"
      width={180}
      height={61}
      priority
      className="h-[52px] w-auto object-contain"
    />
  );
}
