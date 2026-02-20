import { useMemo } from "react";

/**
 * Hook reutilizable para filtrar productos
 * @param {Array} products
 * @param {string} searchTerm
 */
export const useProductFilter = (products = [], searchTerm = "") => {
  return useMemo(() => {
    if (!searchTerm.trim()) return products;

    const search = searchTerm.toLowerCase();

    return products.filter(product =>
      product.name?.toLowerCase().includes(search) ||
      product.description?.toLowerCase().includes(search) ||
      String(product.price).includes(search)
    );
  }, [products, searchTerm]);
};
