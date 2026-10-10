export default function FilterChip({ testid, label, count, active, onClick, onClear, icon: Icon, iconClass, primary = false }) {
  const disabled = count === 0 && !active;
  // ~30% smaller than the original px-4 py-2 text-sm chip. Below sm the chips fill a 2-column grid
  // (same width each, label left / count right); from sm up they size to their content.
  const base = "w-full sm:w-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] leading-4 font-semibold border-2 transition-colors duration-200";

  let state = "bg-white text-text-main border-[#E8E6E0] hover:bg-green-50 hover:border-green-400 hover:text-green-800";
  if (active) state = "bg-green-800 text-white border-green-800 hover:bg-green-700 hover:border-green-700";
  if (disabled) state = "bg-[#F5F2EC] text-text-sec/45 border-transparent cursor-not-allowed";

  const iconColor = active ? "text-white" : disabled ? "opacity-40" : iconClass;

  return (
    <button
      data-testid={testid}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-pressed={active}
      className={`${base} ${state}`}
    >
      {Icon && <Icon size={11} className={`flex-shrink-0 ${iconColor || ""}`} />}
      <span className="flex-1 sm:flex-none text-left truncate">{label}</span>
      {count !== undefined && (
        <span className={`text-[9px] leading-3 px-1.5 py-0.5 rounded-full flex-shrink-0 ${
          active ? "bg-white/25" : disabled ? "bg-white/60 text-text-sec/45" : "bg-[#F5F2EC]"
        }`}>{count}</span>
      )}
      {active && !primary && (
        <span
          role="button"
          tabIndex={0}
          data-testid={`${testid}-clear`}
          aria-label={`Quitar filtro ${label}`}
          onClick={(e) => { e.stopPropagation(); onClear?.(); }}
          onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); onClear?.(); } }}
          className="text-white/70 hover:text-white text-xs leading-none -mr-1 pl-0.5"
        >
          ✕
        </span>
      )}
    </button>
  );
}
