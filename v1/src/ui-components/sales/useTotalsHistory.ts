/*
 * Copyright 2024 RSC-Labs, https://rsoftcon.com/
 *
 * MIT License
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { useAdminCustomQuery } from "medusa-react"
import type { DateRange, OrderStatus } from "../utils/types";
import { TotalsHistoryResponse } from "./types";

type AdminTotalsHistoryQuery = {
  orderStatuses: string[],
  currencyCode: string,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

export const useTotalsHistory = (orderStatuses: OrderStatus[], currencyCode: string, dateRange?: DateRange, dateRangeCompareTo?: DateRange) => {
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminTotalsHistoryQuery,
    TotalsHistoryResponse
  >(
    `/sales-analytics/totals-history`,
    [orderStatuses, currencyCode, dateRange, dateRangeCompareTo],
    {
      orderStatuses: Object.values(orderStatuses),
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
      currencyCode: currencyCode
    }
  )

  return {
    data,
    isLoading,
    isError,
    error
  }
} 