# Monti adapter report — generated from Availability of items and pending orders-2026-06-04.xlsx

- Source updated on: **2026-06-04**
- SKUs: **112**  ·  master rows 110  ·  lot rows 110
- Lots: **110**  ·  in-transit lots (ETA parsed): **28**
- SKUs with on-hand stock: **43**  ·  with in-transit: **18**

## Commitments parsed from notes
- Auto-extracted (confident): **21**
- Flagged for review: **73**

### Confident commitments
- `20150` **Tony 55/mo**  ← _average purchase TONY 55 per month_
- `01021` **INACTIVE**  ← _prodotto senza mercato_
- `01126` **INACTIVE** (last 2015)  ← _prodotto senza mercato, ultimo movimento 2015_
- `02073` **Cowbell 50/mo** (also: Tony, ACE Endico, Baldor)  ← _Cowbell monthly plan 50x, average purchase TONY 10_
- `02302` **INACTIVE**  ← _prodotto senza mercato_
- `03003` **DeKalb 30/mo** · reorder <30  ← _De Kalb 30 per month, next container if we go down_
- `03057` **INACTIVE**  ← _prodotto senza mercato_
- `04181` **Cowbell 5/mo**  ← _CowBell 5x per monthly plan_
- `20229` **Cowbell 15/mo**  ← _10-15x monthly plan Cowbell_
- `05411` **Greg 12/mo**  ← _Greg 12x monthly plan and ACE, we monitor, next_
- `20450` **INACTIVE**  ← _prodotto senza mercato_
- `20451` **INACTIVE**  ← _prodotto senza mercato?_
- `20452` **INACTIVE**  ← _prodotto senza mercato_
- `20453` **INACTIVE**  ← _prodotto senza mercato?_
- `20700` **INACTIVE**  ← _prodotto senza mercato_
- `20701` **INACTIVE**  ← _prodotto senza mercato - CHIEDERE PER DETWILER A S_
- `20702` **INACTIVE**  ← _prodotto senza mercato_
- `20703` **INACTIVE**  ← _prodotto senza mercato_
- `20719` **INACTIVE**  ← _prodotto senza mercato_
- `20720` **INACTIVE**  ← _prodotto senza mercato_
- `40140` **INACTIVE**  ← _prodotto senza mercato_

### Needs review (sample)
- `01032` [customer=Cowbell, alsoBuy=['DeKalb']] ← _lo comprano solo Cowbell e Dekalb, 18? prossimo container?_
- `01034` [customer=SK Food] ← _only for SK Food when ordered_
- `01101` ← _2x al mese Olio e Olive_
- `20162` [customer=Greg] ← _15x Greg monthly plan, we monitor_
- `01154` ← _senza ordini in mano, non lo facciamo spedire_
- `20163` [customer=TJ] ← _only for TJ_
- `01155` [customer=Lettieri] ← _Lettieri? he asked last time on 19 August 2025_
- `01174` ← _2x al mese Olio e Olive_
- `01186` [customer=Veroni, alsoBuy=['Creminelli']] ← _always 1 pallet available, not more. Veroni-Creminelli preor_
- `01190` ← _no project in working_
- `01269` ← _only for Cheese Importers, was the first order good?  He nee_
- `01299` [customer=Levoni] ← _solo per Levoni su ordinazione_
- `02005` [customer=Alma, reorderBelowCases=33] ← _Alma, < 33?_
- `02091` [casesPerPeriod=2] ← _2x month Olio e Olive_
- `02206` [customer=Cowbell] ← _3x CowBell monthly plan?_
- `03010` [customer=ACE Endico, alsoBuy=['DeKalb']] ← _ACE Endico? DeKalb?_
- `03014` [customer=Selected, reorderBelowCases=24] ← _Selected, <24?_
- `03023` [customer=DeKalb] ← _occasionally DeKalb, as long as we are >20, no thanks_
- `03044` [casesPerPeriod=2] ← _2x mese Olio e Olive_
- `03073` ← _2x al mese Olio e Olive_
- `04028` [reorderBelowCases=60] ← _monitor <60?_
- `04046` [customer=Selected, alsoBuy=['Tama', 'ACE Endico']] ← _Selected - Tama - ACE ENDICO_
- `04067` ← _product without a market, last movement 2019_
- `04145` [customer=Lettieri] ← _Lettieri doesn't order much_
- `04154` [customer=Cowbell, reorderBelowCases=8] ← _It doesn't sell much, Cowbell buys a little bit, <8_

## Pending orders → customer cadence (orders in file)
- Baldor: 30
- Cowbell: 18
- GORDON: 16
- Lettieri: 15
- Selected: 15
- GFI: 15
- SK Food: 13
- ACE Endico: 11
- Tony's: 10
- Dekalb: 9
- Di Palo: 7
- HEB: 7

## Canceled POs (missed-sale seed): 7
- 2025-10-17 · Selected · 11967
- 2025-11-25 · GFI · 543557
- 2026-01-24 · CENTO · 79540
- 2026-02-08 · Selected · 12276
- 2026-03-02 · Tama · 195577
- 2026-04-17 · Cowbell · MT041426
- 2026-05-18 · GFI · 285712