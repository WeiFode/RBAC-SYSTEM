/**
 * 格式化日期工具类
 */
class DateUtils {
  /**
   * 将 ISO 日期字符串转换为本地日期字符串
   * @param {string} isoString - ISO 格式的日期字符串
   * @returns {string} - 格式化后的本地日期字符串
   */
  static toLocalDateString(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString();
  }

  /**
   * 将 ISO 日期字符串转换为本地时间字符串
   * @param {string} isoString - ISO 格式的日期字符串
   * @returns {string} - 格式化后的本地时间字符串
   */
  static toLocalTimeString(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleTimeString();
  }

  /**
   * 将 ISO 日期字符串转换为自定义格式的日期时间字符串（不包含时区）
   * @param {string} isoString - ISO 格式的日期字符串
   * @param {string} locale - 可选，本地化字符串（如 'en-US', 'zh-CN'）
   * @param {Intl.DateTimeFormatOptions} options - 可选，格式化选项
   * @returns {string} - 格式化后的日期时间字符串
   */
  static toCustomFormatString(
    isoString: string,
    locale: string = 'zh-CN',
    options: Intl.DateTimeFormatOptions = {}
  ): string {
    const date = new Date(isoString);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      // 不包含 timeZoneName 以去除时区信息
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
  }

  /**
   * 将 ISO 日期字符串转换为简短的日期格式
   * @param {string} isoString - ISO 格式的日期字符串
   * @returns {string} - 格式化后的简短日期字符串
   */
  static toShortDate(isoString: string): string {
    const date = new Date(isoString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(date);
  }

  /**
   * 将 ISO 日期字符串转换为时间戳
   * @param {string} isoString - ISO 格式的日期字符串
   * @returns {number} - 时间戳（毫秒）
   */
  static toTimestamp(isoString: string): number {
    return new Date(isoString).getTime();
  }


  /**
    * 将时间戳转换为自定义格式的日期时间字符串
    * @param {number | string} timestamp - 时间戳（秒或毫秒）
    * @param {string} locale - 可选，本地化字符串（如 'en-US', 'zh-CN'）
    * @param {Intl.DateTimeFormatOptions} options - 可选，格式化选项
    * @returns {string} - 格式化后的日期时间字符串
    */
  static fromTimestamp(
    timestamp: number | string,
    locale: string = 'zh-CN',
    options: Intl.DateTimeFormatOptions = {}
  ): string {
    // 检查 timestamp 是否为字符串，并将其转换为数字
    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;

    // 如果时间戳是以秒为单位，则转换为毫秒
    const timestampInMs = numericTimestamp.toString().length === 10 ? numericTimestamp * 1000 : numericTimestamp;

    const date = new Date(timestampInMs);
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(date);
  }
}

export default DateUtils;
