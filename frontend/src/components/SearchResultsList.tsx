import { SearchResult } from "../types"; // Import type

// Define your backend API URL
const API_URL = "http://localhost:8000";

// Define props type
interface SearchResultsProps {
  results: SearchResult[] | null; // Can be null initially or on error
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  onError: (message: string) => void;
}

function SearchResults({
  results,
  setIsLoading,
  isLoading,
  onError,
}: SearchResultsProps) {
  const handleDownload = async (meetingId: string) => {
    if (!meetingId) {
      onError("Cannot download - Meeting ID is missing.");
      return;
    }
    setIsLoading(true); // Optional: set loading for download button too
    onError(""); // Clear previous errors

    try {
      const downloadUrl = `${API_URL}/download/${meetingId}`;
      console.log("Triggering download from:", downloadUrl);

      // Create a temporary link and click it
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.setAttribute("target", "_blank");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download initiation error:", err);
      onError(`Failed to initiate download for ${meetingId}.`);
    }
    setIsLoading(false); // Optional: unset loading
  };

  // Format timestamp nicely
  const formatTimestamp = (isoString: string | null): string => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return isoString; // Return original if invalid date
      }
      // Adjust formatting as needed
      return date.toLocaleString("en-US", {
        // Example locale
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });
    } catch (e) {
      console.error("Timestamp parsing error:", e);
      return isoString; // Return original if parsing fails
    }
  };

  // Don't render anything if results are explicitly null (initial state or error)
  if (results === null) {
    return null;
  }

  // Message handled by SearchBar/App's error state
  if (results.length === 0) {
    return (
      <div className="search-results card">
        <p>No meetings found matching your query.</p>
      </div>
    );
  }

  return (
    <div className="search-results card">
      {/* Only show title if there are results */}
      {results.length > 0 && <h3>Search Results:</h3>}
      {results.length > 0 ? (
        <ul>
          {results.map((meeting) => (
            <li key={meeting.id} className="search-result-item">
              <div>
                <strong>File:</strong> {meeting.filename || "N/A"} <br />
                <strong>Date:</strong> {formatTimestamp(meeting.timestamp)}{" "}
                <br />
                <strong>Summary Snippet:</strong>{" "}
                {meeting.summary
                  ? `${meeting.summary.substring(0, 100)}...`
                  : "N/A"}
              </div>
              <button
                onClick={() => handleDownload(meeting.id)}
                disabled={isLoading}
                className="download-button-small"
              >
                Download PDF
              </button>
            </li>
          ))}
        </ul>
      ) : (
        // Optional: You could show a "No results found" message here if needed,
        // but often handled via the main error display
        <></>
      )}
    </div>
  );
}

export default SearchResults;
