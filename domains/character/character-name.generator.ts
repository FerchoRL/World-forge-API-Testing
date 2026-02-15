/**
 * Generador de nombres únicos estilo waifu
 * Usado para testing en todos los endpoints de character (create, update, etc.)
 */

export function generateWaifuName(): string {
  const baseNames = [
    'Airi', 'Yuki', 'Hana', 'Mika', 'Sora',
    'Nami', 'Rin', 'Akira', 'Emi', 'Luna',
    'Hoshi', 'Kira', 'Mori', 'Saya', 'Aiko',
    'Miku', 'Rei', 'Asuna', 'Zero', 'Nez'
  ];

  const suffixes = [
    'chan', 'san', 'senpai', 'nyan',
    'x', 'kai', 'kun'
  ];

  const base = baseNames[Math.floor(Math.random() * baseNames.length)];
  const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
  const unique = Math.random().toString(36).substring(2, 6);

  return `${base}_${suffix}_${unique}`;
}
