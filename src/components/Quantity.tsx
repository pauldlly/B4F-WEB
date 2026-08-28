import { Minus, Plus } from "lucide-react";

export function Quantity({
  value,
  onChange,
  minimum = 0,
  maximum = 20,
}: {
  value: number;
  onChange: (value: number) => void;
  minimum?: number;
  maximum?: number;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/10 bg-black/30 p-1">
      <button
        type="button"
        onClick={() =>
          onChange(Math.max(minimum, value - 1))
        }
        disabled={value <= minimum}
        className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 disabled:opacity-25"
        aria-label="Diminuer"
      >
        <Minus size={16} />
      </button>

      <strong className="min-w-9 text-center">{value}</strong>

      <button
        type="button"
        onClick={() =>
          onChange(Math.min(maximum, value + 1))
        }
        disabled={value >= maximum}
        className="grid h-9 w-9 place-items-center rounded-full text-white/70 transition hover:bg-white/10 disabled:opacity-25"
        aria-label="Augmenter"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}
