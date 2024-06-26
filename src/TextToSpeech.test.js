import React from "react";
import { render, fireEvent, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
import TextToSpeech from "./TextToSpeech";

describe("TextToSpeech Component", () => {
  test("renders without crashing", () => {
    render(<TextToSpeech />);
    expect(screen.getByText("Text to Speech")).toBeInTheDocument();
  });

  test("entering text updates state", () => {
    render(<TextToSpeech />);
    const textarea = screen.getByLabelText("Enter Text:");
    fireEvent.change(textarea, { target: { value: "Hello, World!" } });
    expect(textarea.value).toBe("Hello, World!");
  });

  test("selecting language updates state", () => {
    render(<TextToSpeech />);
    const select = screen.getByLabelText("Select Language:");
    fireEvent.change(select, { target: { value: "en-US" } });
    expect(select.value).toBe("en-US");
  });

  test("selecting voice updates state", () => {
    render(<TextToSpeech />);
    const languageSelect = screen.getByLabelText("Select Language:");
    fireEvent.change(languageSelect, { target: { value: "en-US" } });

    const voiceSelect = screen.getByLabelText("Select Voice:");
    fireEvent.change(voiceSelect, { target: { value: "Google US English" } });
    expect(voiceSelect.value).toBe("Google US English");
  });

  test("speaking button toggles state and plays audio", async () => {
    render(<TextToSpeech />);
    const speakButton = screen.getByText("Speak");
    fireEvent.click(speakButton);
    expect(screen.getByText("Speaking...")).toBeInTheDocument();

    // Simulate speech end
    await waitFor(() => {
      expect(screen.getByText("Speak")).toBeInTheDocument();
    });
  });

  test("reset button resets state", () => {
    render(<TextToSpeech />);
    const textarea = screen.getByLabelText("Enter Text:");
    fireEvent.change(textarea, { target: { value: "Hello, World!" } });

    const resetButton = screen.getByText("Reset");
    fireEvent.click(resetButton);

    expect(textarea.value).toBe("");
  });

  // Add more tests as needed for specific functionality
});
