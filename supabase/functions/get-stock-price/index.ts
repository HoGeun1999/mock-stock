// supabase/functions/get-stock-price/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { symbol } = await req.json()
    
    // 서버측 환경 변수에서 키를 가져옴
    const APP_KEY = Deno.env.get('KIS_APP_KEY')
    const SECRET_KEY = Deno.env.get('KIS_SECRET_KEY')
    const BASE_URL = Deno.env.get('KIS_URL')

    // KIS 토큰 발급 로직
    const authRes = await fetch(`${BASE_URL}/oauth2/tokenP`, {
      method: 'POST',
      body: JSON.stringify({
        grant_type: "client_credentials",
        appkey: APP_KEY,
        appsecret: SECRET_KEY
      })
    })
    const authData = await authRes.json()
    const accessToken = authData.access_token

    // 실시간 시세 조회
    const res = await fetch(`${BASE_URL}/uapi/domestic-stock/v1/quotations/inquire-price?fid_cond_mrkt_div_code=J&fid_input_iscd=${symbol}`, {
      headers: {
        'content-type': 'application/json',
        'authorization': `Bearer ${accessToken}`,
        'appkey': APP_KEY,
        'appsecret': SECRET_KEY,
        'tr_id': 'FHKST01010100'
      }
    })

    const result = await res.json()
    
    return new Response(JSON.stringify(result.output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})