// src/hooks/index.ts
// Export all hooks

export {
  useUpload,
  useHorsePhotoUpload,
  useDocumentUpload,
  useAvatarUpload,
  useBarnLogoUpload,
  useFileList,
  useStorageQuota,
  useDragDrop,
  formatBytes,
  STORAGE_BUCKETS,
  type FileMetadata,
  type UploadResult,
  type StorageQuota,
} from './useStorage'

export {
  useTierPermissions,
  useTier,
  TierProvider,
  PermissionGate,
  DocumentTypeGate,
  PhotoLimitGate,
} from './useTierPermissions'

export { 
  useHorses, 
  useHorse, 
  useEvents, 
  useTasks, 
  useAlerts, 
  useActivityLog 
} from './useData'
