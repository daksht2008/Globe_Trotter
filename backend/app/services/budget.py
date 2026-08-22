def calculate_trip_budget(trip) -> dict:
    """
    Calculates detailed budget breakdown for a trip.
    Returns total_cost, cost by stop, cost by category, daily avg.
    Phase 3 - Dev-1 Backend Implementation
    """
    total_cost = 0.0
    by_stop = []
    by_category = {}

    if not trip:
        return {"total_cost": 0.0, "by_stop": [], "by_category": {}, "avg_per_day": 0.0, "num_days": 0}

    for stop in getattr(trip, "stops", []):
        stop_cost = 0.0
        stop_activities_list = []

        for sa in getattr(stop, "stop_activities", []):
            act = getattr(sa, "activity", None)
            if act:
                cost = float(getattr(act, "cost", None) or getattr(act, "cost_estimate", 0.0) or 0.0)
                category = getattr(act, "category", "Uncategorized")
                stop_cost += cost
                by_category[category] = by_category.get(category, 0.0) + cost
                stop_activities_list.append({
                    "id": str(getattr(act, "id", "")),
                    "name": getattr(act, "name", "Activity"),
                    "cost": cost,
                    "category": category,
                    "duration_hours": float(getattr(act, "duration_hours", getattr(act, "durationHours", 1.0)) or 1.0)
                })

        city_obj = getattr(stop, "city", None)
        city_name = getattr(city_obj, "name", f"Stop {stop.id}") if city_obj else f"Stop {stop.id}"
        by_stop.append({
            "stop_id": str(stop.id),
            "city": city_name,
            "cost": round(stop_cost, 2),
            "activities": stop_activities_list
        })
        total_cost += stop_cost

    num_days = 1
    start_date = getattr(trip, "start_date", None)
    end_date = getattr(trip, "end_date", None)
    if start_date and end_date:
        delta = (end_date - start_date).days + 1
        if delta > 0:
            num_days = delta

    avg_per_day = round(total_cost / num_days, 2) if num_days > 0 else total_cost

    return {
        "total_cost": round(total_cost, 2),
        "by_stop": by_stop,
        "by_category": {k: round(v, 2) for k, v in by_category.items()},
        "avg_per_day": avg_per_day,
        "num_days": num_days
    }
