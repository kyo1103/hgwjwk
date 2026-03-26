type Props = {
  children: React.ReactNode;
  tone?: "ok" | "warn" | "err";
};

export function Badge({ children, tone = "ok" }: Props) {
  return <span className={`badge ${tone}`}>{children}</span>;
}
