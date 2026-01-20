const ProductSelectorRow = ({ product, selectedItem, onChange }) => {
  const quantity = selectedItem?.quantity || "";

  return (
    <tr>
      <td>{product.name}</td>
      <td>${product.price}</td>
      <td>
        <input
          type="number"
          min="0"
          className="form-control form-control-sm"
          value={quantity}
          onChange={(e) =>
            onChange(product, Number(e.target.value))
          }
        />
      </td>
    </tr>
  );
};

export default ProductSelectorRow;
