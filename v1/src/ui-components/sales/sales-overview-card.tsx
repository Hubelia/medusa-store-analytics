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

import { Select as MedusaSelect, Select, Text } from "@medusajs/ui";
import { CustomAlert } from "../common/custom-alert";
import { CurrencyDollar } from "@medusajs/icons";
import { CircularProgress, Grid, SelectProps } from "@mui/material";
import type { DateRange, OrderStatus } from "../utils/types";
import { SalesNumber } from "./sales-number-overview";
import { useState } from 'react';
import { useAdminRegions } from "medusa-react"
import { SalesByNewChart } from "./sales-total-chart";
import { useAdminCustomQuery } from "medusa-react"
import { SalesHistoryResponse } from "./types";

type AdminSalesStatisticsQuery = {
  orderStatuses: string[],
  currencyCode: string,
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

const SalesDetails = ({orderStatuses, currencyCode, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], currencyCode: string, dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  const { data, isLoading, isError, error } = useAdminCustomQuery<
    AdminSalesStatisticsQuery,
    SalesHistoryResponse
  >(
    `/sales-analytics/history`,
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

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (isError) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <CustomAlert variant="error" children={errorText} />
  }

  if (data.analytics == undefined) {
    return (
      <Grid item xs={12} md={12}> 
        <h3>Cannot get orders</h3>
      </Grid>
    )
  }

  if (data.analytics.dateRangeFrom) {
    return (
      <>
        <Grid item xs={12} md={12}>
          <SalesNumber salesHistoryResponse={data} compareEnabled={compareEnabled}/>
        </Grid>
        <Grid item xs={12} md={12}>
          <SalesByNewChart salesHistoryResponse={data} compareEnabled={compareEnabled}/> 
        </Grid>
      </>
    )
  } else {
    return (
      <Grid item xs={12} md={12}> 
        <h3>No orders</h3>
      </Grid>
    )
  }
}

export const SalesOverviewCard = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

  const { regions, isLoading } = useAdminRegions();
  const [ value , setValue ] = useState<string | undefined>(regions?.[0]?.currency_code);
  
    const selectProps = {
      value: value,
      onValueChange: setValue,
      disabled: isLoading || !regions || !regions.length
    } as any

  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12} md={12}>
          <Grid container spacing={2} alignItems='center'>
            <Grid item>
              <CurrencyDollar/>
            </Grid>
            <Grid item>
              <h2>
                Total sales
              </h2>
            </Grid>
            <Grid item>
              <div className="w-[256px]">
                <MedusaSelect {...selectProps}>
                  <MedusaSelect.Trigger>
                    <MedusaSelect.Value placeholder={isLoading ? "Loading..." : "Select currency"} />
                  </MedusaSelect.Trigger>
                  <MedusaSelect.Content>
                    {isLoading && (
                      <div className="flex items-center justify-center p-2">
                        <CircularProgress size={20} />
                      </div>
                    )}
                    {regions && !regions.length && (
                      <div className="p-2">
                        <Text>No regions</Text>
                      </div>
                    )}
                    {regions && regions.length > 0 &&
                      [...new Set(regions.map(region => region.currency_code))].map((currencyCode) => (
                        <MedusaSelect.Item key={currencyCode} value={currencyCode}>
                          {currencyCode.toUpperCase()}
                        </MedusaSelect.Item>
                      ))
                    }
                  </MedusaSelect.Content>
                </MedusaSelect>
              </div>
            </Grid>
          </Grid>
      </Grid>
      {value ? <SalesDetails orderStatuses={orderStatuses} currencyCode={value} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/> : 
        <Grid item>
          <h2>Please select a currency</h2>
        </Grid>
      }
    </Grid>
  )
}