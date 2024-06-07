import { City, MapData } from '../model/City';

class Pathfinder {
    static findShortestPath(start: City, end: City, mapData: MapData): City[] {
        const distances: { [key: string]: number } = {};
        const previous: { [key: string]: City | null } = {};
        const queue: City[] = [];

        // Initialize distances to Infinity for all cities except the start city
        mapData.cities.forEach(city => {
            distances[city.name] = Infinity;
            previous[city.name] = null;
        });

        // Set the distance for the start city to 0 and add to the queue
        distances[start.name] = 0;
        queue.push(start);

        while (queue.length > 0) {
            // Sort queue based on distance (smallest to largest)
            queue.sort((a, b) => distances[a.name] - distances[b.name]);
            const current = queue.shift()!; // Remove and get the first item in the sorted queue

            // Check if the current city is the end city
            if (current === end) {
                const path: City[] = [];
                let node: City | null = current;
                while (node) {
                    path.unshift(node);  // Build path in reverse from end to start
                    node = previous[node.name];
                }
                return path;
            }

            // Explore neighbors
            mapData.connections.forEach(connection => {
                if (connection.parent === current.name) {
                    const neighbor = mapData.cities.find(city => city.name === connection.child);
                    if (neighbor) {
                        const alt = distances[current.name] + 1; // Assuming equal weight for all edges
                        if (alt < distances[neighbor.name]) {
                            distances[neighbor.name] = alt;
                            previous[neighbor.name] = current;
                            if (!queue.includes(neighbor)) {
                                queue.push(neighbor); // Only add neighbor if not already in queue
                            }
                        }
                    }
                }
            });
        }

        return [];  // Return empty array if no path is found
    }
}

export default Pathfinder;