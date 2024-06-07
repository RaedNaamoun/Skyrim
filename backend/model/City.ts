class City {
    name: string;
    positionX: number;
    positionY: number;

    constructor(name: string, positionX: number, positionY: number) {
        this.name = name;
        this.positionX = positionX;
        this.positionY = positionY;
    }
}

class Connection {
    parent: string;
    child: string;

    constructor(parent: string, child: string) {
        this.parent = parent;
        this.child = child;
    }
}

class MapData {
    mapname: string;
    connections: Connection[];
    cities: City[];
    mapsizeX: number;
    mapsizeY: number;

    constructor(mapname: string, connections: Connection[], cities: City[], mapsizeX: number, mapsizeY: number) {
        this.mapname = mapname;
        this.connections = connections;
        this.cities = cities;
        this.mapsizeX = mapsizeX;
        this.mapsizeY = mapsizeY;
    }
}

export { City, Connection, MapData };