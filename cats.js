const http = require('http');
const axios = require('axios');
const url = require('url');

const port = 3000;

const catApiUrl = 'https://api.thecatapi.com/v1/images/search';
const apiKey = 'live_mj5nBFKRYqg7Zl21G5aCeIOYer5GaQBMIxwZHaVDgQmonFj24Ln7Hm7eyA2cJiTu';

let storedCatImages = [];

const server = http.createServer((req, res) => {
    const requestUrl = url.parse(req.url, true);

    if (requestUrl.pathname === '/') {
        handleMainPage(req, res);
    } else if (requestUrl.pathname === '/json') {
        handleJsonPage(req, res);
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

function handleMainPage(req, res) {
    getRandomCatImages()
        .then(catImages => {
            storedCatImages = catImages;
            const catHtml = catImages.map((cat, index) => `<img src="${cat.url}" class="cat-image" alt="Random Cat ${index + 1} - ${cat.type}">`).join('');

            const html = `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Випадкові коти</title>
                    <style>
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }

                        body {
                            font-family: 'Arial', sans-serif;
                            transition: background-color 0.3s, color 0.3s;
                        }

                        .container {
                            text-align: center;
                            background-color: #fff;
                            color: #000;
                            transition: background-color 0.3s, color 0.3s;
                            padding: 20px;
                        }

                        .title {
                            font-size: 24px;
                            margin-top: 20px;
                        }

                        .reload-button, .dark-mode-button {
                            margin: 10px;
                            padding: 10px 20px;
                            cursor: pointer;
                            border: none;
                            transition: background-color 0.3s, color 0.3s;
                        }

                        .reload-button {
                            background-color: #008CBA;
                            color: #fff;
                        }

                        .cat-grid {
                            display: flex;
                            flex-wrap: wrap;
                            justify-content: center;
                        }

                        .cat-image {
                            width: 300px;
                            height: 300px;
                            object-fit: cover;
                            margin: 10px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
                            transition: transform 0.3s;
                        }

                        .cat-image:hover {
                            transform: scale(1.1);
                        }

                        .dark-mode-button {
                            background-color: #333;
                            color: #fff;
                        }

                        .dark-mode .container {
                            background-color: #333;
                            color: #fff;
                        }

                        .dark-mode .reload-button {
                            background-color: #555;
                        }

                        .dark-mode .dark-mode-button {
                            background-color: #555;
                        }
                    </style>
                </head>
                <body>
                    <div class="container">
                        <h1 class="title">Знайшли для тебе котів</h1>
                        <button id="reloadButton" class="reload-button" onclick="location.reload()">Хочу ще!</button>
                        <button id="jsonButton" class="reload-button" onclick="window.location.href='/json'">Подивитися JSON</button>
                        <button id="darkModeButton" class="dark-mode-button" onclick="toggleDarkMode()">Темний режим</button>
                        <div class="cat-grid" id="catGrid">
                            ${catHtml}
                        </div>
                    </div>
                    <script>
                        function toggleDarkMode() {
                            const body = document.body;
                            body.classList.toggle('dark-mode');
                        }
                    </script>
                </body>
                </html>
            `;

            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(html);
        })
        .catch(error => {
            console.error('Помилка: ' + error.message);
            res.writeHead(500, { 'Content-Type': 'text/plain' });
            res.end('Internal Server Error');
        });
}

function handleJsonPage(req, res) {
    const catJson = JSON.stringify(storedCatImages.map((cat, index) => ({ name: `Кіт ${index + 1}`, type: cat.type, url: cat.url })), null, 2);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(catJson);
}

async function getRandomCatImages() {
    const catImages = [];

    for (let i = 0; i < 4; i++) {
        const response = await axios.get(catApiUrl, {
            headers: {
                'X-Api-Key': apiKey,
            },
        });

        const catImageUrl = response.data[0].url;
        const catType = response.data[0].type === 'gif' ? 'Гіфка' : 'Фото';
        catImages.push({ url: catImageUrl, type: catType });
    }

    return catImages;
}

server.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
