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
import { SalesTotalsResponse } from "./types";

type AdminSalesTotalsQuery = {
  orderStatuses: string[],
  currencyCode: string,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

export const useSalesTotals = (
  orderStatuses: OrderStatus[], 
  currencyCode: string, 
  dateRange?: DateRange, 
  dateRangeCompareTo?: DateRange
) => {
  return useAdminCustomQuery<AdminSalesTotalsQuery, SalesTotalsResponse>(
    `/sales-analytics/totals`,
    [orderStatuses, currencyCode, dateRange, dateRangeCompareTo],
    {
      orderStatuses: Object.values(orderStatuses),
      dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
      dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
      dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
      dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
      currencyCode: currencyCode
    }
  );
}; 