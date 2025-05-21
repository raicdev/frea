import { useEffect, useRef } from 'react';

/**
 * A hook to manage the document title.
 * @param title - The title to set for the document
 * @param restoreOnUnmount - Whether to restore the previous title when the component unmounts (default: true)
 */
export function useTitle(title: string, restoreOnUnmount: boolean = true): void {
  const previousTitle = useRef(document.title);

  useEffect(() => {
    // Set the new title
    document.title = title;

    // Restore the previous title on unmount if restoreOnUnmount is true
    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle.current ;
      }
    };
  }, [title, restoreOnUnmount]);
}