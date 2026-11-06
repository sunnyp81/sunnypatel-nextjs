import Link from "next/link";

export function HumanEditedBadge() {
  return (
    <Link
      href="/about/"
      className="lit-label lit-label--gold lit-label--sm"
    >
      Written by Sunny Patel
    </Link>
  );
}
