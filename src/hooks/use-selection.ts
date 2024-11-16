import { useState, useEffect } from 'react';

interface UseSelectionParams<T> {
  defaultValue?: T | null;
  pageSize: number;
  idExtractor: (item: T) => string | number; // Function to extract the identifier from the data item
}

function useSelection<T>(dataList: T[], { defaultValue, pageSize, idExtractor }: UseSelectionParams<T>) {
  const [isInitialised, setIsInitialised] = useState(false);
  const [initialRowIndex, setInitialRowIndex] = useState<number>();
  const [initialPageIndex, setInitialPageIndex] = useState<number>();

  useEffect(() => {
    if (defaultValue && dataList) {
      const selected = dataList.findIndex((item) => idExtractor(item) === idExtractor(defaultValue));
      const page = Math.floor(selected / pageSize) + 1;
      const selectedPosition = selected % pageSize;
      setInitialPageIndex(page);
      setInitialRowIndex(selectedPosition);
      setIsInitialised(true);
    } else if (dataList) {
      setIsInitialised(true);
    }
  }, [defaultValue, dataList, pageSize, idExtractor]);

  return { isInitialised, initialRowIndex, initialPageIndex };
}

export default useSelection;
