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

import { OrderStatus, TransactionBaseService } from "@medusajs/medusa"
import { Order, OrderService } from "@medusajs/medusa"
import { calculateResolution, DateResolutionType } from "./utils/dateTransformations"
import { OrdersHistoryResult } from "./utils/types"
import { In } from "typeorm"

type OrdersHistory = {
  orderCount: string,
  date: string
}

export type OrdersCounts = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: number,
  previous: number
}

type InitialOrdersPaymentProvider = {
  orderCount: string,
  paymentProviderId: string
}

type OrdersPaymentProvider = {
  orderCount: string,
  percentage: string,
  paymentProviderId: string
}

type OrdersPaymentProviderPopularityResult = {
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
  current: OrdersPaymentProvider[]
  previous: OrdersPaymentProvider[]
}


export default class OrdersAnalyticsService extends TransactionBaseService {

  private readonly orderService: OrderService;
  private readonly orderRepository_;

  constructor(
    container,
  ) {
    super(container)
    this.orderService = container.orderService;
    this.orderRepository_ = container.orderRepository;
  }

  async getOrdersHistory(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersHistoryResult> {
    
    const orderStatusesAsStrings = Object.values(orderStatuses);
    if (orderStatusesAsStrings.length) {
      if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
        const resolution = calculateResolution(from);
        
        try {
          const query = this.activeManager_.withRepository(this.orderRepository_)
          .createQueryBuilder('order')
          .select(`
            CASE
              WHEN order.created_at < :from AND order.created_at >= :dateRangeFromCompareTo THEN 'previous'
              ELSE 'current'
            END AS type,
            date_trunc('${resolution}', order.created_at) AS date
          `)
          .setParameters({ from, dateRangeFromCompareTo })
          .addSelect('COUNT(order.id)', 'orderCount')
          .where(`created_at >= :dateRangeFromCompareTo`, { dateRangeFromCompareTo })
          .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });
    
          const orders = await query
          .groupBy('type, date')
          .orderBy('date, type',  'ASC')
          .getRawMany();
    
          const finalOrders: OrdersHistoryResult = orders.reduce((acc, entry) => {
            const type = entry.type;
            const date = entry.date;
            const orderCount = entry.orderCount;
            if (!acc[type]) {
              acc[type] = [];
            }
    
            acc[type].push({date, orderCount})
    
            return acc;
          }, {})
    
          return {
            dateRangeFrom: from.getTime(),
            dateRangeTo: to.getTime(),
            dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
            dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
            current: finalOrders.current ? finalOrders.current : [],
            previous: finalOrders.previous ? finalOrders.previous : [],
          }
        } catch (error) {
          console.error('[OrdersAnalytics] Error in getOrdersHistory query builder:', error);
          throw error;
        }
      }

      let startQueryFrom: Date | undefined;
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          // All time
          try {
            const lastOrder = await this.activeManager_.withRepository(this.orderRepository_).find({
              skip: 0,
              take: 1,  
              order: { created_at: "ASC"},
              where: { status: In(orderStatusesAsStrings) }
            })
    
            if (lastOrder.length > 0) {
              startQueryFrom = lastOrder[0].created_at;
            }
          } catch (error) {
            console.error('[OrdersAnalytics] Error getting earliest order in getOrdersHistory:', error);
            throw error;
          }
        }
      } else {
        startQueryFrom = dateRangeFromCompareTo;
      }
  
      if (startQueryFrom) {
        const resolution = calculateResolution(startQueryFrom);
        
        try {
          const query = this.activeManager_.withRepository(this.orderRepository_)
            .createQueryBuilder('order')
            .select(`date_trunc('${resolution}', order.created_at)`, 'date')
            .addSelect('COUNT(order.id)', 'orderCount')
            .where(`created_at >= :startQueryFrom`, { startQueryFrom })
            .andWhere(`status IN(:...orderStatusesAsStrings)`, { orderStatusesAsStrings });
    
          const orders = await query
          .groupBy('date')
          .orderBy('date', 'ASC')
          .getRawMany();
    
          return {
            dateRangeFrom: startQueryFrom.getTime(),
            dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
            dateRangeFromCompareTo: undefined,
            dateRangeToCompareTo: undefined,
            current: orders,
            previous: []
          };
        } catch (error) {
          console.error('[OrdersAnalytics] Error in getOrdersHistory query builder (no comparison):', error);
          throw error;
        }
      }
    }
    
    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: [],
      previous: []
    }
  }

  async getOrdersCount(orderStatuses: OrderStatus[], from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersCounts> {
    
    let startQueryFrom: Date | undefined;
    const orderStatusesAsStrings = Object.values(orderStatuses);

    if (orderStatusesAsStrings.length) {
      if (!dateRangeFromCompareTo) {
        if (from) {
          startQueryFrom = from;
        } else {
          // All time
          try {
            const lastOrder = await this.activeManager_.withRepository(this.orderRepository_).find({
              skip: 0,
              take: 1,
              order: { created_at: "ASC"},
              where: { status: In(orderStatusesAsStrings) }
            })

            if (lastOrder.length > 0) {
              startQueryFrom = lastOrder[0].created_at;
            }
          } catch (error) {
            console.error('[OrdersAnalytics] Error getting earliest order in getOrdersCount:', error);
            throw error;
          }
        }
      } else {
          startQueryFrom = dateRangeFromCompareTo;
      }
      
      try {
        const orders = await this.orderService.listAndCount({
          created_at: startQueryFrom ? { gte: startQueryFrom } : undefined,
          status: In(orderStatusesAsStrings)
        }, {
          select: [
            "id",
            "created_at",
            "updated_at"
          ],
          order: { created_at: "DESC" },
        })

        if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
          const previousOrders = orders[0].filter(order => order.created_at < from);
          const currentOrders = orders[0].filter(order => order.created_at >= from);
          return {
            dateRangeFrom: from.getTime(),
            dateRangeTo: to.getTime(),
            dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
            dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
            current: currentOrders.length,
            previous: previousOrders.length
          }
        }
        
        if (startQueryFrom) {
          return {
            dateRangeFrom: startQueryFrom.getTime(),
            dateRangeTo: to ? to.getTime() : new Date(Date.now()).getTime(),
            dateRangeFromCompareTo: undefined,
            dateRangeToCompareTo: undefined,
            current: orders[1],
            previous: 0
          }
        }
      } catch (error) {
        console.error('[OrdersAnalytics] Error in orderService.listAndCount:', error);
        throw error;
      }
    }
    
    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: 0,
      previous: 0
    }
  }

  async getPaymentProviderPopularity(from?: Date, to?: Date, dateRangeFromCompareTo?: Date, dateRangeToCompareTo?: Date) : Promise<OrdersPaymentProviderPopularityResult> {
    
    function calculateSumAndPercentageOfResults(results: InitialOrdersPaymentProvider[]): OrdersPaymentProvider[] {

        const orderMap: Map<string, string> = new Map();

        let allSum: number = 0;

        results.forEach(result => {
            const { orderCount, paymentProviderId } = result;
            if (orderMap.has(paymentProviderId)) {
              const sum: number = parseInt(orderMap.get(paymentProviderId)) + parseInt(orderCount);
              orderMap.set(paymentProviderId, sum.toFixed());
            } else {
              orderMap.set(paymentProviderId, orderCount);
            }
        });

        const newArray: OrdersPaymentProvider[] =  [];
        orderMap.forEach(( value: string) => {
          allSum += parseInt(value);
        })

        orderMap.forEach(( value: string, key: string) => {
          newArray.push({
            orderCount: value,
            percentage: (parseInt(value) * 100 / allSum).toFixed(2),
            paymentProviderId: key
          })
        })

        return newArray;
    }
    if (dateRangeFromCompareTo && from && to && dateRangeToCompareTo) {
      const resolution = calculateResolution(from);
      
      try {
        const query = this.activeManager_.withRepository(this.orderRepository_)
        .createQueryBuilder('order')
        .select(`
          CASE
            WHEN order.created_at < :from AND order.created_at >= :dateRangeFromCompareTo THEN 'previous'
            ELSE 'current'
          END AS type`)
        .addSelect(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.payments', 'payments')
        .where('order.created_at >= :dateRangeFromCompareTo', { dateRangeFromCompareTo })
        
        const ordersCountWithPayments = await query
        .groupBy('date, type, payments.id')
        .orderBy('date', 'ASC')
        .setParameters({from, dateRangeFromCompareTo})
        .getRawMany()

        const finalOrders: OrdersPaymentProviderPopularityResult = ordersCountWithPayments.reduce((acc, entry) => {
          const type = entry.type;
          const orderCount = entry.orderCount;
          const paymentProviderId = entry.payments_provider_id;
          if (!acc[type]) {
            acc[type] = [];
          }

          acc[type].push({
            orderCount,
            paymentProviderId,
          })

          return acc;
        }, {})

        const finalOrdersCurrentGrouped = calculateSumAndPercentageOfResults(finalOrders.current ? finalOrders.current : []);
        const finalOrdersPreviousGrouped = calculateSumAndPercentageOfResults(finalOrders.previous ? finalOrders.previous : []);

        return {
          dateRangeFrom: from.getTime(),
          dateRangeTo: to.getTime(),
          dateRangeFromCompareTo: dateRangeFromCompareTo.getTime(),
          dateRangeToCompareTo: dateRangeToCompareTo.getTime(),
          current: finalOrdersCurrentGrouped ? finalOrdersCurrentGrouped : [],
          previous: finalOrdersPreviousGrouped ? finalOrdersPreviousGrouped : [],
        }
      } catch (error) {
        console.error('[OrdersAnalytics] Error in payment provider query with comparison:', error);
        throw error;
      }
    }

    let startQueryFrom: Date | undefined;
    if (!dateRangeFromCompareTo) {
      if (from) {
        startQueryFrom = from;
      } else {
        // All time
        try {
          const lastOrder = await this.activeManager_.withRepository(this.orderRepository_).find({
            skip: 0,
            take: 1,
            order: { created_at: "ASC"},
          })

          if (lastOrder.length > 0) {
            startQueryFrom = lastOrder[0].created_at;
          }
        } catch (error) {
          console.error('[OrdersAnalytics] Error getting earliest order in getPaymentProviderPopularity:', error);
          throw error;
        }
      }
    } else {
        startQueryFrom = dateRangeFromCompareTo;
    }
    
    if (startQueryFrom) {
      const resolution = calculateResolution(startQueryFrom);
      
      try {
        const query = this.activeManager_.withRepository(this.orderRepository_)
        .createQueryBuilder('order')
        .select(`date_trunc('${resolution}', order.created_at)`, 'date')
        .addSelect('COUNT(order.id)', 'orderCount')
        .leftJoinAndSelect('order.payments', 'payments')
        .where('order.created_at >= :startQueryFrom', { startQueryFrom })

        const ordersCountWithPayments = await query
        .groupBy('date, payments.id')
        .orderBy('date', 'ASC')
        .getRawMany()

        const initialOrders: InitialOrdersPaymentProvider[] = ordersCountWithPayments.map(order => {
          return {
            orderCount: order.orderCount,
            paymentProviderId: order.payments_provider_id,
          }
        });

        const finalOrdersGrouped = calculateSumAndPercentageOfResults(initialOrders ? initialOrders : []);

        return {
          dateRangeFrom: startQueryFrom.getTime(),
          dateRangeTo: to ? to.getTime(): new Date(Date.now()).getTime(),
          dateRangeFromCompareTo: undefined,
          dateRangeToCompareTo: undefined,
          current: finalOrdersGrouped,
          previous: []
        }
      } catch (error) {
        console.error('[OrdersAnalytics] Error in payment provider query without comparison:', error);
        throw error;
      }
    }

    return {
      dateRangeFrom: undefined,
      dateRangeTo: undefined,
      dateRangeFromCompareTo: undefined,
      dateRangeToCompareTo: undefined,
      current: [],
      previous: []
    }
  }
}