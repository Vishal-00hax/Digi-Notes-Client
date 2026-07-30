import { useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";

export const useVoiceInput = (onResult) => {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setIsSupported(false); // Hide the feature if browser does not supprot
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; //Stop automatically afetr speak one time
    recognition.interimResults = false; // only final result not from middel
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript); // Send result into Parent Component
    };

    recognition.onerror = (event) => {
      console.error("Voice recognition error:", event.error);
      setIsListening(false);
      if (event.error === "not-allowed") {
        toast.error(
          "Microphone access denied. Please allow microphone permission.",
        );
      } else if (event.error === "no-speech") {
        toast.error(
          "No speech detected. Try speaking right after clicking the mic.",
        );
      } else if (event.error === "network") {
        toast.error("Network error. Please check your internet connection.");
      } else if (event.error === "aborted") {
        // ✅ Yeh tab hota hai jab user khud stop kar de — koi error dikhane ki zaroorat nahi
      } else {
        toast.error("Voice recognition failed. Please try again.");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [onResult]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current || isListening) return;
    setIsListening(true);
    toast.success("Microphone Start");
    recognitionRef.current.start();
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    toast.success("Microphone Stop");
    recognitionRef.current.stop();
  }, []);

  return { isListening, isSupported, startListening, stopListening };
};
