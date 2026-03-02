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
async function scrape(query) {
    try {
        const url = `${proxy() + "https://anichin.cafe/"}?s=${encodeURIComponent(query)}`;
        const { data } = await axios_1.default.get(url, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(data);
        const results = [];
        $(".listupd article").each((_, el) => {
            const title = $(el).find(".tt h2").text().trim();
            const type = $(el).find(".typez").text().trim();
            const status = $(el).find(".bt .epx").text().trim();
            const link = $(el).find("a").attr("href");
            const image = $(el).find("img").attr("src");
            results.push({
                title: title,
                type: type,
                status: status,
                link: link,
                image: image,
            });
        });
        return results;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/anime/anichin-search",
        name: "anichin search",
        category: "Anime",
        description: "This API endpoint allows users to search for anime on the Anichin website. By providing a search query, users can retrieve a list of anime titles along with their type, current status, a direct link to the anime page, and an image thumbnail. This is useful for quickly finding information about specific anime or exploring available titles on Anichin. The endpoint handles various anime categories and provides relevant details for each search result.",
        tags: ["Anime", "Search", "Anichin"],
        example: "?query=naga",
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
                description: "Anime search query",
                example: "naga",
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
                    error: "Query is required",
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
            try {
                const results = await scrape(query.trim());
                if (!results || results.length === 0) {
                    return {
                        status: false,
                        error: "No results found for your query",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data: results,
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
        endpoint: "/api/anime/anichin-search",
        name: "anichin search",
        category: "Anime",
        description: "This API endpoint allows users to search for anime on the Anichin website by sending a search query in the request body. Upon successful execution, it returns a list of anime titles, including their type, status, direct link, and image thumbnail. This is ideal for applications requiring structured data submission for anime searches, providing a flexible and robust method to query the Anichin database and retrieve detailed results for various use cases.",
        tags: ["Anime", "Search", "Anichin"],
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
                                description: "The search term for anime",
                                example: "naga",
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
                    error: "Query is required",
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
            try {
                const results = await scrape(query.trim());
                if (!results || results.length === 0) {
                    return {
                        status: false,
                        error: "No results found for your query",
                        code: 404,
                    };
                }
                return {
                    status: true,
                    data: results,
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
