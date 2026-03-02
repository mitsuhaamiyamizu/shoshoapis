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
const baseUrl = "https://otakudesu.cloud/";
async function searchAnime(query) {
    const url = `${baseUrl}/?s=${query}&post_type=anime`;
    try {
        const { data } = await axios_1.default.get(proxy() + url, {
            timeout: 30000,
        });
        const $ = cheerio.load(data);
        const animeList = [];
        $(".chivsrc li").each((index, element) => {
            const title = $(element).find("h2 a").text().trim();
            const link = $(element).find("h2 a").attr("href");
            const imageUrl = $(element).find("img").attr("src");
            const genres = $(element)
                .find(".set")
                .first()
                .text()
                .replace("Genres : ", "")
                .trim();
            const status = $(element)
                .find(".set")
                .eq(1)
                .text()
                .replace("Status : ", "")
                .trim();
            const rating = $(element).find(".set").eq(2).text().replace("Rating : ", "").trim() ||
                "N/A";
            animeList.push({
                title,
                link,
                imageUrl,
                genres,
                status,
                rating,
            });
        });
        return animeList;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/anime/otakudesu/search",
        name: "otakudesu search",
        category: "Anime",
        description: "This API endpoint allows users to search for anime on Otakudesu. By providing a search query, the API returns a list of matching anime, including their titles, direct links to their pages, thumbnail images, genres, current status (e.g., ongoing, completed), and ratings. This is useful for integrating anime search capabilities into applications, enabling users to quickly find specific anime titles and retrieve relevant information.",
        tags: ["Anime", "Otakudesu", "Search"],
        example: "?s=naruto",
        parameters: [
            {
                name: "s",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 100,
                },
                description: "Anime search query",
                example: "naruto",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { s } = req.query || {};
            if (!s) {
                return {
                    status: false,
                    error: "Query parameter 's' is required",
                    code: 400,
                };
            }
            if (typeof s !== "string" || s.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 's' must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await searchAnime(s.trim());
                return {
                    status: true,
                    data: data,
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
        endpoint: "/api/anime/otakudesu/search",
        name: "otakudesu search",
        category: "Anime",
        description: "This API endpoint enables users to search for anime on Otakudesu by providing a search query in the JSON request body. It returns a structured list of anime matching the query, including details such as their titles, direct links to their respective pages, thumbnail images, associated genres, current status (e.g., ongoing, completed), and ratings. This POST method is suitable for automated systems or complex applications that need to programmatically send search queries and retrieve anime information from Otakudesu.",
        tags: ["Anime", "Otakudesu", "Search"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["s"],
                        properties: {
                            s: {
                                type: "string",
                                description: "Anime search query",
                                example: "naruto",
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
            const { s } = req.body || {};
            if (!s) {
                return {
                    status: false,
                    error: "Query parameter 's' is required",
                    code: 400,
                };
            }
            if (typeof s !== "string" || s.trim().length === 0) {
                return {
                    status: false,
                    error: "Query parameter 's' must be a non-empty string",
                    code: 400,
                };
            }
            try {
                const data = await searchAnime(s.trim());
                return {
                    status: true,
                    data: data,
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
