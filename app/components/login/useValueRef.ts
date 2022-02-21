import { useRef } from 'react';

const useValueRef = (params: any) => {
  const paramsRef = useRef(0);
  paramsRef.current = params;
  return paramsRef;
};

export default useValueRef;
