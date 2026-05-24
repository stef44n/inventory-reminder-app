export function isChargeableDue(item) {
    const lastCharged = new Date(item.chargeable.lastChargedAt);

    const nextCharge = new Date(lastCharged);

    nextCharge.setDate(nextCharge.getDate() + item.chargeable.chargeCycleDays);

    return new Date() >= nextCharge;
}

export function isSubscriptionDue(item) {
    const lastRenewed = new Date(item.subscription.lastRenewedAt);

    const nextRenewal = new Date(lastRenewed);

    nextRenewal.setDate(nextRenewal.getDate() + item.subscription.cycleDays);

    return new Date() >= nextRenewal;
}

export function getExpiryStatus(item) {
    const expiryDate = new Date(item.expiry.expiryDate);

    const today = new Date();

    const diffDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return "expired";
    }

    if (diffDays <= 7) {
        return "soon";
    }

    return "ok";
}

export function isConsumableLow(item) {
    return item.consumable.quantity <= item.consumable.minThreshold;
}
