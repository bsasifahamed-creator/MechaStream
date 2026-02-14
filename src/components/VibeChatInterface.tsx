'use client'

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Send, Paperclip, Mic, MicOff, X, FileText, Image, Folder } from 'lucide-react'

interface FileAttachment {
  id: string
  file: File
  type: 'image' | 'document' | 'folder'
  preview?: string
}

interface VibeChatInterfaceProps {
  onSendMessage?: (text: string, attachments: FileAttachment[]) => void
  onFilesSelected?: (files: FileAttachment[]) => void
  onSpeechResult?: (text: string) => void
  placeholder?: string
  disabled?: boolean
}

const VibeChatInterface: React.FC<VibeChatInterfaceProps> = ({
  onSendMessage,
  onFilesSelected,
  onSpeechResult,
  placeholder = "Type your message...",
  disabled = false
}) => {
  const [inputText, setInputText] = useState('')
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [recognition, setRecognition] = useState<any>(null)
  
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognitionCtor = (window as Window & { webkitSpeechRecognition?: new () => unknown; SpeechRecognition?: new () => unknown }).webkitSpeechRecognition || (window as Window & { SpeechRecognition?: new () => unknown }).SpeechRecognition
      if (!SpeechRecognitionCtor) return
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognitionInstance = new SpeechRecognitionCtor() as any
      recognitionInstance.continuous = true
      recognitionInstance.interimResults = true
      recognitionInstance.lang = 'en-US'
      
      recognitionInstance.onresult = (event: { resultIndex: number; results: Array<{ isFinal: boolean; 0: { transcript: string } }> }) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        if (finalTranscript) {
          setInputText(prev => prev + finalTranscript)
          onSpeechResult?.(finalTranscript)
        }
      }
      
      recognitionInstance.onerror = (event: { error: string }) => {
        console.error('Speech recognition error:', event.error)
        setIsRecording(false)
      }
      
      recognitionInstance.onend = () => {
        setIsRecording(false)
      }
      
      setRecognition(recognitionInstance)
    }
  }, [onSpeechResult])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'M') {
        e.preventDefault()
        toggleRecording()
      } else if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault()
        handleSend()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [inputText, attachments])

  const handleSend = useCallback(() => {
    if (!inputText.trim() && attachments.length === 0) return
    
    onSendMessage?.(inputText, attachments)
    setInputText('')
    setAttachments([])
    inputRef.current?.focus()
  }, [inputText, attachments, onSendMessage])

  const toggleRecording = useCallback(() => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.')
      return
    }

    if (isRecording) {
      recognition.stop()
    } else {
      recognition.start()
      setIsRecording(true)
    }
  }, [recognition, isRecording])

  const handleFileSelect = useCallback((files: FileList | null) => {
    if (!files) return

    const newAttachments: FileAttachment[] = Array.from(files).map(file => {
      const id = Math.random().toString(36).substr(2, 9)
      const type = file.type.startsWith('image/') ? 'image' : 'document'
      
      const attachment: FileAttachment = {
        id,
        file,
        type
      }

      // Generate preview for images
      if (type === 'image') {
        const reader = new FileReader()
        reader.onload = (e) => {
          attachment.preview = e.target?.result as string
          setAttachments(prev => prev.map(a => a.id === id ? attachment : a))
        }
        reader.readAsDataURL(file)
      }

      return attachment
    })

    setAttachments(prev => [...prev, ...newAttachments])
    onFilesSelected?.(newAttachments)
  }, [onFilesSelected])

  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id))
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [handleFileSelect])

  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const openFolderPicker = useCallback(() => {
    folderInputRef.current?.click()
  }, [])

  const canSend = inputText.trim().length > 0 || attachments.length > 0

  return (
    <div className="vibe-chat-interface">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.doc,.docx,.txt"
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        {...{ webkitdirectory: '' } as React.InputHTMLAttributes<HTMLInputElement>}
        onChange={(e) => handleFileSelect(e.target.files)}
        style={{ display: 'none' }}
      />

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div className="attachment-preview">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-chip">
              {attachment.type === 'image' && attachment.preview ? (
                <img src={attachment.preview} alt="Preview" className="attachment-preview-img" />
              ) : (
                <FileText className="attachment-icon" />
              )}
              <span className="attachment-name">{attachment.file.name}</span>
              <button
                type="button"
                className="attachment-remove"
                onClick={() => removeAttachment(attachment.id)}
                aria-label={`Remove ${attachment.file.name}`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input area */}
      <div 
        className={`input-container ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="input-wrapper">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="message-input"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
            aria-label="Message input"
          />
          
          <div className="input-actions">
            {/* Attachment button */}
            <button
              type="button"
              className="action-button"
              onClick={openFilePicker}
              disabled={disabled}
              aria-label="Attach files"
              title="Attach files"
            >
              <Paperclip size={20} />
            </button>

            {/* Folder button */}
            <button
              type="button"
              className="action-button"
              onClick={openFolderPicker}
              disabled={disabled}
              aria-label="Attach folder"
              title="Attach folder"
            >
              <Folder size={20} />
            </button>

            {/* Microphone button */}
            <button
              type="button"
              className={`action-button ${isRecording ? 'recording' : ''}`}
              onClick={toggleRecording}
              disabled={disabled}
              aria-label={isRecording ? 'Stop recording' : 'Start voice input'}
              title={isRecording ? 'Stop recording' : 'Start voice input'}
            >
              {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
              {isRecording && <div className="recording-indicator" />}
            </button>

            {/* Send button */}
            <button
              type="button"
              className={`send-button ${canSend ? 'active' : ''}`}
              onClick={handleSend}
              disabled={!canSend || disabled}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

        {/* Status indicator */}
        {(isRecording || attachments.length > 0) && (
          <div className="status-indicator">
            {isRecording && <span className="status-text">Recording...</span>}
            {attachments.length > 0 && (
              <span className="status-text">{attachments.length} file{attachments.length !== 1 ? 's' : ''} attached</span>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .vibe-chat-interface {
          --primary-bg: #0f172a;
          --secondary-bg: #1e293b;
          --input-bg: #334155;
          --border-color: #475569;
          --text-primary: #f1f5f9;
          --text-secondary: #cbd5e1;
          --accent-color: #3b82f6;
          --accent-hover: #2563eb;
          --border-radius: 12px;
          --border-radius-sm: 8px;
          --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          
          background: var(--primary-bg);
          border-radius: var(--border-radius);
          padding: 16px;
          box-shadow: var(--shadow-lg);
          border: 1px solid var(--border-color);
        }

        .attachment-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .attachment-chip {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--secondary-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius-sm);
          padding: 6px 10px;
          font-size: 12px;
          color: var(--text-secondary);
          max-width: 200px;
        }

        .attachment-preview-img {
          width: 20px;
          height: 20px;
          border-radius: 4px;
          object-fit: cover;
        }

        .attachment-icon {
          color: var(--text-secondary);
        }

        .attachment-name {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .attachment-remove {
          background: none;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .attachment-remove:hover {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .input-container {
          position: relative;
          background: var(--input-bg);
          border: 1px solid var(--border-color);
          border-radius: var(--border-radius);
          transition: all 0.2s;
        }

        .input-container.drag-over {
          border-color: var(--accent-color);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .input-wrapper {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          padding: 12px;
        }

        .message-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--text-primary);
          font-size: 14px;
          line-height: 1.5;
          resize: none;
          outline: none;
          min-height: 20px;
          max-height: 120px;
          font-family: inherit;
        }

        .message-input::placeholder {
          color: var(--text-secondary);
        }

        .input-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .action-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .action-button:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }

        .action-button.recording {
          color: #ef4444;
          animation: pulse 2s infinite;
        }

        .action-button.recording .recording-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 8px;
          height: 8px;
          background: #ef4444;
          border-radius: 50%;
          animation: pulse 1s infinite;
        }

        .send-button {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: var(--border-color);
          border: none;
          color: var(--text-secondary);
          border-radius: var(--border-radius-sm);
          cursor: pointer;
          transition: all 0.2s;
        }

        .send-button.active {
          background: var(--accent-color);
          color: white;
        }

        .send-button.active:hover {
          background: var(--accent-hover);
          transform: scale(1.05);
        }

        .send-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          border-top: 1px solid var(--border-color);
          font-size: 12px;
          color: var(--text-secondary);
        }

        .status-text {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        /* Responsive design */
        @media (max-width: 640px) {
          .vibe-chat-interface {
            padding: 12px;
          }

          .input-wrapper {
            padding: 8px;
          }

          .action-button {
            width: 32px;
            height: 32px;
          }

          .send-button {
            width: 32px;
            height: 32px;
          }

          .attachment-chip {
            max-width: 150px;
            font-size: 11px;
          }
        }

        /* Focus styles for accessibility */
        .action-button:focus,
        .send-button:focus,
        .attachment-remove:focus {
          outline: 2px solid var(--accent-color);
          outline-offset: 2px;
        }

        .message-input:focus {
          outline: none;
        }
      `}</style>
    </div>
  )
}

export default VibeChatInterface 