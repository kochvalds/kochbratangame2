import React, { useState } from 'react';
import { X, TrendingUp, TrendingDown, DollarSign, BarChart2, Activity } from 'lucide-react';
import { StockAsset, CryptoAsset, CandleDataPoint } from '../../types/game';
import { formatMoney, formatExactMoney, formatPercent } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface TradingDiagramModalProps {
  asset: StockAsset | CryptoAsset;
  isCrypto: boolean;
  playerCash: number;
  onClose: () => void;
  onTrade: (action: 'BUY' | 'SELL', amount: number) => void;
}

export function TradingDiagramModal({
  asset,
  isCrypto,
  playerCash,
  onClose,
  onTrade
}: TradingDiagramModalProps) {
  const [chartType, setChartType] = useState<'candles' | 'line'>('candles');
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | '1Y'>('1D');
  const [tradeAmount, setTradeAmount] = useState<number>(1);

  const isStock = !isCrypto;
  const stockAsset = isStock ? (asset as StockAsset) : null;
  const cryptoAsset = isCrypto ? (asset as CryptoAsset) : null;

  const currentPrice = asset.price;
  const priceChange = ((asset.price - asset.prevPrice) / asset.prevPrice) * 100;
  const isPositive = priceChange >= 0;

  const ownedAmount = isStock ? (stockAsset?.sharesOwned || 0) : (cryptoAsset?.amountOwned || 0);

  // Candles data
  const candles: CandleDataPoint[] = asset.candles || [];
  const minPrice = Math.min(...candles.map(c => c.low)) * 0.995;
  const maxPrice = Math.max(...candles.map(c => c.high)) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map(c => c.volume)) || 1;

  const chartHeight = 220;
  const chartWidth = 560;
  const candleSpacing = chartWidth / Math.max(1, candles.length);
  const candleWidth = Math.max(4, candleSpacing * 0.65);

  const totalCost = Number((tradeAmount * currentPrice).toFixed(2));

  const handleMaxBuy = () => {
    const maxAffordable = Math.floor(playerCash / currentPrice);
    setTradeAmount(Math.max(1, maxAffordable));
  };

  const handleMaxSell = () => {
    setTradeAmount(Math.max(1, Math.floor(ownedAmount)));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative space-y-6">
        
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${
              isCrypto ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
            }`}>
              {asset.symbol.slice(0, 3)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-white">{asset.name}</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {asset.symbol}
                </span>
                <span className="text-xs text-neutral-400 font-medium">
                  {isCrypto ? 'Криптовалютный рынок' : (stockAsset?.sector || 'Акции США')}
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1 tabular-nums">
                <span className="text-2xl font-black text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className={`text-sm font-bold flex items-center gap-1 ${
                  isPositive ? 'text-emerald-400' : 'text-rose-400'
                }`}>
                  {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  {formatPercent(priceChange)}
                </span>
                <span className="text-xs text-neutral-400">
                  Объем: {isStock ? stockAsset?.marketCap : cryptoAsset?.marketCap}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Diagram Toolbar: Timeframes and Chart Type Switch */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            {(['1D', '1W', '1M', '1Y'] as const).map(tf => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 font-semibold rounded transition-colors ${
                  timeframe === tf ? 'bg-neutral-800 text-amber-400 shadow-sm' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-lg border border-neutral-800 text-xs">
            <button
              onClick={() => setChartType('candles')}
              className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded transition-colors ${
                chartType === 'candles' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Японские свечи</span>
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`flex items-center gap-1.5 px-3 py-1 font-semibold rounded transition-colors ${
                chartType === 'line' ? 'bg-neutral-800 text-white' : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-blue-400" />
              <span>Линия</span>
            </button>
          </div>
        </div>

        {/* High-Performance SVG Chart */}
        <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 relative overflow-hidden">
          <div className="flex justify-between text-[10px] text-neutral-500 font-mono mb-2">
            <span>High: ${maxPrice.toFixed(2)}</span>
            <span>Live Technical Feed</span>
            <span>Low: ${minPrice.toFixed(2)}</span>
          </div>

          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight + 45}`}
            className="w-full h-56 select-none"
          >
            {/* Grid Lines */}
            {[0.25, 0.5, 0.75].map((ratio, idx) => (
              <line
                key={idx}
                x1="0"
                y1={chartHeight * ratio}
                x2={chartWidth}
                y2={chartHeight * ratio}
                stroke="#262626"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            ))}

            {/* Volume Separator */}
            <line
              x1="0"
              y1={chartHeight}
              x2={chartWidth}
              y2={chartHeight}
              stroke="#333333"
              strokeWidth="1"
            />

            {chartType === 'candles' ? (
              // Candlesticks rendering
              candles.map((candle, idx) => {
                const x = idx * candleSpacing + candleSpacing / 2;
                const isBullish = candle.close >= candle.open;
                const color = isBullish ? '#10B981' : '#EF4444';

                const highY = chartHeight - ((candle.high - minPrice) / priceRange) * chartHeight;
                const lowY = chartHeight - ((candle.low - minPrice) / priceRange) * chartHeight;
                const openY = chartHeight - ((candle.open - minPrice) / priceRange) * chartHeight;
                const closeY = chartHeight - ((candle.close - minPrice) / priceRange) * chartHeight;

                const bodyTop = Math.min(openY, closeY);
                const bodyHeight = Math.max(3, Math.abs(closeY - openY));

                // Volume Bar
                const volHeight = (candle.volume / maxVolume) * 38;
                const volY = chartHeight + 42 - volHeight;

                return (
                  <g key={idx} className="cursor-pointer">
                    {/* Wick Line */}
                    <line
                      x1={x}
                      y1={highY}
                      x2={x}
                      y2={lowY}
                      stroke={color}
                      strokeWidth="1.5"
                    />
                    {/* Candle Body */}
                    <rect
                      x={x - candleWidth / 2}
                      y={bodyTop}
                      width={candleWidth}
                      height={bodyHeight}
                      fill={color}
                      rx="1"
                    />
                    {/* Volume Bar */}
                    <rect
                      x={x - candleWidth / 2}
                      y={volY}
                      width={candleWidth}
                      height={volHeight}
                      fill={color}
                      opacity="0.35"
                    />
                  </g>
                );
              })
            ) : (
              // Line / Area chart rendering
              <g>
                <path
                  d={`M ${candles
                    .map((c, i) => {
                      const x = i * candleSpacing + candleSpacing / 2;
                      const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
                      return `${x},${y}`;
                    })
                    .join(' L ')}`}
                  fill="none"
                  stroke="#3B82F6"
                  strokeWidth="2.5"
                />
                <path
                  d={`M ${candleSpacing / 2},${chartHeight} L ${candles
                    .map((c, i) => {
                      const x = i * candleSpacing + candleSpacing / 2;
                      const y = chartHeight - ((c.close - minPrice) / priceRange) * chartHeight;
                      return `${x},${y}`;
                    })
                    .join(' L ')} L ${chartWidth - candleSpacing / 2},${chartHeight} Z`}
                  fill="url(#blueGradient)"
                  opacity="0.25"
                />
                <defs>
                  <linearGradient id="blueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                  </linearGradient>
                </defs>
              </g>
            )}
          </svg>

          <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
            <span>09:30 Открытие</span>
            <span>Текущая биржевая сессия</span>
            <span>16:00 Закрытие</span>
          </div>
        </div>

        {/* Live Order Execution Center */}
        <div className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-neutral-400">
              В вашем портфеле: <strong className="text-white">{ownedAmount} {asset.symbol}</strong> ({formatExactMoney(ownedAmount * currentPrice)})
            </span>
            <span className="text-neutral-400">
              Доступно наличных: <strong className="text-emerald-400">{formatExactMoney(playerCash)}</strong>
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full flex items-center gap-2">
              <label className="text-xs text-neutral-400 whitespace-nowrap">Количество:</label>
              <input
                type="number"
                min="1"
                value={tradeAmount}
                onChange={e => setTradeAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-neutral-900 border border-neutral-700 px-3 py-2 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleMaxBuy}
                className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-semibold"
              >
                Max Buy
              </button>
              <button
                onClick={handleMaxSell}
                className="px-2.5 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-xs font-semibold"
              >
                Max Sell
              </button>
            </div>

            <div className="text-right whitespace-nowrap text-xs">
              <span className="text-neutral-400 block text-[10px]">Сумма сделки</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {formatExactMoney(totalCost)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button
              onClick={() => {
                onTrade('BUY', tradeAmount);
                sounds.playCash();
              }}
              disabled={playerCash < totalCost}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              Купить {tradeAmount} {asset.symbol}
            </button>

            <button
              onClick={() => {
                onTrade('SELL', tradeAmount);
                sounds.playCash();
              }}
              disabled={ownedAmount < tradeAmount}
              className="py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              Продать {tradeAmount} {asset.symbol}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
