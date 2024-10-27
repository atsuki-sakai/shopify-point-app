import { useState } from "react";
import { useLoaderData, Form } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  TextField,
} from "@shopify/polaris";

import { TitleBar } from "@shopify/app-bridge-react";
import { getMerchant, updateMerchant } from "../controller/userController";
import { getProducts } from "../controller/storeController";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const admin = await authenticate.admin(request);
  const { shop, accessToken } = admin.session;

  const merchant = await getMerchant(shop);
  const products = await getProducts(accessToken, shop);
  return json({ merchant, products });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  let formData = await request.formData();
  const admin = await authenticate.admin(request);
  // FIXME - idンボ取得方法がわからないのでdomainをidにしている
  const { shop, accessToken } = admin.session;

  const point = formData.get("point") as string;
  const pointRate = formData.get("point_rate") as string;
  const expirationOfPointsDay = formData.get(
    "expiration_of_points_day",
  ) as string;

  await updateMerchant({
    id: shop,
    accessToken: accessToken ?? "",
    amount_of_points: Number(point),
    point_rate: Number(pointRate),
    expiration_of_points_day: Number(expirationOfPointsDay),
  });
  return { success: true };
};

export default function Index() {
  const { merchant } = useLoaderData<typeof loader>();

  const [point, setPoint] = useState(merchant?.amount_of_points ?? "100"); // point の状態を管理
  const [pointRate, setPointRate] = useState(merchant?.point_rate ?? "1"); // point_rate の状態を管理
  const [expirationOfPointsDay, setExpirationOfPointsDay] = useState(
    merchant?.expiration_of_points_day ?? "360",
  ); // expiration_of_points_day の状態を管理
  return (
    <Page>
      <TitleBar title="Multiseller App">
        <button
          variant="primary"
          // onClick={generateProduct}
        >
          MULTI SELER
        </button>
      </TitleBar>
      <BlockStack gap="500">
        <Layout>
          <Layout.Section>
            <Card>
              <BlockStack gap="500">
                <Form method="POST">
                  <BlockStack gap="400">
                    <Text as="h3" variant="headingLg">
                      ポイント還元設定
                    </Text>

                    <TextField
                      id="point"
                      name="point"
                      label="ポイント還元の最低購入金額"
                      autoComplete="off"
                      type="number"
                      placeholder="100"
                      prefix="¥"
                      value={point}
                      onChange={(value) => setPoint(value)}
                    />
                    <TextField
                      id="point_rate"
                      name="point_rate"
                      label="ポイント還元率(%)"
                      autoComplete="off"
                      type="number"
                      placeholder="1"
                      suffix="%"
                      value={pointRate}
                      onChange={(value) => setPointRate(value)}
                    />
                    <TextField
                      id="expiration_of_points_day"
                      name="expiration_of_points_day"
                      label="ポイントの最終利用日からの有効期限"
                      autoComplete="off"
                      type="number"
                      placeholder="360"
                      suffix="日"
                      value={expirationOfPointsDay}
                      onChange={(value) => setExpirationOfPointsDay(value)}
                    />
                    <Button submit={true} variant="primary">
                      ポイント設定を変更
                    </Button>
                  </BlockStack>
                </Form>
              </BlockStack>
            </Card>
          </Layout.Section>
        </Layout>
      </BlockStack>
    </Page>
  );
}
