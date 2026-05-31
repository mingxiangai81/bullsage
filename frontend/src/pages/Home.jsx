import TickerInput from '../components/TickerInput';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-xl mx-auto px-6 text-center">
        <h1 className="text-4xl font-serif font-bold text-white mb-4">
          用大师的眼光<br />看每一只股票
        </h1>
        <p className="text-gray-400 mb-8">
          输入股票代码，60秒获得巴菲特、格雷厄姆、林奇等10位大师的独立裁决
        </p>
        <TickerInput />
        <p className="text-xs text-gray-600 mt-4">支持美股 · 港股 | 教育性内容，非投资建议</p>
      </div>
    </div>
  );
}
