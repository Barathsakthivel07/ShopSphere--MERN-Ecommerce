
export const ORDER_STATUS_TRANSITIONS = Object.freeze({
  pending: Object.freeze(["confirmed", "cancelled"]),
  confirmed: Object.freeze(["shipped", "cancelled"]),
  shipped: Object.freeze(["delivered"]),
  delivered: Object.freeze([]),
  cancelled: Object.freeze([]),
});

export const isValidOrderTransition = (
  currentStatus,
  nextStatus
) => {
  const allowedStatuses =
    ORDER_STATUS_TRANSITIONS[currentStatus];

  if (!allowedStatuses) {
    return false;
  }

  return allowedStatuses.includes(nextStatus);
};
