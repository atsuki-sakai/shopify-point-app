
export const getProducts = async (
  accessToken?: string,
  shop?: string,
  limit?: number,
) => {
  if (!accessToken || !shop) {
    throw new Error("accessToken or shop is not defined");
  }
  const response = await fetch(
    `https://${shop}/admin/api/2023-07/products.json?limit=${limit ?? 250}`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
    },
  });
  const responseData = await response.json();
  return responseData.products;
};
