'use client';

import CodeEditor from "@/components/CodeEditor";

export default function EditorPage() {
  const preventCopyPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    return false;
  };

  const preventContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  return (
    <main 
      className="min-h-screen bg-gray-900 select-none"
      onCopy={preventCopyPaste}
      onCut={preventCopyPaste}
      onPaste={preventCopyPaste}
      onContextMenu={preventContextMenu}
      style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
    >
      <CodeEditor />
    </main>
  );
}
