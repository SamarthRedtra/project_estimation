import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

import { useNavigate } from "react-router-dom"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function handleNavigate (path: string) : void {
  const navigate = useNavigate()
  navigate(path)
}