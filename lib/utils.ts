import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeParseJSON<T>(jsonString: string): T | null {
  try {
    // Attempt standard parse first
    return JSON.parse(jsonString) as T;
  } catch (e) {
    // If standard parse fails, try to strip markdown code fences and extraneous text
    try {
      // Find the first occurrence of { or [ and the last occurrence of } or ]
      const firstCurly = jsonString.indexOf('{');
      const firstSquare = jsonString.indexOf('[');
      const lastCurly = jsonString.lastIndexOf('}');
      const lastSquare = jsonString.lastIndexOf(']');

      let startIndex = -1;
      let endIndex = -1;

      if (firstCurly !== -1 && (firstSquare === -1 || firstCurly < firstSquare)) {
        startIndex = firstCurly;
        endIndex = lastCurly;
      } else if (firstSquare !== -1) {
        startIndex = firstSquare;
        endIndex = lastSquare;
      }

      if (startIndex !== -1 && endIndex !== -1 && endIndex >= startIndex) {
        let extractedJson = jsonString.substring(startIndex, endIndex + 1);
        
        // Remove trailing commas before closing braces/brackets (simple regex approach)
        extractedJson = extractedJson.replace(/,\s*([\]}])/g, '$1');
        
        return JSON.parse(extractedJson) as T;
      }

      return null;
    } catch (e2) {
      return null;
    }
  }
}
