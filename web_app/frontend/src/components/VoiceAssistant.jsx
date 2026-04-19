// Voice Assistant Component
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const VoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [commands, setCommands] = useState([]);
  const [commandResult, setCommandResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    // Initialize Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionInstance.onresult = (event) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            setTranscript(prev => prev + transcript + ' ');
            processVoiceCommand(transcript);
          } else {
            interimTranscript += transcript;
          }
        }
      };

      recognitionInstance.onerror = (event) => {
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    } else {
      setError('Speech Recognition API not supported in this browser');
    }

    fetchAvailableCommands();
  }, []);

  const fetchAvailableCommands = async () => {
    try {
      const response = await axios.get('/api/advanced/voice/commands');
      if (response.data.success) {
        setCommands(response.data.commands);
      }
    } catch (err) {
      console.error('Failed to fetch commands', err);
    }
  };

  const startListening = () => {
    if (recognition) {
      setTranscript('');
      recognition.start();
    }
  };

  const stopListening = () => {
    if (recognition) {
      recognition.stop();
    }
  };

  const processVoiceCommand = async (text) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/advanced/voice/process-command', { text });

      if (response.data.success) {
        setCommandResult({
          command: response.data.command,
          action: response.data.action,
          response: response.data.response,
          confidence: response.data.confidence
        });
        
        // Speak the response
        speakResponse(response.data.response);
      } else {
        setError(response.data.error);
      }
    } catch (err) {
      setError('Failed to process command');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const speakResponse = async (text) => {
    try {
      await axios.post('/api/advanced/voice/speak', null, {
        params: { message: text }
      });
    } catch (err) {
      console.error('Failed to speak response', err);
    }
  };

  const manualCommand = async (e) => {
    e.preventDefault();
    if (transcript.trim()) {
      processVoiceCommand(transcript.trim());
    }
  };

  return (
    <div className="voice-assistant-container">
      <h2>🎤 Voice Assistant</h2>

      <div className="voice-interface">
        <div className={`microphone-button ${isListening ? 'listening' : ''}`}>
          <button
            onClick={isListening ? stopListening : startListening}
            className={`mic-btn ${isListening ? 'active' : ''}`}
            disabled={!recognition}
          >
            <span className="mic-icon">🎤</span>
            <p>{isListening ? 'Listening...' : 'Click to Speak'}</p>
          </button>

          {isListening && (
            <div className="listening-indicator">
              <span className="pulse"></span>
              Listening for your command...
            </div>
          )}
        </div>

        <div className="transcript-section">
          <h3>Transcript</h3>
          <div className="transcript-box">
            {transcript || 'Your speech will appear here...'}
          </div>
        </div>

        <form onSubmit={manualCommand} className="manual-input">
          <input
            type="text"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Or type a command manually..."
          />
          <button type="submit" disabled={!transcript.trim()}>
            Process
          </button>
        </form>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {commandResult && (
        <div className="command-result">
          <h3>Command Processed</h3>
          <div className="result-card">
            <div className="result-field">
              <strong>Command:</strong>
              <p>{commandResult.command}</p>
            </div>
            <div className="result-field">
              <strong>Action:</strong>
              <p>{commandResult.action}</p>
            </div>
            <div className="result-field">
              <strong>Response:</strong>
              <p>{commandResult.response}</p>
            </div>
            <div className="result-field">
              <strong>Confidence:</strong>
              <p className={`confidence-${commandResult.confidence}`}>
                {commandResult.confidence.replace('_', ' ').toUpperCase()}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="commands-reference">
        <h3>📋 Available Commands</h3>
        <div className="commands-grid">
          {commands.map((cmd, idx) => (
            <div key={idx} className="command-card">
              <h4>{cmd.command.toUpperCase()}</h4>
              <p className="description">{cmd.description}</p>
              <div className="aliases">
                <strong>Say:</strong>
                <ul>
                  {cmd.aliases.map((alias, i) => (
                    <li key={i}>"{alias}"</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="tips-section">
        <h3>💡 Tips for Best Results</h3>
        <ul>
          <li>Speak clearly and naturally</li>
          <li>Minimize background noise</li>
          <li>Use the exact command phrases when possible</li>
          <li>Wait for confirmation after each command</li>
          <li>If not recognized, try rephrasing the command</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceAssistant;
