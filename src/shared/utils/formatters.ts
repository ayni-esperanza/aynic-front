export const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return "-";

  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    // Verificar si la fecha es válida
    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(parsedDate);
  } catch (error) {
    console.warn("Error formatting date:", error);
    return "-";
  }
};

export const formatDateTime = (
  date: Date | string | null | undefined
): string => {
  if (!date) return "-";

  try {
    const parsedDate = typeof date === "string" ? new Date(date) : date;

    // Verificar si la fecha es válida
    if (isNaN(parsedDate.getTime())) {
      return "-";
    }

    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsedDate);
  } catch (error) {
    console.warn("Error formatting datetime:", error);
    return "-";
  }
};

export const formatNumber = (num: number | null | undefined): string => {
  if (num === null || num === undefined || isNaN(num)) return "-";

  try {
    return new Intl.NumberFormat("es-ES").format(num);
  } catch (error) {
    console.warn("Error formatting number:", error);
    return String(num);
  }
};

export const formatCurrency = (amount: number | null | undefined): string => {
  if (amount === null || amount === undefined || isNaN(amount)) return "-";

  try {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
  } catch (error) {
    console.warn("Error formatting currency:", error);
    return `€${amount}`;
  }
};

export const truncateText = (
  text: string | null | undefined,
  maxLength: number
): string => {
  if (!text) return "-";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};