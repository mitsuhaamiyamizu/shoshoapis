"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const cheerio = __importStar(require("cheerio"));
async function fetchOtakotaku(q) {
    try {
        const url = `https://otakotaku.com/search?q=${q}&q_filter=semua`;
        const response = await axios_1.default.get(url);
        const html = response.data;
        const $ = cheerio.load(html);
        const data = {
            headline: $(".headline.aoi").text().trim(),
            anime: [],
            karakter: [],
            artikel: [],
        };
        $(".anime-result .anime-grid").each((index, element) => {
            const title = $(element).find("small").text().trim();
            const imageUrl = $(element).find("img").attr("src");
            const url = $(element).find("a").attr("href");
            data.anime.push({ title, imageUrl, url });
        });
        $(".char-result .char-grid").each((index, element) => {
            const title = $(element).find("small").text().trim();
            const imageUrl = $(element).find("img").attr("src");
            const url = $(element).find("a").attr("href");
            data.karakter.push({ title, imageUrl, url });
        });
        $(".news-list").each((index, element) => {
            const title = $(element).find("h4 a").text().trim();
            const imageUrl = $(element).find("img").attr("src");
            const url = $(element).find("h4 a").attr("href");
            data.artikel.push({ title, imageUrl, url });
        });
        return data;
    }
    catch (error) {
        throw new Error(`Error fetching data from Otakotaku: ${error.message}`);
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/s/otakotaku",
        name: "otakotaku",
        category: "Search",
        description: "Search for anime, characters, and articles on Otakotaku.com using query parameters. This endpoint provides a comprehensive search across different categories on Otakotaku, including anime titles, character profiles, and news articles. Users can specify a search query to retrieve relevant results, which include the title, image URL, and a direct link to the content on Otakotaku. This API is useful for developers building applications that need to integrate with Otakotaku's content, such as anime tracking apps, character databases, or news aggregators focused on Japanese pop culture.",
        tags: ["Search", "Anime", "Manga", "Characters", "Articles"],
        example: "?query=mahiru",
        parameters: [
            {
                name: "query",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "The search query for Otakotaku",
                example: "mahiru",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.query || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            if (query.length > 100) {
                return {
                    status: false,
                    error: "Query must be less than 100 characters",
                    code: 400,
                };
            }
            try {
                const result = await fetchOtakotaku(query.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    },
    {
        metode: "POST",
        endpoint: "/api/s/otakotaku",
        name: "otakotaku",
        category: "Search",
        description: "Search for anime, characters, and articles on Otakotaku.com using JSON body. This endpoint provides a comprehensive search across different categories on Otakotaku, including anime titles, character profiles, and news articles. Users can specify a search query to retrieve relevant results, which include the title, image URL, and a direct link to the content on Otakotaku. This API is useful for developers building applications that need to integrate with Otakotaku's content, such as anime tracking apps, character databases, or news aggregators focused on Japanese pop culture.",
        tags: ["Search", "Anime", "Manga", "Characters", "Articles"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["query"],
                        properties: {
                            query: {
                                type: "string",
                                description: "The search query for Otakotaku",
                                example: "mahiru",
                                minLength: 1,
                                maxLength: 100,
                            },
                        },
                        additionalProperties: false,
                    },
                },
            },
        },
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { query } = req.body || {};
            if (!query) {
                return {
                    status: false,
                    error: "Query parameter is required",
                    code: 400,
                };
            }
            if (typeof query !== "string" || query.trim().length === 0) {
                return {
                    status: false,
                    error: "Query must be a non-empty string",
                    code: 400,
                };
            }
            if (query.length > 100) {
                return {
                    status: false,
                    error: "Query must be less than 100 characters",
                    code: 400,
                };
            }
            try {
                const result = await fetchOtakotaku(query.trim());
                if (!result) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: result,
                    timestamp: new Date().toISOString(),
                };
            }
            catch (error) {
                return {
                    status: false,
                    error: error.message || "Internal Server Error",
                    code: 500,
                };
            }
        },
    },
];
