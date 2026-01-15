"use client";
import { useSession } from "next-auth/react";
import { usePrediction } from "context/PredictionContext";
import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useState, useRef, useEffect } from 'react';
import { CldUploadButton } from 'next-cloudinary';
import Swal from 'sweetalert2';
import LoadingTeeth from "/public/assets/LoadingTeeth.gif";
import { API_URL } from '@/config';

const CREATE_SCAN_RECORD = gql`
  mutation CreateScanRecord(
    $user: ID!, 
    $result: [String!]!, 
    $notes: [String!], 
    $imageUrls: [String!],
    $limeVisualizationUrl: String,
  ) {
    createScanRecord(
      user: $user, 
      result: $result, 
      notes: $notes, 
      imageUrls: $imageUrls,
      limeVisualizationUrl: $limeVisualizationUrl,
    ) {
      _id
      result
      notes
      imageUrls
      limeVisualizationUrl
    }
  }
`;

const ScanPage = () => {
  const [images, setImages] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const MAX_IMAGES = 5;
  const { predictionResult, setPredictionResult } = usePrediction();
  const [loading, setLoading] = useState(false);
  const [createScanRecord] = useMutation(CREATE_SCAN_RECORD);
  const [severityResponses, setSeverityResponses] = useState("");
  const [causeResponses, setCauseResponses] = useState("");
  const [symptomResponses, setSymptomResponses] = useState("");
  const [confidenceLevel, setConfidenceLevel] = useState<string>("");
  const [isValid, setIsValid] = useState(true);
  const [availableDevices, setAvailableDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [showDeviceSelector, setShowDeviceSelector] = useState(false);
  const [limeExplanation, setLimeExplanation] = useState<string | null>(null);
  const [showLimeExplanation, setShowLimeExplanation] = useState(false);
  const [generatingLime, setGeneratingLime] = useState(false);
  const [totalPositive, setTotalPositive] = useState<number | null>(null);
  const [totalNegative, setTotalNegative] = useState<number | null>(null);
  const [netEvidence, setNetEvidence] = useState<number | null>(null);


  const isMediaError = (error: unknown): error is DOMException => {
    return error instanceof DOMException;
  };

  const hasErrorName = (error: unknown): error is { name: string; message: string } => {
    return typeof error === 'object' && error !== null && 'name' in error && 'message' in error;
  };
  
  useEffect(() => {
    setPredictionResult(""); // Clear the prediction result when ScanPage mounts
    closeCamera();
  }, []);

  // Camera-related state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: session, status } = useSession();
  console.log("This is the session: ", session);
  console.log("This is the user id:", session?.user?.id);
  const userId = session?.user?.id;

  // Replace the handleImageUpload function:
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    // Reset the input value to allow selecting the same files again
    e.target.value = '';
    
    // Check if adding these files would exceed the limit
    if (selectedFiles.length + files.length > MAX_IMAGES) {
      Swal.fire({
        icon: 'warning',
        title: 'Upload Limit Exceeded',
        text: `You can only upload a maximum of ${MAX_IMAGES} images.`,
        confirmButtonColor: '#74b0f0'
      });
      return;
    }
    
    files.forEach(file => {
      const imageUrl = URL.createObjectURL(file);
      setImages(prev => [...prev, imageUrl]);
      setSelectedFiles(prev => [...prev, file]);
    });
  };

  // Camera functions
  const checkCameraPermissions = async () => {
    try {
      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not supported in this browser');
      }

      // Try to get permission first with basic constraints
      const testStream = await navigator.mediaDevices.getUserMedia({ video: true });
      testStream.getTracks().forEach(track => track.stop()); // Stop immediately
      return true;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  };

  const getAvailableDevices = async () => {
    try {
      // First, request basic camera permission
      const hasPermission = await checkCameraPermissions();
      if (!hasPermission) {
        throw new Error('Camera permission denied');
      }

      // Now enumerate devices
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      console.log('Available video devices:', videoDevices.map(d => ({ 
        label: d.label, 
        deviceId: d.deviceId.substring(0, 20) + '...' 
      })));
      
      setAvailableDevices(videoDevices);
      
      // Auto-select UVC camera if found
      const uvcDevice = videoDevices.find(device => 
        device.label.toLowerCase().includes('usb') || 
        device.label.toLowerCase().includes('uvc') ||
        device.label.toLowerCase().includes('camera 2.0') ||
        device.label.toLowerCase().includes('external')
      );
      
      if (uvcDevice) {
        console.log('UVC camera found:', uvcDevice.label);
        setSelectedDeviceId(uvcDevice.deviceId);
      } else if (videoDevices.length > 0) {
        console.log('Using first available camera:', videoDevices[0].label);
        setSelectedDeviceId(videoDevices[0].deviceId);
      }
      
      return videoDevices;
    } catch (error) {
      console.error('Error getting camera devices:', error);
      
      // Handle the error with proper typing
      if (hasErrorName(error)) {
        throw new Error(`Failed to get camera devices: ${error.message}`);
      } else {
        throw new Error(`Failed to get camera devices: ${String(error)}`);
      }
    }
  };

  const openCamera = async () => {
    try {
      console.log('Opening camera...');
      
      // Get available devices first
      let devices;
      try {
        devices = await getAvailableDevices();
      } catch (error) {
        alert('Unable to access camera devices. Please check your browser permissions.');
        return;
      }
      
      // If no devices found
      if (devices.length === 0) {
        alert('No camera devices found. Please make sure your camera is connected.');
        return;
      }
      
      // If no device selected and multiple devices available, show selector
      if (!selectedDeviceId && devices.length > 1) {
        setShowDeviceSelector(true);
        return;
      }
      
      // Use first device if none selected
      const deviceToUse = selectedDeviceId || devices[0].deviceId;
      console.log('Using camera device:', deviceToUse);
      
      const constraints = {
        video: {
          deviceId: deviceToUse ? { exact: deviceToUse } : undefined,
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      console.log('Camera constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera stream obtained successfully');
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      setShowDeviceSelector(false);
      
      // Wait a bit for the video element to be rendered
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error opening camera:', error);
      
      // Provide more specific error messages
      let errorMessage = 'Unable to access camera. ';
      
      // Use type guard to safely access error properties
      if (isMediaError(error)) {
        if (error.name === 'NotAllowedError') {
          errorMessage += 'Camera permission was denied. Please allow camera access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'No camera device found. Please make sure your camera is connected.';
        } else if (error.name === 'NotReadableError') {
          errorMessage += 'Camera is already in use by another application.';
        } else if (error.name === 'OverconstrainedError') {
          errorMessage += 'Camera does not support the requested settings. Trying with basic settings...';
          
          // Try with basic constraints as fallback
          try {
            const basicStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(basicStream);
            setIsCameraOpen(true);
            
            setTimeout(() => {
              if (videoRef.current) {
                videoRef.current.srcObject = basicStream;
                videoRef.current.play();
              }
            }, 100);
            return;
          } catch (fallbackError) {
            errorMessage += ' Fallback also failed.';
          }
        } else {
          errorMessage += `Error: ${error.name} - ${error.message}`;
        }
      } else if (hasErrorName(error)) {
        // Handle other error types that have name and message
        errorMessage += `Error: ${error.name} - ${error.message}`;
      } else {
        // Handle completely unknown errors
        errorMessage += `Unknown error: ${String(error)}`;
      }
      
      alert(errorMessage);
    }
  };


  // Add this function to handle device selection
  const selectAndOpenCamera = async (deviceId: string) => {
    console.log('Selecting camera device:', deviceId);
    setSelectedDeviceId(deviceId);
    setShowDeviceSelector(false);
    
    try {
      const constraints = {
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      };
      
      console.log('Selected camera constraints:', constraints);
      
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Selected camera stream obtained successfully');
      
      setStream(mediaStream);
      setIsCameraOpen(true);
      
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play();
        }
      }, 100);
      
    } catch (error) {
      console.error('Error opening selected camera:', error);
      
      let errorMessage = 'Unable to access the selected camera. ';
      
      if (isMediaError(error)) {
        if (error.name === 'NotReadableError') {
          errorMessage += 'The camera might be in use by another application.';
        } else if (error.name === 'NotAllowedError') {
          errorMessage += 'Camera permission was denied.';
        } else if (error.name === 'NotFoundError') {
          errorMessage += 'The selected camera was not found.';
        } else {
          errorMessage += `Error: ${error.name} - ${error.message}`;
        }
      } else {
        errorMessage += 'Please try selecting a different camera.';
      }
      
      alert(errorMessage);
      setShowDeviceSelector(true); // Show selector again
    }
  };

  const closeCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  // Update the capturePhoto function:
  const capturePhoto = () => {
    if (selectedFiles.length >= MAX_IMAGES) {
      Swal.fire({
        icon: 'warning',
        title: 'Maximum Images Reached',
        text: `Maximum of ${MAX_IMAGES} images allowed.`,
        confirmButtonColor: '#74b0f0'
      });
      return;
    }
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(file);
          
          setImages(prev => [...prev, imageUrl]);
          setSelectedFiles(prev => [...prev, file]);
        }
      }, 'image/jpeg', 0.9);
    }
  };

  // Function to convert base64 to File
  const base64ToFile = (base64String: string, filename: string): File => {
    // Remove data URL prefix if present
    const base64Data = base64String.includes('base64,') 
      ? base64String.split('base64,')[1] 
      : base64String;
    
    // Convert base64 to binary
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Create blob and convert to File
    const blob = new Blob([bytes], { type: 'image/png' });
    return new File([blob], filename, { type: 'image/png' });
  };

  // Updated streamGeminiResponse function with callback for real-time streaming
  const streamGeminiResponse = async (
    prompt: string, 
    imageBase64?: string,
    onChunk?: (chunk: string) => void,
    delayMs: number = 10,
    charsPerStep: number = 3
  ): Promise<string> => {
    const body = imageBase64
      ? JSON.stringify({ prompt, image: imageBase64 })
      : JSON.stringify({ prompt });

    const response = await fetch(`${API_URL}/chat-stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder("utf-8");
    let result = "";

    if (reader) {
      let done = false;
      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          result += chunk;

          if (onChunk) {
            for (let i = 0; i < chunk.length; i += charsPerStep) {
              const chars = chunk.slice(i, i + charsPerStep);
              onChunk(chars);
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }
        }
      }
    }

    return result;
  };

  const generateLimeExplanation = async () => {
    if (selectedFiles.length === 0) {
      alert('Please upload an image first');
      return;
    }

    setGeneratingLime(true);
    setLimeExplanation(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFiles[0]); // Use first image

      const response = await fetch(`${API_URL}/predict-with-lime?num_samples=100`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('LIME explanation failed');
      }

      const data = await response.json();
      setLimeExplanation(data.explanation_image);
      setShowLimeExplanation(true);
      
    } catch (error) {
      console.error('Error generating LIME explanation:', error);
      alert('Failed to generate LIME explanation. Please try again.');
    } finally {
      setGeneratingLime(false);
    }
  };

  // Function to upload files to Cloudinary
  const uploadToCloudinary = async (files: File[]): Promise<string[]> => {
    const uploadPromises = files.map(file => uploadSingleFile(file));
    return Promise.all(uploadPromises);
  };

  // Function to upload a single file to Cloudinary
  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'patient_teeth'); // Your preset name
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      if (!response.ok) {
        throw new Error('Cloudinary upload failed');
      }
      
      const result = await response.json();
      return result.secure_url; // Returns the Cloudinary URL
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  };

  // Helper to resize image before sending to API
  const resizeImage = (file: File, maxWidth = 768): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ratio = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * ratio;
          
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          // Convert to base64 with lower quality (0.7) to save tokens
          resolve(canvas.toDataURL('image/jpeg', 0.7)); 
        };
      };
    });
  };

  // Submit Images
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) return;

    // Reset ALL states at the beginning
    setPredictionResult("");
    setIsValid(true); 
    setSeverityResponses("");
    setCauseResponses("");
    setSymptomResponses("");
    setConfidenceLevel("");
    setLimeExplanation(null);
    setGeneratingLime(true);
    
    const formData = new FormData();
    selectedFiles.forEach((file, index) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);
      
      // Reset streaming responses
      setSeverityResponses("");
      setCauseResponses("");
      setSymptomResponses("");

      // IMPROVEMENT 1: Resize image to save tokens (90% reduction!)
      const base64Image = await resizeImage(selectedFiles[0], 768);

      // IMPROVEMENT 2 & 3: Combined validation + health check in ONE non-streaming call
      console.log("Validating image with combined prompt...");
      const validationResponse = await streamGeminiResponse(
        `Analyze this image and respond ONLY with a JSON array in this exact format: ["valid", "healthy"]

        Rules:
        - First element: "yes" if image shows real human teeth/mouth/lips, "no" otherwise
        - Second element: "yes" if teeth appear healthy, "no" if any disease/issues visible

        Examples:
        - Real teeth, healthy: ["yes", "yes"]
        - Real teeth, diseased: ["yes", "no"]  
        - Not teeth: ["no", "no"]

        Respond with ONLY the JSON array, no explanation, no markdown, no backticks.`,
        base64Image
      );

      let isValidTeethImage = false;
      let isHealthy = true;

      try {
        // Clean up any potential markdown or extra text
        const cleanResponse = validationResponse.trim().replace(/```json|```/g, '');
        const responseArray = JSON.parse(cleanResponse);
        isValidTeethImage = responseArray[0].toLowerCase().trim() === "yes";
        isHealthy = responseArray[1].toLowerCase().trim() === "yes";
        console.log("Validation result - Valid:", isValidTeethImage, "Healthy:", isHealthy);
      } catch (error) {
        console.error("Failed to parse validation response:", validationResponse, error);
        // Fallback: assume invalid to be safe
        setIsValid(false);
        setPredictionResult("Unable to validate image. Please try again.");
        setConfidenceLevel("");
        setLoading(false);
        setGeneratingLime(false);
        return;
      }
      
      if (!isValidTeethImage) {
        setIsValid(false);
        setPredictionResult("Invalid image: Please upload a clear image of actual teeth.");
        setConfidenceLevel("");
        setLoading(false);
        setGeneratingLime(false);
        return;
      } else if (isHealthy) {
        setIsValid(false);
        setPredictionResult("No diseases detected");
        setConfidenceLevel("");

        // Upload image to Cloudinary even for healthy teeth
        console.log("Uploading healthy teeth image to Cloudinary...");
        const cloudinaryUrls = await uploadToCloudinary(selectedFiles);

        // Save healthy result to database
        await createScanRecord({
          variables: {
            user: userId,
            result: ["No diseases detected"],
            notes: ["Healthy teeth"],
            imageUrls: cloudinaryUrls,
            analysisDetails: {
              cnnPrediction: "Healthy",
              cnnConfidence: 1.0,
              hybridPrediction: "Healthy",
              hybridConfidence: 1.0,
              totalPositiveEvidence: 0,
              totalNegativeEvidence: 0,
              netEvidence: 0,
              clinicalInterpretation: ["No diseases detected", "Teeth appear healthy"],
              allProbabilities: JSON.stringify({}),
            },
          },
        });

        setLoading(false);
        setGeneratingLime(false);
        return;
      }

      // Upload images to Cloudinary
      console.log("Uploading to Cloudinary...");
      const cloudinaryUrls = await uploadToCloudinary(selectedFiles);
      console.log("Cloudinary URLs:", cloudinaryUrls);

      // ===== STEP 1: FAST PREDICTION (NO LIME) =====
      console.log("Getting fast prediction...");
      const fastFormData = new FormData();
      fastFormData.append('file', selectedFiles[0]);
      
      const fastResponse = await fetch(`${API_URL}/predict-fast`, {
        method: 'POST',
        body: fastFormData,
      });
      
      if (!fastResponse.ok) {
        throw new Error("Fast prediction failed");
      }

      const fastData = await fastResponse.json();
      
      // Extract prediction from fast response
      const prediction = fastData.prediction.hybrid_prediction;
      setPredictionResult(prediction);
      setConfidenceLevel(`${(fastData.prediction.hybrid_confidence * 100).toFixed(1)}%`);
      
      console.log("Fast prediction received:", prediction);

      // Stream Gemini responses immediately (while LIME generates in background)
      const diseaseName = prediction.toLowerCase() === "calculus" ? "Dental Calculus" : prediction;

      // const severityPromise = streamGeminiResponse(
      //   `does this teeth have severe or mild ${prediction}? Just analyze the teeth in the image, don't consider other factors such as the teeth in the back that cannot be seen. Respond with a dash "-" followed by the severity assessment. Respond also in a straightforward manner. don't include sentences of doubt. After giving the severity level, put a period and give a description of the disease up to a maximum of 45 words`,
      //   base64Image,
      //   (chunk) => {
      //     setSeverityResponses(prev => prev + chunk);
      //   },
      //   20, 
      //   3
      // );

      // const causesPromise = streamGeminiResponse(
      //   `what are the causes of ${diseaseName}? Respond in a straightforward manner. Limit response up to a maximum of 45 words.`,
      //   undefined,
      //   (chunk) => {
      //     setCauseResponses(prev => prev + chunk);
      //   },
      //   20,
      //   3
      // );

      // const symptomsPromise = streamGeminiResponse(
      //   `what are the symptoms of ${diseaseName}? Respond in a straightforward manner. Limit response up to a maximum of 45 words.`,
      //   undefined,
      //   (chunk) => {
      //     setSymptomResponses(prev => prev + chunk);
      //   },
      //   20,
      //   3
      // );

      // setLoading(false);

      // // Wait for Gemini streams
      // await Promise.all([
      //   severityPromise,
      //   causesPromise,
      //   symptomsPromise,
      // ]);

      // ===== STEP 2: GENERATE LIME IN BACKGROUND =====
      console.log("Generating LIME explanation in background...");
      
      // Start LIME generation (don't await - runs in background)
      const limeFormData = new FormData();
      limeFormData.append('file', selectedFiles[0]);
      
      fetch(`${API_URL}/generate-lime?num_samples=100`, {
        method: 'POST',
        body: limeFormData,
      })
      .then(async (limeResponse) => {
        if (limeResponse.ok) {
          const limeData = await limeResponse.json();
          
          // Store LIME visualization
          setLimeExplanation(limeData.explanation_image);
          setGeneratingLime(false);
          
          // Convert base64 LIME image to File and upload to Cloudinary
          console.log("Uploading LIME visualization to Cloudinary...");
          const limeImageFile = base64ToFile(limeData.explanation_image, 'lime-explanation.png');
          const limeCloudinaryUrl = await uploadSingleFile(limeImageFile);
          console.log("LIME Cloudinary URL:", limeCloudinaryUrl);
          
          // Prepare comprehensive notes array
          const notes = [
            `CNN Prediction: ${fastData.prediction.cnn_prediction} (${(fastData.prediction.cnn_confidence * 100).toFixed(1)}% confidence)`,
            `Hybrid Prediction: ${fastData.prediction.hybrid_prediction} (${(fastData.prediction.hybrid_confidence * 100).toFixed(1)}% confidence)`,
            `Total Positive Evidence: ${limeData.lime_statistics.total_positive_evidence.toFixed(4)}`,
            `Total Negative Evidence: ${limeData.lime_statistics.total_negative_evidence.toFixed(4)}`,
            `Net Evidence: ${limeData.lime_statistics.net_evidence.toFixed(4)}`,
            ...limeData.lime_statistics.clinical_interpretation,
          ];
          
          // Save to database with LIME data
          await createScanRecord({
            variables: {
              user: userId,
              result: [prediction],
              notes: notes,
              imageUrls: cloudinaryUrls,
              limeVisualizationUrl: limeCloudinaryUrl,
            },
          });
          
          console.log("LIME explanation ready and saved!");
        } else {
          console.error("LIME generation failed:", limeResponse.status);
          setGeneratingLime(false);
        }
      })
      .catch((error) => {
        console.error("Error generating LIME:", error);
        setGeneratingLime(false);
      });

    } catch (error) {
      console.error("Error during analysis:", error);
      setPredictionResult("Error: could not get prediction.");
      setLoading(false);
      setGeneratingLime(false);
    } 
  };

  return (
    <>
      <div className="h-[370px] bg-gradient-to-br from-[#4fa1f2] via-[#74b0f0] to-[#66acf4] 
        backdrop-blur-md bg-opacity-30 rounded-3xl p-6 shadow-md hover:shadow-blue-300 
        transition-shadow duration-500 relative"
      >       
        {/* Loading GIF overlay */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center pt-4 rounded-3xl z-10">
            <img 
              src={LoadingTeeth.src} 
              alt="Loading..." 
              className="w-40 h-auto" // Adjust size as needed
            />
          </div>
        )}
        <div className="flex justify-between">
          <h2 className="text-2xl font-bold text-white">Ready to check your Teeth's Health?</h2>
          {/* Show loading state while generating LIME */}
          {generatingLime && (
            <div className="flex items-center gap-3 px-4 py-2 bg-blue-500/80 rounded-3xl">
              <span className="text-white text-sm font-medium">
                Please wait for 30 seconds, Image Explanation Generating...
              </span>
            </div>
          )}

          {/* Show button when LIME is ready */}
          {!generatingLime && limeExplanation && (
            <button
              onClick={() => setShowLimeExplanation(true)}
              className="px-6 py-2 bg-blue-500 text-white rounded-3xl hover:bg-blue-600 transition"
            >
              🔍 View AI Explanation
            </button>
          )}
        </div>     
        <p className="text-2xl text-white font-semibold mt-2">Scan Results</p>
        {predictionResult !== "" ? (
          isValid ? (
            <div className="flex items-start gap-10 mt-4">
              {/* Prediction list on the left */}
              <div className="text-xl text-white">
                <p className="mb-2 font-semibold">Diseases Present:</p>
                <ul className="list-disc list-inside">
                  {predictionResult ? (
                    <>
                      <li className="font-semibold capitalize">{predictionResult}</li>
                      <li>Confidence: {confidenceLevel}</li>
                    </>
                  ) : (
                    <li>{predictionResult}</li>
                  )}
                </ul>
              </div>

              {/* Status boxes */}
              <div className="w-80 h-55 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white">
                <p className="text-sm font-medium mb-2">Severity of Disease:</p>
                <p className="text-sm">{severityResponses}</p>
              </div>
              <div className="w-80 h-55 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white">
                <p className="text-sm font-medium mb-2">Possible Causes:</p>
                <p className="text-sm">{causeResponses}</p>
              </div>
              <div className="w-80 h-55 bg-white/20 backdrop-blur-md rounded-3xl p-4 shadow-inner text-white">
                <p className="text-sm font-medium mb-2">Symptoms:</p>
                <p className="text-sm">{symptomResponses}</p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-2xl text-white font-semibold">
              {predictionResult}
            </p>
          )
        ) : null}
      </div>

      <div className="h-[370px] bg-gradient-to-br from-white via-[#f0f0f0] to-[#e6e6e6]
        backdrop-blur-md bg-opacity-50 rounded-3xl p-6 shadow-md hover:shadow-gray-300
        transition-shadow duration-500 relative"
      >     
        <div className="flex justify-between items-center mb-4">  
          <h2 className="text-2xl font-bold text-[#74b0f0]">Upload Images Here:</h2>
          
          {/* Camera controls on the right */}
          <div className="flex gap-2 items-center flex-wrap">          
            {/* Device selector dropdown */}
            {availableDevices.length > 1 && !isCameraOpen && (
              <select
                value={selectedDeviceId}
                onChange={(e) => setSelectedDeviceId(e.target.value)}
                className="px-3 py-2 rounded-3xl border border-gray-300 text-sm max-w-48"
              >
                <option value="">Select Camera</option>
                {availableDevices.map((device, index) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${index + 1}`}
                  </option>
                ))}
              </select>
            )}
            
            {!isCameraOpen ? (
              <button
                onClick={openCamera}
                className="px-4 py-2 bg-[#74b0f0] text-white rounded-3xl hover:bg-[#5a9bd8] transition"
              >
                📷 Open Camera
              </button>
            ) : (
              <button
                onClick={closeCamera}
                className="px-4 py-2 bg-red-500 text-white rounded-3xl hover:bg-red-600 transition"
              >
                ✕ Close Camera
              </button>
            )}
          </div>

          {/* Device selector modal */}
          {showDeviceSelector && (
            <div className="absolute top-20 right-6 z-20 bg-white p-4 rounded-xl shadow-lg border max-w-80">
              <p className="text-gray-800 mb-3 font-medium">Select Camera:</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {availableDevices.map((device, index) => (
                  <button
                    key={device.deviceId}
                    onClick={() => selectAndOpenCamera(device.deviceId)}
                    className="block w-full text-left px-3 py-2 rounded-lg hover:bg-gray-100 transition text-sm border"
                  >
                    <div className="font-medium">
                      {device.label || `Camera ${index + 1}`}
                    </div>
                    <div className="text-xs text-gray-500 truncate">
                      ID: {device.deviceId.substring(0, 30)}...
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowDeviceSelector(false)}
                className="mt-3 px-3 py-1 bg-gray-500 text-white rounded-lg text-sm"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Camera view - Absolute positioned to not affect layout */}
        {isCameraOpen && (
          <div className="absolute top-20 right-6 z-10">
            <p className="text-gray-600 mb-2 text-sm">Camera View:</p>
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-48 h-36 rounded-xl shadow-md bg-black object-cover"
                onLoadedMetadata={() => {
                  if (videoRef.current) {
                    videoRef.current.play();
                  }
                }}
              />
              <button
                onClick={capturePhoto}
                className="mt-2 px-3 py-1 bg-[#74b0f0] text-white text-sm rounded-3xl hover:bg-[#5a9bd8] transition block"
              >
                📸 Capture Photo
              </button>
            </div>
          </div>
        )}

        {/* Main content area with fixed height */}
        <div className="flex gap-4 h-[calc(100%-120px)]">
          {/* Left side - Upload and preview */}
          <div className="flex-1">
            <div className="mb-4">
              <label 
                htmlFor="fileUpload" 
                className="cursor-pointer px-4 py-2 bg-[#74b0f0] text-white rounded-3xl hover:bg-[#5a9bd8] transition inline-block"
              >
                Choose Image
              </label>
              <input 
                id="fileUpload"
                type="file" 
                accept="image/*" 
                multiple
                onChange={handleImageUpload} 
                className="hidden"
              />
            </div>

            {/* Replace the single image preview with: */}
            {images.length > 0 && (
              <div className="overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-gray-600">Image Preview ({images.length}/{MAX_IMAGES}):</p>
                  <button
                    onClick={() => {
                      setImages([]);
                      setSelectedFiles([]);
                    }}
                    className="text-[#4fa1f2] text-sm hover:text-blue-700"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-6 max-h-[180px] overflow-y-auto justify-center">
                  {images.map((img, index) => (
                    <div key={index} className="relative">
                      <img 
                        src={img} 
                        alt={`Preview ${index + 1}`} 
                        className="w-[150px] h-[150px] object-cover rounded-xl shadow-md"
                      />
                      <button
                        onClick={() => {
                          setImages(prev => prev.filter((_, i) => i !== index));
                          setSelectedFiles(prev => prev.filter((_, i) => i !== index));
                        }}
                        className="absolute -top-1 right-0 bg-red-400 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                      >
                        ×
                      </button>
                      
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed position button at bottom center */}
        <div className="absolute bottom-6 right-6">
          <button 
            onClick={handleSubmit}
            disabled={loading || selectedFiles.length === 0}
            className="px-6 py-3 bg-[#74b0f0] text-white rounded-3xl hover:bg-[#5a9bd8] transition disabled:opacity-50 font-medium"
          >
            {loading ? "Analyzing..." : "Analyze Image"}
          </button>
        </div>

        {/* Hidden canvas for photo capture */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>

      {/* LIME Explanation Modal */}
      {showLimeExplanation && limeExplanation && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 p-4 backdrop-blur-2xl bg-opacity-50"
          onClick={() => setShowLimeExplanation(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-6xl max-h-[95vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-2xl font-bold text-gray-800">
                🔍 AI Explanation - LIME Analysis
              </h3>
              <button
                onClick={() => setShowLimeExplanation(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-2 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>How to read:</strong>
              </p>
              <ul className="text-sm text-gray-600 mt-2 space-y-1">
                <li>🟢 Green regions = Areas supporting the diagnosis</li>
                <li>🔴 Red regions = Areas contradicting the diagnosis</li>
                <li>⚪ Neutral areas = Not significant for diagnosis</li>
              </ul>
            </div>

            <img
              src={`data:image/png;base64,${limeExplanation}`}
              alt="LIME Explanation"
              className="w-full rounded-lg shadow-lg"
            />

            <div className="mt-4 text-center">
              <button
                onClick={() => setShowLimeExplanation(false)}
                className="px-6 py-2 bg-gray-600 text-white rounded-3xl hover:bg-gray-700 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ScanPage;