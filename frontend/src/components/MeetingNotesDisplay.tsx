import { MeetingData } from "../types"; // Import type

// Define your backend API URL
const API_URL = "http://localhost:8000";

// Define props type
interface MeetingDisplayProps {
  meetingData: MeetingData | null; // Can be null initially
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean;
  onError: (message: string) => void;
}

function MeetingDisplay({
  meetingData,
  setIsLoading,
  isLoading,
  onError,
}: MeetingDisplayProps) {
  const handleDownload = async (meetingId: string | undefined) => {
    if (!meetingId) {
      onError("Cannot download - Meeting ID is missing.");
      return;
    }
    // No need to set loading generally for simple link click, unless checking first
    setIsLoading(true);
    onError(""); // Clear previous errors

    try {
      const downloadUrl = `${API_URL}/download/${meetingId}`;
      console.log("Triggering download from:", downloadUrl);

      // Create a temporary link and click it
      const link = document.createElement("a");
      link.href = downloadUrl;
      // link.setAttribute("target", "_blank"); // Try opening in new tab first
      link.setAttribute("download", `meeting_report_${meetingId}.pdf`); // Suggest filename
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link); // Clean up the link
    } catch (err) {
      console.error("Download initiation error:", err);
      onError(
        `Failed to initiate download for ${meetingId}. Check browser permissions or backend.`
      );
      setIsLoading(false); // Only if loading was set
    }
    setIsLoading(false); // Only if loading was set
  };

  if (!meetingData || !meetingData.meeting_id) {
    return (
      <div className="meeting-display card">
        <p>Upload an audio file to see the results here.</p>
      </div>
    );
  }

  return (
    <div className="meeting-display card">
      <h2>Meeting Results (ID: {meetingData.meeting_id})</h2>
      {meetingData.filename && (
        <p>
          <strong>File:</strong> {meetingData.filename}
        </p>
      )}

      <h3>Summary:</h3>
      <div className="summary-box">
        {meetingData.summary || "No summary generated."}
      </div>

      <h3>Action Items:</h3>
      <div className="action-items-box">
        {meetingData.action_items && meetingData.action_items.length > 0 ? (
          <ul>
            {meetingData.action_items.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        ) : (
          <p>No action items identified.</p>
        )}
      </div>

      {/* Transcript Preview (Optional) */}
      {meetingData.transcript_preview && (
        <>
          <h3>Transcript Preview:</h3>
          <p className="transcript-preview">{meetingData.transcript_preview}</p>
        </>
      )}

      <button
        onClick={() => handleDownload(meetingData.meeting_id)}
        disabled={isLoading}
        className="download-button"
      >
        Download Full Report (PDF)
      </button>
    </div>
  );
}

export default MeetingDisplay;
