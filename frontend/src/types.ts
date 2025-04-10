// src/types.ts

// Data structure returned by the /transcribe endpoint
export interface MeetingData {
  meeting_id: string;
  filename: string | null; // Filename might not always be present if error occurs early
  transcript_preview?: string; // Optional preview
  summary: string;
  action_items: string[]; // Expecting an array of strings
}

// Data structure for items in the array returned by the /search endpoint
export interface SearchResult {
  id: string; // Matches meeting_id
  filename: string | null;
  timestamp: string; // Assuming ISO string format from backend
  summary: string; // Full summary might be returned, or just a snippet
}

// For Axios error handling
export interface ApiErrorDetail {
  detail: string;
}

// interface NetworkError extends Error {
//   config?: object; // Axios errors typically have a 'config' property
//   response?: {
//     data?: any;
//     status?: number;
//     headers?: any;
//   };
//   request?: any;
//   // Note: We don't check for isAxiosError here as the guard itself replaces that check
// }
