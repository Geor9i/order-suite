export const storeSettings = {
  orderDays: {
    monday: {
      orderDayCutoff: "friday",
      orderCuttoffTime: "10:00",
    },
    wednesday: {
      orderDayCutoff: "monday",
      orderCuttoffTime: "10:00",
    },
    friday: {
      orderDayCutoff: "wednesday",
      orderCuttoffTime: "10:00",
    },
  },
  weekendSalesPercent: 51,
  openTimes: {
    monday: { startTime: "11:00", endTime: "22:00" },
    tuesday: { startTime: "11:00", endTime: "22:00" },
    wednesday: { startTime: "11:00", endTime: "22:00" },
    thursday: { startTime: "11:00", endTime: "23:00" },
    friday: { startTime: "11:00", endTime: "23:00" },
    saturday: { startTime: "11:00", endTime: "23:00" },
    sunday: { startTime: "11:00", endTime: "22:00" },
  },
};
