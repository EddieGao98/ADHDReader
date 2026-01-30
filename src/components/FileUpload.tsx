import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { getSupportedFormatsText, parseFile } from '../utils/fileParsers';

interface FileUploadProps {
  onFileLoaded: (title: string, content: string) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setIsLoading(true);
      setError(null);

      try {
        const { title, content } = await parseFile(file);
        onFileLoaded(title, content);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse file');
      } finally {
        setIsLoading(false);
      }
    },
    [onFileLoaded]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0]);
      }
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
      'application/epub+zip': ['.epub'],
      'application/x-mobipocket-ebook': ['.mobi'],
      'image/vnd.djvu': ['.djvu'],
      'application/vnd.amazon.ebook': ['.azw3', '.azw'],
      'text/plain': ['.txt'],
    },
    multiple: false,
    disabled: isLoading,
  });

  return (
    <div className="file-upload-container">
      <div
        {...getRootProps()}
        className={`dropzone ${isDragActive ? 'dropzone-active' : ''} ${isLoading ? 'dropzone-loading' : ''}`}
      >
        <input {...getInputProps()} />

        <div className="dropzone-content">
          {isLoading ? (
            <>
              <Loader2 className="dropzone-icon spinning" size={64} />
              <h2>Processing your file...</h2>
              <p>Extracting text and preparing for reading</p>
            </>
          ) : isDragActive ? (
            <>
              <Upload className="dropzone-icon bounce" size={64} />
              <h2>Drop it here!</h2>
              <p>Release to start reading</p>
            </>
          ) : (
            <>
              <FileText className="dropzone-icon" size={64} />
              <h2>Drop your file here</h2>
              <p>or click to browse</p>
              <div className="supported-formats">
                <span>Supported formats:</span>
                <strong>{getSupportedFormatsText()}</strong>
              </div>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="error-message">
          <AlertCircle size={20} />
          <span>{error}</span>
          <button onClick={() => setError(null)}>Dismiss</button>
        </div>
      )}

      <style>{`
        .file-upload-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 60vh;
          padding: 2rem;
        }

        .dropzone {
          width: 100%;
          max-width: 500px;
          padding: 3rem 2rem;
          border: 3px dashed rgba(255, 255, 255, 0.3);
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.05);
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .dropzone:hover {
          border-color: rgba(0, 255, 136, 0.5);
          background: rgba(0, 255, 136, 0.05);
        }

        .dropzone-active {
          border-color: #00ff88;
          background: rgba(0, 255, 136, 0.1);
          transform: scale(1.02);
        }

        .dropzone-loading {
          pointer-events: none;
          opacity: 0.8;
        }

        .dropzone-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          color: rgba(255, 255, 255, 0.9);
        }

        .dropzone-icon {
          color: rgba(255, 255, 255, 0.6);
          margin-bottom: 1.5rem;
          transition: all 0.3s ease;
        }

        .dropzone:hover .dropzone-icon {
          color: #00ff88;
          transform: translateY(-5px);
        }

        .dropzone-active .dropzone-icon {
          color: #00ff88;
        }

        .dropzone-content h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .dropzone-content p {
          margin: 0;
          color: rgba(255, 255, 255, 0.6);
          font-size: 1rem;
        }

        .supported-formats {
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          font-size: 0.875rem;
        }

        .supported-formats span {
          color: rgba(255, 255, 255, 0.5);
          display: block;
          margin-bottom: 0.25rem;
        }

        .supported-formats strong {
          color: rgba(255, 255, 255, 0.8);
          font-weight: 500;
        }

        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1.5rem;
          padding: 1rem 1.5rem;
          background: rgba(255, 71, 87, 0.15);
          border: 1px solid rgba(255, 71, 87, 0.3);
          border-radius: 10px;
          color: #ff6b6b;
          max-width: 500px;
        }

        .error-message button {
          margin-left: auto;
          padding: 0.25rem 0.75rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          border-radius: 5px;
          color: inherit;
          cursor: pointer;
          font-size: 0.875rem;
        }

        .error-message button:hover {
          background: rgba(255, 255, 255, 0.2);
        }

        .spinning {
          animation: spin 1s linear infinite;
        }

        .bounce {
          animation: bounce 0.5s ease infinite alternate;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default FileUpload;
