export default function estimatedTimeStatusPending(orderTimestamp, orderStatus) {
    const now = new Date();
    const orderTime = new Date(orderTimestamp);

    const day = now.getDay();
    const hour = now.getHours();

    const restaurantOpen = hour >= 17 && hour < 21;
    const restaurantClosed = !restaurantOpen;

    const orderHour = orderTime.getHours();
    const orderWasBeforeClosing = orderHour < 21;
    const orderWasAfterClosing = orderHour >= 21;

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const hoursUntilNextOpening = () => {
        const nextOpen = new Date(now);
        nextOpen.setHours(17, 0, 0, 0);

        // If it's already past 5pm today, move to tomorrow
        if (now.getHours() >= 17) {
            nextOpen.setDate(nextOpen.getDate() + 1);
        }

        // If tomorrow is Monday, skip to Tuesday
        if (nextOpen.getDay() === 1) {
            nextOpen.setDate(nextOpen.getDate() + 1);
        }

        const diffMs = nextOpen - now;
        const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

        const isTomorrow = nextOpen.getDate() === now.getDate() + 1;
        const dayName = daysOfWeek[nextOpen.getDay()];

        return {
            hours: diffHours,
            label: isTomorrow ? `tomorrow (${dayName})` : `on ${dayName}`
        };
    };

    // Closed on Monday
    if (day === 1) {
        const { hours, label } = hoursUntilNextOpening();
        return `The restaurant is closed on Mondays. Your order will be processed ${label} in ${hours} hours.`;
    }

    // Restaurant is closed AND order is pending
    if (restaurantClosed && orderStatus === null) {
        const { hours, label } = hoursUntilNextOpening();

        // Order made BEFORE closing → delay
        if (orderWasBeforeClosing) {
            return `There has been a delay in processing your order. It will be processed ${label} in ${hours} hours.`;
        }

        // Order made AFTER closing → no delay
        if (orderWasAfterClosing) {
            return `Your order will be processed ${label} in ${hours} hours.`;
        }
    }

    // Before opening hours today
    if (hour < 17) {
        const hours = 17 - hour;
        return `Your order will be processed today (${daysOfWeek[day]}) in ${hours} hours when the restaurant opens.`;
    }
    // During open hours
    if (restaurantOpen) {
        return "Your order will be processed shortly.";
    }


    return "Estimated time unavailable.";
}
