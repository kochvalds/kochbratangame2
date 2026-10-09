import React, { useState } from 'react';
import {
  TrendingUp,
  Sparkles,
  Building2,
  Search,
  Filter,
  BarChart2,
  DollarSign,
  ChevronRight,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { StockAsset, CryptoAsset, RealEstateProperty } from '../../types/game';
import { formatMoney, formatExactMoney, formatPercent } from '../../utils/formatters';
import { TradingDiagramModal } from './TradingDiagramModal';
import { sounds } from '../../utils/audio';

interface InvestmentsViewProps {
  stocks: StockAsset[];
  cryptos: CryptoAsset[];
  realEstate: RealEstateProperty[];
  cash: number;
  onTradeStock: (stock: StockAsset, action: 'BUY' | 'SELL', amount: number) => void;
  onTradeCrypto: (crypto: CryptoAsset, action: 'BUY' | 'SELL', amount: number) => void;
  onBuyProperty: (property: RealEstateProperty) => void;
}

export function InvestmentsView({
  stocks,
  cryptos,
  realEstate,
  cash,
  onTradeStock,
  onTradeCrypto,
  onBuyProperty
}: InvestmentsViewProps) {
  // Modal state
  const [selectedAsset, setSelectedAsset] = useState<{ asset: StockAsset | CryptoAsset; isCrypto: boolean } | null>(null);

  // Real estate filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('ALL');
  const [showOnlyOwned, setShowOnlyOwned] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const itemsPerPage = 12;

  // Distinct cities from real estate
  const uniqueCities = React.useMemo(() => {
    const set = new Set<string>();
    realEstate.forEach(p => set.add(p.city));
    return Array.from(set);
  }, [realEstate]);

  // Filtered properties
  const filteredProperties = React.useMemo(() => {
    return realEstate.filter(prop => {
      if (showOnlyOwned && !prop.isOwned) return false;
      if (selectedCity !== 'ALL' && prop.city !== selectedCity) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return prop.name.toLowerCase().includes(q) || prop.location.toLowerCase().includes(q);
      }
      return true;
    });
  }, [realEstate, showOnlyOwned, selectedCity, searchQuery]);

  const totalPages = Math.ceil(filteredProperties.length / itemsPerPage) || 1;
  const paginatedProperties = filteredProperties.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const ownedPropertiesCount = realEstate.filter(p => p.isOwned).length;
  const totalRentalIncome = realEstate.filter(p => p.isOwned).reduce((acc, p) => acc + p.monthlyRentalYield, 0);

  return (
    <div className="space-y-8">
      {/* 1. Stocks & Crypto Header with Prompt to Click for Diagram */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
              <span>Мировые Биржи: Акции & Криптовалюты</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              💡 <strong>Кликните на любую акцию или криптовалюту</strong>, чтобы открыть интерактивную свечную диаграмму и терминал покупки/продажи!
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Stocks Column */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-semibold uppercase tracking-wider">Фондовый рынок (NYSE & NASDAQ)</span>
              <span>Клик для диаграммы</span>
            </div>

            <div className="space-y-2.5">
              {stocks.map(stock => {
                const change = ((stock.price - stock.prevPrice) / stock.prevPrice) * 100;
                const isPositive = change >= 0;
                return (
                  <div
                    key={stock.symbol}
                    onClick={() => {
                      setSelectedAsset({ asset: stock, isCrypto: false });
                      sounds.playClick();
                    }}
                    className="p-3.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group hover:bg-neutral-850"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-bold text-xs text-white group-hover:border-amber-500/40">
                        {stock.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{stock.symbol}</span>
                          <span className="text-xs text-neutral-400">{stock.name}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          В портфеле: {stock.sharesOwned} шт. ({formatMoney(stock.sharesOwned * stock.price)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right tabular-nums">
                        <span className="font-bold text-white text-sm block">${stock.price.toFixed(2)}</span>
                        <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(change)}
                        </span>
                      </div>
                      <BarChart2 className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Crypto Column */}
          <div className="lg:col-span-6 space-y-3">
            <div className="flex items-center justify-between text-xs text-neutral-400 px-1">
              <span className="font-semibold uppercase tracking-wider">Криптовалютная биржа (Spot & Margin)</span>
              <span>Клик для диаграммы</span>
            </div>

            <div className="space-y-2.5">
              {cryptos.map(crypto => {
                const change = ((crypto.price - crypto.prevPrice) / crypto.prevPrice) * 100;
                const isPositive = change >= 0;
                return (
                  <div
                    key={crypto.symbol}
                    onClick={() => {
                      setSelectedAsset({ asset: crypto, isCrypto: true });
                      sounds.playClick();
                    }}
                    className="p-3.5 bg-neutral-900 border border-neutral-800 hover:border-amber-500/50 rounded-xl flex items-center justify-between cursor-pointer transition-all group hover:bg-neutral-850"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-neutral-950 border border-neutral-800 flex items-center justify-center font-bold text-xs text-amber-400 group-hover:border-amber-500/40">
                        {crypto.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-amber-400 text-sm">{crypto.symbol}</span>
                          <span className="text-xs text-neutral-400">{crypto.name}</span>
                        </div>
                        <span className="text-[11px] text-neutral-500">
                          В кошельке: {crypto.amountOwned.toFixed(2)} ({formatMoney(crypto.amountOwned * crypto.price)})
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right tabular-nums">
                        <span className="font-bold text-white text-sm block">${crypto.price.toFixed(2)}</span>
                        <span className={`text-[11px] font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {formatPercent(change)}
                        </span>
                      </div>
                      <BarChart2 className="w-4 h-4 text-neutral-500 group-hover:text-amber-400 transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Global Real Estate (300 Properties Catalog) */}
      <div className="space-y-6 pt-6 border-t border-neutral-800">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              <span>Мировой Каталог Элитной Недвижимости (300 Объектов)</span>
            </h3>
            <p className="text-xs text-neutral-400 mt-0.5">
              Виллы, пентхаусы и особняки в 15 мировых столицах. Купленная недвижимость приносит пассивный арендный доход каждый месяц!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-neutral-900 px-4 py-2 rounded-xl border border-neutral-800 text-xs">
            <div>
              <span className="text-neutral-500 block text-[10px]">В вашей собственности</span>
              <span className="text-amber-400 font-bold text-sm">{ownedPropertiesCount} / 300</span>
            </div>
            <div className="w-px h-6 bg-neutral-800" />
            <div>
              <span className="text-neutral-500 block text-[10px]">Арендный доход</span>
              <span className="text-emerald-400 font-bold text-sm">+{formatMoney(totalRentalIncome)}/мес</span>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию или району (например, Palm Jumeirah, Mayfair, Billionaires Row)..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-neutral-900 border border-neutral-800 pl-10 pr-4 py-2.5 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <select
              value={selectedCity}
              onChange={e => {
                setSelectedCity(e.target.value);
                setPage(1);
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-300 px-3 py-2.5 rounded-xl text-xs focus:outline-none focus:border-amber-500"
            >
              <option value="ALL">Все города (15 мировых столиц)</option>
              {uniqueCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>

            <button
              onClick={() => {
                setShowOnlyOwned(v => !v);
                setPage(1);
              }}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap border transition-colors ${
                showOnlyOwned
                  ? 'bg-amber-500 text-neutral-950 border-amber-400 font-bold'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
            >
              Только купленные ({ownedPropertiesCount})
            </button>
          </div>
        </div>

        {/* Real Estate Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginatedProperties.map(prop => (
            <div
              key={prop.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                prop.isOwned
                  ? 'bg-neutral-900 border-emerald-500/50 shadow-md'
                  : 'bg-neutral-900 border-neutral-800 hover:border-neutral-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-amber-400 font-bold flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {prop.city}
                  </span>
                  {prop.isOwned ? (
                    <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded flex items-center gap-1 text-[11px]">
                      <CheckCircle2 className="w-3 h-3" /> В собственности
                    </span>
                  ) : (
                    <span className="text-neutral-400 text-[11px]">{prop.imageTag}</span>
                  )}
                </div>

                <h4 className="font-bold text-white text-sm">{prop.name}</h4>
                <p className="text-[11px] text-neutral-400 mt-1 line-clamp-2">{prop.description}</p>

                <div className="mt-4 pt-3 border-t border-neutral-800 space-y-1.5 text-xs tabular-nums">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Стоимость покупки:</span>
                    <span className="font-semibold text-white">{formatMoney(prop.price)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Арендный доход:</span>
                    <span className="font-bold text-emerald-400">+{formatMoney(prop.monthlyRentalYield)}/мес</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-neutral-800">
                {prop.isOwned ? (
                  <div className="text-center text-xs text-emerald-400 font-bold py-2">
                    Сдается в аренду (+{formatMoney(prop.monthlyRentalYield)}/мес)
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onBuyProperty(prop);
                      sounds.playCash();
                    }}
                    disabled={cash < prop.price}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-xl transition-colors shadow disabled:opacity-40"
                  >
                    Купить недвижимость ({formatMoney(prop.price)})
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800 text-xs">
            <span className="text-neutral-400">
              Показано {paginatedProperties.length} из {filteredProperties.length} объектов недвижимости
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 disabled:opacity-40"
              >
                Назад
              </button>
              <span className="text-neutral-300 font-mono">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-300 disabled:opacity-40"
              >
                Вперед
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Trading Diagram Modal */}
      {selectedAsset && (
        <TradingDiagramModal
          asset={selectedAsset.asset}
          isCrypto={selectedAsset.isCrypto}
          playerCash={cash}
          onClose={() => setSelectedAsset(null)}
          onTrade={(action, amount) => {
            if (selectedAsset.isCrypto) {
              onTradeCrypto(selectedAsset.asset as CryptoAsset, action, amount);
            } else {
              onTradeStock(selectedAsset.asset as StockAsset, action, amount);
            }
          }}
        />
      )}
    </div>
  );
}
