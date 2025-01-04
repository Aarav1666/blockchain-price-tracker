/**
 * Groups the provided records by hour and calculates the average, minimum, and maximum
 * prices for each hour based on the specified target price key.
 *
 * @param records The array of records to be grouped, each containing a timestamp and a price.
 * @param targetPriceKey The key to access the price value for calculations in the record.
 * @returns An array of objects, each representing an hour with properties for the hour,
 *          average price, minimum price, and maximum price.
 */

export const groupByHour = (records: any[], targetPriceKey: string) => {
  const grouped: Record<string, any[]> = {};

  records.forEach((record) => {
    const hourKey = new Date(record.timestamp).getHours(); // Get the hour of the record
    if (!grouped[hourKey]) {
      grouped[hourKey] = [];
    }
    grouped[hourKey].push(record);
  });

  // Calculate the average price for each hour
  return Object.keys(grouped).map((hour) => {
    const hourRecords = grouped[hour];
    const avgPrice =
      hourRecords.reduce((sum, record) => sum + record[targetPriceKey], 0) /
      hourRecords.length;

    return {
      hour: `${hour} hour`,
      avergePrice: avgPrice,
      minPrice: hourRecords.reduce(
        (acc, record) =>
          acc > record[targetPriceKey] ? record[targetPriceKey] : acc,
        hourRecords?.[0]?.[targetPriceKey] ?? 0,
      ),
      maxPrice: hourRecords.reduce(
        (acc, record) =>
          acc > record[targetPriceKey] ? acc : record[targetPriceKey],
        0,
      ),
    };
  });
};
