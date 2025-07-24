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

import { DateLasts } from "./types";
import type { DateRange } from "./types"

export function amountToDisplay(amount: number, decimalDigits: number) : string {
  return (amount / Math.pow(10, decimalDigits)).toFixed(decimalDigits);
}

export function calculatePercentage(current: number, previous: number) : number | undefined {
  if (current == previous) {
    return 0;
  }
  if (current == 0) {
    return 100;
  }

  if (previous == 0) {
    return undefined;
  }

  const percentage: number = Number((((current) - previous) / previous).toFixed(2)) * 100;
  if (percentage > 0) {
    return Math.round(percentage * 100) / 100;
  }
  return Math.round((percentage - percentage - percentage) * 100) / 100;
}

export function convertDateLastsToDateRange(dateLasts: DateLasts): DateRange | undefined {
  let result: DateRange | undefined;
  const now = new Date();
  
  switch (dateLasts) {
    case DateLasts.Today:
      const today = new Date();
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      
      result = {
        from: startOfToday,
        to: new Date()
      }
      break;
    case DateLasts.ThisWeek:
      // Get Sunday of current week (day 0 = Sunday)
      const currentDate = new Date();
      const currentDayOfWeek = currentDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
      
      // Calculate days to subtract to get to Sunday
      const daysFromSunday = currentDayOfWeek;
      
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - daysFromSunday, 0, 0, 0, 0);
      
      result = {
        from: startOfWeek,
        to: new Date()
      }
      break;
    case DateLasts.ThisMonth:
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, 0);
      result = {
        from: startOfMonth,
        to: new Date()
      }
      break;
    case DateLasts.ThisYear:
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      result = {
        from: startOfYear,
        to: new Date(now)
      }
      break;
    case DateLasts.LastWeek: 
      // Last week = Sunday to Saturday of previous week
      const todayDay = now.getDay();
      const startOfCurrentWeek = new Date(now);
      startOfCurrentWeek.setDate(now.getDate() - todayDay);
      startOfCurrentWeek.setHours(0, 0, 0, 0);
      
      const startOfLastWeek = new Date(startOfCurrentWeek);
      startOfLastWeek.setDate(startOfCurrentWeek.getDate() - 7);
      
      const endOfLastWeek = new Date(startOfCurrentWeek);
      endOfLastWeek.setDate(startOfCurrentWeek.getDate() - 1);
      endOfLastWeek.setHours(23, 59, 59, 999);
      
      result = {
        from: startOfLastWeek,
        to: endOfLastWeek
      }
      break;
    case DateLasts.Last30Days:
      // Last 30 days from today
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
      thirtyDaysAgo.setHours(0, 0, 0, 0);
      
      result = {
        from: thirtyDaysAgo,
        to: new Date(now)
      }
      break;
    case DateLasts.LastMonth:
      result = {
        // 86400000 - alignment for taking last 29 days, as the current day is 30
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 29)).setHours(0,0,0,0)),
        to: new Date(Date.now())
      }
      break;
    case DateLasts.Last60Days:
      // Last 60 days from today
      const sixtyDaysAgo = new Date(now);
      sixtyDaysAgo.setDate(now.getDate() - 60);
      sixtyDaysAgo.setHours(0, 0, 0, 0);
      
      result = {
        from: sixtyDaysAgo,
        to: new Date()
      }
      break;
    case DateLasts.LastYear: 
      // Last year = complete previous calendar year (Jan 1 - Dec 31 of 2024)
      const currentYear = new Date().getFullYear();
      const startOfLastYear = new Date(currentYear - 1, 0, 1, 0, 0, 0, 0); // Jan 1, 2024
      const endOfLastYear = new Date(currentYear - 1, 11, 31, 23, 59, 59, 999); // Dec 31, 2024
      
      result = {
        from: startOfLastYear,
        to: endOfLastYear
      }
      break;
  }
  return result;
}

export function convertDateLastsToComparedDateRange(dateLasts: DateLasts): DateRange | undefined {
  let result: DateRange | undefined;
  const now = new Date();
  
  switch (dateLasts) {
    case DateLasts.Today:
      // Same as current period: Today
      const today = new Date();
      const startOfToday = new Date(today);
      startOfToday.setHours(0, 0, 0, 0);
      
      result = {
        from: startOfToday,
        to: new Date()
      }
      break;
    case DateLasts.ThisWeek:
      // Same as current period: Current week (Sunday to today)
      const currentDate = new Date();
      const currentDayOfWeek = currentDate.getDay();
      const startOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - currentDayOfWeek, 0, 0, 0, 0);
      
      result = {
        from: startOfWeek,
        to: new Date()
      }
      break;
    case DateLasts.ThisMonth:
      // Same as current period: Current month (1st to today)
      const currentMonth = new Date();
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1, 0, 0, 0, 0);
      
      result = {
        from: startOfMonth,
        to: new Date()
      }
      break;
    case DateLasts.ThisYear:
      // Same as current period: Current year (Jan 1st to today)
      const currentYear = new Date();
      const startOfYear = new Date(currentYear.getFullYear(), 0, 1, 0, 0, 0, 0);
      
      result = {
        from: startOfYear,
        to: new Date()
      }
      break;
    case DateLasts.LastWeek: 
      // Same as current period: Last week (Sunday to Saturday)
      const todayDay = now.getDay();
      const startOfCurrentWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - todayDay, 0, 0, 0, 0);
      
      const startOfLastWeek = new Date(startOfCurrentWeek.getFullYear(), startOfCurrentWeek.getMonth(), startOfCurrentWeek.getDate() - 7, 0, 0, 0, 0);
      const endOfLastWeek = new Date(startOfCurrentWeek.getFullYear(), startOfCurrentWeek.getMonth(), startOfCurrentWeek.getDate() - 1, 23, 59, 59, 999);
      
      result = {
        from: startOfLastWeek,
        to: endOfLastWeek
      }
      break;
    case DateLasts.Last30Days:
      // Same as current period: Last 30 days
      const thirtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 30, 0, 0, 0, 0);
      
      result = {
        from: thirtyDaysAgo,
        to: new Date()
      }
      break;
    case DateLasts.LastMonth: 
      // Same as current period: Last month (last 29 days)
      result = {
        from: new Date(new Date(new Date().setDate(new Date().getDate() - 29)).setHours(0,0,0,0)),
        to: new Date(Date.now())
      }
      break;
    case DateLasts.Last60Days:
      // Same as current period: Last 60 days
      const sixtyDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 60, 0, 0, 0, 0);
      
      result = {
        from: sixtyDaysAgo,
        to: new Date()
      }
      break;
    case DateLasts.LastYear:
      // Same as current period: Last year (complete previous calendar year)
      const currentYearComp = new Date().getFullYear();
      const startOfLastYearComp = new Date(currentYearComp - 1, 0, 1, 0, 0, 0, 0); // Jan 1, 2024
      const endOfLastYearComp = new Date(currentYearComp - 1, 11, 31, 23, 59, 59, 999); // Dec 31, 2024
      
      result = {
        from: startOfLastYearComp,
        to: endOfLastYearComp
      }
      break;
  }
  return result;
}