import {
  Page,
  Layout,
  Text,
  Card,
  BlockStack,
  EmptyState,
  TextField,
  Button,
  Checkbox,
  DatePicker,
  Badge,
  InlineStack,
} from "@shopify/polaris";

import { Form, useLoaderData, useNavigate } from "@remix-run/react";
import { TitleBar } from "@shopify/app-bridge-react";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import {
  createCampaign,
  getCampaignToMerchantId,
} from "app/controller/userController";
import { useState, useCallback } from "react";
import type { MSCampaign } from "app/controller/userController";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const admin = await authenticate.admin(request);
  const { shop } = admin.session;
  const merchantCampaigns = await getCampaignToMerchantId(shop);
  return json({ merchantCampaigns });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const admin = await authenticate.admin(request);
  const { shop } = admin.session;

  const formData = await request.formData();
  const name = formData.get("name");
  const start_date = formData.get("start_date");
  const end_date = formData.get("end_date");
  const special_point_rate = formData.get("special_point_rate");
  const status = formData.get("status") === "true" ? true : false;
  const campaignData = {
    id: "",
    merchant_id: shop,
    name: String(name ?? ""), // Convert to string
    start_date: String(start_date ?? ""), // Convert to string
    end_date: String(end_date ?? ""), // Convert to string
    special_point_rate: Number(special_point_rate ?? 0), // Convert to number
    status: status, // Ensure status is a boolean
  };
  const campaign = await createCampaign(campaignData);
  return json({ campaign });
};

export default function CampaignPage() {
  const navigate = useNavigate();
  const { merchantCampaigns } = useLoaderData<typeof loader>();
  console.log(merchantCampaigns);
  const [campaignData, setCampaignData] = useState<MSCampaign>({
    id: "",
    merchant_id: "",
    name: "",
    start_date: "",
    end_date: "",
    status: true,
  });

  const [{ month, year }, setDate] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
  });
  const [selectedDates, setSelectedDates] = useState({
    start: new Date(),
    end: new Date(),
  });

  const handleMonthChange = useCallback(
    (month: number, year: number) => setDate({ month, year }),
    [],
  );

  console.log(campaignData);

  return (
    <>
      <Page>
        <TitleBar title="キャンペーン設定" />
        <Layout>
          <Layout.Section>
            <BlockStack gap="400">
              <Text fontWeight="bold" as="h1">
                キャンペーンを作成する
              </Text>
              <Card>
                <Form method="POST">
                  <BlockStack gap="400">
                    <TextField
                      label="キャンペーン名"
                      id="name"
                      placeholder="キャンペーン名を入力してください"
                      name="name"
                      value={campaignData?.name}
                      onChange={(value) =>
                        setCampaignData({ ...campaignData, name: value })
                      }
                      autoComplete="off"
                    />
                    <DatePicker
                      month={month}
                      year={year}
                      onChange={setSelectedDates}
                      onMonthChange={handleMonthChange}
                      selected={selectedDates}
                      multiMonth
                      allowRange
                    />

                    <TextField
                      id="start_date"
                      label="開始日"
                      placeholder="開始日を入力してください"
                      name="start_date"
                      readOnly
                      value={selectedDates.start.toISOString().split("T")[0]}
                      autoComplete="off"
                    />

                    <TextField
                      label="終了日"
                      id="end_date"
                      placeholder="終了日を入力してください"
                      name="end_date"
                      readOnly
                      value={selectedDates.end.toISOString().split("T")[0]}
                      autoComplete="off"
                    />
                    <TextField
                      label="ポイント還元率"
                      id="special_point_rate"
                      placeholder="ポイント還元率を入力してください"
                      name="special_point_rate"
                      suffix="%"
                      type="number"
                      value={campaignData?.special_point_rate?.toString()}
                      onChange={(value) =>
                        setCampaignData({
                          ...campaignData,
                          special_point_rate: Number(value),
                        })
                      }
                      autoComplete="off"
                    />
                    <input
                      type="hidden"
                      name="status"
                      value={campaignData?.status ? "true" : "false"}
                    />
                    <Checkbox
                      label="有効にする"
                      checked={campaignData?.status}
                      onChange={(value) =>
                        setCampaignData({ ...campaignData, status: value })
                      }
                    />
                    <Button submit variant="primary" size="large">
                      キャンペーンを作成
                    </Button>
                  </BlockStack>
                </Form>
              </Card>
              <Card>
                {merchantCampaigns.length === 0 ? (
                  <EmptyState
                    heading="まだキャンペーンがありません."
                    action={{ content: "キャンペーンを作成" }}
                    image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                  >
                    <p>
                      キャンペーンを作成して、ポイント還元率を設定しましょう。
                    </p>
                  </EmptyState>
                ) : (
                  <Card padding="400">
                    <BlockStack gap="400">
                      <Text fontWeight="bold" as="h1" alignment="center">
                        キャンペーン一覧
                      </Text>
                      <BlockStack gap="800">
                        {merchantCampaigns.map(
                          (campaign: any, index: number) => (
                            <Card key={index}>
                              <BlockStack gap="400">
                                <Text fontWeight="bold" as="h1">
                                  {campaign.name}
                                </Text>

                                <InlineStack gap="400">
                                  <Text as="span">
                                    開始日: {campaign.start_date}
                                  </Text>
                                  <Text as="span">
                                    終了日: {campaign.end_date}
                                  </Text>
                                  <Badge
                                    size="small"
                                    tone={
                                      campaign.status ? "success" : "critical"
                                    }
                                  >
                                    {campaign.status ? "有効" : "無効"}
                                  </Badge>
                                  <Text as="span">
                                    ポイント還元率:{" "}
                                    {campaign.special_point_rate}%
                                  </Text>
                                </InlineStack>

                                <Button
                                  onClick={() =>
                                    navigate(
                                      `/app/campaign-edit/${campaign.id}`,
                                    )
                                  }
                                >
                                  キャンペーンを編集
                                </Button>
                              </BlockStack>
                            </Card>
                          ),
                        )}
                      </BlockStack>
                    </BlockStack>
                  </Card>
                )}
              </Card>
            </BlockStack>
          </Layout.Section>
        </Layout>
      </Page>
    </>
  );
}
