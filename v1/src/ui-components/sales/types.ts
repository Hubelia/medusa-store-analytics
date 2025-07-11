export type SalesHistory = {
  total: string,
  date: string
}

export type SalesHistoryResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string,
    currencyDecimalDigits: number,
    current: SalesHistory[];
    previous: SalesHistory[];
  }
}

export type RefundsResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string
    currencyDecimalDigits: number,
    current: string;
    previous: string;
  }
}

export type SalesTotalsResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string
    currencyDecimalDigits: number,
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
}

export type TotalsHistory = {
  date: string,
  revenuePreShipping: string
  shipping: string
  taxes: string
}

export type TotalsHistoryResponse = {
  analytics: {
    dateRangeFrom?: number
    dateRangeTo?: number,
    dateRangeFromCompareTo?: number,
    dateRangeToCompareTo?: number,
    currencyCode: string
    currencyDecimalDigits: number,
    current: TotalsHistory[];
    previous: TotalsHistory[];
  }
}