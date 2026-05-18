import type { CSSProperties } from "react";

type StatProps = {
  label: string;
  value: string;
};

type ProgressProps = {
  label: string;
  value: number;
};

type ProgressStyle = CSSProperties & {
  "--value": string;
};

export function Stat({ label, value }: StatProps) {
  return <div className="card stat"><span>{label}</span><strong>{value}</strong></div>;
}

export function Progress({ label, value }: ProgressProps) {
  return (
    <div className="progress-row">
      <div className="progress-head"><span>{label}</span><span>{value}%</span></div>
      <div className="bar"><i style={{ "--value": `${value}%` } as ProgressStyle} /></div>
    </div>
  );
}
