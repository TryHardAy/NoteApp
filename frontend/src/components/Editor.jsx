import React, { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const Editor = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [isOffline, setIsOffline] = useState(!navigator.onLine); // Track offline status

  // Initialize Quill editor when the component mounts
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: true,
        },
      });

      // Load saved content from local storage (if available)
      const savedContent = localStorage.getItem('draftDocument');
      if (savedContent) {
        quillRef.current.root.innerHTML = savedContent; // Load saved content into the editor
      }

      // Listen for text-change event to track changes and save to localStorage
      quillRef.current.on('text-change', () => {
        const content = quillRef.current.root.innerHTML;
        localStorage.setItem('draftDocument', content); // Save content to local storage
      });
    }

    // Handle online/offline status changes
    const handleOnline = () => {
      setIsOffline(false);
      syncContentToServer(); // Try syncing content when coming online
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    // Attach event listeners for online/offline changes
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check for online/offline status
    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Function to get the current editor content
  const getEditorContent = () => {
    if (quillRef.current) {
      return quillRef.current.root.innerHTML;
    }
    return '';
  };

  // Function to send content to the server
  const syncContentToServer = async () => {
    const content = localStorage.getItem('draftDocument');
    if (content && navigator.onLine) {
      try {
        // Send the content to the server (FastAPI)
        await fetch('/api/save-document', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });
        console.log('Document saved to the server');
        localStorage.removeItem('draftDocument'); // Clear the saved content after successful sync
      } catch (error) {
        console.error('Failed to save document to server:', error);
      }
    }
  };

  // Function to handle the "Get Content" button click
  const handleGetContent = () => {
    const content = getEditorContent(); // Get the current content of the editor
    console.log(content); // Log it to the console (or you can use it in another way)
    quillRef.current.setText(''); // Clear the content from the editor
  };

  return (
    <div>
      <div ref={editorRef} style={{ minHeight: '300px', padding: '10px' }}></div>
      <button 
        onClick={handleGetContent} 
        disabled={isOffline} // Disable the button if offline
      >
        Get Content
      </button>
      {isOffline && <p>You are offline. Changes are saved locally.</p>}
    </div>
  );
};

export default Editor;
