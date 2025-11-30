'use client'

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle } from 'lucide-react'
import { Modal, Button, Progress } from '../ui'
import { useAppStore } from '@/store'
import { cn, formatFileSize, getDocumentTypeFromFile } from '@/lib/utils'

interface DocumentUploaderProps {
  isOpen: boolean
  onClose: () => void
  projectId: string
}

interface UploadingFile {
  file: File
  progress: number
  status: 'uploading' | 'success' | 'error'
  error?: string
}

export function DocumentUploader({
  isOpen,
  onClose,
  projectId,
}: DocumentUploaderProps) {
  const { addDocument } = useAppStore()
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])

  const simulateUpload = async (file: File) => {
    // Simulate upload progress
    for (let progress = 0; progress <= 100; progress += 10) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      setUploadingFiles((prev) =>
        prev.map((f) => (f.file === file ? { ...f, progress } : f))
      )
    }

    // Read file content (for demo purposes)
    const reader = new FileReader()
    return new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const content = reader.result as string
        resolve(content.slice(0, 5000)) // Limit content for demo
      }
      reader.onerror = reject

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    })
  }

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      // Initialize uploading files
      const newUploadingFiles: UploadingFile[] = acceptedFiles.map((file) => ({
        file,
        progress: 0,
        status: 'uploading' as const,
      }))
      setUploadingFiles((prev) => [...prev, ...newUploadingFiles])

      // Process each file
      for (const file of acceptedFiles) {
        try {
          const content = await simulateUpload(file)

          // Add document to store
          addDocument(projectId, {
            name: file.name,
            type: getDocumentTypeFromFile(file),
            size: file.size,
            content,
            preview: file.type.startsWith('image/') ? content : undefined,
          })

          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file ? { ...f, status: 'success' as const } : f
            )
          )
        } catch {
          setUploadingFiles((prev) =>
            prev.map((f) =>
              f.file === file
                ? { ...f, status: 'error' as const, error: 'Erreur lors de l\'upload' }
                : f
            )
          )
        }
      }
    },
    [addDocument, projectId]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'text/*': ['.txt', '.md', '.csv'],
      'application/json': ['.json'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB per file
  })

  const removeFile = (file: File) => {
    setUploadingFiles((prev) => prev.filter((f) => f.file !== file))
  }

  const handleClose = () => {
    setUploadingFiles([])
    onClose()
  }

  const hasUploading = uploadingFiles.some((f) => f.status === 'uploading')
  const allSuccess = uploadingFiles.length > 0 && uploadingFiles.every((f) => f.status === 'success')

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Uploader des documents"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose}>
            {allSuccess ? 'Terminer' : 'Annuler'}
          </Button>
        </>
      }
    >
      {/* Dropzone */}
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
          isDragActive
            ? 'border-claude-primary bg-claude-light'
            : 'border-gray-300 hover:border-claude-primary hover:bg-gray-50'
        )}
      >
        <input {...getInputProps()} />
        <Upload
          className={cn(
            'w-12 h-12 mx-auto mb-4',
            isDragActive ? 'text-claude-primary' : 'text-gray-400'
          )}
        />
        {isDragActive ? (
          <p className="text-claude-primary font-medium">
            Déposez les fichiers ici...
          </p>
        ) : (
          <>
            <p className="text-gray-600 font-medium mb-1">
              Glissez-déposez vos documents ici
            </p>
            <p className="text-sm text-gray-400">
              ou cliquez pour sélectionner des fichiers
            </p>
          </>
        )}
        <p className="text-xs text-gray-400 mt-4">
          Formats supportés: PDF, Images (PNG, JPG), CSV, JSON, TXT (max 50Mo par
          fichier)
        </p>
      </div>

      {/* Uploading files list */}
      {uploadingFiles.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Fichiers ({uploadingFiles.length})
          </h4>
          {uploadingFiles.map((item, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center gap-3 p-3 rounded-lg border',
                item.status === 'success'
                  ? 'bg-green-50 border-green-200'
                  : item.status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-gray-50 border-gray-200'
              )}
            >
              <div
                className={cn(
                  'p-2 rounded-lg',
                  item.status === 'success'
                    ? 'bg-green-100'
                    : item.status === 'error'
                    ? 'bg-red-100'
                    : 'bg-gray-100'
                )}
              >
                {item.status === 'success' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : item.status === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-red-600" />
                ) : (
                  <File className="w-5 h-5 text-gray-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {item.file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(item.file.size)}
                  {item.error && (
                    <span className="text-red-600 ml-2">{item.error}</span>
                  )}
                </p>
                {item.status === 'uploading' && (
                  <Progress
                    value={item.progress}
                    size="sm"
                    className="mt-2"
                  />
                )}
              </div>
              {item.status !== 'uploading' && (
                <button
                  onClick={() => removeFile(item.file)}
                  className="p-1 hover:bg-gray-200 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}
      <div className="mt-6 bg-claude-light rounded-lg p-4">
        <h4 className="text-sm font-medium text-claude-secondary mb-2">
          Conseils pour de meilleurs résultats
        </h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-claude-primary rounded-full mt-1.5" />
            Les PDF avec du texte selectionnable donnent de meilleurs résultats
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-claude-primary rounded-full mt-1.5" />
            Les graphiques et tableaux sont automatiquement analysés
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-claude-primary rounded-full mt-1.5" />
            Utilisez des images de haute qualité pour l&apos;OCR
          </li>
        </ul>
      </div>
    </Modal>
  )
}
