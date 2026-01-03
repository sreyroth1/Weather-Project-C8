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

        