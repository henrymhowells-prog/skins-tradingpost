type Props = {
  float_min?: number | string | null;
  float_max?: number | string | null;
  pattern_seed?: number | string | null;
};

export default function WantedRequirementBadges({
  float_min,
  float_max,
  pattern_seed,
}: Props) {
  const hasFloat = float_min || float_max;
  const hasPattern = pattern_seed;

  if (!hasFloat && !hasPattern) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-2 text-xs">
      {hasFloat && (
        <span className="rounded-full bg-blue-500/20 px-2 py-1 text-blue-300">
          Float: {float_min || "0"} - {float_max || "0.999999"}
        </span>
      )}

      {hasPattern && (
        <span className="rounded-full bg-purple-500/20 px-2 py-1 text-purple-300">
          Pattern: {pattern_seed}
        </span>
      )}
    </div>
  );
}