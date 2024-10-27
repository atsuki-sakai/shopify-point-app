// /app/controllers/userController.ts
import firestore from '../db/firestoreClient';

const merchantCollection = "merchant";
const campaignCollection = "campaign";
// ユーザーを作成する関数
export const createMerchant = async (merchant: MSMerchant) => {
  const userRef = firestore.collection(merchantCollection).doc(); // 新しいドキュメントを作成
  await userRef.set(merchant); // ユーザーデータを設定
  return { ...merchant }; // 作成したユーザーのIDを返す
};

export const updateMerchant = async (merchant: MSMerchant) => {
  const userRef = firestore.collection(merchantCollection).doc(merchant.id);
  await userRef.set(merchant);
  return { ...merchant };
};

export const getMerchant = async (id: string) => {
  const snapshot = await firestore
    .collection(merchantCollection)
    .where("id", "==", id)
    .get(); // ユーザードキュメントを取得

  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs[0].data();
};

// ユーザーを取得する関数
export const fetchUsers = async () => {
  const snapshot = await firestore.collection(merchantCollection).get(); // ユーザーコレクションを取得
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // ドキュメントを配列に変換
};

export const setPointExcludedProductIds = async (merchantId: string, productIds: string[]) => {
  const merchantRef = firestore.collection(merchantCollection).doc(merchantId);
  await merchantRef.update({ point_excluded_product_ids: productIds });
};

export const getPointExcludedProductIds = async (merchantId: string) => {
  const merchantRef = firestore.collection(merchantCollection).doc(merchantId);
  const snapshot = await merchantRef.get();
  return snapshot.data()?.point_excluded_product_ids || [];
};

export const createCampaign = async (campaign: MSCampaign) => {
  const campaignRef = firestore.collection(campaignCollection).doc();
  await campaignRef.set({ ...campaign, id: campaignRef.id });
  return { ...campaign, id: campaignRef.id };
};

export const getCampaignToMerchantId = async (merchantId: string): Promise<any> => {
  const snapshot = await firestore
    .collection(campaignCollection)
    .where("merchant_id", "==", merchantId)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
};

export const getCampaignById = async (campaignId: string): Promise<any> => {
  const snapshot = await firestore
    .collection(campaignCollection)
    .where("id", "==", campaignId)
    .get();
  return snapshot.docs[0].data();
};

export const updateCampaign = async (campaignId: string, campaign: MSCampaign) => {
  const campaignRef = firestore.collection(campaignCollection).doc(campaignId);
  await campaignRef.update(campaign);

  return { ...campaign, id: campaignId };
};

type MSMerchant = {
  id: string;
  accessToken: string;
  // ポイント還元の最低購入金額
  amount_of_points: number;
  // ポイント還元率
  point_rate: number;
  // ポイント有効期限
  expiration_of_points_day?: number;
  // ポイント還元除外商品ID
  // FIXME - 上限数を設定した方が良い？
  point_excluded_product_ids?: string[];
};

export type MSCampaign = {
  id: string;
  merchant_id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: boolean;
  special_point_rate?: number;
  point_excluded_product_ids?: string[];
};

type MSPoint = {
  id: string;
  merchant_id: string;
  customer_id: string;
  last_updated: string;
  point: number;
};

type MSPointHistory = {
  id: string;
  point_id: string;
  action: "ADD" | "SUBTRACT" | "RESET";
  amount: number;
  created_at: string;
};
