export const Footer = () => {
  return (
    <footer className="max-w-6xl mx-auto mt-20 pb-10 px-6 text-slate-600 text-xs leading-relaxed border-t border-slate-900 pt-8">
      <div className="flex flex-col gap-2">
        <p>© 2026 MOCK-INVEST</p>
        <p>
          본 서비스는 포트폴리오 목적으로 제작되었으며, 어떠한 영리적 이익도
          취하지 않습니다. 제공되는 시세 정보는 한국투자증권(KIS) API를 사용하여
          실시간 시장 가격과 차이가 발생할 수 있으며, 데이터 지연 및 누락에 대해
          어떠한 법적 책임도 지지 않음을 알려드립니다.
        </p>
        <p>Data Source: Korea Investment & Securities Co., Ltd.</p>
      </div>
    </footer>
  );
};
