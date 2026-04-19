"""Voice Assistant Module - Speech Recognition & Text-to-Speech"""
import speech_recognition as sr
import pyttsx3
from typing import Dict, Optional
import json
from datetime import datetime


class VoiceAssistant:
    """Voice-based interface for MRI analysis application"""
    
    def __init__(self):
        # Initialize speech recognition
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        
        # Initialize text-to-speech
        self.engine = pyttsx3.init()
        self.engine.setProperty('rate', 150)  # Speed of speech
        self.engine.setProperty('volume', 0.9)  # Volume (0.0 to 1.0)
        
        # Define voice commands
        self.voice_commands = {
            'upload': {
                'aliases': ['upload mri', 'upload image', 'upload scan'],
                'action': 'upload_file',
                'response': 'Opening file upload. Please select an MRI image.'
            },
            'analyze': {
                'aliases': ['analyze', 'run analysis', 'analyze image', 'check tumor'],
                'action': 'analyze_image',
                'response': 'Starting analysis. This may take a moment.'
            },
            'show_results': {
                'aliases': ['show results', 'show result', 'display results', 'what\'s the result'],
                'action': 'display_results',
                'response': 'Displaying analysis results.'
            },
            'three_d': {
                'aliases': ['3d view', '3d model', 'three dimensional', 'show 3d'],
                'action': 'show_3d_visualization',
                'response': 'Generating 3D brain model visualization.'
            },
            'growth_prediction': {
                'aliases': ['predict growth', 'growth prediction', 'tumor growth', 'how fast'],
                'action': 'show_growth_prediction',
                'response': 'Calculating tumor growth prediction.'
            },
            'recommendation': {
                'aliases': ['doctor recommendation', 'specialist', 'treatment', 'what doctor'],
                'action': 'show_recommendation',
                'response': 'Generating specialist recommendation and treatment options.'
            },
            'performance': {
                'aliases': ['model performance', 'accuracy', 'precision', 'show metrics'],
                'action': 'show_performance',
                'response': 'Displaying model performance metrics.'
            },
            'help': {
                'aliases': ['help', 'what can you do', 'commands', 'options'],
                'action': 'show_help',
                'response': 'Here are available commands: Upload MRI, Analyze, Show results, 3D view, Growth prediction, Doctor recommendation, Performance metrics, and Help.'
            },
            'exit': {
                'aliases': ['exit', 'quit', 'close', 'goodbye'],
                'action': 'exit_app',
                'response': 'Goodbye. Thank you for using Brain Tumor Detection Assistant.'
            }
        }
    
    def listen(self) -> Dict:
        """
        Listen to microphone input and convert speech to text
        
        Returns:
            Dictionary with recognition result
        """
        try:
            with self.microphone as source:
                # Adjust for ambient noise
                self.recognizer.adjust_for_ambient_noise(source, duration=1)
                
                # Listen for audio
                audio = self.recognizer.listen(source, timeout=10)
            
            # Recognize speech
            text = self.recognizer.recognize_google(audio)
            
            return {
                'success': True,
                'text': text.lower(),
                'confidence': 'high'
            }
        
        except sr.UnknownValueError:
            return {
                'success': False,
                'error': 'Could not understand audio. Please speak clearly.',
                'error_type': 'unknown_value'
            }
        
        except sr.RequestError as e:
            return {
                'success': False,
                'error': f'Speech recognition service error: {str(e)}',
                'error_type': 'service_error'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e),
                'error_type': 'unknown_error'
            }
    
    def speak(self, text: str) -> Dict:
        """
        Convert text to speech and play it
        
        Args:
            text: Text to speak
            
        Returns:
            Dictionary with status
        """
        try:
            self.engine.say(text)
            self.engine.runAndWait()
            
            return {
                'success': True,
                'message': text,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def process_command(self, voice_input: str) -> Dict:
        """
        Process voice input and identify command
        
        Args:
            voice_input: Text from speech recognition
            
        Returns:
            Dictionary with command details
        """
        try:
            voice_input_lower = voice_input.lower().strip()
            
            # Try exact matches first
            for command_key, command_info in self.voice_commands.items():
                if voice_input_lower == command_key:
                    return {
                        'success': True,
                        'command': command_key,
                        'action': command_info['action'],
                        'response': command_info['response'],
                        'confidence': 'very_high'
                    }
            
            # Try alias matches
            for command_key, command_info in self.voice_commands.items():
                for alias in command_info['aliases']:
                    if alias in voice_input_lower:
                        return {
                            'success': True,
                            'command': command_key,
                            'action': command_info['action'],
                            'response': command_info['response'],
                            'confidence': 'high'
                        }
            
            # No match found
            return {
                'success': False,
                'error': f'Command not recognized: "{voice_input}"',
                'suggestion': 'Try "help" to see available commands'
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_available_commands(self) -> Dict:
        """
        Get list of all available voice commands
        """
        commands = []
        
        for command_key, command_info in self.voice_commands.items():
            commands.append({
                'command': command_key,
                'aliases': command_info['aliases'],
                'description': command_info['response']
            })
        
        return {
            'success': True,
            'total_commands': len(commands),
            'commands': commands
        }
    
    def handle_voice_session(self) -> Dict:
        """
        Handle a complete voice interaction session
        
        Returns:
            Dictionary with session summary
        """
        try:
            # Greeting
            greeting = 'Welcome to Brain Tumor Detection Assistant. Say \"help\" for available commands or say \"upload MRI\" to start.'
            self.speak(greeting)
            
            session_log = []
            
            while True:
                # Listen
                listen_result = self.listen()
                
                if not listen_result['success']:
                    # Speak error and retry
                    self.speak(listen_result['error'])
                    session_log.append({
                        'type': 'error',
                        'message': listen_result['error']
                    })
                    continue
                
                voice_input = listen_result['text']
                session_log.append({
                    'type': 'user_input',
                    'text': voice_input,
                    'timestamp': datetime.now().isoformat()
                })
                
                # Process command
                command_result = self.process_command(voice_input)
                
                if not command_result['success']:
                    self.speak(command_result['error'])
                    session_log.append({
                        'type': 'assistant_response',
                        'message': command_result['error']
                    })
                    continue
                
                # Execute command
                action = command_result['action']
                response = command_result['response']
                
                session_log.append({
                    'type': 'assistant_response',
                    'message': response,
                    'action': action,
                    'confidence': command_result['confidence']
                })
                
                self.speak(response)
                
                # Check for exit command
                if action == 'exit_app':
                    break
            
            return {
                'success': True,
                'session_log': session_log,
                'total_interactions': len([x for x in session_log if x['type'] == 'user_input'])
            }
        
        except Exception as e:
            return {
                'success': False,
                'error': str(e)
            }


def create_voice_response(message: str, should_speak: bool = True) -> Dict:
    """
    Helper function to create voice response
    """
    assistant = VoiceAssistant()
    
    result = {
        'message': message,
        'timestamp': datetime.now().isoformat()
    }
    
    if should_speak:
        speak_result = assistant.speak(message)
        result['spoke'] = speak_result['success']
    
    return result
