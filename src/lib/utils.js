import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn Utility Function
 * -------------------
 * This is a helper function used to conditionally combine class names
 * in a clean and Tailwind-friendly way.
 *
 * It combines:
 * - clsx → handles conditional class joining
 * - tailwind-merge → removes conflicting Tailwind classes
 *
 * Example:
 * cn("p-4", isActive && "bg-red-500", "p-2")
 * → resolves conflicts and returns clean final class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}







