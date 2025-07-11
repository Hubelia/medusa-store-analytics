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

import { CircularProgress, Grid } from "@mui/material";
import { CustomAlert } from "../common/custom-alert";
import { PercentageComparison } from "../common/percentage-comparison";
import { IconComparison } from "../common/icon-comparison";
import { useTotalsHistory } from "./useTotalsHistory";
import { amountToDisplay } from "../utils/helpers";
import type { DateRange, OrderStatus } from "../utils/types";
import { ChartCurrentPrevious } from "../common/chart-components";

export const SalesTotalTaxesChart = ({orderStatuses, currencyCode, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], currencyCode: string, dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled?: boolean}) => {
  
  const { data, isLoading, isError, error } = useTotalsHistory(orderStatuses, currencyCode, dateRange, dateRangeCompareTo);

  if (isLoading) {
    return <CircularProgress size={12}/>
  }

  if (isError) {
    const trueError = error as any;
    const errorText = `Error when loading data. It shouldn't have happened - please raise an issue. For developer: ${trueError?.response?.data?.message}`
    return <CustomAlert variant="error" children={errorText} />
  }

  if (data.analytics == undefined) {
    return <h3>Cannot get totals history</h3>
  }

  // Calculate overall totals for the number display
  const currentTaxes = data.analytics.current.reduce((sum, item) => sum + parseInt(item.taxes), 0);
  const previousTaxes = data.analytics.previous.length > 0 ? 
    data.analytics.previous.reduce((sum, item) => sum + parseInt(item.taxes), 0) : undefined;

  // Prepare chart data
  const rawChartData = {
    current: data.analytics.current.map(currentData => {
      return {
        date: new Date(currentData.date),
        value: amountToDisplay(parseInt(currentData.taxes), data.analytics.currencyDecimalDigits)
      };
    }),
    previous: data.analytics.previous.map(previousData => {
      return {
        date: new Date(previousData.date),
        value: amountToDisplay(parseInt(previousData.taxes), data.analytics.currencyDecimalDigits)
      };
    }),
  };

  return (
    <Grid container paddingBottom={2} spacing={3}>
      <Grid item xs={12}>
        <h2>Total Taxes</h2>
      </Grid>
      <Grid item xs={12}>
        <Grid container alignItems={'center'} spacing={2}>
          <Grid item>
            <h1>
              {amountToDisplay(currentTaxes, data.analytics.currencyDecimalDigits)} {data.analytics.currencyCode.toUpperCase()}
            </h1>
          </Grid>
          {compareEnabled && data.analytics.dateRangeFromCompareTo && 
          <Grid item>
            <Grid container alignItems={'center'}>
              <Grid item>
                <IconComparison current={currentTaxes} previous={previousTaxes}/>
              </Grid>
              {previousTaxes !== undefined && <Grid item>
                <PercentageComparison 
                  current={amountToDisplay(currentTaxes, data.analytics.currencyDecimalDigits)} 
                  label={data.analytics.currencyCode.toUpperCase()} 
                  previous={amountToDisplay(previousTaxes, data.analytics.currencyDecimalDigits)}
                />
              </Grid>}
            </Grid>
          </Grid>
          }
        </Grid>
      </Grid>
      {data.analytics.dateRangeFrom && (
        <Grid item xs={12}>
          <h3>Taxes by time</h3>
          <ChartCurrentPrevious          
            rawChartData={rawChartData} 
            fromDate={new Date(data.analytics.dateRangeFrom)} 
            toDate={new Date(data.analytics.dateRangeTo)} 
            fromCompareDate={data.analytics.dateRangeFromCompareTo ? new Date(data.analytics.dateRangeFromCompareTo) : undefined}
            toCompareDate={data.analytics.dateRangeToCompareTo ? new Date(data.analytics.dateRangeToCompareTo) : undefined}
            compareEnabled={compareEnabled}
          />
        </Grid>
      )}
    </Grid>
  )
} 