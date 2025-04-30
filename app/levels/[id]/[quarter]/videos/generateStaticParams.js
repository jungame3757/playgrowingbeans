export function generateStaticParams() {
  const levels = ['1', '2', '3', '4', '5', '6'];
  const quarters = ['q1', 'q2', 'q3', 'q4'];

  const params = [];
  
  for (const id of levels) {
    for (const quarter of quarters) {
      params.push({ id, quarter });
    }
  }
  
  return params;
} 