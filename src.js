document.addEventListener('DOMContentLoaded', async function() {
    
    // Центр карты — Санкт-Петербург.
    let map = L.map('map').setView([59.9300, 30.3300], 12);
    
    // Базовый слой карты.
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', {
        prefix: false,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>'
    }).addTo(map);
    
    // Чтение данных о национальностях из JSON-базы.
    const response = await fetch('data.json');
    const json = await response.json();
    const nationalities = json.nationalities;
    const objects = json.points;

    let icons = { };
    let groups = { };

    for (const key in nationalities) {
        icons[key] = createIcon(nationalities[key].color);
        groups[key] = L.layerGroup();
    }

    // Создание маркера общины.
    function createIcon(color) {
        return L.divIcon({
            className: 'custom-marker-icon',
            html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 8px ${color};"></div>`,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10]
        });
    }

    // Создание popup-объекта.
    function createPopupContent(title, address, extraInfo, image, type) {
        return `
            <div class="popup-content ${type}-popup">
                <h3 style="color: ${nationalities[type].color};">📍 ${title}</h3>
                <img class="popup-image" src="${image}"></img>
                <hr style="border-top: 1px ${nationalities[type].color};">
                <p class="address">${address}</p>
                ${extraInfo ? '<p>' + extraInfo + '</p>' : ''}
                <hr style="border-top: 1px dashed ${nationalities[type].color};">
                <p><i>${nationalities[type].name} Санкт-Петербурга</i></p>
            </div>
        `;
    }

    // Создание необходимых маркеров на карте.
    for (const obj of objects) {
        L.marker(obj.coordinates, { icon: icons[obj.type] })
         .bindPopup(createPopupContent(obj.title, obj.address, obj.description, obj.image, obj.type))
         .addTo(groups[obj.type]);
    }

    // Создание кнопки переключения.
    function setupToggle(checkboxId, group, sidebarId) {
        var chk = document.getElementById(checkboxId);
        var sidebarBlock = document.getElementById(sidebarId);
        
        chk.addEventListener('change', function(e) {
            if (this.checked) {
                map.addLayer(group);
                if (sidebarBlock) sidebarBlock.style.display = 'block';
            } else {
                map.removeLayer(group);
                if (sidebarBlock) sidebarBlock.style.display = 'none';
            }
        });
    }

    // Добавление необходимых кнопок.
    for (var type in groups) {
        groups[type].addTo(map);
        setupToggle('toggle-' + type, groups[type], 'sidebar-' + type);
    }

    L.control.scale({imperial: false, metric: true}).addTo(map);
});
