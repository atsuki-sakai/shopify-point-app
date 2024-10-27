import { useState } from "react";
import { Form, useLoaderData } from "@remix-run/react";
import {
  Card,
  Layout,
  Page,
  Text,
  IndexTable,
  Button,
  ButtonGroup,
  Thumbnail,
  BlockStack,
  Divider,
  InlineStack,
  Bleed,
  useIndexResourceState,
  Checkbox,
} from "@shopify/polaris";
import { TitleBar } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { getProducts } from "../controller/storeController";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import {
  setPointExcludedProductIds,
  getPointExcludedProductIds,
  getCampaignToMerchantId,
} from "../controller/userController";
import { json } from "@remix-run/node";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const admin = await authenticate.admin(request);
  const { shop, accessToken } = admin.session;
  const products = await getProducts(accessToken, shop);
  const excludedProductIds = await getPointExcludedProductIds(shop);
  const campaign = await getCampaignToMerchantId(shop);
  return json({ products, excludedProductIds, campaign });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const admin = await authenticate.admin(request);
  const { shop } = admin.session;
  const formData = await request.formData();
  const selectedProductIds = JSON.parse(formData.get("productIds") as string);
  setPointExcludedProductIds(shop, selectedProductIds);
  return json({ selectedProductIds });
};

export default function ExcludedProductPage() {
  const { products, excludedProductIds, campaign } =
    useLoaderData<typeof loader>();
  const { selectedResources, allResourcesSelected, handleSelectionChange } =
    useIndexResourceState(products, { selectedResources: excludedProductIds });

  const resourceName = {
    singular: "product",
    plural: "products",
  };

  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const itemsPerPage = 30; // Define items per page

  // Calculate the index of the first and last item on the current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = products.slice(indexOfFirstItem, indexOfLastItem); // Get current items

  const totalPages = Math.ceil(products.length / itemsPerPage); // Calculate total pages

  console.log(selectedResources);
  return (
    <Page fullWidth>
      <TitleBar title="Additional page" />
      <Layout>
        <Layout.Section>
          <Form method="POST">
            <BlockStack gap="800">
              <Text as="h3" variant="headingLg">
                ポイント還元除外商品
              </Text>
              <Text as="h4">
                除外商品に設定された商品はポイント還元対象外となります。
              </Text>
              <Card>
                <BlockStack gap="400">
                  <IndexTable
                    resourceName={resourceName}
                    itemCount={products.length}
                    selectedItemsCount={
                      allResourcesSelected ? "All" : selectedResources.length
                    }
                    onSelectionChange={handleSelectionChange}
                    headings={[
                      { title: "image" },
                      { title: "title" },
                      { title: "price" },
                    ]}
                  >
                    {currentItems.map((product: any, index: number) => (
                      <IndexTable.Row
                        id={product.id}
                        key={product.id}
                        selected={selectedResources.includes(product.id)}
                        position={index + indexOfFirstItem} // Adjust position for correct indexing
                      >
                        <IndexTable.Cell>
                          <Thumbnail
                            source={product.image.src}
                            size="small"
                            alt={product.title}
                          />
                        </IndexTable.Cell>
                        <IndexTable.Cell>{product.title}</IndexTable.Cell>
                        <IndexTable.Cell>
                          ¥{product.variants[0].price}
                        </IndexTable.Cell>
                      </IndexTable.Row>
                    ))}
                  </IndexTable>
                  {/*FIXME - 選択中の商品IDをactionに送信、かなり冗長的な書き方なので改善が必要 */}
                  <input
                    type="hidden"
                    name="productIds"
                    value={JSON.stringify(selectedResources)}
                  />
                  {/* Pagination Controls */}
                  <Divider borderColor="border" />
                  <BlockStack gap="800" align="center" inlineAlign="center">
                    <ButtonGroup>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(prev - 1, 1))
                        }
                        disabled={currentPage === 1}
                      >
                        Previous
                      </Button>
                      <Text as="h2">
                        Page {currentPage} of {totalPages}
                      </Text>
                      <Button
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </Button>
                    </ButtonGroup>
                    <Button
                      size="large"
                      fullWidth
                      submit={true}
                      variant="primary"
                    >
                      選択中の商品を除外商品に設定
                    </Button>
                    <Bleed marginInlineEnd="600">
                      {/* <Text as="h4">
                        除外商品に設定された商品はポイント還元対象外となります。
                      </Text> */}
                    </Bleed>
                  </BlockStack>
                </BlockStack>
              </Card>
            </BlockStack>
          </Form>
        </Layout.Section>
      </Layout>
    </Page>
  );
}
