import {
  Minus,
  Plus,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

function normalize(
  value: number,
  minimum: number,
  maximum: number | null,
) {
  const parsed =
    Math.floor(
      Number(value),
    );

  const safe =
    Number.isFinite(
      parsed,
    )
      ? Math.max(
          minimum,
          parsed,
        )
      : minimum;

  return maximum === null
    ? safe
    : Math.min(
        maximum,
        safe,
      );
}

export function QuantityInput({
  value,
  onChange,
  minimum = 0,
  maximum = null,
  compact = false,
}: {
  value: number;
  onChange: (
    value: number,
  ) => void;
  minimum?: number;
  maximum?: number | null;
  compact?: boolean;
}) {
  const [
    draft,
    setDraft,
  ] = useState(
    String(value),
  );

  useEffect(() => {
    setDraft(
      String(value),
    );
  }, [value]);

  const commit = (
    raw: string,
  ) => {
    const next =
      normalize(
        Number(raw),
        minimum,
        maximum,
      );

    setDraft(
      String(next),
    );

    onChange(
      next,
    );
  };

  const decrement =
    () => {
      onChange(
        normalize(
          value - 1,
          minimum,
          maximum,
        ),
      );
    };

  const increment =
    () => {
      onChange(
        normalize(
          value + 1,
          minimum,
          maximum,
        ),
      );
    };

  const plusDisabled =
    maximum !== null &&
    value >= maximum;

  const buttonSize =
    compact
      ? "h-9 w-9"
      : "h-11 w-11";

  return (
    <div
      className="
        quantity-control
        inline-flex
        items-center
        rounded-full
        border
        border-white/10
        bg-black/[0.35]
        p-1
        shadow-inner
        outline-none
        ring-0
        focus:outline-none
        focus:ring-0
        focus-visible:outline-none
        focus-visible:ring-0
      "
    >
      {/* MINUS */}
      <button
        type="button"
        onClick={
          decrement
        }
        disabled={
          value <= minimum
        }
        className={`
          grid
          ${buttonSize}
          place-items-center
          rounded-full
          text-white/70
          outline-none
          ring-0
          transition
          hover:bg-white/10
          hover:text-white
          focus:outline-none
          focus:ring-0
          focus-visible:outline-none
          focus-visible:ring-0
          focus-visible:ring-offset-0
          disabled:cursor-not-allowed
          disabled:opacity-20
        `}
        aria-label="Diminuer la quantité"
      >
        <Minus
          size={
            compact
              ? 15
              : 17
          }
        />
      </button>

      {/* QUANTITY */}
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={
          draft
        }
        onFocus={(
          event,
        ) =>
          event.currentTarget.select()
        }
        onChange={(
          event,
        ) => {
          const clean =
            event.target.value.replace(
              /\D/g,
              "",
            );

          setDraft(
            clean,
          );
        }}
        onBlur={() =>
          commit(
            draft ||
              String(
                minimum,
              ),
          )
        }
        onKeyDown={(
          event,
        ) => {
          if (
            event.key ===
            "Enter"
          ) {
            event.currentTarget.blur();
          }
        }}
        className={`
          ${
            compact
              ? "w-11"
              : "w-14"
          }
          appearance-none
          border-0
          bg-transparent
          text-center
          font-subtitle
          text-sm
          text-white
          outline-none
          ring-0
          focus:border-transparent
          focus:outline-none
          focus:ring-0
          focus-visible:border-transparent
          focus-visible:outline-none
          focus-visible:ring-0
          focus-visible:ring-offset-0
        `}
        aria-label="Quantité"
      />

      {/* PLUS */}
      <button
        type="button"
        onClick={
          increment
        }
        disabled={
          plusDisabled
        }
        className={`
          grid
          ${buttonSize}
          place-items-center
          rounded-full
          bg-white/[0.08]
          text-white
          outline-none
          ring-0
          transition
          hover:bg-secondary
          hover:text-ink
          focus:outline-none
          focus:ring-0
          focus-visible:outline-none
          focus-visible:ring-0
          focus-visible:ring-offset-0
          disabled:cursor-not-allowed
          disabled:bg-transparent
          disabled:text-white/20
        `}
        aria-label="Augmenter la quantité"
      >
        <Plus
          size={
            compact
              ? 15
              : 17
          }
        />
      </button>
    </div>
  );
}