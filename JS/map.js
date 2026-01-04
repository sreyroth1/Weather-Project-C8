const apiKey = '4f865a5334a61776d13577ccd4a1484a';
const map = L.map('map').setView([10, 0], 3);

let currentBaseLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
let currentWeatherLayer = null;
let animationInterval = null;

const baseMaps = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
    streets: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
};

const weatherLayers = {
    clouds: 'clouds_new',
    precipitation: 'precipitation_new',
    wind: 'wind_new',
    temperature: 'temp_new',
    pressure: 'pressure_new'
};

function setBaseLayer(name) {
    if (currentBaseLayer) map.removeLayer(currentBaseLayer);
    currentBaseLayer = L.tileLayer(baseMaps[name]).addTo(map);
}

function addWeatherLayer(name) {
    if (currentWeatherLayer) map.removeLayer(currentWeatherLayer);
    const url = `https://tile.openweathermap.org/map/${weatherLayers[name]}/{z}/{x}/{y}.png?appid=${apiKey}`;
    currentWeatherLayer = L.tileLayer(url, { opacity: document.getElementById('opacity').value }).addTo(map);
}

// Current time display
function updateTime() {
    const now = new Date();
    document.getElementById('currentTime').textContent = now.toLocaleString();
}
setInterval(updateTime, 1000);
updateTime();

// Search location
document.getElementById('searchBtn').addEventListener('click', async () => {
    const query = document.getElementById('searchInput').value.trim();
    if (!query) {
        document.getElementById('weatherInfo').textContent = 'Please enter a location';
        return;
    }

    document.getElementById('weatherInfo').innerHTML = '🔍 Searching location & weather...';

    try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) throw new Error('Location not found');

        const lat = parseFloat(geoData[0].lat);
        const lon = parseFloat(geoData[0].lon);

        map.setView([lat, lon], 10);

        if (window.searchMarker) map.removeLayer(window.searchMarker);
        window.searchMarker = L.marker([lat, lon]).addTo(map).bindPopup('Loading weather...').openPopup();

        const reverseRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const reverseData = await reverseRes.json();

        let locationName = query;
        if (reverseData && reverseData.length > 0) {
            const loc = reverseData[0];
            locationName = loc.name || '';
            if (loc.state) locationName += `, ${loc.city}`;
            if (loc.country) locationName += `, ${loc.country}`;
        }

        const weatherRes = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=en`);
        const d = await weatherRes.json();

        if (d.cod !== 200) throw new Error(d.message || 'Weather data unavailable');

        document.getElementById('weatherInfo').innerHTML = `
                    📍 <strong>${locationName}</strong><br>
                    🌡️ ${d.main.temp}°C (Feels like ${d.main.feels_like}°C)<br>
                    💧 ${d.main.humidity}% | ☁️${d.clouds.all}%<br>
                    💨 ${d.wind.speed} m/s (${d.wind.deg}°)<br>
                    🌤️ ${d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1)}
                `;

        window.searchMarker.setPopupContent(`
                    <strong>${locationName}</strong><br>
                    ${d.main.temp}°C<br>
                    ${d.weather[0].description.charAt(0).toUpperCase() + d.weather[0].description.slice(1)}
                `);

    } catch (err) {
        console.error(err);
        document.getElementById('weatherInfo').innerHTML = `❌ <strong>Error:</strong> ${err.message || 'Could not load data'}`;
    }
});

// Map click weather
map.on('click', async e => {
    const { lat, lng } = e.latlng;
    try {
        const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`);
        const d = await res.json();
        document.getElementById('weatherInfo').innerHTML = `
                    📍 ${lat.toFixed(2)}, ${lng.toFixed(2)}<br>
                    🌡️ ${d.main.temp}°C (Feels ${d.main.feels_like}°C)<br>
                    💧 ${d.main.humidity}% | ☁️ ${d.clouds.all}%<br>
                    💨 ${d.wind.speed} m/s ${d.wind.deg}°<br>
                    🌤️ ${d.weather[0].description}
                `;
    } catch {
        document.getElementById('weatherInfo').textContent = 'Data unavailable';
    }
});

// Controls
document.getElementById('weatherLayer').addEventListener('change', e => addWeatherLayer(e.target.value));
document.getElementById('baseMap').addEventListener('change', e => setBaseLayer(e.target.value));
document.getElementById('opacity').addEventListener('input', e => currentWeatherLayer?.setOpacity(e.target.value));

// Animation
document.getElementById('animateBtn').addEventListener('click', () => {
    const btn = document.getElementById('animateBtn');
    if (animationInterval) {
        clearInterval(animationInterval);
        animationInterval = null;
        btn.textContent = '▶️';
    } else {
        const layers = Object.keys(weatherLayers);
        let i = 0;
        animationInterval = setInterval(() => {
            document.getElementById('weatherLayer').value = layers[i];
            addWeatherLayer(layers[i]);
            i = (i + 1) % layers.length;
        }, 4000);
        btn.textContent = '⏸️';
    }
});

// NEW: Toggle Panels & Mobile Menu
document.getElementById('toggleControls').addEventListener('click', () => {
    document.getElementById('controlPanel').classList.toggle('active');
});

document.getElementById('toggleInfo').addEventListener('click', () => {
    document.getElementById('infoPanel').classList.toggle('active');
});

document.getElementById('menuBtn').addEventListener('click', () => {
    document.getElementById('mobileMenu').classList.toggle('active');
});

// Fix map rendering
window.addEventListener('load', () => setTimeout(() => map.invalidateSize(), 200));
window.addEventListener('resize', () => setTimeout(() => map.invalidateSize(), 300));
window.addEventListener('orientationchange', () => setTimeout(() => map.invalidateSize(), 500));

// Initial load
addWeatherLayer('clouds');



/* =========================
MOBILE MENU
========================= */
const menuBtn = document.getElementById("menuBtn");
const mobileMenu = document.getElementById("mobileMenu");
menuBtn.addEventListener("click", () => {
    mobileMenu.style.display =
        mobileMenu.style.display === "flex" ? "none" : "flex";
});

// Updated map.js auth section (replace entire DOMContentLoaded listener)
// Changes:
// - Improved upload: Now shows preview before save, confirms upload
// - Icon (chevron) clicks show dropdown
// - Name/email from currentUser (from login/signup)
// - Responsive: Adjusts trigger size/gap on mobile

document.addEventListener('DOMContentLoaded', () => {
    const authSection = document.getElementById('authSection');
    const dropdown = document.getElementById('profileDropdown');
    const loggedIn = localStorage.getItem('loggedIn') === 'true';
    const currentUser = loggedIn ? JSON.parse(localStorage.getItem('currentUser')) : null;
    const defaultPhoto = '/images/default-profile.png';

    if (loggedIn && currentUser) {
        const photoSrc = currentUser.photo || defaultPhoto;

        // Header trigger with avatar + chevron icon
        authSection.innerHTML = `
            <div class="profile-trigger" id="profileTrigger" style="display: flex; align-items: center; gap: 10px; cursor: pointer;">
                <img src="${photoSrc}" alt="Profile Photo" 
                     style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 3px solid #2563eb; box-shadow: 0 2px 8px rgba(37,99,235,0.4);">
                <i class="fas fa-chevron-down" style="font-size: 18px; color: white; transition: transform 0.3s;"></i>
            </div>
        `;

        // Populate dropdown with name/email from currentUser (from signup/login)
        document.getElementById('dropdownPhoto').src = photoSrc;
        document.getElementById('dropdownUsername').textContent = currentUser.username || 'You';
        document.getElementById('dropdownEmail').textContent = currentUser.email || '';

        // Toggle dropdown on trigger click
        const trigger = document.getElementById('profileTrigger');
        const chevron = trigger.querySelector('.fa-chevron-down');
        trigger.addEventListener('click', (e) => {
            e.stopPropagation();
            const isShown = dropdown.style.display === 'block';
            dropdown.style.display = isShown ? 'none' : 'block';
            chevron.style.transform = isShown ? 'rotate(0deg)' : 'rotate(180deg)';
        });

        // Close on outside click
        document.addEventListener('click', () => {
            dropdown.style.display = 'none';
            chevron.style.transform = 'rotate(0deg)';
        });

        // Prevent close on dropdown click
        dropdown.addEventListener('click', (e) => e.stopPropagation());

        // Improved photo upload: Preview & confirm
        document.getElementById('changePhotoItem').addEventListener('click', () => {
            dropdown.style.display = 'none';
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => {
                if (e.target.files && e.target.files[0]) {
                    const file = e.target.files[0];
                    if (file.size > 5 * 1024 * 1024) { // 5MB limit
                        alert('File too large. Max 5MB.');
                        return;
                    }

                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        const previewSrc = ev.target.result;

                        // Show preview & confirm modal (simple alert for now)
                        if (confirm('Preview looks good? Upload this photo?')) {
                            currentUser.photo = previewSrc;
                            localStorage.setItem('currentUser', JSON.stringify(currentUser));

                            // Update users array
                            const users = JSON.parse(localStorage.getItem('users')) || [];
                            const index = users.findIndex(u => u.email === currentUser.email);
                            if (index !== -1) {
                                users[index].photo = previewSrc;
                                localStorage.setItem('users', JSON.stringify(users));
                            }

                            // Update UI
                            trigger.querySelector('img').src = previewSrc;
                            document.getElementById('dropdownPhoto').src = previewSrc;
                            alert('Profile photo updated!');
                        }
                    };
                    reader.readAsDataURL(file);
                }
            };
            input.click();
        });

        // Logout
        document.getElementById('logoutItem').addEventListener('click', () => {
            localStorage.removeItem('loggedIn');
            localStorage.removeItem('currentUser');
            window.location.href = '/index.html';
        });

        // Manage account (placeholder)
        document.getElementById('manageAccountItem').addEventListener('click', () => {
            alert('Manage account coming soon!');
            dropdown.style.display = 'none';
        });

    } else {
        authSection.innerHTML = `<a href="/index.html"><button class="login-btn">Log In</button></a>`;
    }
});