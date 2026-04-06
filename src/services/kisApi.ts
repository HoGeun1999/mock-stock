// src/services/kisApi.ts

const KIS_URL = "/kis-api";
const APP_KEY = import.meta.env.VITE_KIS_APP_KEY;
const APP_SECRET = import.meta.env.VITE_KIS_SECRET_KEY;

// 로컬 스토리지 키 이름
const TOKEN_KEY = "kis_access_token";
const TOKEN_EXPIRE_KEY = "kis_token_expire";

/**
 * 1. 접근 토큰(Access Token) 발급 및 캐싱 함수
 */
export const getKisAccessToken = async () => {
  const now = Math.floor(Date.now() / 1000); // 현재 시간 (초 단위)

  // 1. 로컬 스토리지에서 기존 토큰 확인
  const savedToken = localStorage.getItem(TOKEN_KEY);
  const expireTime = localStorage.getItem(TOKEN_EXPIRE_KEY);

  // 2. 토큰이 있고 만료되지 않았으면 그대로 반환 (새로고침 방어)
  if (savedToken && expireTime && parseInt(expireTime) > now) {
    console.log(
      "♻️ 기존 토큰 재사용 (만료까지:",
      parseInt(expireTime) - now,
      "초 남음)",
    );
    return savedToken;
  }

  // 3. 토큰이 없거나 만료되었다면 새로 발급
  try {
    console.log("🔑 KIS 토큰 새로 발급 중...");
    const response = await fetch(`${KIS_URL}/oauth2/tokenP`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: APP_KEY,
        appsecret: APP_SECRET,
      }),
    });

    const data = await response.json();

    if (data.access_token) {
      // KIS 토큰은 보통 24시간(86400초) 유효하지만 안전하게 6시간 정도로 설정
      const expiresIn = 6 * 60 * 60;
      const newExpireDate = now + expiresIn;

      localStorage.setItem(TOKEN_KEY, data.access_token);
      localStorage.setItem(TOKEN_EXPIRE_KEY, newExpireDate.toString());

      console.log("✅ KIS 토큰 발급 및 저장 완료!");
      return data.access_token;
    } else {
      console.error("❌ 토큰 발급 실패:", data);
      return null;
    }
  } catch (error) {
    console.error("❌ KIS API 요청 오류:", error);
    return null;
  }
};
/**
 * 2. 실제 주가 조회 함수
 */
export const getStockPrice = async (symbol: string) => {
  // 토큰을 가져올 때까지 대기
  const token = await getKisAccessToken();
  if (!token) return null;

  try {
    const url = `${KIS_URL}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        authorization: `Bearer ${token}`,
        appkey: APP_KEY,
        appsecret: APP_SECRET,
        tr_id: "FHKST01010100",
      },
    });

    const data = await response.json();

    if (data.rt_cd !== "0") {
      console.warn(`⚠️ [${symbol}] 조회 실패: ${data.msg1}`);
      return null;
    }

    return data.output;
  } catch (error) {
    console.error(`❌ [${symbol}] 주가 조회 중 예외 발생:`, error);
    return null;
  }
};
