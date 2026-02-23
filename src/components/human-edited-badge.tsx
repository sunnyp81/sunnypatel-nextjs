import Link from "next/link";
import { CheckCircle } from "lucide-react";

export function HumanEditedBadge() {
  return (
    <Link
      href="/about"
      className="inline-flex items-center gap-1.5 rounded-full border border-[#5a922c]/20 bg-[#5a922c]/10 px-3 py-1 text-xs font-medium text-[#5a922c] transition-colors duration-200 hover:border-[#5a922c]/30 hover:bg-[#5a922c]/15"
    >
      <CheckCircle className="h-3 w-3" />
      Reviewed by Sunny Patel
    </Link>
  );
}
