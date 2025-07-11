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

import { useState } from 'react';
import { Text, Switch, Label, Button, IconButton, Checkbox, Badge, DatePicker } from "@medusajs/ui";
import { Adjustments } from "@medusajs/icons"
import { DateLasts, OrderStatus } from "../utils/types";
import type { DateRange } from "../utils/types";
import { Select } from "@medusajs/ui"

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

import { DropdownMenu, toast } from "@medusajs/ui"
import { useAdminCustomPost } from "medusa-react";

type ReportResult = {
  buffer?: Buffer
}

type AdminGenerateReportPostReq = {
  orderStatuses: string[],
  dateRangeFrom?: number
  dateRangeTo?: number,
  dateRangeFromCompareTo?: number,
  dateRangeToCompareTo?: number,
}

export const GenerateReportButton = ({orderStatuses, dateRange, dateRangeCompareTo, compareEnabled} : 
  {orderStatuses: OrderStatus[], dateRange?: DateRange, dateRangeCompareTo?: DateRange, compareEnabled: boolean}) => {

  const [ loadingButton, setLoadingStatus ]= useState(false);

  const { mutate } = useAdminCustomPost<
    AdminGenerateReportPostReq,
    ReportResult  
  >
  (
    `/reports-analytics/general`,
    [orderStatuses, dateRange, dateRangeCompareTo],
  )
  const generate = async () => {
    const id = toast.loading("Report", {
      description: "Generating report...",
      duration: Infinity
    })

    setLoadingStatus(true);

    mutate(
      {
        orderStatuses: Object.values(orderStatuses),
        dateRangeFrom: dateRange ? dateRange.from.getTime() : undefined,
        dateRangeTo: dateRange ? dateRange.to.getTime() : undefined,
        dateRangeFromCompareTo: dateRangeCompareTo ? dateRangeCompareTo.from.getTime() : undefined,
        dateRangeToCompareTo: dateRangeCompareTo ? dateRangeCompareTo.to.getTime() : undefined,
      }, {
        onSuccess: ( { response, buffer }) => {
          if (response.status == 201 && buffer) {
            const anyBuffer = buffer as any;
            const blob = new Blob([ new Uint8Array(anyBuffer.data)  ], { type : 'application/pdf'});
            toast.dismiss();
            setLoadingStatus(false);
            const pdfURL = URL.createObjectURL(blob);
            window.open(pdfURL, '_blank');
          } else {
            toast.dismiss();
            setLoadingStatus(false);
            toast.error("Report", {
              description: 'Problem happened when generating report',
            })
          }
        },
        onError: (error) => {
          toast.dismiss();
          setLoadingStatus(false);
          const trueError = error as any;
          toast.error("Report", {
            description: trueError?.response?.data?.message,
          })
        }
      }
    )
  };

  return (
    <>
      {loadingButton && <Button variant="secondary" disabled={true} style={{ width: 180 }}>
        Generating
      </Button>}
      {!loadingButton && <Button variant="secondary" onClick={generate} style={{ width: 180 }}>
        Generate report
        <Badge rounded="full" size="2xsmall" color="green">Beta</Badge>
      </Button>}
    </>
  )
}

export const ComparedDate = ({compare, comparedToDateRange} : {compare: boolean, comparedToDateRange?: DateRange}) => {
  if (comparedToDateRange && compare) {
    return (
      <Text>
        {`Compared to ${comparedToDateRange.from.toLocaleDateString()} - ${comparedToDateRange.to.toLocaleDateString()}`}
      </Text>
    );
  }
  return (
    <Text>
      {`No comparison`}
    </Text>
  ); 
}

type BooleanCallback = (value: boolean) => any;

export const SwitchComparison = ({compareEnabled, onCheckChange, allTime} : {compareEnabled: boolean, onCheckChange: BooleanCallback, allTime: boolean}) => {
  return (
    <div className="flex items-center gap-x-2">
      <Switch id="manage-inventory" onCheckedChange={onCheckChange} disabled={allTime} checked={compareEnabled && !allTime}/>
      <Label htmlFor="manage-inventory">Compare</Label>
    </div>
  )
}

type OrderStatusCallback = (value: OrderStatus[]) => any;

export const DropdownOrderStatus = ({onOrderStatusChange, appliedStatuses} : {onOrderStatusChange: OrderStatusCallback, appliedStatuses: OrderStatus[]}) => {

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const handleStatusToggle = (status) => {
    setSelectedStatuses((prevSelectedStatuses) =>
      prevSelectedStatuses.includes(status)
        ? prevSelectedStatuses.filter((selected) => selected !== status)
        : [...prevSelectedStatuses, status]
    );
  };


  const handleApplyClick = () => {
    // Close the dropdown when Apply is clicked
    setIsDropdownOpen(false);
    onOrderStatusChange(selectedStatuses.map(selectedStatus => OrderStatus[selectedStatus.toUpperCase()]));
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={(isOpen) => {
      if (isOpen) {
        setSelectedStatuses(Object.values(appliedStatuses));
      }
      setIsDropdownOpen(isOpen)
    }}>
    <DropdownMenu.Trigger asChild>
      <IconButton>
        <Adjustments />
      </IconButton>
    </DropdownMenu.Trigger>
    <DropdownMenu.Content className="p-2">
      <DropdownMenu.Label className="gap-x-2" style={ { paddingLeft: 8, paddingBottom: 8}}>
        <h3>Choose orders</h3>
      </DropdownMenu.Label>
      {Object.values(OrderStatus).map(orderStatus => (
        <DropdownMenu.Item className="gap-x-2" onSelect={event => event.preventDefault()} key={orderStatus.toString()}>
          <Checkbox 
            id={`order-status-${orderStatus}`}
            checked={selectedStatuses.includes(orderStatus)}
            onCheckedChange={() => handleStatusToggle(orderStatus)}
          />
          <Label htmlFor={`order-status-${orderStatus}`}>{orderStatus}</Label>
        </DropdownMenu.Item>
      ))}
      <DropdownMenu.Label className="gap-x-2 flex justify-end">
          <Button onClick={handleApplyClick}>
            Apply
          </Button>
      </DropdownMenu.Label>
    </DropdownMenu.Content> 
    </DropdownMenu>
  )
}

type StringCallback = (value: string) => void;
type DateRangeCallback = (value: DateRange) => void;

export const SelectDateLasts = ({dateLast, onSelectChange, onCustomDateRangeChange} : 
  {dateLast: DateLasts, onSelectChange: StringCallback, onCustomDateRangeChange?: DateRangeCallback}) => {
  const [value, setValue] = useState<string | undefined>(DateLasts.LastWeek)
  const [customFromDate, setCustomFromDate] = useState<Date | undefined>(undefined)
  const [customToDate, setCustomToDate] = useState<Date | undefined>(undefined)
  const [isDateRangeValid, setIsDateRangeValid] = useState<boolean>(true)
  
  const setDropdownValue = (value: string) => {
    setValue(value)
    onSelectChange(value)
    if (value !== DateLasts.Custom) {
      // Reset custom date states when switching away from custom
      setCustomFromDate(undefined)
      setCustomToDate(undefined)
      setIsDateRangeValid(true)
    }
  }

  const validateDateRange = (fromDate: Date | undefined, toDate: Date | undefined): boolean => {
    if (!fromDate || !toDate) return true; // Allow incomplete selections
    return fromDate <= toDate;
  }

  const handleCustomDateChange = () => {
    if (customFromDate && customToDate && onCustomDateRangeChange) {
      const customDateRange: DateRange = {
        from: customFromDate,
        to: customToDate
      }
      onCustomDateRangeChange(customDateRange)
    }
  }

  const handleFromDateChange = (date: Date) => {
    setCustomFromDate(date)
    const isValid = validateDateRange(date, customToDate)
    setIsDateRangeValid(isValid)
    
    if (date && customToDate && onCustomDateRangeChange && isValid) {
      const customDateRange: DateRange = {
        from: date,
        to: customToDate
      }
      onCustomDateRangeChange(customDateRange)
    }
  }

  const handleToDateChange = (date: Date) => {
    setCustomToDate(date)
    const isValid = validateDateRange(customFromDate, date)
    setIsDateRangeValid(isValid)
    
    if (customFromDate && date && onCustomDateRangeChange && isValid) {
      const customDateRange: DateRange = {
        from: customFromDate,
        to: date
      }
      onCustomDateRangeChange(customDateRange)
    }
  }

  const dateLastsToSelect: DateLasts[] = [
    DateLasts.LastWeek,
    DateLasts.LastMonth,
    DateLasts.LastYear,
    DateLasts.All,
    DateLasts.Custom
  ]

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <div className="w-[170px]">
          {/* @ts-ignore */}
          <Select onValueChange={setDropdownValue} value={value}>
            <Select.Trigger>
              <Select.Value placeholder="Select a date" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value={DateLasts.LastWeek}>Last Week</Select.Item>
              <Select.Item value={DateLasts.LastMonth}>Last Month</Select.Item>
              <Select.Item value={DateLasts.LastYear}>Last Year</Select.Item>
              <Select.Item value={DateLasts.All}>All</Select.Item>
              <Select.Item value={DateLasts.Custom}>Custom</Select.Item>
            </Select.Content>
          </Select>
        </div>
        
        {/* Custom Date Range Pickers */}
        {value === DateLasts.Custom && (
          <>
            <DatePicker
              value={customFromDate}
              onChange={handleFromDateChange}
              placeholder="From date"
            />
            <DatePicker
              value={customToDate}
              onChange={handleToDateChange}
              placeholder="To date"
            />
          </>
        )}
      </div>
      
      {/* Error message for invalid date range */}
      {value === DateLasts.Custom && !isDateRangeValid && customFromDate && customToDate && (
        <Text className="text-red-500 text-sm">
          From date must be before or equal to the to date
        </Text>
      )}
    </div>
  )
}