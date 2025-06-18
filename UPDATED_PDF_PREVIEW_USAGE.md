# Updated PDF Preview Usage Guide

## Overview

The PDF preview system has been updated to use resume version IDs for caching instead of content hashing. This provides better performance, more reliable caching, and enforces saving before preview generation.

## Key Changes

### 1. **ServerPDFPreview Component**

The component now requires saved resume data instead of direct content:

```tsx
// OLD (removed)
<ServerPDFPreview
  sanitizedMarkdown={markdown}
  sanitizedCSS={css}
  previewTab={activeTab}
  onPageCountChange={setPageCount}
/>

// NEW (current)
<ServerPDFPreview
  resumeId={resumeId}
  versionId={currentVersionId} // optional
  previewTab={activeTab}
  hasUnsavedChanges={hasUnsavedChanges}
  onPageCountChange={setPageCount}
  onSaveRequired={handleSaveRequired}
/>
```

### 2. **API Endpoints**

Both endpoints now expect resume/version IDs:

```typescript
// Preview endpoint (PUT /api/pdf)
const response = await fetch('/api/pdf', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeId: 'resume-uuid',
    versionId: 'version-uuid', // optional
    options: {
      format: 'A4',
      margin: { top: '0.5in', right: '0.5in', bottom: '0.5in', left: '0.5in' }
    }
  })
});

// Download endpoint (POST /api/pdf)
const response = await fetch('/api/pdf', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    resumeId: 'resume-uuid',
    versionId: 'version-uuid', // optional
    options: { format: 'A4' }
  })
});
```

## Usage Examples

### 1. **Basic Integration**

```tsx
import { ServerPDFPreview } from '@/components/ServerPDFPreview';
import { useState, useEffect } from 'react';

function ResumePreview({ resumeId }: { resumeId: string }) {
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentVersionId, setCurrentVersionId] = useState<string>();
  const [pageCount, setPageCount] = useState(0);
  const [activeTab, setActiveTab] = useState('preview');

  const
 handleSaveRequired = async () => {
    // Implement your save logic here
    const newVersionId = await saveResumeVersion(resumeId);
    setCurrentVersionId(newVersionId);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="h-full">
      <ServerPDFPreview
        resumeId={resumeId}
        versionId={currentVersionId}
        previewTab={activeTab}
        hasUnsave
