import { useCallback, useEffect, useState } from 'react';

import { useStorageState } from '@/hooks/useStorageState';
import { SAFManager } from '@/utils/saf-manager';

export function useSAF() {
  const [safManager] = useState(new SAFManager());
  const [hasAccess, setHasAccess] = useState(false);

  const [[isStoredUriLoading, storedUri], setStoredUri] =
    useStorageState('directoryUri');

  useEffect(() => {
    let isMounted = true;

    if (isStoredUriLoading === false) {
      if (!storedUri) {
        return;
      }

      if (isMounted) {
        console.log('Stored URI found:', storedUri);
        safManager.setDirectoryUri(storedUri);
        setHasAccess(true);
      }
    }

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line
  }, [isStoredUriLoading, storedUri]);

  const moveFileToSAF = useCallback(
    async (sourceUri: string, fileName: string, mimeType?: string) => {
      // Check if we have a stored URI (either from state or safManager)
      const hasStoredUri = storedUri || safManager.hasDirectoryAccess();

      if (!hasStoredUri) {
        // No stored URI, request access
        const directoryUri = await safManager.requestDirectoryAccess();
        if (directoryUri) {
          setHasAccess(true);
          setStoredUri(directoryUri);
        } else {
          return null;
        }
      } else if (!safManager.hasDirectoryAccess() && storedUri) {
        // We have a stored URI but safManager doesn't have it set yet
        safManager.setDirectoryUri(storedUri);
        setHasAccess(true);
      }

      // Try to move the file - if it fails (invalid URI), request new access
      try {
        const result = await safManager.moveFileToDirectory(
          sourceUri,
          fileName,
          mimeType || 'application/octet-stream'
        );

        // If result is false, the operation failed (possibly invalid URI)
        if (result === false) {
          console.warn(
            'Failed to move file with stored URI, requesting new access'
          );
          // URI might be invalid, request new access
          const directoryUri = await safManager.requestDirectoryAccess();
          if (directoryUri) {
            setHasAccess(true);
            setStoredUri(directoryUri);
            // Retry with new URI
            return await safManager.moveFileToDirectory(
              sourceUri,
              fileName,
              mimeType || 'application/octet-stream'
            );
          }
          return false;
        }

        return result;
      } catch (error) {
        console.warn(
          'Error moving file with stored URI, requesting new access:',
          error
        );
        // URI might be invalid, request new access
        const directoryUri = await safManager.requestDirectoryAccess();
        if (directoryUri) {
          setHasAccess(true);
          setStoredUri(directoryUri);
          // Retry with new URI
          try {
            return await safManager.moveFileToDirectory(
              sourceUri,
              fileName,
              mimeType || 'application/octet-stream'
            );
          } catch (retryError) {
            console.error('Failed to move file even with new URI:', retryError);
            return false;
          }
        }
        return false;
      }
    },
    [safManager, setStoredUri, storedUri]
  );

  return {
    hasAccess,
    moveFileToSAF,
  };
}
