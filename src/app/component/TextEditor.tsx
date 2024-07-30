// pages/index.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Document {
  id: string;
  content: string;
}

const HomePage = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const router = useRouter();

  useEffect(() => {
    const keys = Object.keys(localStorage).filter(key => key.startsWith('document-'));
    const docs = keys.map(key => ({
      id: key.replace('document-', ''),
      content: localStorage.getItem(key) || ''
    }));
    setDocuments(docs);
  }, []);

  const handleEdit = (id: string) => {
    router.push(`/editor?id=${id}`);
  };

  const handleDelete = (id: string) => {
    localStorage.removeItem(`document-${id}`);
    setDocuments(docs => docs.filter(doc => doc.id !== id));
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Saved Documents</h1>
      <a href="/editor" className="px-4 py-2 border border-green-300 rounded bg-green-100 text-green-600 mb-4 inline-block">
        Create New Document
      </a>
      {documents.length === 0 ? (
        <p>No documents found</p>
      ) : (
        <ul>
          {documents.map(doc => (
            <li key={doc.id} className="mb-4">
              <div className="border p-4 rounded">
                <h3 className="text-lg font-bold">Document {doc.id}</h3>
                <div
                  className="my-2 border border-gray-300 p-2 rounded"
                  dangerouslySetInnerHTML={{ __html: doc.content }}
                />
                <div>
                  <button
                    onClick={() => handleEdit(doc.id)}
                    className="px-4 py-2 border border-blue-300 rounded bg-blue-100 text-blue-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="px-4 py-2 border border-red-300 rounded bg-red-100 text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default HomePage;
