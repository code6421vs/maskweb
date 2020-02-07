//const apiUrl = 'https://api.code6421.cc/v1/near';
const apiUrl = 'http://localhost:8002/v1/near';

function createIcon(iconType) {
    if (iconType == 'green') {
        return new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
    else if (iconType == 'red') {
        return new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
    else if (iconType == 'gray') {
        return new L.Icon({
            iconUrl: 'https://cdn.rawgit.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }
}

function getAround(lat, lon, raidus) {
    PI = 3.14159265;
    latitude = lat;
    longitude = lon;
    degree = (24901 * 1609) / 360.0;
    raidusMile = raidus;
    dpmLat = 1 / degree;
    radiusLat = dpmLat * raidusMile;
    minLat = latitude - radiusLat;
    maxLat = latitude + radiusLat;
    mpdLng = degree * Math.cos(latitude * (PI / 180));
    dpmLng = 1 / mpdLng;
    radiusLng = dpmLng * raidusMile;
    minLng = longitude - radiusLng;
    maxLng = longitude + radiusLng;
    return {
        minLat,
        maxLat,
        minLng,
        maxLng
    };
}

navigator.geolocation.getCurrentPosition(function (position) {
    map = L.map('map').setView([position.coords.latitude, position.coords.longitude], 18);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '<a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
    }).addTo(map);

    var greenIcon = createIcon('green');
    var redIcon = createIcon('red');
    var grayIcon = createIcon('gray');

    var marker = L.marker([position.coords.latitude, position.coords.longitude]);
    marker.addTo(map);

    var now = new Date;
    var cacheStr = now.getUTCFullYear().toString() + now.getUTCMonth().toString() + now.getUTCDate().toString() + now.getUTCHours().toString() + (now.getUTCMinutes() / 10).toString();
    var nearRange = getAround(position.coords.latitude, position.coords.longitude, 5000);

    $.getJSON("https://raw.githubusercontent.com/kiang/pharmacies/master/json/points.json?ct=" + cacheStr, function (data) {
        $.each(data.features, function (i, field) {
            if (field.geometry.coordinates[1] >= nearRange.minLat &&
                field.geometry.coordinates[1] <= nearRange.maxLat &&
                field.geometry.coordinates[0] >= nearRange.minLng &&
                field.geometry.coordinates[0] <= nearRange.maxLng) {
                let iconUsed = null, tip = null;
                let adultNum = field.properties.mask_adult, childNum = field.properties.mask_child;
                tip = adultNum == 0 && childNum == 0 ? field.properties.name : field.properties.name + "<p>大:" + adultNum + "&nbsp&nbsp小" + childNum;
                if (adultNum > 100 && childNum > 30)
                    iconUsed = greenIcon;
                else if (adultNum == 0 && childNum == 0)
                    iconUsed = grayIcon;
                else
                    iconUsed = redIcon;
                var marker = L.marker([field.geometry.coordinates[1], field.geometry.coordinates[0]], { icon: iconUsed }).bindTooltip(tip,
                    {
                        permanent: true,
                        direction: 'right'
                    });
                marker.bindPopup("<p>" + field.properties.phone + "<p><a href='https://www.google.com.tw/maps/place/" +
                    field.properties.address + "' target='_blank'/>" + field.properties.address + "</a><p>大:" + adultNum + "&nbsp&nbsp小:" + childNum);
                marker.addTo(map);
            }
        });
    });    
});      