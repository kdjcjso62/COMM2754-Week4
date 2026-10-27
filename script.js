const csvFile = 'musicdata.csv';
let allTracks = [];

function escapeHTML(value) {
    return String(value ?? '').replace(/[&<>"']/g, function (character) {
        const replacements = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        };
        return replacements[character];
    });
}

function renderTracks(tracks) {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    if (tracks.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5">No matching tracks found.</td></tr>';
        return;
    }

    tracks.forEach(function (track) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${escapeHTML(track.track_name)}</td>
            <td>${escapeHTML(track.track_artist)}</td>
            <td>${escapeHTML(track.playlist_genre)}</td>
            <td>${escapeHTML(track.track_popularity)}</td>
            <td>${escapeHTML(track.danceability)}</td>
        `;
        tbody.appendChild(row);
    });
}

Papa.parse(csvFile, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
        allTracks = results.data.filter(function (row) {
            return row.track_name && row.track_artist;
        });

        renderTracks(allTracks);
        document.querySelector('#trackCount').textContent = allTracks.length;

        const popularityValues = allTracks
            .map(track => Number(track.track_popularity))
            .filter(value => Number.isFinite(value));

        if (popularityValues.length > 0) {
            const average = popularityValues.reduce((sum, value) => sum + value, 0) / popularityValues.length;
            document.querySelector('#averagePopularity').textContent = average.toFixed(1) + ' / 100';
        }

        document.querySelector('#statusMessage').textContent =
            'Loaded ' + allTracks.length + ' tracks successfully.';
    },
    error: function (error) {
        console.error('Could not load CSV:', error);
        document.querySelector('#dataTable tbody').innerHTML =
            '<tr><td colspan="5">Could not load the CSV file. Check that musicdata.csv is in the same folder.</td></tr>';
        document.querySelector('#statusMessage').textContent =
            'Data could not be loaded. Check the file name and folder.';
    }
});

document.querySelector('#searchInput').addEventListener('input', function (event) {
    const query = event.target.value.toLowerCase().trim();
    const filteredTracks = allTracks.filter(function (track) {
        return String(track.track_name).toLowerCase().includes(query) ||
            String(track.track_artist).toLowerCase().includes(query);
    });
    renderTracks(filteredTracks);
});
