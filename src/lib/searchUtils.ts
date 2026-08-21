export const searchProducts = (products: any[], query: string) => {
  if (!query) return products;
  const q = query.toLowerCase();

  return [...products]
    .sort((a, b) => {
      const getScore = (p: any) => {
        if (p.name?.toLowerCase().startsWith(q)) return 4;
        if (p.name?.toLowerCase().includes(q)) return 3;
        if (p.category?.toLowerCase().includes(q)) return 2;
        if (
          p.metadata &&
          Object.values(p.metadata).some((val) =>
            String(val).toLowerCase().includes(q)
          )
        )
          return 1;
        return 0;
      };
      return getScore(b) - getScore(a);
    })
    .filter((p) => {
      return (
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        (p.metadata &&
          Object.values(p.metadata).some((val) =>
            String(val).toLowerCase().includes(q)
          ))
      );
    });
};

export const getPrediction = (products: any[], query: string) => {
  if (!query) return '';
  const q = query.toLowerCase();
  const match = products.find((p) => p.name?.toLowerCase().startsWith(q));
  return match ? match.name : '';
};
