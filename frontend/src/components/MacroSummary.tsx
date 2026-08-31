function Chip({ label, grams }: { label: string; grams: number }) {
  return (
    <div className="flex-1 rounded-xl border border-ink/10 bg-paper-raised px-3 py-2 text-center">
      <p className="font-mono text-[10px] uppercase tracking-widest text-ink/40">{label}</p>
      <p className="font-mono text-lg font-bold tabular-nums text-ink">{grams}g</p>
    </div>
  );
}

export default function MacroSummary({
  protein,
  carbs,
  fat,
}: {
  protein: number;
  carbs: number;
  fat: number;
}) {
  return (
    <div className="flex gap-2">
      <Chip label="Protein" grams={protein} />
      <Chip label="Carbs" grams={carbs} />
      <Chip label="Fat" grams={fat} />
    </div>
  );
}
