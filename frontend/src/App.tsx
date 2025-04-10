import { useState } from "react";
import FileUpload from "./components/FileUpload";
import MeetingDisplay from "./components/MeetingNotesDisplay";
import SearchBar from "./components/SearchBar";
import SearchResults from "./components/SearchResultsList";
import { MeetingData, SearchResult } from "./types"; // Import types
import "./App.css"; // Assuming you have App.css from previous step

function App() {
  // Use generics with useState for type safety
  const [currentMeetingData, setCurrentMeetingData] =
    useState<MeetingData | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[] | null>(
    null
  ); // null initially
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Callback functions now expect typed arguments
  const handleUploadSuccess = (data: MeetingData) => {
    setCurrentMeetingData(data);
    setError(""); // Clear errors on success
    setSearchResults(null); // Clear search results when new file is uploaded
  };

  const handleSearchResults = (results: SearchResult[] | null) => {
    setSearchResults(results);
    // Decide if search should clear specific errors or not
    // setError(''); // Be cautious about clearing unrelated errors
  };

  // Generic error handler remains the same
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  return (
    <div className="App">
      <h1>Multilingual Meeting Note Taker 🇭🇰</h1>

      {/* Conditional rendering based on state */}
      {isLoading && (
        <div className="loading-indicator">Processing... Please wait.</div>
      )}
      {error && <div className="error-message">{error}</div>}

      <div className="main-container">
        <div className="left-panel">
          <FileUpload
            onUploadSuccess={handleUploadSuccess}
            onUploadError={handleError}
            setIsLoading={setIsLoading}
            isLoading={isLoading} // Pass isLoading state down
          />
          <SearchBar
            onSearchResults={handleSearchResults}
            onError={handleError}
            setIsLoading={setIsLoading}
            isLoading={isLoading} // Pass isLoading state down
          />
        </div>

        <div className="right-panel">
          {/* Display latest uploaded meeting OR prompt */}
          <MeetingDisplay
            meetingData={currentMeetingData}
            setIsLoading={setIsLoading}
            isLoading={isLoading} // Pass isLoading state down
            onError={handleError}
          />

          {/* Display search results if available */}
          <SearchResults
            results={searchResults}
            setIsLoading={setIsLoading}
            isLoading={isLoading} // Pass isLoading state down
            onError={handleError}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
