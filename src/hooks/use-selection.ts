import { useMemo } from "react";

interface UseSelectionParams<T> {
  defaultValue?: T;
  pageSize: number;
  idExtractor: (item: T) => string | number;
}

function useSelection<T>(dataList: T[], { defaultValue, pageSize, idExtractor }: UseSelectionParams<T>) {
  const initialSelection = useMemo(() => {
    if (defaultValue && dataList) {
      const selected = dataList.findIndex((item) => idExtractor(item) === idExtractor(defaultValue));
      if (selected !== -1) {
        const page = Math.floor(selected / pageSize) + 1;
        const selectedPosition = selected % pageSize;
        return {
          isInitialised: true,
          initialRowIndex: selectedPosition,
          initialPageIndex: page,
        };
      }
    }
    return {
      isInitialised: !!dataList,
      initialRowIndex: undefined,
      initialPageIndex: undefined,
    };
  }, [dataList, defaultValue, pageSize, idExtractor]);

  return initialSelection;
}

export default useSelection;