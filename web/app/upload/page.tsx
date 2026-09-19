"use client";

import { useState } from "react";
import { useRouter } from "navigation";
import { uploadContract } from "../../lib/api";
import { useRouter as useNextRouter } from "next/navigation";

export default function UploadPage() {
  const [isUploading, setIsUploading] = useState(false);
  const router = useNextRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const contract = await uploadContract(file);
      router.push(`/contracts/${contract.id}`);
    } catch (error) {
      console.error(error);
      alert("Upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-24">
      <h1 className="text-3xl font-semibold text-gray-900 mb-6 font-serif">Upload Contract</h1>
      
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center bg-gray-50">
        {isUploading ? (
          <p className="text-gray-500 font-medium">Extracting obligations...</p>
        ) : (
          <div>
            <p className="text-gray-600 mb-4 font-mono text-sm">Drag and drop a PDF, or browse</p>
            <input 
              type="file" 
              accept="application/pdf"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-indigo-50 file:text-indigo-700
                hover:file:bg-indigo-100 mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
