import React, { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css'; // Import Quill's CSS
// You no longer need to import Toolbox because Quill's default toolbar will be used

const Editor = () => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  // Initialize Quill editor when the component mounts
  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          // Enable the built-in toolbar
          toolbar: true
        },
      });
    }
  }, []);

  // Function to get the current editor content
  const getEditorContent = () => {
    if (quillRef.current) {
      return quillRef.current.root.innerHTML; // Get the HTML content of the editor
    }
    return '';
  };

  return (
    <div>
      {/* Quill editor with built-in toolbar */}
      <div ref={editorRef} style={{ minHeight: '300px', padding: '10px' }}></div>

      {/* Button to get editor content */}
      <button onClick={() => console.log(getEditorContent())}>Get Content</button>
    </div>
  );
};

export default Editor;
