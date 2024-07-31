'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const EditorPage = () => {
  const [content, setContent] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      const doc = localStorage.getItem(`document-${id}`);
      if (doc) {
        setContent(doc);
        setEditingId(id);
      } else {
        router.push('/'); // Redirect if document not found
      }
    } else {
      setEditingId(null); // New document mode
      setContent('');
    }
  }, [searchParams, router]);

  const handleContentChange = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const saveDocument = () => {
    if (editingId) {
      localStorage.setItem(`document-${editingId}`, content);
    } else {
      const id = Date.now().toString();
      localStorage.setItem(`document-${id}`, content);
      router.push(`/editor?id=${id}`);
    }
    router.push('/');
  };

  const applyFormat = (command: string) => {
    document.execCommand(command, false, '');
    handleContentChange();
  };

  // Set the cursor to the end of the content
  const setCursorToEnd = () => {
    if (editorRef.current) {
      const range = document.createRange();
      const selection = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  };

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
      setCursorToEnd();
    }
  }, [content]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {editingId ? 'Edit Document' : 'Create New Document'}
      </h1>

      <div className="mb-4">
        <button
          onClick={() => applyFormat('bold')}
          className="px-4 py-2 border border-gray-300 rounded mr-2"
        >
          Bold
        </button>
        <button
          onClick={() => applyFormat('italic')}
          className="px-4 py-2 border border-gray-300 rounded mr-2"
        >
          Italic
        </button>
        <button
          onClick={() => applyFormat('underline')}
          className="px-4 py-2 border border-gray-300 rounded"
        >
          Underline
        </button>
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="w-full h-64 p-2 border border-gray-300 rounded mb-4"
        onInput={handleContentChange}
        placeholder="Start typing..."
      >
        {content}
      </div>

      <button
        onClick={saveDocument}
        className="px-4 py-2 border border-blue-300 rounded bg-blue-100 text-blue-600"
      >
        {editingId ? 'Save Document' : 'Create Document'}
      </button>
    </div>
  );
};

export default EditorPage;
