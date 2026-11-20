import { useEffect, useState } from 'react';
import { getLookupOptions } from '../api/lookupOptions.api';

export function useLookupOptions(category) {
  const [options, setOptions] = useState([]);
  useEffect(() => {
    let mounted = true;
    getLookupOptions(category).then(({ data }) => {
      if (mounted) setOptions((data.data || []).map((option) => ({ value: option.value, label: option.label })));
    }).catch(() => { if (mounted) setOptions([]); });
    return () => { mounted = false; };
  }, [category]);
  return options;
}
