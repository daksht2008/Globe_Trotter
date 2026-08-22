def calculate_trip_budget(trip) -> dict:
    """
    Calculate full budget breakdown for a trip:
    - total_cost
    - by_stop: [{stop_id, city, cost, activities}]
    - by_category: {sightseeing: X, food: Y, ...}
    - avg_per_day, num_days
    """
    total_cost = 0.0
    by_stop = []
    by_category = {}

    if not trip or not hasattr(trip, 'stops'):
        return {
            "total_cost": 0.0,
            "by_stop": [],
            "by_category": {},
            "avg_per_day": 0.0,
            "num_days": 0
        }

    for stop in trip.stops:
        stop_cost = 0.0
        stop_activities_list = []
        
        # Calculate stop activities cost if stop_activities exists
        stop_acts = getattr(stop, 'stop_activities', [])
        for sa in stop_acts:
            act = sa.activity if hasattr(sa, 'activity') else None
            if act:
                cost = float(act.cost_estimate or 0.0)
                category = act.category or "uncategorized"
                
                stop_cost += cost
                by_category[category] = by_category.get(category, 0.0) + cost
                
                stop_activities_list.append({
                    "id": act.id,
                    "name": act.name,
                    "cost": cost,
                    "category": category
                })

        city_name = stop.city.name if hasattr(stop, 'city') and stop.city else f"Stop {stop.id}"
        by_stop.append({
            "stop_id": stop.id,
            "city": city_name,
            "cost": stop_cost,
            "activities": stop_activities_list
        })
        total_cost += stop_cost

    num_days = 1
    if getattr(trip, 'start_date', None) and getattr(trip, 'end_date', None):
        delta = (trip.end_date - trip.start_date).days + 1
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
