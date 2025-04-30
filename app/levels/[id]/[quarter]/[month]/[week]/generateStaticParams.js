export function generateStaticParams() {
  const levels = ['1', '2', '3', '4', '5', '6'];
  const quarters = ['q1', 'q2', 'q3', 'q4'];
  const months = [
    'm1', 'm2', 'm3', 'm4', 'm5', 'm6',
    'm7', 'm8', 'm9', 'm10', 'm11', 'm12'
  ];
  const weeks = ['w1', 'w2', 'w3', 'w4'];

  const params = [];
  
  for (const id of levels) {
    for (const quarter of quarters) {
      for (const month of months) {
        for (const week of weeks) {
          params.push({ id, quarter, month, week });
        }
      }
    }
  }
  
  return params;
} 