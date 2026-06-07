import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function HumanEditedBadge() {
  return (
    <Link
      href="/about/"
      className="inline-flex items-center gap-1.5 rounded-full border border-success/20 bg-success/10 px-3 py-1 text-xs font-medium text-success transition-colors duration-200 hover:border-success/30 hover:bg-success/15"
    >
      <CheckCircle className="h-3 w-3" />
      Reviewed by Sunny Patel
    </Link>
  );
}
