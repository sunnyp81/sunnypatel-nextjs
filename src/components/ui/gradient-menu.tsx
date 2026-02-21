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
  const pillBase =
    size === "sm"
      ? "w-[46px] h-[46px] hover:w-[130px]"
      : "w-[56px] h-[56px] hover:w-[160px]";
  const gap = size === "sm" ? "gap-2" : "gap-3";
  const iconSize = size === "sm" ? "text-xl" : "text-2xl";
  const labelSize = size === "sm" ? "text-[11px]" : "text-sm";

  return (
    <ul className={`flex ${gap}`}>
      {menuItems.map(({ title, icon, href, gradientFrom, gradientTo }, idx) => (
        <li
          key={idx}
          style={
            {
              "--gradient-from": gradientFrom,
              "--gradient-to": gradientTo,
            } as React.CSSProperties
          }
          className={`relative ${pillBase} bg-white/[0.06] border border-white/10 rounded-full flex items-center justify-center transition-all duration-500 hover:border-transparent hover:shadow-none group cursor-pointer`}
        >
          {/* Gradient fill on hover */}
          <span className="absolute inset-0 rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

          {/* Glow bloom below */}
          <span className="absolute top-[10px] inset-x-0 h-full rounded-full bg-[linear-gradient(45deg,var(--gradient-from),var(--gradient-to))] blur-[15px] opacity-0 -z-10 transition-opacity duration-500 group-hover:opacity-50" />

          {/* Icon — fades/scales out on hover */}
          <span className="relative z-10 transition-all duration-300 group-hover:scale-0 group-hover:opacity-0">
            <span className={`${iconSize} text-muted-foreground`}>{icon}</span>
          </span>

          {/* Label — scales in on hover */}
          <span
            className={`absolute z-10 text-white uppercase tracking-wide font-medium ${labelSize} scale-0 opacity-0 transition-all duration-300 delay-100 group-hover:scale-100 group-hover:opacity-100 whitespace-nowrap pointer-events-none`}
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
