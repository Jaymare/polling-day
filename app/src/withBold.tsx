// Renders **text** as bold; everything else stays plain
export function withBold(text: string) {
  return text
    .split(/\*\*(.+?)\*\*/)
    .map((part, i) => (i % 2 ? <strong key={i}>{part}</strong> : part));
}
