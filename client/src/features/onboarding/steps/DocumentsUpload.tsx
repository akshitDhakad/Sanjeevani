/**
 * Documents Upload Step
 * Second step of caregiver onboarding - document verification
 */

import { Button } from '../../../components';

const DOCUMENT_TYPES = [
  { value: 'id_proof', label: 'ID Proof', required: true },
  { value: 'qualification', label: 'Qualification Certificate', required: true },
  {
    value: 'background_check',
    label: 'Background Check Report',
    required: false,
  },
  { value: 'other', label: 'Other Documents', required: false },
];

interface DocumentsUploadProps {
  uploadedDocuments?: Record<string, File>;
  setUploadedDocuments?: (docs: Record<string, File>) => void;
}

export function DocumentsUpload({ 
  uploadedDocuments = {}, 
  setUploadedDocuments 
}: DocumentsUploadProps) {
  const uploadedFiles: Record<string, { file: File; preview?: string }> = {};
  
  // Convert File objects to preview format
  Object.entries(uploadedDocuments).forEach(([type, file]) => {
    uploadedFiles[type] = {
      file,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
    };
  });

  const handleFileChange = (
    type: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !setUploadedDocuments) return;

    // Validate file type (images and PDFs)
    const validTypes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
    ];
    if (!validTypes.includes(file.type)) {
      alert('Please upload a PDF or image file (JPEG, PNG)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadedDocuments({
      ...uploadedDocuments,
      [type]: file,
    });
  };

  const removeFile = (type: string) => {
    if (!setUploadedDocuments) return;
    const updated = { ...uploadedDocuments };
    delete updated[type];
    setUploadedDocuments(updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          Document Verification
        </h3>
        <p className="text-sm text-gray-600">
          Upload required documents for verification. All documents are securely
          stored and encrypted.
        </p>
        <p className="text-xs text-gray-500 mt-2">
          <strong>Privacy Note:</strong> Documents are masked and only visible
          to verification team. We comply with GDPR and Indian privacy laws.
        </p>
      </div>

      <div className="space-y-4">
        {DOCUMENT_TYPES.map((docType) => {
          const uploaded = uploadedFiles[docType.value];
          return (
            <div
              key={docType.value}
              className="p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-gray-700">
                  {docType.label}
                  {docType.required && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
                {uploaded && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(docType.value)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              {uploaded ? (
                <div className="mt-2">
                  {uploaded.preview ? (
                    <img
                      src={uploaded.preview}
                      alt={docType.label}
                      className="max-w-xs h-32 object-cover rounded border"
                    />
                  ) : (
                    <div className="flex items-center p-2 bg-gray-50 rounded">
                      <svg
                        className="w-8 h-8 text-gray-400 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {uploaded.file.name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-10 h-10 mb-3 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or
                      drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, PNG, JPG (MAX. 5MB)
                    </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.png,.jpg,.jpeg"
                    onChange={(e) => handleFileChange(docType.value, e)}
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Note:</strong> Verification typically takes 2-3 business days.
          You'll receive an email notification once your documents are reviewed.
        </p>
      </div>
    </div>
  );
}

