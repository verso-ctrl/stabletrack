// src/lib/storage-server.ts
// Server-side storage utilities (DO NOT import in client components)

import { writeFile, mkdir, unlink } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

/**
 * Get MIME type from filename
 */
export function getMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  const mimeTypes: Record<string, string> = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'csv': 'text/csv',
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

/**
 * Save base64 file to local storage
 */
export async function saveBase64File(
  base64Data: string,
  folder: string = 'uploads',
  filename: string
): Promise<{ url: string; path: string; fileUrl: string; fileSize: number }> {
  // Remove data URL prefix if present
  const base64 = base64Data.replace(/^data:[^;]+;base64,/, '')
  const buffer = Buffer.from(base64, 'base64')
  
  const uploadDir = join(process.cwd(), 'uploads', folder)
  if (!existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }
  
  const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '-')}`
  const filePath = join(uploadDir, uniqueFilename)
  await writeFile(filePath, buffer)
  
  const url = `/api/uploads/${folder}/${uniqueFilename}`
  
  return { 
    url, 
    path: filePath,
    fileUrl: url,
    fileSize: buffer.length,
  }
}

/**
 * Delete a file from local storage by path or URL
 */
export async function deleteFileByPath(filePath: string): Promise<boolean> {
  try {
    // If it's a URL, convert to file path
    let actualPath = filePath
    if (filePath.startsWith('/api/uploads/')) {
      const relativePath = filePath.replace('/api/uploads/', '')
      actualPath = join(process.cwd(), 'uploads', relativePath)
    } else if (filePath.startsWith('/uploads/')) {
      actualPath = join(process.cwd(), filePath)
    }
    
    if (existsSync(actualPath)) {
      await unlink(actualPath)
      return true
    }
    
    return false
  } catch (error) {
    console.error('Delete file error:', error)
    return false
  }
}
