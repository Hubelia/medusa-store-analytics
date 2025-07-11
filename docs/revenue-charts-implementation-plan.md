# Implementation Plan – Sales Tab Enhancements

## Goal
Add three new charts to the Sales analytics tab:
1. **Total Revenue (pre-shipping)**
2. **Total Shipping**
3. **Total Taxes**

These charts will respect the existing date-range, comparison, and order-status filters used throughout the analytics dashboard.

---

## High-Level Steps
1. **Backend – Data Layer**
   • Extend analytics services to calculate the three aggregates for the selected date range(s).
2. **Backend – API Layer**
   • Expose a lightweight endpoint (or extend the current Sales endpoint) that returns the required totals.
3. **Frontend – Data Fetching**
   • Create a React hook (e.g. `useSalesTotals`) leveraging SWR/React-Query to call the new API.
4. **Frontend – UI Components**
   • Build three reusable chart cards (bar/line/area) displaying totals and optional comparison deltas.
5. **Integration – SalesTab**
   • Import the new components and add them to the grid layout in `sales.tsx`.
6. **Testing**
   • Unit-test service calculations & API serialization.
   • Component tests for the new charts (rendering, loading state, comparison logic).
7. **Docs & Demo**
   • Update README and screenshots.

---

## Detailed Checklist

### 1. Backend (detailed)
- [x] **Define output shape**  
      Create a new TypeScript interface `SalesTotalsResult` alongside existing result types in `services/salesAnalytics.ts`:
      ```ts
      export type SalesTotalsResult = {
        currencyCode: string
        currencyDecimalDigits: number
        dateRangeFrom?: number
        dateRangeTo?: number
        dateRangeFromCompareTo?: number
        dateRangeToCompareTo?: number
        current: {
          revenuePreShipping: string
          shipping: string
          taxes: string
        }
        previous: {
          revenuePreShipping: string
          shipping: string
          taxes: string
        }
      }
      ```
- [x] **Extend `SalesAnalyticsService`**  
  1. Add a new public method `getTotals(...)` with the same signature style as `getOrdersSales`.  
  2. Accept parameters: `(orderStatuses: OrderStatus[], currencyCode: string, from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date)` and return `Promise<SalesTotalsResult>`.
  3. Inside the method:
     - Convert `orderStatuses` to string array exactly as in existing helpers.
     - Derive `startQueryFrom` (or `dateRangeFromCompareTo`) logic identical to `getOrdersSales` to support **all-time** queries.
     - **Comparison path** (`from` & `dateRangeFromCompareTo` provided):
       ```sql
       SELECT
         CASE WHEN o.created_at < :from AND o.created_at >= :dateRangeFromCompareTo THEN 'previous' ELSE 'current' END AS type,
         SUM(o.total - o.shipping_total)              AS revenue_pre_shipping,
         SUM(o.shipping_total)                        AS shipping,
         SUM(o.tax_total)                             AS taxes
       FROM order o
       WHERE o.created_at >= :dateRangeFromCompareTo
         AND o.currency_code = :currencyCode
         AND o.status IN (:...orderStatuses)
       GROUP BY type;
       ```
     - **Single-period path** (no comparison): same query without `CASE` grouping; just aggregate everything since `startQueryFrom`.
     - Transform SQL response into the `SalesTotalsResult` structure, converting numeric DB sums to **string** to stay consistent with existing services.
     - Use existing helper `getDecimalDigits(currencyCode)` for formatting meta.
- [x] **Update API route**  (`api/admin/sales-analytics/[kind]/route.ts`)
  1. Introduce a new `kind` value: **`totals`**.
  2. Require `currencyCode` query param (mirrors `history`).
  3. Map directly to `salesAnalyticsService.getTotals(...)` and return `{ analytics: result }`.
- [x] **Wire-up container (if needed)**  — `SalesAnalyticsService` is already registered in the Medusa container, so no additional wiring is required.
- [x] **Currency considerations**  
      All aggregated fields are stored in smallest currency unit (cents). Return raw sums as strings; UI layer will format with `amountToDisplay`.

### 2. Frontend – Data Fetching
- [x] Create `useSalesTotals` hook in `ui-components/sales/` that accepts `orderStatuses`, `dateRange`, `dateRangeCompareTo`.
- [x] Add SWR key & fetcher; parse API response into usable format.

### 3. Frontend – Chart Components
- [x] ✅ `sales-total-revenue-chart.tsx` - **Time-series chart with ChartCurrentPrevious**
- [x] ✅ `sales-total-shipping-chart.tsx` - **Time-series chart with ChartCurrentPrevious**  
- [x] ✅ `sales-total-taxes-chart.tsx` - **Time-series chart with ChartCurrentPrevious**
- [x] ✅ Each card to show:
  - [x] ✅ Main metric (formatted currency)
  - [x] ✅ Optional comparison % change (if `compareEnabled`)
  - [x] ✅ **Full time-series area charts** showing trends over time
  - [x] ✅ **Comparison mode** with current vs previous period overlays
  - [x] ✅ **Interactive tooltips** with date and value information

### 4. Integration – SalesTab Layout
- [x] Import new components in `v1/src/ui-components/tabs/sales.tsx`.
- [x] Decide layout (e.g. 3 cards in a single row on desktops, 2x + 1 on tablets).
- [x] Pass through existing props (`orderStatuses`, `dateRange`, `dateRangeCompareTo`, `compareEnabled`).

### 5. Styling & UX
- [ ] Follow Medusa UI guidelines.
- [ ] Use consistent color palette (revenue – primary, shipping – info, taxes – warning).
- [ ] Ensure accessibility (aria-labels, friendly tooltip text).

### 6. Testing
- [ ] Jest unit tests for service helpers.
- [ ] React Testing Library tests for each chart card.
- [ ] Cypress/E2E happy-path flow (optional).

### 7. Documentation
- [ ] Add screenshot to `docs/` folder.
- [ ] Update `README.md` with usage instructions and new analytics insights.

---

## Estimated Timeline
| Task | Estimate |
|------|----------|
| Backend changes | ½ day |
| Frontend hooks & components | 1 day |
| Integration & styling | ½ day |
| Tests & docs | ½ day |

Total: **~2–2.5 developer days**

---

## ✅ **Implementation Complete!**

### **What Was Built**
The revenue charts feature has been successfully implemented with **full time-series visualization**:

#### **Backend Enhancements**
- ✅ **Two API endpoints**: `totals` (aggregate values) and `totals-history` (time-series data)
- ✅ **New service methods**: `getTotals()` and `getTotalsHistory()` with date grouping logic
- ✅ **Time-series data structure**: Groups orders by date resolution (day/month) with proper aggregation
- ✅ **Comparison support**: Handles both single-period and comparison modes

#### **Frontend Features**
- ✅ **Time-series charts**: Each component shows trends over time using `ChartCurrentPrevious`
- ✅ **Interactive visualizations**: Area charts with tooltips, legends, and comparison overlays
- ✅ **Responsive design**: Works on all screen sizes with proper grid layout
- ✅ **Data hooks**: `useTotalsHistory` for time-series data fetching
- ✅ **Complete integration**: All three charts integrated into SalesTab layout

#### **Chart Components**
1. **Revenue Chart**: Shows revenue (pre-shipping) trends over time
2. **Shipping Chart**: Displays shipping cost trends over time  
3. **Taxes Chart**: Visualizes tax collection trends over time

Each chart includes:
- Large currency total display
- Comparison icons and percentage changes
- Full-featured time-series area chart
- Interactive tooltips with date/value information
- Current vs previous period comparison (when enabled)

### **Technical Architecture**
- **Backend**: Uses `orderService.list()` method for data fetching (handles computed fields correctly)
- **Frontend**: Leverages existing `ChartCurrentPrevious` component for consistent chart styling
- **Data Flow**: `useTotalsHistory` → API → `getTotalsHistory()` → grouped order data → time-series response

The implementation provides the same rich analytical experience as the existing sales chart, but broken down into the three key revenue components!

---

_This document serves as the source of truth for the implementation. ✅ **Status: Complete**_