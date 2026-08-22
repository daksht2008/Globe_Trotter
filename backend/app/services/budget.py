def calculate_trip_budget(trip) -> dict:
    """
    Calculates detailed budget breakdown for a trip.
    Returns total_cost, cost by stop, cost by category, daily avg,
    and frontend-compatible keys (stops_breakdown, categories, total_estimated_cost_usd).
    Phase 3 - Advanced Features Implementation
    """
    total_cost = 0.0
    by_stop = []
    by_category = {}

    if not trip:
        return {
            "trip_id": None,
            "total_cost": 0.0,
            "total_estimated_cost_usd": 0.0,
            "currency": "USD",
            "by_stop": [],
            "stops_breakdown": [],
            "by_category": {},
            "categories": {},
            "avg_per_day": 0.0,
            "num_days": 0
        }

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
                    "id": getattr(act, "id", None),
                    "name": getattr(act, "name", "Activity"),
                    "cost": cost,
                    "estimated_cost": cost,
                    "category": category,
                    "duration_hours": float(getattr(act, "duration_hours", getattr(act, "durationHours", 1.0)) or 1.0)
                })

        city_obj = getattr(stop, "city", None)
        city_name = getattr(city_obj, "name", f"Stop {stop.id}") if city_obj else f"Stop {stop.id}"
        by_stop.append({
            "stop_id": stop.id,
            "city": city_name,
            "cost": round(stop_cost, 2),
            "cost_usd": round(stop_cost, 2),
            "activity_count": len(stop_activities_list),
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
    rounded_categories = {k: round(v, 2) for k, v in by_category.items()}

    return {
        "trip_id": getattr(trip, "id", None),
        "total_cost": round(total_cost, 2),
        "total_estimated_cost_usd": round(total_cost, 2),
        "currency": "USD",
        "by_stop": by_stop,
        "stops_breakdown": [
            {
                "stop_id": s["stop_id"],
                "city": s["city"],
                "cost_usd": s["cost"],
                "activity_count": s["activity_count"]
            }
            for s in by_stop
        ],
        "by_category": rounded_categories,
        "categories": rounded_categories,
        "avg_per_day": avg_per_day,
        "num_days": num_days
    }

