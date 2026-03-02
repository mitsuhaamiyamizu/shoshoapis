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
async function scrape(search) {
    try {
        const response = await axios_1.default.get(`https://an1.com/?story=${search}&do=search&subaction=search`, {
            timeout: 30000,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
            },
        });
        const $ = cheerio.load(response.data);
        const applications = [];
        $(".item").each((index, element) => {
            const $element = $(element);
            const app = {
                title: $element.find(".name a span").text().trim(),
                link: $element.find(".name a").attr("href"),
                developer: $element.find(".developer").text().trim(),
                image: $element.find(".img img").attr("src"),
                rating: {
                    value: parseFloat($element.find(".current-rating").text()) || null,
                    percentage: parseInt($element
                        .find(".current-rating")
                        .attr("style")
                        ?.replace("width:", "")
                        .replace("%;", "") || "0"),
                },
                type: $element.find(".item_app").hasClass("mod") ? "MOD" : "Original",
            };
            applications.push(app);
        });
        return applications;
    }
    catch (error) {
        console.error("API Error:", error.message);
        throw new Error("Failed to get response from API");
    }
}
exports.default = [
    {
        metode: "GET",
        endpoint: "/api/apk/an1",
        name: "an1",
        category: "APK",
        description: "This API endpoint allows you to search for Android applications on an1.com. It scrapes the website based on your provided search query and returns a list of relevant applications, including their title, download link, developer, image, rating, and whether it's a MOD or Original version. This can be used by developers needing to programmatically find and list applications available on an1.com.",
        tags: ["APK", "Search", "Android"],
        example: "?search=pou",
        parameters: [
            {
                name: "search",
                in: "query",
                required: true,
                schema: {
                    type: "string",
                    minLength: 1,
                    maxLength: 255,
                },
                description: "Search query for applications",
                example: "pou",
            },
        ],
        isPremium: false,
        isMaintenance: false,
        isPublic: true,
        async run({ req }) {
            const { search } = req.query || {};
            if (!search) {
                return {
                    status: false,
                    error: "Parameter 'search' is required",
                    code: 400,
                };
            }
            if (typeof search !== "string" || search.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'search' must be a non-empty string",
                    code: 400,
                };
            }
            if (search.length > 255) {
                return {
                    status: false,
                    error: "Parameter 'search' must be less than 255 characters",
                    code: 400,
                };
            }
            try {
                const applications = await scrape(search.trim());
                if (!applications) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: applications,
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
        endpoint: "/api/apk/an1",
        name: "an1",
        category: "APK",
        description: "This API endpoint allows you to search for Android applications on an1.com using a POST request. It scrapes the website based on your provided search query in the request body and returns a list of relevant applications, including their title, download link, developer, image, rating, and whether it's a MOD or Original version. This can be used by developers needing to programmatically find and list applications available on an1.com.",
        tags: ["APK", "Search", "Android"],
        example: "",
        requestBody: {
            required: true,
            content: {
                "application/json": {
                    schema: {
                        type: "object",
                        required: ["search"],
                        properties: {
                            search: {
                                type: "string",
                                description: "The search term for applications on an1.com",
                                example: "pou",
                                minLength: 1,
                                maxLength: 255,
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
            const { search } = req.body || {};
            if (!search) {
                return {
                    status: false,
                    error: "Parameter 'search' is required",
                    code: 400,
                };
            }
            if (typeof search !== "string" || search.trim().length === 0) {
                return {
                    status: false,
                    error: "Parameter 'search' must be a non-empty string",
                    code: 400,
                };
            }
            if (search.length > 255) {
                return {
                    status: false,
                    error: "Parameter 'search' must be less than 255 characters",
                    code: 400,
                };
            }
            try {
                const applications = await scrape(search.trim());
                if (!applications) {
                    return {
                        status: false,
                        error: "No result returned from API",
                        code: 500,
                    };
                }
                return {
                    status: true,
                    data: applications,
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
