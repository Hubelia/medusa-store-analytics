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

import { Container } from "@medusajs/ui"
import { 
  DiscountsTopCard,
  SalesChannelPopularityCard,
  OrderStatus,
  SalesOverviewCard,
  RefundsOverviewCard
} from '..';
import type { DateRange } from '..';
import { Grid } from "@mui/material";
import { SalesTotalRevenueChart } from "../sales/sales-total-revenue-chart";
import { SalesTotalShippingChart } from "../sales/sales-total-shipping-chart";
import { SalesTotalTaxesChart } from "../sales/sales-total-taxes-chart";
import { useState } from 'react';
import { useAdminRegions } from "medusa-react"

const SalesTab = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {
    
    const { regions } = useAdminRegions();
    const [ currencyCode ] = useState<string | undefined>(regions?.[0]?.currency_code || 'usd');

    return (
      <Grid container spacing={2}>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesOverviewCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesChannelPopularityCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <RefundsOverviewCard dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo} compareEnabled={compareEnabled}/>
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <DiscountsTopCard orderStatuses={orderStatuses} dateRange={dateRange} dateRangeCompareTo={dateRangeCompareTo}/>
          </Container>
        </Grid>
        
        {/* Revenue Charts - First Row */}
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesTotalRevenueChart 
              orderStatuses={orderStatuses} 
              currencyCode={currencyCode || 'usd'} 
              dateRange={dateRange} 
              dateRangeCompareTo={dateRangeCompareTo} 
              compareEnabled={compareEnabled}
            />
          </Container>
        </Grid>
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesTotalShippingChart 
              orderStatuses={orderStatuses} 
              currencyCode={currencyCode || 'usd'} 
              dateRange={dateRange} 
              dateRangeCompareTo={dateRangeCompareTo} 
              compareEnabled={compareEnabled}
            />
          </Container>
        </Grid>
        
        {/* Revenue Charts - Second Row */}
        <Grid item xs={6} md={6} xl={6}>
          <Container>
            <SalesTotalTaxesChart 
              orderStatuses={orderStatuses} 
              currencyCode={currencyCode || 'usd'} 
              dateRange={dateRange} 
              dateRangeCompareTo={dateRangeCompareTo} 
              compareEnabled={compareEnabled}
            />
          </Container>
        </Grid>
      </Grid> 
    )
}

export default SalesTab