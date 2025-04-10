import React, { useState } from "react";
import axios from "axios";
import { SearchResult, ApiErrorDetail } from "../types"; // Import types

// Define your backend API URL
const API_URL = "http://localhost:8000";

// Define props type
interface SearchBarProps {
  onSearchResults: (results: SearchResult[] | null) => void; // Can be null on clear/error
  onError: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
}

// Expected response structure from /search
interface SearchResponse {
  query: string;
  results: SearchResult[];
}

function SearchBar({
  onSearchResults,
  onError,
  setIsLoading,
  isLoading,
}: SearchBarProps) {
  const [query, setQuery] = useState<string>("");

  const handleSearch = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default form submission
    if (!query.trim()) {
      onError("Please enter a search term.");
      return;
    }
    setIsLoading(true);
    onError(""); // Clear previous errors
    onSearchResults(null); // Clear previous results visually

    try {
      // Add type safety to the GET request response
      const response = await axios.get<SearchResponse>(`${API_URL}/search`, {
        params: { query: query },
      });
      if (response.data && response.data.results) {
        onSearchResults(response.data.results);
        if (response.data.results.length === 0) {
          onError(`No results found for "${query}".`); // Inform user if search returned empty
        }
      } else {
        onSearchResults([]); // Explicitly set empty array if data format is wrong
        onError("Received unexpected data from search.");
      }
    } catch (err) {
      console.error("Search error:", err);
      let errorMsg = "Search failed. Check console or backend logs.";
      // if (axios.isAxiosError(err)) {
      //   const serverError = err as AxiosError<ApiErrorDetail>;
      //   if (
      //     serverError.response &&
      //     serverError.response.data &&
      //     serverError.response.data.detail
      //   ) {
      //     errorMsg = `Search Error: ${serverError.response.data.detail}`;
      //   } else if (serverError.request) {
      //     errorMsg = "Search Error: No response from server.";
      //   } else if (serverError.message) {
      //     errorMsg = `Search Error: ${serverError.message}`;
      //   }
      // } else if (err instanceof Error) {
      //   errorMsg = `Search Error: ${err.message}`;
      // }
      console.log(err);
      onError(errorMsg);
      onSearchResults(null); // Ensure results are cleared on error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-section card">
      <h2>2. Search Past Meetings</h2>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={query}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setQuery(e.target.value)
          }
          placeholder="Search by keyword in transcript or summary..."
          disabled={isLoading}
          style={{ width: "300px", marginRight: "10px" }}
        />
        <button type="submit" disabled={!query.trim() || isLoading}>
          Search
        </button>
      </form>
    </div>
  );
}

export default SearchBar;
