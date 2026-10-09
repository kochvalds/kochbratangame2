import React from 'react';
import { Scale, ShieldCheck, AlertTriangle, DollarSign, Building, FileCheck, CheckCircle2 } from 'lucide-react';
import { TaxSystemState } from '../../types/game';
import { formatMoney, formatExactMoney, formatPercent } from '../../utils/formatters';
import { sounds } from '../../utils/audio';

interface TaxOfficeViewProps {
  taxSystem: TaxSystemState;
  cash: number;
  monthlyRevenue: number;
  netWorth: number;
  onPayTaxes: () => void;
  onToggleAutoPay: () => void;
  onUnlockOptimization: (type: 'lawyers' | 'monaco' | 'swiss') => void;
}

export function TaxOfficeView({
  taxSystem,
  cash,
  monthlyRevenue,
  netWorth,
  onPayTaxes,
  onToggleAutoPay,
  onUnlockOptimization
}: TaxOfficeViewProps) {
  // Estimated monthly tax calculation
  const monthlyTax = Math.round(monthlyRevenue * taxSystem.effectiveTaxRate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">
              Налоговое Управление & Офшорный Траст
            </h2>
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Оптимизируйте налоги легальными инструментами: от швейцарских холдингов в кантоне Цуг до монакских дискреционных трастов.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-neutral-950 px-4 py-2 rounded-xl border border-neutral-800 text-xs">
          <div>
            <span className="text-neutral-500 block text-[10px]">Базовая ставка</span>
            <span className="text-neutral-300 font-semibold">21.5%</span>
          </div>
          <div className="w-px h-6 bg-neutral-800" />
          <div>
            <span className="text-neutral-500 block text-[10px]">Ваша эффективная ставка</span>
            <span className="text-emerald-400 font-bold text-sm">
              {(taxSystem.effectiveTaxRate * 100).toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-neutral-400 text-xs block">Налог к уплате за месяц</span>
          <span className="text-lg font-bold text-amber-400 mt-1 block">
            {formatExactMoney(taxSystem.accumulatedTaxDue || monthlyTax)}
          </span>
          <span className="text-[11px] text-neutral-500">Списывается раз в месяц</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-neutral-400 text-xs block">Сэкономлено на налогах</span>
          <span className="text-lg font-bold text-emerald-400 mt-1 block">
            {formatMoney(taxSystem.totalTaxSaved)}
          </span>
          <span className="text-[11px] text-neutral-500">За все время игры</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-neutral-400 text-xs block">Всего уплачено налогов</span>
          <span className="text-lg font-bold text-neutral-300 mt-1 block">
            {formatMoney(taxSystem.totalTaxPaid)}
          </span>
          <span className="text-[11px] text-neutral-500">В государственную казну</span>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl">
          <span className="text-neutral-400 text-xs block">Риск Налоговой Проверки</span>
          <span className={`text-lg font-bold mt-1 block ${
            taxSystem.auditRiskPercent > 20 ? 'text-rose-400' : 'text-emerald-400'
          }`}>
            {taxSystem.auditRiskPercent}%
          </span>
          <span className="text-[11px] text-neutral-500">
            {taxSystem.underAudit ? 'Идет проверка ФНС!' : 'Статус: Чисто'}
          </span>
        </div>
      </div>

      {/* Payment Actions */}
      <div className="bg-neutral-900 border border-neutral-800 p-6 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-white text-sm">Уплата начисленных налогов</h3>
          <p className="text-xs text-neutral-400 mt-0.5">
            Своевременная уплата налогов сводит к нулю вероятность ареста счетов и штрафов.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleAutoPay}
            className={`px-4 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              taxSystem.autoPayTaxes
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : 'bg-neutral-800 border-neutral-700 text-neutral-400'
            }`}
          >
            {taxSystem.autoPayTaxes ? '✓ Автоуплата включена' : 'Включить автоуплату'}
          </button>

          <button
            onClick={() => {
              onPayTaxes();
              sounds.playCash();
            }}
            disabled={cash < (taxSystem.accumulatedTaxDue || monthlyTax)}
            className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold rounded-lg text-xs transition-colors shadow disabled:opacity-40"
          >
            Оплатить налоги ({formatExactMoney(taxSystem.accumulatedTaxDue || monthlyTax)})
          </button>
        </div>
      </div>

      {/* Offshore & Legal Optimizations */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-neutral-300 uppercase tracking-wider">
          Инструменты оптимизации и снижения налоговой ставки
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Attorneys */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold text-xs">Юридический отдел</span>
                {taxSystem.offshoreAccountantsHired && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Активно
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white text-base">Топовые налоговые юристы</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Команда аудиторов Big-4 находит законные налоговые вычеты, ускоренную амортизацию оборудования и снижает налог на -6%.
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-xs space-y-1">
                <div className="text-emerald-400 font-semibold">Снижение ставки: -6.0%</div>
                <div className="text-neutral-400">Стоимость контракта: $35,000</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800">
              {taxSystem.offshoreAccountantsHired ? (
                <div className="text-center text-xs text-emerald-400 font-semibold py-2">
                  Юристы работают на вас
                </div>
              ) : (
                <button
                  onClick={() => onUnlockOptimization('lawyers')}
                  disabled={cash < 35000}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                >
                  Нанять юристов ($35,000)
                </button>
              )}
            </div>
          </div>

          {/* Monaco Trust */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold text-xs">Офшорный Траст</span>
                {taxSystem.monacoTrustRegistered && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Активно
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white text-base">Дискреционный Траст Монако</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Перевод прав владения суперкарами, джетами и долями в компаниях в закрытый траст княжества Монако с нулевым налогом на прирост капитала.
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-xs space-y-1">
                <div className="text-emerald-400 font-semibold">Снижение ставки: -8.0%</div>
                <div className="text-neutral-400">Стоимость регистрации: $120,000</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800">
              {taxSystem.monacoTrustRegistered ? (
                <div className="text-center text-xs text-emerald-400 font-semibold py-2">
                  Траст зарегистрирован в Монако
                </div>
              ) : (
                <button
                  onClick={() => onUnlockOptimization('monaco')}
                  disabled={cash < 120000}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                >
                  Открыть траст ($120,000)
                </button>
              )}
            </div>
          </div>

          {/* Swiss Zug Holding */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-amber-400 font-bold text-xs">Швейцарский Холдинг</span>
                {taxSystem.swissZugHoldingSetup && (
                  <span className="text-emerald-400 text-xs font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Активно
                  </span>
                )}
              </div>
              <h4 className="font-bold text-white text-base">Холдинг в Кантоне Цуг (Crypto Valley)</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Финальная ступень глобального структурирования активов: швейцарская юрисдикция с максимальной защитой капитала и ставкой налога 2.5%!
              </p>
              <div className="mt-4 pt-3 border-t border-neutral-800 text-xs space-y-1">
                <div className="text-emerald-400 font-semibold">Снижение ставки: -5.0%</div>
                <div className="text-neutral-400">Стоимость инкорпорации: $350,000</div>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-neutral-800">
              {taxSystem.swissZugHoldingSetup ? (
                <div className="text-center text-xs text-emerald-400 font-semibold py-2">
                  Швейцарская холдинговая структура активна
                </div>
              ) : (
                <button
                  onClick={() => onUnlockOptimization('swiss')}
                  disabled={cash < 350000}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold rounded-lg transition-colors disabled:opacity-40"
                >
                  Инкорпорировать холдинг ($350,000)
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
