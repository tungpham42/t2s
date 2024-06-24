import React, { useState, useEffect, useRef } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlay,
  faPause,
  faUndo,
  faDownload,
} from "@fortawesome/free-solid-svg-icons";
import LocaleConverter from "./LocaleConverter";

const TextToSpeech = () => {
  const [text, setText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [languages, setLanguages] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaStreamRef = useRef(null); // Reference to store the media stream

  useEffect(() => {
    const synth = window.speechSynthesis;

    const loadVoices = () => {
      const voices = synth
        .getVoices()
        .sort((a, b) => a.name.localeCompare(b.name));
      setVoices(voices);

      const uniqueLanguages = [
        ...new Set(voices.map((voice) => voice.lang)),
      ].sort((a, b) => a.localeCompare(b));
      setLanguages(uniqueLanguages);
    };

    loadVoices();
    synth.onvoiceschanged = loadVoices;

    // Cleanup function to stop media stream when component unmounts
    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const handleSpeak = async () => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream; // Store the media stream reference

      mediaRecorderRef.current = new MediaRecorder(stream);

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        audioChunksRef.current = [];
      };

      mediaRecorderRef.current.start();
      window.speechSynthesis.speak(utterance);

      setIsSpeaking(true); // Set speaking status to true

      utterance.onend = () => {
        mediaRecorderRef.current.stop();
        setIsSpeaking(false); // Reset speaking status to false
      };
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const handleVoiceChange = (event) => {
    const selectedVoice = voices.find(
      (voice) => voice.name === event.target.value
    );
    setSelectedVoice(selectedVoice);
  };

  const handleLanguageChange = (event) => {
    const lang = event.target.value;
    setSelectedLanguage(lang);
    setSelectedVoice(null); // Reset selected voice when language changes
  };

  const handleReset = () => {
    setText("");
    setSelectedLanguage("");
    setSelectedVoice(null);
    setAudioBlob(null);
    setAudioURL("");

    // Stop speech synthesis
    window.speechSynthesis.cancel();

    // Stop media recording if active
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
    }

    // Stop media stream if active
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setIsSpeaking(false); // Reset speaking status to false
  };

  const downloadAudio = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement("a");
    a.style.display = "none";
    a.href = url;
    a.download = "speech.webm";
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filteredVoices = voices.filter(
    (voice) => voice.lang === selectedLanguage
  );

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <h1 className="mb-4">Text to Speech</h1>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="enterText">Enter Text:</Form.Label>
              <Form.Control
                id="enterText"
                as="textarea"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="selectLang">Select Language:</Form.Label>
              <Form.Control
                id="selectLang"
                as="select"
                value={selectedLanguage}
                onChange={handleLanguageChange}
              >
                <option value="">Select a language</option>
                {languages.map((lang, index) => (
                  <option key={index} value={lang}>
                    <LocaleConverter localeCode={lang} />
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {selectedLanguage && (
              <Form.Group className="mb-3">
                <Form.Label htmlFor="selectVoice">Select Voice:</Form.Label>
                <Form.Control
                  id="selectVoice"
                  as="select"
                  value={selectedVoice?.name || ""}
                  onChange={handleVoiceChange}
                >
                  <option value="">Default</option>
                  {filteredVoices.map((voice, index) => (
                    <option key={index} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </option>
                  ))}
                </Form.Control>
              </Form.Group>
            )}
            <Button variant="primary" onClick={handleSpeak}>
              {isSpeaking ? (
                <>
                  <FontAwesomeIcon icon={faPause} /> Speaking...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faPlay} /> Speak
                </>
              )}
            </Button>
            {audioURL && (
              <Button
                variant="success"
                className="ms-3"
                onClick={downloadAudio}
              >
                <FontAwesomeIcon icon={faDownload} /> Download WEBM
              </Button>
            )}
            <Button variant="secondary" className="ms-3" onClick={handleReset}>
              <FontAwesomeIcon icon={faUndo} /> Reset
            </Button>
            {audioURL && (
              <div className="mt-3">
                <audio controls src={audioURL}></audio>
              </div>
            )}
          </Form>
        </Col>
      </Row>
    </Container>
  );
};

export default TextToSpeech;
