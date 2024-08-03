'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const EditorPage = () => {
  const [content, setContent] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeFormat, setActiveFormat] = useState<{ [key: string]: boolean }>({
    bold: false,
    italic: false,
    underline: false,
  });
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
      updateActiveFormat();
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

  const insertImage = (imageSrc: string) => {
    if (editorRef.current) {
      const img = document.createElement('img');
      img.src = imageSrc;
      img.style.maxWidth = '100%';
      img.style.border = '2px solid black';
      img.style.maxHeight = 'auto';
      img.classList.add('resizable');
      editorRef.current.appendChild(img);
      handleContentChange();
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          insertImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const updateActiveFormat = () => {
    const isBold = document.queryCommandState('bold');
    const isItalic = document.queryCommandState('italic');
    const isUnderline = document.queryCommandState('underline');

    setActiveFormat({
      bold: isBold,
      italic: isItalic,
      underline: isUnderline,
    });
  };

  useEffect(() => {
    if (editorRef.current && content) {
      editorRef.current.innerHTML = content;
      setCursorToEnd();
      updateActiveFormat();
    }
  }, [content]);

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
    const handleMouseDown = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (target.classList.contains('resizable')) {
        const img = target as HTMLImageElement;
        const startX = event.clientX;
        const startY = event.clientY;
        const startWidth = img.offsetWidth;
        const startHeight = img.offsetHeight;

        const handleMouseMove = (e: MouseEvent) => {
          img.style.width = `${startWidth + (e.clientX - startX)}px`;
          img.style.height = `${startHeight + (e.clientY - startY)}px`;
        };

        const handleMouseUp = () => {
          document.removeEventListener('mousemove', handleMouseMove);
          document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
      }
    };

    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  const handleKeyUp = useCallback(() => {
    saveCursorPosition();
    updateActiveFormat();
  }, []);

  const saveCursorPosition = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      cursorPositionRef.current = selection.getRangeAt(0);
    }
  };

  const cursorPositionRef = useRef<Range | null>(null);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        {editingId ? 'Edit Document' : 'Create New Document'}
      </h1>

      <div className="mb-4">
        <button
          onClick={() => { applyFormat('bold'); updateActiveFormat(); }}
          className={`px-4 py-2 border border-gray-300 rounded mr-2 ${activeFormat.bold ? 'bg-blue-100' : ''}`}
        >
          Bold
        </button>
        <button
          onClick={() => { applyFormat('italic'); updateActiveFormat(); }}
          className={`px-4 py-2 border border-gray-300 rounded mr-2 ${activeFormat.italic ? 'bg-blue-100' : ''}`}
        >
          Italic
        </button>
        <button
          onClick={() => { applyFormat('underline'); updateActiveFormat(); }}
          className={`px-4 py-2 border border-gray-300 rounded ${activeFormat.underline ? 'bg-blue-100' : ''}`}
        >
          Underline
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="px-4 py-2 border border-gray-300 rounded ml-2"
        >
          Upload Image
        </button>
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>

      <div
        ref={editorRef}
        contentEditable
        className="w-full h-[60vh] border border-gray-300 rounded text-left flex flex-wrap"
        onInput={handleContentChange}
        onKeyUp={handleKeyUp}
      >
      </div>

      <button
        onClick={saveDocument}
        className="px-4 py-2 border border-blue-300 rounded bg-blue-100 text-blue-600 justify-center text-justify"
      >
        {editingId ? 'Save Document' : 'Create Document'}
      </button>

      {/* CSS for Image resize */}
      <style jsx>{`
        .resizable {
          position: relative;
          border: 4px solid #ddd;
          box-sizing: border-box;
        }
        .resizable:hover {
          border: 4px solid green;
        }
        .resizable::after {
          content: '';
          position: absolute;
          right: 0;
          bottom: 0;
          width: 10px;
          height: 10px;
          background: rgba(0, 0, 0, 0.5);
          cursor: se-resize;
        }
      `}</style>
    </div>
  );
};

export default EditorPage;
