"use client";

import Link from "next/link";
import type React from "react";
import {
  IoHomeOutline,
  IoBriefcaseOutline,
  IoPersonOutline,
  IoGridOutline,
  IoDocumentTextOutline,
  IoMailOutline,
} from "react-icons/io5";

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  href: string;
  gradientFrom: string;
  gradientTo: string;
}

const menuItems: MenuItem[] = [
  {
    title: "Home",
    icon: <IoHomeOutline />,
    href: "/",
    gradientFrom: "#5B8AEF",
    gradientTo: "#7B9FF0",
  },
  {
    title: "Services",
    icon: <IoBriefcaseOutline />,
    href: "/services",
    gradientFrom: "#56CCF2",
    gradientTo: "#2F80ED",
  },
  {
    title: "About",
    icon: <IoPersonOutline />,
    href: "/about",
    gradientFrom: "#a955ff",
    gradientTo: "#ea51ff",
  },
  {
    title: "Portfolio",
    icon: <IoGridOutline />,
    href: "/portfolio",
    gradientFrom: "#80FF72",
    gradientTo: "#7EE8FA",
  },
  {
    title: "Blog",
    icon: <IoDocumentTextOutline />,
    href: "/blog",
    gradientFrom: "#FF9966",
    gradientTo: "#FF5E62",
  },
  {
    title: "Contact",
    icon: <IoMailOutline />,
    href: "/contact",
    gradientFrom: "#ffa9c6",
    gradientTo: "#f434e2",
  },
];

interface GradientMenuProps {
  size?: "sm" | "md";
}

export default function GradientMenu({ size = "md" }: GradientMenuProps) {
  // Desktop (md): tiny ghost pills — barely visible at rest, vivid on hover
  // Mobile (sm): slightly larger for touch targets
  const pillBase =
    size === "sm"
      ? "w-[42px] h-[42px] hover:w-[120px]"
      : "w-[32px] h-[32px] hover:w-[100px]";
  const gap = size === "sm" ? "gap-2" : "gap-1";
  const iconSize = size === "sm" ? "text-lg" : "text-[15px]";
  const labelSize = "text-[10px]";
  // Desktop icons are very muted; mobile slightly more visible
  const iconColor = size === "sm" ? "text-white/50" : "text-white/40";

  return (
    <ul className={`flex items-center ${gap}`}>
      {menuItems.map(({ title, icon, href, gradientFrom, gradientTo }, idx) => (
        <li
          key={idx}
          style={
            {
              "--gradient-from": gradientFrom,
              "--gradient-to": gradientTo,
            } as React.CSSProperties
          }
          className={`relative ${pillBase} bg-white/[0.06] border border-white/[0.10] rounded-full flex items-center justify-center transition-all duration-500 hover:border-white/[0.04] group cursor-pointer`}
        >
          {/* Gradient fill on hover — muted */}
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-opacity duration-500 group-hover:opacity-30" />

          {/* Soft glow — very restrained */}
          <span className="absolute top-[6px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[10px] opacity-0 -z-10 transition-opacity duration-500 group-hover:opacity-20" />

          {/* Icon — dims slightly on hover, stays visible */}
          <span className={`relative z-10 transition-all duration-400 group-hover:opacity-0 group-hover:scale-75 ${iconColor}`}>
            <span className={iconSize}>{icon}</span>
          </span>

          {/* Label — fades in softly */}
          <span
            className={`absolute z-10 text-white/80 uppercase tracking-widest font-medium ${labelSize} opacity-0 scale-95 transition-all duration-300 delay-75 group-hover:opacity-100 group-hover:scale-100 whitespace-nowrap pointer-events-none`}
          >
            {title}
          </span>

          {/* Full-area link */}
          <Link
            href={href}
            className="absolute inset-0 rounded-full z-20"
            aria-label={title}
          />
        </li>
      ))}
    </ul>
  );
}
