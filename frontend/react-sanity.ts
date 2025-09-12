import { useState, useEffect } from 'react';

const Demo = () => {
  const [n, setN] = useState(0);
  useEffect(() => { setN(v => v + 1); }, []);
  return n;
};

export default Demo;
