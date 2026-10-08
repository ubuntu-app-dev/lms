export default function ProgressBar({
  value,
  label,
  track = "bg-[#E3E7F4]",
  fill = "bg-[#2347F4]",
}: {
  value: number;
  label: string;
  track?: string;
  fill?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={`h-2 w-full overflow-hidden rounded-full ${track}`}
    >
      <div className={`h-full rounded-full ${fill}`} style={{ width: `${value}%` }} />
    </div>
  );
}
