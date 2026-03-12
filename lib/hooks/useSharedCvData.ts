import { useCvData } from '@/lib/contexts/CvDataContext';

export function useSharedCvData() {
  return useCvData();
}

export default useSharedCvData;
