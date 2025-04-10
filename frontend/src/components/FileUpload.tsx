import { useState } from "react";
import axios from "axios";
import { MeetingData, ApiErrorDetail } from "../types"; // Import types

// Define your backend API URL
const API_URL = "http://localhost:8000";

// Define props type
interface FileUploadProps {
  onUploadSuccess: (data: MeetingData) => void;
  onUploadError: (message: string) => void;
  setIsLoading: (isLoading: boolean) => void;
  isLoading: boolean; // Receive isLoading state
}

function FileUpload({
  onUploadSuccess,
  onUploadError,
  setIsLoading,
  isLoading,
}: FileUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
      setStatus(""); // Clear previous status
      onUploadError(""); // Clear previous errors
    } else {
      setSelectedFile(null);
    }
  };
  // This is the first code

  const handleUpload = async () => {
    // ... (keep existing code before try block)
    if (!selectedFile) {
      onUploadError("Please select an audio file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    setIsLoading(true);
    setStatus(
      `Uploading "${selectedFile.name}" and processing... please wait.`
    );
    onUploadError("");

    try {
      const response = await axios.post<MeetingData>(
        `${API_URL}/transcribe`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          // timeout: 300000,
        }
      );
      setStatus(`Successfully processed "${selectedFile.name}"!`);
      onUploadSuccess(response.data);
    } catch (err) {
      console.error("Upload error details:", err);
      let errorMsg = "Upload failed. Check console or backend logs.";
      // --- CHANGE HERE: Use the type guard ---
      // if (axios.isAxiosError && axios.isAxiosError(err)) {
      //   // Within this block, TypeScript knows 'err' is an AxiosError
      //   // You can safely access err.response, err.request, err.message

      //   // Check for response data with detail property
      //   if (err.response) {
      //     // You can assert the type of data if you are sure about its structure
      //     const responseData = err.response.data as Partial<ApiErrorDetail>;
      //     if (responseData && responseData.detail) {
      //       errorMsg = `Error: ${responseData.detail}`;
      //     } else {
      //       // Handle cases where response exists but data format is unexpected
      //       errorMsg = `Error: Received status ${err.response.status} from server.`;
      //     }
      //   } else if (err.request) {
      //     // The request was made but no response was received
      //     errorMsg = "Error: No response from server. Is it running?";
      //   } else {
      //     // Something happened in setting up the request that triggered an Error
      //     errorMsg = `Axios Error: ${err.message}`;
      //   }
      // } else if (err instanceof Error) {
      //   // Handle non-Axios errors (e.g., network issues before request)
      //   errorMsg = `Error: ${err.message}`;
      // } else {
      //   // Handle other types of errors if necessary
      //   errorMsg = "An unexpected error occurred.";
      // }
      console.log(err);

      setStatus("");
      onUploadError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // This is the second code
  // const handleUpload = async () => {
  //   if (!selectedFile) {
  //     onUploadError("Please select an audio file first.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("file", selectedFile);

  //   setIsLoading(true);
  //   setStatus(
  //     `Uploading "${selectedFile.name}" and processing... please wait.`
  //   );
  //   onUploadError(""); // Clear previous errors

  //   try {
  //     // Specify the expected response type for type safety
  //     const response = await axios.post<MeetingData>(
  //       `${API_URL}/transcribe`,
  //       formData,
  //       {
  //         headers: {
  //           "Content-Type": "multipart/form-data",
  //         },
  //         // timeout: 300000, // 5 minutes timeout (Consider Axios timeout handling)
  //       }
  //     );
  //     setStatus(`Successfully processed "${selectedFile.name}"!`);
  //     onUploadSuccess(response.data); // Pass the typed data up
  //   } catch (err) {
  //     console.error("Upload error details:", err); // Log the raw error for debugging
  //     let errorMsg = "Upload failed. Please try again or check console logs."; // Default message

  //     if (axios.isAxiosError(err)) {
  //       // --- Specific Axios Error Handling ---
  //       // Error came from the server response
  //       if (err.response) {
  //         const responseData = err.response.data as Partial<ApiErrorDetail>; // Type assertion
  //         if (responseData && responseData.detail) {
  //           errorMsg = `Server Error: ${responseData.detail}`;
  //         } else {
  //           errorMsg = `Server Error: Received status ${err.response.status}.`;
  //         }
  //         // Request was made, but no response received (e.g., server down, network issue detected by Axios)
  //       } else if (err.request) {
  //         errorMsg =
  //           "Network Error: No response received from server. Is it running and accessible?";
  //         // Error happened setting up the request (e.g., invalid config)
  //       } else {
  //         errorMsg = `Request Setup Error: ${err.message}`;
  //       }
  //     } else if (err instanceof Error) {
  //       // --- Generic JavaScript Error Handling ---
  //       // This catches errors that aren't specifically AxiosErrors
  //       // e.g., potentially network issues before Axios request fires, or other JS errors.

  //       const lowerCaseMessage = err.message.toLowerCase();

  //       // Try to guess if it's a common network-related generic error
  //       if (
  //         lowerCaseMessage.includes("network") ||
  //         lowerCaseMessage.includes("failed to fetch") || // Common with underlying fetch issues
  //         lowerCaseMessage.includes("timeout") || // Could be generic timeout, not Axios specific
  //         lowerCaseMessage.includes("offline")
  //       ) {
  //         errorMsg = `Network Error: ${err.message}. Please check your internet connection.`;
  //       } else {
  //         // Otherwise, treat it as a general client-side error
  //         errorMsg = `Client Error: ${err.message}`;
  //       }
  //     } else {
  //       // --- Non-Error Thrown ---
  //       // Fallback for cases where something other than an Error object was thrown
  //       errorMsg = "An unexpected issue occurred.";
  //       console.error("Caught a non-Error throwable:", err); // Log this unusual case
  //     }

  //     setStatus(""); // Clear the "uploading..." status
  //     onUploadError(errorMsg); // Set the specific error message for the UI
  //   } finally {
  //     setIsLoading(false); // Always ensure loading state is reset
  //   }
  // };

  // ... rest of the component (return statement, etc.) remains the same ...

  // Helper Type (assuming your backend error might look like this)

  // Assume MeetingData and FileUploadProps are defined elsewhere
  // interface MeetingData { /* structure of your expected success response */ }
  // interface FileUploadProps { /* structure of your component props */ }
  // const API_URL = '...'; // Your API base URL

  return (
    <div className="upload-section card">
      <h2>1. Upload Meeting Audio</h2>
      <input
        type="file"
        accept="audio/*" // Accept common audio formats
        onChange={handleFileChange}
        disabled={isLoading}
      />
      <button onClick={handleUpload} disabled={!selectedFile || isLoading}>
        {isLoading ? "Processing..." : "Upload & Analyze"}
      </button>
      {status && <p className="status-message">Status: {status}</p>}
    </div>
  );
}

export default FileUpload;
